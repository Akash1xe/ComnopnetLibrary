from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuthenticationError, AuthorizationError, ConflictError, NotFoundError, RateLimitError
from app.core.security import create_access_token, create_refresh_token, create_signed_token, decode_token, hash_password, verify_password
from app.models.user import SubscriptionTier, User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserRegister
from app.tasks.email_tasks import send_email_task


class AuthService:
    def __init__(self, session: AsyncSession, redis: Redis) -> None:
        self.session = session
        self.redis = redis
        self.users = UserRepository(session)

    async def register(self, payload: UserRegister) -> User:
        if await self.users.get_by_email(payload.email):
            raise ConflictError("Email is already taken.")
        if await self.users.get_by_username(payload.username):
            raise ConflictError("Username is already taken.")

        user = await self.users.create(
            {
                "email": payload.email,
                "username": payload.username,
                "full_name": payload.full_name,
                "hashed_password": hash_password(payload.password),
                "is_verified": False,
            }
        )
        token = create_signed_token({"sub": str(user.id)}, token_type="email_verify", expires_delta=timedelta(hours=24))
        verification_url = f"{settings.frontend_url}/verify-email?token={token}"
        send_email_task.delay(
            user.email,
            "Verify your email",
            f"<p>Verify your account by clicking <a href='{verification_url}'>here</a>.</p>",
        )
        return user

    async def verify_email(self, token: str) -> dict[str, str]:
        payload = decode_token(token)
        if payload.get("type") != "email_verify":
            raise AuthenticationError("Invalid email verification token.")
        user = await self.users.get_by_id(payload["sub"])
        if not user:
            raise NotFoundError("User not found.")
        user.is_verified = True
        await self.session.flush()
        return await self._issue_tokens(user)

    async def login(self, email: str, password: str) -> dict[str, Any]:
        attempt_key = f"login_attempts:{email}"
        attempts = int(await self.redis.get(attempt_key) or 0)
        if attempts >= settings.login_attempt_limit:
            raise RateLimitError("Too many login attempts. Try again later.")

        user = await self.users.get_by_email(email)
        if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
            attempts = await self.redis.incr(attempt_key)
            if attempts == 1:
                await self.redis.expire(attempt_key, settings.login_lock_minutes * 60)
            raise AuthenticationError("Invalid email or password.")
        if not user.is_active:
            raise AuthorizationError("Inactive account.")

        await self.redis.delete(attempt_key)
        await self.users.update_last_login(user)
        return await self._issue_tokens(user)

    async def refresh_tokens(self, refresh_token: str) -> dict[str, Any]:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise AuthenticationError("Invalid refresh token.")
        user_id = payload["sub"]
        token_id = payload["jti"]
        redis_key = f"refresh:{user_id}:{token_id}"
        if not await self.redis.exists(redis_key):
            raise AuthenticationError("Refresh token has been revoked.")
        await self.redis.delete(redis_key)
        user = await self.users.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
        return await self._issue_tokens(user)

    async def logout(self, access_payload: dict[str, Any], refresh_token: str | None = None) -> None:
        expires_at = access_payload.get("exp")
        jti = access_payload.get("jti")
        if jti and expires_at:
            ttl = max(int(expires_at - datetime.now(UTC).timestamp()), 1)
            await self.redis.setex(f"blacklist:{jti}", ttl, "1")
        if refresh_token:
            payload = decode_token(refresh_token)
            await self.redis.delete(f"refresh:{payload['sub']}:{payload['jti']}")

    async def forgot_password(self, email: str) -> None:
        user = await self.users.get_by_email(email)
        if not user:
            return
        token = create_signed_token({"sub": str(user.id)}, token_type="password_reset", expires_delta=timedelta(hours=1))
        reset_url = f"{settings.frontend_url}/reset-password?token={token}"
        send_email_task.delay(
            user.email,
            "Reset your password",
            f"<p>Reset your password by clicking <a href='{reset_url}'>here</a>.</p>",
        )

    async def reset_password(self, token: str, new_password: str) -> None:
        payload = decode_token(token)
        if payload.get("type") != "password_reset":
            raise AuthenticationError("Invalid reset token.")
        blacklist_key = f"password_reset_used:{payload['jti']}"
        if await self.redis.exists(blacklist_key):
            raise AuthenticationError("Password reset token already used.")
        user = await self.users.get_by_id(payload["sub"])
        if not user:
            raise NotFoundError("User not found.")
        user.hashed_password = hash_password(new_password)
        await self.session.flush()
        await self.redis.setex(blacklist_key, 3600, "1")
        for key in await self.redis.keys(f"refresh:{user.id}:*"):
            await self.redis.delete(key)

    async def github_authorize_url(self) -> str:
        state = str(uuid4())
        await self.redis.setex(f"github_oauth_state:{state}", 600, "1")
        params = urlencode(
            {
                "client_id": settings.github_client_id,
                "redirect_uri": str(settings.github_redirect_uri),
                "scope": "read:user user:email",
                "state": state,
            }
        )
        return f"https://github.com/login/oauth/authorize?{params}"

    async def github_callback(self, code: str, state: str) -> tuple[dict[str, Any], bool]:
        if not await self.redis.exists(f"github_oauth_state:{state}"):
            raise AuthenticationError("Invalid OAuth state.")
        await self.redis.delete(f"github_oauth_state:{state}")

        async with httpx.AsyncClient(timeout=20) as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                    "redirect_uri": str(settings.github_redirect_uri),
                    "state": state,
                },
            )
            token_response.raise_for_status()
            github_token = token_response.json()["access_token"]
            profile_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {github_token}", "Accept": "application/json"},
            )
            profile_response.raise_for_status()
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {github_token}", "Accept": "application/json"},
            )
            emails_response.raise_for_status()

        profile = profile_response.json()
        primary_email = next((item["email"] for item in emails_response.json() if item.get("primary")), None)
        if primary_email is None:
            raise AuthenticationError("GitHub account has no primary email.")

        is_new_user = False
        user = await self.users.get_by_github_id(str(profile["id"]))
        if not user:
            user = await self.users.get_by_email(primary_email)
            if user:
                user.github_id = str(profile["id"])
                user.github_username = profile.get("login")
                user.avatar_url = profile.get("avatar_url")
            else:
                is_new_user = True
                user = await self.users.create(
                    {
                        "email": primary_email,
                        "username": profile.get("login"),
                        "full_name": profile.get("name"),
                        "avatar_url": profile.get("avatar_url"),
                        "github_id": str(profile["id"]),
                        "github_username": profile.get("login"),
                        "is_verified": True,
                    }
                )
        await self.session.flush()
        return await self._issue_tokens(user), is_new_user

    async def _issue_tokens(self, user: User) -> dict[str, Any]:
        access_token = create_access_token({"sub": str(user.id), "tier": user.subscription_tier.value})
        refresh_token = create_refresh_token({"sub": str(user.id), "tier": user.subscription_tier.value})
        refresh_payload = decode_token(refresh_token)
        await self.redis.setex(
            f"refresh:{user.id}:{refresh_payload['jti']}",
            settings.refresh_token_expire_days * 86400,
            "1",
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }
