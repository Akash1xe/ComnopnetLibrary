from __future__ import annotations

import asyncio
import io
import re
import zipfile
from datetime import datetime, timezone

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthorizationError, NotFoundError
from app.models.component import ComponentStatus
from app.models.user import SubscriptionTier, User
from app.repositories.component_repo import ComponentRepository


class AccessControlService:
    @staticmethod
    def can_access_premium_code(component, user: User | None) -> bool:
        if component.is_free:
            return True
        if user is None:
            return False
        return user.subscription_tier in {SubscriptionTier.PRO, SubscriptionTier.TEAM} or user.is_superuser


class AnalyticsService:
    def __init__(self, repo: ComponentRepository) -> None:
        self.repo = repo

    async def track(self, component_id, action: str) -> None:
        if action in {"view", "copy", "download"}:
            await self.repo.increment_counter(component_id, action)  # type: ignore[arg-type]


class ComponentService:
    def __init__(self, session: AsyncSession, redis: Redis | None) -> None:
        self.session = session
        self.redis = redis
        self.repo = ComponentRepository(session)
        self.access = AccessControlService()
        self.analytics = AnalyticsService(self.repo)

    async def list_components(self, filters: dict, pagination: dict, sort: str, *, include_unpublished: bool = False):
        return await self.repo.list(filters, pagination, sort, include_unpublished=include_unpublished)

    async def get_component_detail(self, slug: str, *, include_unpublished: bool = False):
        component = await self.repo.get_by_slug(slug, include_unpublished=include_unpublished)
        if not component or component.is_deleted:
            raise NotFoundError("Component not found.")
        return component

    async def invalidate_component_cache(self, slug: str) -> None:
        if self.redis is not None:
            await self.redis.delete(f"component:{slug}")

    async def generate_unique_slug(self, name: str) -> str:
        base_slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "component"
        slug = base_slug
        counter = 1
        while await self.repo.get_by_slug(slug, include_unpublished=True):
            counter += 1
            slug = f"{base_slug}-{counter}"
        return slug

    async def ensure_category(self, category_slug: str):
        category = await self.repo.get_category_by_slug(category_slug)
        if category:
            return category
        return await self.repo.create_category(
            {
                "name": category_slug.replace("-", " ").title(),
                "slug": category_slug,
                "description": None,
                "icon": None,
                "order": 0,
            }
        )

    async def create_component(self, payload: dict, author: User):
        slug = payload.get("slug") or await self.generate_unique_slug(payload["name"])
        category = await self.ensure_category(payload.pop("category_slug"))
        tag_slugs = payload.pop("tag_slugs", [])
        trust_badges = payload.pop("trust_badges", [])
        code_files = payload.pop("code_files")
        data = {
            **payload,
            "slug": slug,
            "creator_id": author.id,
            "category_id": category.id,
            "published_at": datetime.now(timezone.utc) if payload.get("status") == ComponentStatus.PUBLISHED.value else None,
        }
        tags = await self.repo.ensure_tags(tag_slugs)
        files_payload = [item.model_dump() if hasattr(item, "model_dump") else item for item in code_files]
        return await self.repo.create_with_relations(data, files_payload, tags, trust_badges)

    async def update_component(self, component, data: dict, actor: User):
        if actor.id != component.creator_id and not actor.is_superuser:
            raise AuthorizationError("You cannot update this component.")
        code_files = data.pop("code_files", None)
        category_slug = data.pop("category_slug", None)
        tag_slugs = data.pop("tag_slugs", None)
        trust_badges = data.pop("trust_badges", None)
        if not actor.is_superuser:
            for field in ("status", "is_featured", "is_trending", "is_free", "trust_badges"):
                data.pop(field, None)
        if category_slug:
            category = await self.ensure_category(category_slug)
            data["category_id"] = category.id
        if "status" in data and data["status"] == ComponentStatus.PUBLISHED.value and component.published_at is None:
            data["published_at"] = datetime.now(timezone.utc)
        if code_files is not None:
            current_parts = [
                {"filename": item.filename, "language": item.language.value, "code": item.code, "is_primary": item.is_primary}
                for item in component.code_files
            ]
            incoming = [item.model_dump() if hasattr(item, "model_dump") else item for item in code_files]
            comparable = [
                {"filename": item["filename"], "language": item["language"], "code": item["code"], "is_primary": item["is_primary"]}
                for item in incoming
            ]
            if current_parts != comparable:
                parts = component.version.split(".")
                next_patch = str(int(parts[-1]) + 1)
                new_version = ".".join(parts[:-1] + [next_patch])
                await self.repo.add_version(component.id, component.version, data.get("changelog"), {"files": current_parts})
                data["version"] = new_version
        tags = await self.repo.ensure_tags(tag_slugs) if tag_slugs is not None else None
        updated = await self.repo.update_with_relations(
            component,
            data,
            code_files=[item.model_dump() if hasattr(item, "model_dump") else item for item in code_files] if code_files is not None else None,
            tags=tags,
            trust_badges=trust_badges,
        )
        await self.invalidate_component_cache(component.slug)
        return updated

    async def copy_component(self, component, user: User):
        if not self.access.can_access_premium_code(component, user):
            raise AuthorizationError("Upgrade to Pro to copy this component.")
        await self.analytics.track(component.id, "copy")
        return component.code_files

    async def download_component(self, component, user: User) -> io.BytesIO:
        if not self.access.can_access_premium_code(component, user):
            raise AuthorizationError("Upgrade to Pro to download this component.")
        await self.analytics.track(component.id, "download")
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
            for code_file in component.code_files:
                archive.writestr(code_file.filename, code_file.code)
        buffer.seek(0)
        return buffer

    async def record_view(self, component_id) -> None:
        await self.analytics.track(component_id, "view")

    async def submit_component(self, creator: User, payload: dict):
        return await self.repo.create_submission({**payload, "creator_id": creator.id})

    @staticmethod
    async def record_analytics_event(payload: dict) -> None:
        await asyncio.sleep(0)
