from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.component import ComponentListItem


class CollectionCreate(BaseModel):
    name: str = Field(max_length=100)
    description: str | None = None
    is_public: bool = False


class CollectionUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    description: str | None = None
    is_public: bool | None = None


class CollectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: str | None
    is_public: bool
    slug: str
    created_at: datetime
    updated_at: datetime
    components: list[ComponentListItem] = []
    component_count: int = 0
