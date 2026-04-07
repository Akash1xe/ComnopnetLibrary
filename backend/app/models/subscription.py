from __future__ import annotations

import enum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AppBaseModel


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"


class Subscription(AppBaseModel):
    __tablename__ = "subscriptions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    stripe_subscription_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    stripe_price_id: Mapped[str] = mapped_column(String(100), nullable=False)
    plan: Mapped[SubscriptionPlan] = mapped_column(Enum(SubscriptionPlan, name="subscription_plan_enum"), nullable=False)
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, name="subscription_status_enum"),
        nullable=False,
        default=SubscriptionStatus.INCOMPLETE,
        server_default=SubscriptionStatus.INCOMPLETE.value,
    )
    current_period_start: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_period_end: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    user = relationship("User", back_populates="subscriptions")
