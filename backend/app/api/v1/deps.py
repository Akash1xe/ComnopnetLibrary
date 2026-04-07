from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.redis import get_redis
from app.core.security import decode_token
from app.models.user import SubscriptionTier, User
from app.repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> User:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise AuthenticationError("Invalid access token.")
    if await redis.exists(f"blacklist:{payload['jti']}"):
        raise AuthenticationError("Access token has been revoked.")
    user = await UserRepository(db).get_by_id(payload["sub"])
    if not user:
        raise AuthenticationError("User not found.")
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_active:
        raise AuthorizationError("Inactive account.")
    return current_user


async def get_current_verified_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    if not current_user.is_verified:
        raise AuthorizationError("Email verification required.")
    return current_user


async def get_current_superuser(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    if not current_user.is_superuser:
        raise AuthorizationError("Superuser access required.")
    return current_user


async def require_pro_tier(
    current_user: Annotated[User, Depends(get_current_verified_user)],
) -> User:
    if current_user.subscription_tier not in {SubscriptionTier.PRO, SubscriptionTier.TEAM}:
        raise AuthorizationError("Upgrade to Pro or Team to access this resource.")
    return current_user
