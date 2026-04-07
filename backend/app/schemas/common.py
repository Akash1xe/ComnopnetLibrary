from math import ceil
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ErrorResponse(BaseModel):
    detail: dict | list | str
    request_id: str | None = None


class MessageResponse(BaseModel):
    message: str


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    meta: PaginationMeta


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def make_pagination(page: int, per_page: int, total: int) -> PaginationMeta:
    return PaginationMeta(page=page, per_page=per_page, total=total, pages=max(ceil(total / per_page), 1))
