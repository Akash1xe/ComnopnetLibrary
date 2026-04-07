from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Query, Request
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_superuser, get_current_verified_user
from app.core.database import get_db
from app.core.exceptions import NotFoundError, RateLimitError
from app.core.redis import get_redis
from app.core.security import decode_token
from app.models.user import SubscriptionTier, User
from app.repositories.component_repo import ComponentRepository
from app.repositories.user_repo import UserRepository
from app.schemas.common import MessageResponse, PaginatedResponse, make_pagination
from app.schemas.component import (
    CategoryResponse,
    CodeFile,
    ComponentCreate,
    ComponentDetail,
    ComponentListItem,
    ComponentSubmissionCreate,
    ComponentSubmissionResponse,
    ComponentUpdate,
    TagResponse,
    TrustBadgeResponse,
)
from app.services.component_service import AccessControlService, ComponentService
from app.tasks.analytics_tasks import record_analytics_task

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        return None
    return await UserRepository(db).get_by_id(payload["sub"])


def serialize_component(component, *, include_code: bool, requires_pro: bool = False, relevance: float | None = None) -> ComponentDetail:
    payload = {
        "id": str(component.id),
        "slug": component.slug,
        "name": component.name,
        "description": component.short_description,
        "category": component.category.name if component.category else None,
        "category_slug": component.category.slug if component.category else None,
        "tags": [tag.slug for tag in component.tags],
        "is_pro": component.is_pro,
        "is_free": component.is_free,
        "preview_image_url": component.preview_image_url,
        "preview_video_url": component.preview_video_url,
        "preview_url": component.preview_url,
        "views_count": component.views_count,
        "copies_count": component.copies_count,
        "downloads_count": component.downloads_count,
        "author": {
            "id": str(component.creator.id),
            "username": component.creator.username,
            "full_name": component.creator.full_name,
            "avatar_url": component.creator.avatar_url,
            "is_verified": component.creator.is_verified,
        },
        "created_at": component.created_at,
        "updated_at": component.updated_at,
        "published_at": component.published_at,
        "long_description": component.long_description,
        "framework": component.framework.value,
        "version": component.version,
        "install_command": component.install_command,
        "dependencies": component.dependencies or [],
        "compatibility_notes": component.compatibility_notes,
        "code_files": [
            CodeFile(
                id=str(item.id),
                filename=item.filename,
                language=item.language.value,
                code=item.code,
                is_primary=item.is_primary,
                order=item.order,
            ).model_dump()
            for item in (component.code_files if include_code else [])
        ],
        "versions": [
            {
                "id": str(version.id),
                "version_string": version.version_string,
                "changelog": version.changelog,
                "created_at": version.created_at,
            }
            for version in component.versions
        ],
        "trust_badges": [TrustBadgeResponse(id=str(badge.id), badge_type=badge.badge_type.value).model_dump() for badge in component.trust_badges],
        "requires_pro": requires_pro,
        "relevance": relevance,
    }
    return ComponentDetail.model_validate(payload)


def serialize_component_list_item(component) -> ComponentListItem:
    return ComponentListItem.model_validate(
        {
            "id": str(component.id),
            "slug": component.slug,
            "name": component.name,
            "description": component.short_description,
            "category": component.category.name if component.category else None,
            "category_slug": component.category.slug if component.category else None,
            "tags": [tag.slug for tag in component.tags],
            "is_pro": component.is_pro,
            "is_free": component.is_free,
            "preview_image_url": component.preview_image_url,
            "preview_video_url": component.preview_video_url,
            "views_count": component.views_count,
            "copies_count": component.copies_count,
            "downloads_count": component.downloads_count,
            "author": {
                "id": str(component.creator.id),
                "username": component.creator.username,
                "full_name": component.creator.full_name,
                "avatar_url": component.creator.avatar_url,
                "is_verified": component.creator.is_verified,
            },
            "created_at": component.created_at,
            "framework": component.framework.value,
            "version": component.version,
            "trust_badges": [{"id": str(badge.id), "badge_type": badge.badge_type.value} for badge in component.trust_badges],
        }
    )


@router.get("", response_model=PaginatedResponse[ComponentListItem])
async def list_components(
    page: int = 1,
    per_page: int = 20,
    category: str | None = None,
    framework: str | None = None,
    tags: list[str] | None = Query(default=None),
    is_free: bool | None = None,
    is_featured: bool | None = None,
    search: str | None = None,
    sort: str = "newest",
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    redis: Annotated[Redis, Depends(get_redis)] = None,
):
    items, total = await ComponentService(db, redis).list_components(
        {
            "category": category,
            "framework": framework,
            "tags": tags,
            "is_free": is_free,
            "is_featured": is_featured,
            "search": search,
        },
        {"page": page, "per_page": min(per_page, 100)},
        sort,
    )
    return PaginatedResponse[ComponentListItem](
        items=[serialize_component_list_item(item) for item in items],
        meta=make_pagination(page, min(per_page, 100), total),
    )


@router.get("/featured", response_model=list[ComponentListItem])
async def featured_components(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    items = await ComponentRepository(db).get_featured(limit=8)
    return [serialize_component_list_item(item) for item in items]


@router.get("/trending", response_model=list[ComponentListItem])
async def trending_components(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    items = await ComponentRepository(db).get_trending(limit=8)
    return [serialize_component_list_item(item) for item in items]


@router.get("/meta/categories", response_model=list[CategoryResponse])
@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    items = await ComponentRepository(db).list_categories()
    return [
        CategoryResponse(
            id=str(category.id),
            name=category.name,
            slug=category.slug,
            description=category.description,
            icon=category.icon,
            parent_id=str(category.parent_id) if category.parent_id else None,
            order=category.order,
            count=count,
        )
        for category, count in items
    ]


@router.get("/meta/tags", response_model=list[TagResponse])
@router.get("/tags", response_model=list[TagResponse])
async def get_tags(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    items = await ComponentRepository(db).list_tags(limit=50)
    return [TagResponse(id=str(tag.id), name=tag.name, slug=tag.slug, count=count) for tag, count in items]


@router.get("/categories/{slug}/components", response_model=PaginatedResponse[ComponentListItem])
async def get_category_components(
    slug: str,
    page: int = 1,
    per_page: int = 20,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    redis: Annotated[Redis, Depends(get_redis)] = None,
):
    items, total = await ComponentService(db, redis).list_components(
        {"category": slug},
        {"page": page, "per_page": min(per_page, 100)},
        "newest",
    )
    return PaginatedResponse[ComponentListItem](
        items=[serialize_component_list_item(item) for item in items],
        meta=make_pagination(page, min(per_page, 100), total),
    )


@router.get("/tags/{slug}/components", response_model=PaginatedResponse[ComponentListItem])
async def get_tag_components(
    slug: str,
    page: int = 1,
    per_page: int = 20,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    redis: Annotated[Redis, Depends(get_redis)] = None,
):
    items, total = await ComponentService(db, redis).list_components(
        {"tags": [slug]},
        {"page": page, "per_page": min(per_page, 100)},
        "newest",
    )
    return PaginatedResponse[ComponentListItem](
        items=[serialize_component_list_item(item) for item in items],
        meta=make_pagination(page, min(per_page, 100), total),
    )


@router.get("/{slug}", response_model=ComponentDetail)
async def get_component_detail(
    slug: str,
    background_tasks: BackgroundTasks,
    request: Request,
    current_user: Annotated[User | None, Depends(get_optional_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    component = await ComponentRepository(db).get_by_slug(slug)
    if not component:
        raise NotFoundError("Component not found.")
    include_code = AccessControlService.can_access_premium_code(component, current_user)
    background_tasks.add_task(record_analytics_task.delay, {"component_id": str(component.id), "event_type": "view"})
    background_tasks.add_task(ComponentService(db, redis).record_view, component.id)
    return serialize_component(component, include_code=include_code, requires_pro=component.is_pro and not include_code)


@router.post("/{slug}/view", response_model=MessageResponse)
async def record_view(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    component = await ComponentRepository(db).get_by_slug(slug)
    if not component:
        raise NotFoundError("Component not found.")
    await ComponentService(db, redis).record_view(component.id)
    return MessageResponse(message="View recorded.")


@router.get("/{slug}/related", response_model=list[ComponentListItem])
async def related_components(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_slug(slug)
    if not component:
        raise NotFoundError("Component not found.")
    items = await repo.get_related(component)
    return [serialize_component_list_item(item) for item in items]


@router.post("/{slug}/copy", response_model=dict)
async def copy_component(
    slug: str,
    request: Request,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    component = await ComponentRepository(db).get_by_slug(slug)
    if not component:
        raise NotFoundError("Component not found.")
    if current_user.subscription_tier == SubscriptionTier.FREE and component.is_pro:
        key = f"copy_limit:{current_user.id}:{request.headers.get('x-day', 'default')}"
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, 86400)
        if current > 20:
            raise RateLimitError("Free tier copy limit reached for today.")
    code_files = await ComponentService(db, redis).copy_component(component, current_user)
    record_analytics_task.delay({"component_id": str(component.id), "user_id": str(current_user.id), "event_type": "copy"})
    return {
        "code_files": [
            CodeFile(
                id=str(item.id),
                filename=item.filename,
                language=item.language.value,
                code=item.code,
                is_primary=item.is_primary,
                order=item.order,
            ).model_dump()
            for item in code_files
        ],
        "message": "Copied!",
    }


@router.post("/{slug}/download")
async def download_component(
    slug: str,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    component = await ComponentRepository(db).get_by_slug(slug)
    if not component:
        raise NotFoundError("Component not found.")
    buffer = await ComponentService(db, redis).download_component(component, current_user)
    record_analytics_task.delay({"component_id": str(component.id), "user_id": str(current_user.id), "event_type": "download"})
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{component.slug}.zip"'},
    )


@router.post("", response_model=ComponentDetail)
async def create_component(
    payload: ComponentCreate,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    component = await ComponentService(db, redis).create_component(payload.model_dump(), current_user)
    return serialize_component(component, include_code=True)


@router.patch("/{slug}", response_model=ComponentDetail)
async def update_component(
    slug: str,
    payload: ComponentUpdate,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_slug(slug, include_unpublished=True)
    if not component:
        raise NotFoundError("Component not found.")
    updated = await ComponentService(db, redis).update_component(component, payload.model_dump(exclude_none=True), current_user)
    return serialize_component(updated, include_code=True)


@router.delete("/{slug}", status_code=204)
async def delete_component(
    slug: str,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_slug(slug, include_unpublished=True)
    if not component:
        raise NotFoundError("Component not found.")
    await repo.soft_delete(component)
    await redis.delete(f"component:{slug}")


@router.post("/creator/components/submit", response_model=ComponentSubmissionResponse)
async def submit_component(
    payload: ComponentSubmissionCreate,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    submission = await ComponentService(db, redis).submit_component(current_user, payload.model_dump())
    return ComponentSubmissionResponse.model_validate(
        {
            "id": str(submission.id),
            "name": submission.name,
            "slug": submission.slug,
            "short_description": submission.short_description,
            "framework": submission.framework.value,
            "status": submission.status.value,
            "reviewer_notes": submission.reviewer_notes,
            "reviewed_at": submission.reviewed_at,
            "created_at": submission.created_at,
        }
    )


@router.get("/creator/components", response_model=list[ComponentSubmissionResponse])
async def list_creator_submissions(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    items = await ComponentRepository(db).list_submissions_by_creator(current_user.id)
    return [
        ComponentSubmissionResponse.model_validate(
            {
                "id": str(item.id),
                "name": item.name,
                "slug": item.slug,
                "short_description": item.short_description,
                "framework": item.framework.value,
                "status": item.status.value,
                "reviewer_notes": item.reviewer_notes,
                "reviewed_at": item.reviewed_at,
                "created_at": item.created_at,
            }
        )
        for item in items
    ]
