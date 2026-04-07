from __future__ import annotations

import enum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AppBaseModel


class AnalyticsEventType(str, enum.Enum):
    VIEW = "view"
    COPY = "copy"
    DOWNLOAD = "download"


class ComponentAnalytics(AppBaseModel):
    __tablename__ = "component_analytics"

    component_id: Mapped[str] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_type: Mapped[AnalyticsEventType] = mapped_column(Enum(AnalyticsEventType, name="analytics_event_type_enum"), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    referrer: Mapped[str | None] = mapped_column(Text, nullable=True)
    country_code: Mapped[str | None] = mapped_column(String(2), nullable=True)

    component = relationship("Component", back_populates="analytics")
    user = relationship("User", back_populates="analytics")

    __table_args__ = (
        Index("ix_component_analytics_component_event_created", "component_id", "event_type", "created_at"),
    )


class WebhookEventLog(AppBaseModel):
    __tablename__ = "webhook_event_logs"

    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    event_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    event_type: Mapped[str] = mapped_column(String(255), nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    processed_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
