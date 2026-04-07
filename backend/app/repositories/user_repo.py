from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.session.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_github_id(self, github_id: str) -> User | None:
        result = await self.session.execute(select(User).where(User.github_id == github_id))
        return result.scalar_one_or_none()

    async def get_by_customer_id(self, stripe_customer_id: str) -> User | None:
        result = await self.session.execute(select(User).where(User.stripe_customer_id == stripe_customer_id))
        return result.scalar_one_or_none()

    async def email_or_username_exists(self, *, email: str, username: str) -> bool:
        result = await self.session.execute(
            select(func.count()).select_from(User).where(or_(User.email == email, User.username == username))
        )
        return (result.scalar_one() or 0) > 0

    async def update_last_login(self, user: User) -> User:
        user.last_login_at = datetime.now(UTC)
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_by_id(self, user_id: UUID) -> User | None:
        return await self.get(user_id)
