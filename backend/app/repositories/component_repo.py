from __future__ import annotations

from typing import Literal
from uuid import UUID

from sqlalchemy import and_, desc, distinct, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.component import (
    Category,
    Component,
    ComponentCode,
    ComponentStatus,
    ComponentSubmission,
    ComponentTag,
    ComponentVersion,
    Tag,
    TrustBadge,
)
from app.repositories.base import BaseRepository


class ComponentRepository(BaseRepository[Component]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Component)

    def _base_query(self):
        return select(Component).options(
            joinedload(Component.creator),
            joinedload(Component.category),
            selectinload(Component.tags),
            selectinload(Component.trust_badges),
            selectinload(Component.code_files),
            selectinload(Component.versions),
        )

    async def get_by_slug(self, slug: str, *, include_unpublished: bool = False) -> Component | None:
        query = self._base_query().where(Component.slug == slug, Component.is_deleted.is_(False))
        if not include_unpublished:
            query = query.where(Component.status == ComponentStatus.PUBLISHED)
        result = await self.session.execute(query)
        return result.scalars().unique().one_or_none()

    async def get_by_id(self, component_id: UUID, *, include_unpublished: bool = False) -> Component | None:
        query = self._base_query().where(Component.id == component_id, Component.is_deleted.is_(False))
        if not include_unpublished:
            query = query.where(Component.status == ComponentStatus.PUBLISHED)
        result = await self.session.execute(query)
        return result.scalars().unique().one_or_none()

    async def list(
        self,
        filters: dict,
        pagination: dict,
        sort: str,
        *,
        include_unpublished: bool = False,
    ) -> tuple[list[Component], int]:
        query = self._base_query().where(Component.is_deleted.is_(False))
        needs_tag_join = bool(filters.get("tags") or filters.get("search"))
        needs_category_join = bool(filters.get("category") or filters.get("search"))

        if needs_tag_join:
            query = query.outerjoin(Component.tags)
        if needs_category_join:
            query = query.outerjoin(Component.category)

        if not include_unpublished:
            query = query.where(Component.status == ComponentStatus.PUBLISHED)
        elif filters.get("status"):
            query = query.where(Component.status == filters["status"])

        if filters.get("category"):
            query = query.where(or_(Category.slug == filters["category"], Category.name.ilike(filters["category"])))
        if filters.get("framework"):
            query = query.where(Component.framework == filters["framework"])
        if filters.get("is_free") is not None:
            query = query.where(Component.is_free == filters["is_free"])
        if filters.get("is_featured") is not None:
            query = query.where(Component.is_featured == filters["is_featured"])
        if filters.get("creator"):
            query = query.where(Component.creator.has(username=filters["creator"]))
        if filters.get("creator_id"):
            query = query.where(Component.creator_id == filters["creator_id"])
        if filters.get("tags"):
            query = query.where(Tag.slug.in_(filters["tags"]))
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            query = query.where(
                or_(
                    Component.name.ilike(search_term),
                    Component.short_description.ilike(search_term),
                    Component.long_description.ilike(search_term),
                    Tag.name.ilike(search_term),
                    Category.name.ilike(search_term),
                )
            )

        count_subquery = query.with_only_columns(Component.id).distinct().subquery()
        total = (await self.session.execute(select(func.count()).select_from(count_subquery))).scalar_one()

        if needs_tag_join:
            query = query.distinct()
        if sort == "popular":
            query = query.order_by(desc(Component.downloads_count), desc(Component.views_count), desc(Component.created_at))
        elif sort == "trending":
            query = query.order_by(desc(Component.is_trending), desc(Component.copies_count), desc(Component.created_at))
        else:
            query = query.order_by(desc(Component.is_featured), desc(Component.created_at))

        query = query.offset((pagination["page"] - 1) * pagination["per_page"]).limit(pagination["per_page"])
        items = (await self.session.execute(query)).scalars().unique().all()
        return list(items), total

    async def create_with_relations(
        self,
        data: dict,
        code_files: list[dict],
        tags: list[Tag],
        trust_badges: list[str],
    ) -> Component:
        component = Component(**data)
        component.tags = tags
        self.session.add(component)
        await self.session.flush()
        for index, code in enumerate(code_files):
            payload = {**code, "order": code.get("order", index)}
            self.session.add(ComponentCode(component_id=component.id, **payload))
        for badge in trust_badges:
            self.session.add(TrustBadge(component_id=component.id, badge_type=badge))
        await self.session.flush()
        return await self.get_by_id(component.id, include_unpublished=True)  # type: ignore[return-value]

    async def update_with_relations(
        self,
        component: Component,
        data: dict,
        *,
        code_files: list[dict] | None = None,
        tags: list[Tag] | None = None,
        trust_badges: list[str] | None = None,
    ) -> Component:
        for key, value in data.items():
            setattr(component, key, value)
        if tags is not None:
            component.tags = tags
        self.session.add(component)
        await self.session.flush()
        if code_files is not None:
            component.code_files.clear()
            await self.session.flush()
            for index, code in enumerate(code_files):
                payload = {**code, "order": code.get("order", index)}
                self.session.add(ComponentCode(component_id=component.id, **payload))
        if trust_badges is not None:
            component.trust_badges.clear()
            await self.session.flush()
            for badge in trust_badges:
                self.session.add(TrustBadge(component_id=component.id, badge_type=badge))
        await self.session.flush()
        return await self.get_by_id(component.id, include_unpublished=True)  # type: ignore[return-value]

    async def soft_delete(self, component: Component) -> None:
        await self.update(component, {"is_deleted": True, "deleted_at": func.now(), "status": ComponentStatus.ARCHIVED})

    async def increment_counter(self, component_id: UUID, field: Literal["views", "copies", "downloads"]) -> None:
        column = {
            "views": Component.views_count,
            "copies": Component.copies_count,
            "downloads": Component.downloads_count,
        }[field]
        await self.session.execute(update(Component).where(Component.id == component_id).values({column.key: column + 1}))

    async def add_version(
        self,
        component_id: UUID,
        version_string: str,
        changelog: str | None,
        files_snapshot: dict,
    ) -> ComponentVersion:
        version_obj = ComponentVersion(
            component_id=component_id,
            version_string=version_string,
            changelog=changelog,
            files_snapshot=files_snapshot,
        )
        self.session.add(version_obj)
        await self.session.flush()
        await self.session.refresh(version_obj)
        return version_obj

    async def get_featured(self, limit: int = 8) -> list[Component]:
        query = (
            self._base_query()
            .where(
                Component.is_deleted.is_(False),
                Component.status == ComponentStatus.PUBLISHED,
                Component.is_featured.is_(True),
            )
            .order_by(desc(Component.created_at))
            .limit(limit)
        )
        return list((await self.session.execute(query)).scalars().unique().all())

    async def get_trending(self, limit: int = 8) -> list[Component]:
        query = (
            self._base_query()
            .where(Component.is_deleted.is_(False), Component.status == ComponentStatus.PUBLISHED)
            .order_by(desc(Component.is_trending), desc(Component.copies_count), desc(Component.views_count))
            .limit(limit)
        )
        return list((await self.session.execute(query)).scalars().unique().all())

    async def get_related(self, component: Component, limit: int = 4) -> list[Component]:
        tag_ids = [tag.id for tag in component.tags]
        query = self._base_query().where(
            Component.id != component.id,
            Component.is_deleted.is_(False),
            Component.status == ComponentStatus.PUBLISHED,
        )
        if component.category_id and tag_ids:
            query = query.outerjoin(Component.tags).where(
                or_(Component.category_id == component.category_id, Tag.id.in_(tag_ids))
            )
        elif component.category_id:
            query = query.where(Component.category_id == component.category_id)
        query = query.order_by(desc(Component.is_featured), desc(Component.views_count), desc(Component.created_at)).limit(limit)
        return list((await self.session.execute(query)).scalars().unique().all())

    async def get_by_creator(self, creator_id: UUID, pagination: dict) -> tuple[list[Component], int]:
        return await self.list({"creator_id": creator_id}, pagination, "newest", include_unpublished=True)

    async def list_categories(self) -> list[tuple[Category, int]]:
        query = (
            select(Category, func.count(Component.id))
            .outerjoin(Component, and_(Component.category_id == Category.id, Component.status == ComponentStatus.PUBLISHED, Component.is_deleted.is_(False)))
            .group_by(Category.id)
            .order_by(Category.order.asc(), Category.name.asc())
        )
        return list((await self.session.execute(query)).all())

    async def list_tags(self, limit: int = 50) -> list[tuple[Tag, int]]:
        query = (
            select(Tag, func.count(ComponentTag.component_id))
            .outerjoin(ComponentTag, ComponentTag.tag_id == Tag.id)
            .outerjoin(
                Component,
                and_(Component.id == ComponentTag.component_id, Component.status == ComponentStatus.PUBLISHED, Component.is_deleted.is_(False)),
            )
            .group_by(Tag.id)
            .order_by(desc(func.count(ComponentTag.component_id)), Tag.name.asc())
            .limit(limit)
        )
        return list((await self.session.execute(query)).all())

    async def get_category_by_slug(self, slug: str) -> Category | None:
        return (
            await self.session.execute(select(Category).where(Category.slug == slug))
        ).scalar_one_or_none()

    async def get_tag_by_slug(self, slug: str) -> Tag | None:
        return (
            await self.session.execute(select(Tag).where(Tag.slug == slug))
        ).scalar_one_or_none()

    async def get_tags_by_slugs(self, slugs: list[str]) -> list[Tag]:
        if not slugs:
            return []
        result = await self.session.execute(select(Tag).where(Tag.slug.in_(slugs)))
        return list(result.scalars().all())

    async def ensure_tags(self, slugs: list[str]) -> list[Tag]:
        existing = {tag.slug: tag for tag in await self.get_tags_by_slugs(slugs)}
        tags = []
        for slug in slugs:
            tag = existing.get(slug)
            if tag is None:
                tag = Tag(name=slug.replace("-", " ").title(), slug=slug)
                self.session.add(tag)
                await self.session.flush()
            tags.append(tag)
        return tags

    async def create_category(self, data: dict) -> Category:
        category = Category(**data)
        self.session.add(category)
        await self.session.flush()
        await self.session.refresh(category)
        return category

    async def create_submission(self, data: dict) -> ComponentSubmission:
        submission = ComponentSubmission(**data)
        self.session.add(submission)
        await self.session.flush()
        await self.session.refresh(submission)
        return submission

    async def list_submissions_by_creator(self, creator_id: UUID) -> list[ComponentSubmission]:
        result = await self.session.execute(
            select(ComponentSubmission).where(ComponentSubmission.creator_id == creator_id).order_by(desc(ComponentSubmission.created_at))
        )
        return list(result.scalars().all())
