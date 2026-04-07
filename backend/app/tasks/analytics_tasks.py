import asyncio

from app.services.component_service import ComponentService
from app.tasks.celery_app import celery_app


@celery_app.task(name="record_analytics")
def record_analytics_task(payload: dict) -> None:
    asyncio.run(ComponentService.record_analytics_event(payload))
