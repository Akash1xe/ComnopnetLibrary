from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.collection import Collection
from app.models.component import Component, ComponentStatus
from app.repositories.base import BaseRepository


class CollectionRepository(BaseRepository[Collection]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Collection)

    async def get_by_slug(self, slug: str) -> Collection | None:
        result = await self.session.execute(
            select(Collection).options(selectinload(Collection.components)).where(Collection.slug == slug)
        )
        return result.scalar_one_or_none()

    async def get_with_components(self, collection_id: str) -> Collection | None:
        result = await self.session.execute(
            select(Collection).options(
                selectinload(Collection.components).selectinload(Component.category),
                selectinload(Collection.components).selectinload(Component.creator),
                selectinload(Collection.components).selectinload(Component.tags),
                selectinload(Collection.components).selectinload(Component.trust_badges),
            ).where(Collection.id == collection_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id):
        result = await self.session.execute(
            select(Collection).options(
                selectinload(Collection.components).selectinload(Component.category),
                selectinload(Collection.components).selectinload(Component.creator),
                selectinload(Collection.components).selectinload(Component.tags),
                selectinload(Collection.components).selectinload(Component.trust_badges),
            )
            .where(Collection.user_id == user_id)
        )
        return list(result.scalars().all())

    async def list_public(self):
        result = await self.session.execute(
            select(Collection).options(
                selectinload(Collection.components).selectinload(Component.category),
                selectinload(Collection.components).selectinload(Component.creator),
                selectinload(Collection.components).selectinload(Component.tags),
                selectinload(Collection.components).selectinload(Component.trust_badges),
            ).where(Collection.is_public.is_(True))
        )
        return list(result.scalars().all())

    async def add_component(self, collection: Collection, component_id: str) -> None:
        component = await self.session.get(Component, component_id)
        if component and component.status == ComponentStatus.PUBLISHED and component not in collection.components:
            collection.components.append(component)
            self.session.add(collection)
            await self.session.flush()

    async def remove_component(self, collection: Collection, component_id: str) -> None:
        collection.components = [component for component in collection.components if str(component.id) != str(component_id)]
        self.session.add(collection)
        await self.session.flush()

    async def delete_instance(self, collection: Collection) -> None:
        await self.session.delete(collection)
        await self.session.flush()
