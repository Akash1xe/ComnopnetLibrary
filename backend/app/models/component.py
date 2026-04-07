from __future__ import annotations

import enum
from typing import Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AppBaseModel, SoftDeleteMixin


def enum_values(enum_cls: type[enum.Enum]) -> list[str]:
    return [item.value for item in enum_cls]


class ComponentFramework(str, enum.Enum):
    REACT = "react"
    VUE = "vue"
    SVELTE = "svelte"
    ANGULAR = "angular"
    HTML = "html"


class ComponentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class CodeLanguage(str, enum.Enum):
    TSX = "tsx"
    JSX = "jsx"
    CSS = "css"
    TS = "ts"
    JS = "js"
    JSON = "json"
    HTML = "html"
    PYTHON = "python"
    MD = "md"


class TrustBadgeType(str, enum.Enum):
    TEAM_CURATED = "team_curated"
    VERIFIED_CREATOR = "verified_creator"
    ACCESSIBLE = "accessible"
    RESPONSIVE = "responsive"
    DARK_MODE_READY = "dark_mode_ready"
    RECENTLY_UPDATED = "recently_updated"
    POPULAR = "popular"
    TRENDING = "trending"
    TYPESCRIPT = "typescript"
    TESTED = "tested"


class SubmissionStatus(str, enum.Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class Category(AppBaseModel):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(80), nullable=True)
    parent_id: Mapped[UUID | None] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent")
    components = relationship("Component", back_populates="category")


class Tag(AppBaseModel):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String(60), nullable=False)
    slug: Mapped[str] = mapped_column(String(60), nullable=False, unique=True, index=True)

    components = relationship("Component", secondary="component_tags", back_populates="tags")


class Component(SoftDeleteMixin, AppBaseModel):
    __tablename__ = "components"

    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    long_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[UUID | None] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    framework: Mapped[ComponentFramework] = mapped_column(
        Enum(ComponentFramework, name="component_framework_enum", values_callable=enum_values),
        nullable=False,
        default=ComponentFramework.REACT,
        server_default=ComponentFramework.REACT.value,
    )
    is_free: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true", index=True)
    status: Mapped[ComponentStatus] = mapped_column(
        Enum(ComponentStatus, name="component_status_enum", values_callable=enum_values),
        nullable=False,
        default=ComponentStatus.DRAFT,
        server_default=ComponentStatus.DRAFT.value,
        index=True,
    )
    is_featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false", index=True)
    is_trending: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false", index=True)
    creator_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    preview_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    preview_video_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    preview_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    downloads_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    views_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    copies_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0.0", server_default="1.0.0")
    published_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True), nullable=True)
    install_command: Mapped[str | None] = mapped_column(Text, nullable=True)
    dependencies: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    compatibility_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    search_vector: Mapped[Any] = mapped_column(TSVECTOR, nullable=True, server_default=func.to_tsvector("english", ""))

    creator = relationship("User", back_populates="components")
    category = relationship("Category", back_populates="components")
    tags = relationship("Tag", secondary="component_tags", back_populates="components")
    versions = relationship("ComponentVersion", back_populates="component", cascade="all,delete-orphan")
    analytics = relationship("ComponentAnalytics", back_populates="component", cascade="all,delete-orphan")
    code_files = relationship("ComponentCode", back_populates="component", cascade="all,delete-orphan", order_by="ComponentCode.order")
    trust_badges = relationship("TrustBadge", back_populates="component", cascade="all,delete-orphan")
    submissions = relationship("ComponentSubmission", back_populates="component")

    __table_args__ = (
        Index("ix_components_search_vector", "search_vector", postgresql_using="gin"),
        Index("ix_components_creator_created_at", "creator_id", "created_at"),
        Index("ix_components_status_created_at", "status", "created_at"),
    )

    @property
    def is_pro(self) -> bool:
        return not self.is_free

    @property
    def author_id(self) -> UUID:
        return self.creator_id

    @property
    def author(self):
        return self.creator


class ComponentTag(AppBaseModel):
    __tablename__ = "component_tags"

    component_id: Mapped[UUID] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id: Mapped[UUID] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"), nullable=False, index=True)

    __table_args__ = (UniqueConstraint("component_id", "tag_id", name="uq_component_tags_component_id"),)


class ComponentCode(AppBaseModel):
    __tablename__ = "component_codes"

    component_id: Mapped[UUID] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(160), nullable=False)
    language: Mapped[CodeLanguage] = mapped_column(
        Enum(CodeLanguage, name="code_language_enum", values_callable=enum_values),
        nullable=False,
    )
    code: Mapped[str] = mapped_column(Text, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    component = relationship("Component", back_populates="code_files")


class ComponentVersion(AppBaseModel):
    __tablename__ = "component_versions"

    component_id: Mapped[UUID] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), nullable=False, index=True)
    version_string: Mapped[str] = mapped_column(String(20), nullable=False)
    changelog: Mapped[str | None] = mapped_column(Text, nullable=True)
    files_snapshot: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))

    component = relationship("Component", back_populates="versions")


class TrustBadge(AppBaseModel):
    __tablename__ = "trust_badges"

    component_id: Mapped[UUID] = mapped_column(ForeignKey("components.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_type: Mapped[TrustBadgeType] = mapped_column(
        Enum(TrustBadgeType, name="trust_badge_type_enum", values_callable=enum_values),
        nullable=False,
        index=True,
    )

    component = relationship("Component", back_populates="trust_badges")

    __table_args__ = (UniqueConstraint("component_id", "badge_type", name="uq_trust_badges_component_id"),)


class ComponentSubmission(AppBaseModel):
    __tablename__ = "component_submissions"

    creator_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id: Mapped[UUID | None] = mapped_column(ForeignKey("components.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    long_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    framework: Mapped[ComponentFramework] = mapped_column(Enum(ComponentFramework, name="component_framework_enum"), nullable=False)
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus, name="component_submission_status_enum", values_callable=enum_values),
        nullable=False,
        default=SubmissionStatus.PENDING_REVIEW,
        server_default=SubmissionStatus.PENDING_REVIEW.value,
    )
    reviewer_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[Any | None] = mapped_column(DateTime(timezone=True), nullable=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))

    component = relationship("Component", back_populates="submissions")
