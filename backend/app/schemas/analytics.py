from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnalyticsEventCreate(BaseModel):
    component_id: str
    event_type: str
    referrer: str | None = None


class AnalyticsEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    component_id: str
    user_id: str | None
    event_type: str
    created_at: datetime
