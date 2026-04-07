from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator

USERNAME_RE = r"^[a-zA-Z0-9_]{3,30}$"
PASSWORD_RE = r"^(?=.*[A-Z])(?=.*\d).{8,}$"


class UserRegister(BaseModel):
    email: EmailStr
    username: Annotated[str, StringConstraints(pattern=USERNAME_RE, min_length=3, max_length=30)]
    password: str
    full_name: str | None = Field(default=None, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        import re

        if not re.match(PASSWORD_RE, value):
            raise ValueError("Password must be at least 8 characters with 1 uppercase letter and 1 number.")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    username: str
    full_name: str | None
    avatar_url: str | None
    subscription_tier: str
    is_verified: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        import re

        if not re.match(PASSWORD_RE, value):
            raise ValueError("Password must be at least 8 characters with 1 uppercase letter and 1 number.")
        return value


class AuthUserEnvelope(BaseModel):
    user: UserResponse
    message: str


class GithubAuthorizeResponse(BaseModel):
    authorize_url: str


class GithubCallbackResponse(TokenResponse):
    is_new_user: bool
