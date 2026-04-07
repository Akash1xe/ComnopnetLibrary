from __future__ import annotations

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Table, Text, Column, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import AppBaseModel

collection_components = Table(
    "collection_components",
    Base.metadata,
    Column("collection_id", PGUUID(as_uuid=True), ForeignKey("collections.id", ondelete="CASCADE"), primary_key=True),
    Column("component_id", PGUUID(as_uuid=True), ForeignKey("components.id", ondelete="CASCADE"), primary_key=True),
    Column("added_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)


class Collection(AppBaseModel):
    __tablename__ = "collections"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)

    user = relationship("User", back_populates="collections")
    components = relationship("Component", secondary=collection_components, lazy="selectin")
