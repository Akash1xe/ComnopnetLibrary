from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_superuser
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.models.component import Component, ComponentStatus
from app.models.user import User
from app.repositories.component_repo import ComponentRepository
from app.repositories.subscription_repo import SubscriptionRepository
from app.schemas.common import MessageResponse, PaginatedResponse, make_pagination
from app.schemas.component import ComponentCreate, ComponentDetail, ComponentListItem, ComponentUpdate
from app.services.component_service import ComponentService
from app.api.v1.endpoints.components import serialize_component, serialize_component_list_item

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    subscriptions = SubscriptionRepository(db)
    users_count = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    pending_components = (
        await db.execute(select(func.count()).select_from(Component).where(Component.status == ComponentStatus.DRAFT))
    ).scalar_one()
    return {
        "users_count": users_count,
        "pending_components": pending_components,
        "active_subscriptions": await subscriptions.get_active_count(),
        "mrr": await subscriptions.get_mrr(),
    }


@router.get("/components", response_model=PaginatedResponse[ComponentListItem])
async def admin_list_components(
    current_user: Annotated[User, Depends(get_current_superuser)],
    page: int = 1,
    per_page: int = 50,
    category: str | None = None,
    framework: str | None = None,
    creator: str | None = None,
    search: str | None = None,
    status: str | None = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    items, total = await ComponentService(db, None).list_components(
        {
            "category": category,
            "framework": framework,
            "creator": creator,
            "search": search,
            "status": status,
        },
        {"page": page, "per_page": min(per_page, 100)},
        "newest",
        include_unpublished=True,
    )
    return PaginatedResponse[ComponentListItem](
        items=[serialize_component_list_item(item) for item in items],
        meta=make_pagination(page, min(per_page, 100), total),
    )


@router.get("/components/{component_id}", response_model=ComponentDetail)
async def admin_get_component(
    component_id: str,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_id(component_id, include_unpublished=True)
    if not component:
        raise NotFoundError("Component not found.")
    return serialize_component(component, include_code=True)


@router.post("/components", response_model=ComponentDetail)
async def admin_create_component(
    payload: ComponentCreate,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    component = await ComponentService(db, None).create_component(payload.model_dump(), current_user)
    return serialize_component(component, include_code=True)


@router.patch("/components/{component_id}", response_model=ComponentDetail)
async def admin_update_component(
    component_id: str,
    payload: ComponentUpdate,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_id(component_id, include_unpublished=True)
    if not component:
        raise NotFoundError("Component not found.")
    updated = await ComponentService(db, None).update_component(component, payload.model_dump(exclude_none=True), current_user)
    return serialize_component(updated, include_code=True)


@router.patch("/components/{component_id}/status", response_model=MessageResponse)
async def admin_change_component_status(
    component_id: str,
    payload: dict,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_id(component_id, include_unpublished=True)
    if not component:
        raise NotFoundError("Component not found.")
    await ComponentService(db, None).update_component(component, {"status": payload["status"]}, current_user)
    return MessageResponse(message="Status updated.")


@router.delete("/components/{component_id}", response_model=MessageResponse)
async def admin_delete_component(
    component_id: str,
    current_user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = ComponentRepository(db)
    component = await repo.get_by_id(component_id, include_unpublished=True)
    if not component:
        raise NotFoundError("Component not found.")
    await repo.soft_delete(component)
    return MessageResponse(message="Component archived.")
