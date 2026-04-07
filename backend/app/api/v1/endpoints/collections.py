from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_active_user
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.collection_repo import CollectionRepository
from app.schemas.collection import CollectionCreate, CollectionResponse, CollectionUpdate
from app.schemas.common import MessageResponse
from app.api.v1.endpoints.components import serialize_component_list_item

router = APIRouter()


@router.get("", response_model=list[CollectionResponse])
async def list_collections(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    collections = await CollectionRepository(db).list_by_user(current_user.id)
    return [
        CollectionResponse.model_validate(
            {
                "id": str(item.id),
                "user_id": str(item.user_id),
                "name": item.name,
                "description": item.description,
                "is_public": item.is_public,
                "slug": item.slug,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "components": [serialize_component_list_item(component).model_dump() for component in item.components],
                "component_count": len(item.components),
            }
        )
        for item in collections
    ]


@router.post("", response_model=CollectionResponse)
async def create_collection(
    payload: CollectionCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CollectionRepository(db)
    collection = await repo.create(
        {
            "user_id": current_user.id,
            "name": payload.name,
            "description": payload.description,
            "is_public": payload.is_public,
            "slug": f"{current_user.username}-{payload.name.lower().replace(' ', '-')}",
        }
    )
    return CollectionResponse.model_validate(
        {
            "id": str(collection.id),
            "user_id": str(collection.user_id),
            "name": collection.name,
            "description": collection.description,
            "is_public": collection.is_public,
            "slug": collection.slug,
            "created_at": collection.created_at,
            "updated_at": collection.updated_at,
            "components": [],
            "component_count": 0,
        }
    )


@router.patch("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    payload: CollectionUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CollectionRepository(db)
    collection = await repo.get(collection_id)
    if not collection or str(collection.user_id) != str(current_user.id):
        raise NotFoundError("Collection not found.")
    updated = await repo.update(collection, payload.model_dump(exclude_none=True))
    return CollectionResponse.model_validate(
        {
            "id": str(updated.id),
            "user_id": str(updated.user_id),
            "name": updated.name,
            "description": updated.description,
            "is_public": updated.is_public,
            "slug": updated.slug,
            "created_at": updated.created_at,
            "updated_at": updated.updated_at,
            "components": [serialize_component_list_item(component).model_dump() for component in updated.components],
            "component_count": len(updated.components),
        }
    )


@router.post("/{collection_id}/components", response_model=MessageResponse)
async def add_component_to_collection(
    collection_id: str,
    payload: dict,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CollectionRepository(db)
    collection = await repo.get_with_components(collection_id)
    if not collection or str(collection.user_id) != str(current_user.id):
        raise NotFoundError("Collection not found.")
    await repo.add_component(collection, payload["component_id"])
    return MessageResponse(message="Component saved to collection.")


@router.delete("/{collection_id}/components/{component_id}", response_model=MessageResponse)
async def remove_component_from_collection(
    collection_id: str,
    component_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CollectionRepository(db)
    collection = await repo.get_with_components(collection_id)
    if not collection or str(collection.user_id) != str(current_user.id):
        raise NotFoundError("Collection not found.")
    await repo.remove_component(collection, component_id)
    return MessageResponse(message="Component removed from collection.")


@router.delete("/{collection_id}", response_model=MessageResponse)
async def delete_collection(
    collection_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CollectionRepository(db)
    collection = await repo.get(collection_id)
    if not collection or str(collection.user_id) != str(current_user.id):
        raise NotFoundError("Collection not found.")
    await repo.delete_instance(collection)
    return MessageResponse(message="Collection deleted.")


@router.get("/public", response_model=list[CollectionResponse])
async def list_public_collections(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return [
        CollectionResponse.model_validate(
            {
                "id": str(item.id),
                "user_id": str(item.user_id),
                "name": item.name,
                "description": item.description,
                "is_public": item.is_public,
                "slug": item.slug,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "components": [serialize_component_list_item(component).model_dump() for component in item.components],
                "component_count": len(item.components),
            }
        )
        for item in await CollectionRepository(db).list_public()
    ]
