from datetime import UTC, datetime

from fastapi import Request
from redis.asyncio import Redis
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.exceptions import RateLimitError
from app.core.redis import redis_client
from app.core.security import decode_token


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis: Redis | None = None) -> None:
        super().__init__(app)
        self.redis = redis or redis_client

    async def dispatch(self, request: Request, call_next):
        if request.url.path.endswith("/health") or request.url.path.startswith("/docs") or request.url.path.startswith("/redoc"):
            return await call_next(request)

        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        tier = "free"
        user_key = request.client.host if request.client else "anonymous"

        if token:
            try:
                payload = decode_token(token)
                tier = payload.get("tier", "free")
                user_key = payload.get("sub", user_key)
            except Exception:
                pass

        limit = {
            "free": settings.rate_limit_free_per_hour,
            "pro": settings.rate_limit_pro_per_hour,
            "team": settings.rate_limit_team_per_hour,
        }.get(tier, settings.rate_limit_team_per_hour)

        hour_bucket = datetime.now(UTC).strftime("%Y%m%d%H")
        redis_key = f"rate_limit:{tier}:{user_key}:{hour_bucket}"
        current = await self.redis.incr(redis_key)
        if current == 1:
            await self.redis.expire(redis_key, 3600)
        if current > limit:
            raise RateLimitError(f"Rate limit exceeded for {tier} tier.")

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(limit - current, 0))
        return response
