from collections.abc import AsyncIterator

from redis.asyncio import Redis

from app.core.config import settings

redis_client = Redis.from_url(
    settings.redis_url,
    decode_responses=True,
    encoding="utf-8",
    max_connections=50,
)


async def get_redis() -> AsyncIterator[Redis]:
    yield redis_client
