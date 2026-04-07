from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryBase(BaseModel):
    name: str = Field(max_length=80)
    slug: str = Field(max_length=80)
    description: str | None = None
    icon: str | None = None
    parent_id: str | None = None
    order: int = 0


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    count: int | None = None


class TagBase(BaseModel):
    name: str = Field(max_length=60)
    slug: str = Field(max_length=60)


class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    count: int | None = None


class TrustBadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str | None = None
    badge_type: str


class CreatorSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str | None = None
    username: str
    full_name: str | None = None
    avatar_url: str | None = None
    is_verified: bool | None = None


class CodeFile(BaseModel):
    id: str | None = None
    filename: str = Field(max_length=160)
    language: Literal["tsx", "jsx", "css", "ts", "js", "json", "html", "python", "md"]
    code: str
    is_primary: bool = False
    order: int = 0


class ComponentVersion(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version_string: str
    changelog: str | None
    created_at: datetime


class ComponentCreate(BaseModel):
    name: str = Field(max_length=120)
    short_description: str | None = None
    long_description: str | None = None
    category_slug: str
    tag_slugs: list[str] = Field(default_factory=list)
    framework: Literal["react", "vue", "svelte", "angular", "html"] = "react"
    code_files: list[CodeFile]
    is_free: bool = True
    status: Literal["draft", "published", "rejected", "archived"] = "draft"
    is_featured: bool = False
    is_trending: bool = False
    preview_image_url: str | None = None
    preview_video_url: str | None = None
    preview_url: str | None = None
    install_command: str | None = None
    dependencies: list[str] = Field(default_factory=list)
    compatibility_notes: str | None = None
    trust_badges: list[str] = Field(default_factory=list)

    @field_validator("code_files")
    @classmethod
    def validate_code_files(cls, value: list[CodeFile]) -> list[CodeFile]:
        if not value:
            raise ValueError("At least one code file is required.")
        if sum(1 for item in value if item.is_primary) != 1:
            raise ValueError("Exactly one code file must be primary.")
        return value


class ComponentUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    short_description: str | None = None
    long_description: str | None = None
    category_slug: str | None = None
    tag_slugs: list[str] | None = None
    framework: Literal["react", "vue", "svelte", "angular", "html"] | None = None
    code_files: list[CodeFile] | None = None
    is_free: bool | None = None
    status: Literal["draft", "published", "rejected", "archived"] | None = None
    is_featured: bool | None = None
    is_trending: bool | None = None
    preview_image_url: str | None = None
    preview_video_url: str | None = None
    preview_url: str | None = None
    install_command: str | None = None
    dependencies: list[str] | None = None
    compatibility_notes: str | None = None
    trust_badges: list[str] | None = None
    changelog: str | None = None


class ComponentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    description: str | None
    category: str | None
    category_slug: str | None = None
    tags: list[str] = Field(default_factory=list)
    is_pro: bool
    is_free: bool
    preview_image_url: str | None
    preview_video_url: str | None = None
    views_count: int
    copies_count: int
    downloads_count: int
    author: CreatorSummary
    created_at: datetime
    framework: str
    version: str
    trust_badges: list[TrustBadgeResponse] = Field(default_factory=list)
    relevance: float | None = None


class ComponentDetail(ComponentListItem):
    long_description: str | None
    preview_url: str | None = None
    install_command: str | None = None
    dependencies: list[str] = Field(default_factory=list)
    compatibility_notes: str | None = None
    code_files: list[CodeFile]
    versions: list[ComponentVersion]
    requires_pro: bool = False
    updated_at: datetime
    published_at: datetime | None = None


class ComponentFilters(BaseModel):
    page: int = 1
    per_page: int = 20
    category: str | None = None
    framework: str | None = None
    tags: list[str] | None = None
    is_free: bool | None = None
    is_featured: bool | None = None
    search: str | None = None
    sort: Literal["newest", "popular", "trending"] = "newest"
    creator: str | None = None
    status: Literal["draft", "published", "rejected", "archived"] | None = None

    @field_validator("per_page")
    @classmethod
    def validate_per_page(cls, value: int) -> int:
        return min(max(value, 1), 100)


class ComponentSubmissionCreate(BaseModel):
    name: str = Field(max_length=120)
    slug: str = Field(max_length=120)
    short_description: str | None = None
    long_description: str | None = None
    framework: Literal["react", "vue", "svelte", "angular", "html"] = "react"
    payload: dict = Field(default_factory=dict)


class ComponentSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    short_description: str | None
    framework: str
    status: str
    reviewer_notes: str | None
    reviewed_at: datetime | None
    created_at: datetime
