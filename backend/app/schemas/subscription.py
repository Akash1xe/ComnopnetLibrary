from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class PlanInfo(BaseModel):
    name: str
    price_monthly: int
    price_annual: int
    features: list[str]
    stripe_price_id_monthly: str | None
    stripe_price_id_annual: str | None


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    plan: str
    status: str
    current_period_end: datetime | None
    cancel_at_period_end: bool


class CheckoutRequest(BaseModel):
    plan: Literal["pro", "team"]
    billing: Literal["monthly", "annual"]


class CheckoutResponse(BaseModel):
    checkout_url: str
