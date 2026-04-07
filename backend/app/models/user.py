from __future__ import annotations

import enum

from sqlalchemy import Boolean, DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AppBaseModel


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"


class User(AppBaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(Text, nullable=True)
    github_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    github_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_superuser: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        Enum(SubscriptionTier, name="subscription_tier_enum"),
        nullable=False,
        default=SubscriptionTier.FREE,
        server_default=SubscriptionTier.FREE.value,
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True, index=True)
    last_login_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    components = relationship("Component", back_populates="creator", cascade="all,delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all,delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all,delete-orphan")
    analytics = relationship("ComponentAnalytics", back_populates="user")
