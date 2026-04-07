from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription, SubscriptionStatus
from app.repositories.base import BaseRepository


class SubscriptionRepository(BaseRepository[Subscription]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Subscription)

    async def get_by_user_id(self, user_id) -> Subscription | None:
        result = await self.session.execute(select(Subscription).where(Subscription.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_by_stripe_id(self, stripe_subscription_id: str) -> Subscription | None:
        result = await self.session.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == stripe_subscription_id)
        )
        return result.scalar_one_or_none()

    async def get_active_count(self) -> int:
        result = await self.session.execute(
            select(func.count()).select_from(Subscription).where(Subscription.status == SubscriptionStatus.ACTIVE)
        )
        return result.scalar_one()

    async def get_mrr(self) -> float:
        result = await self.session.execute(
            select(func.count()).select_from(Subscription).where(Subscription.status == SubscriptionStatus.ACTIVE)
        )
        active = result.scalar_one()
        return float(active * 19)
