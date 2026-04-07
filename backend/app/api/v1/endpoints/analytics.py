from typing import Annotated

from fastapi import APIRouter, Depends, Request
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_active_user
from app.core.database import get_db
from app.core.redis import get_redis
from app.models.user import User
from app.schemas.common import MessageResponse
from app.tasks.analytics_tasks import record_analytics_task

router = APIRouter()


@router.post("/track", response_model=MessageResponse)
async def track_event(
    request: Request,
    payload: dict,
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    body = {
        **payload,
        "user_id": str(current_user.id),
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "referrer": request.headers.get("referer"),
    }
    record_analytics_task.delay(body)
    return {"message": "Tracked"}
