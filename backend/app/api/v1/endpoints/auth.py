from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_active_user
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import decode_token
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.user import (
    AuthUserEnvelope,
    GithubAuthorizeResponse,
    GithubCallbackResponse,
    PasswordReset,
    PasswordResetRequest,
    RefreshRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=AuthUserEnvelope)
async def register(
    payload: UserRegister,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    service = AuthService(db, redis)
    user = await service.register(payload)
    return {"user": UserResponse.model_validate(user), "message": "Check your email to verify"}


@router.get("/verify-email", response_model=TokenResponse)
async def verify_email(
    token: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    service = AuthService(db, redis)
    tokens = await service.verify_email(token)
    user = await service.users.get_by_id(decode_token(tokens["access_token"])["sub"])
    return {**tokens, "user": UserResponse.model_validate(user)}


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    service = AuthService(db, redis)
    return await service.login(form_data.username, form_data.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    service = AuthService(db, redis)
    return await service.refresh_tokens(payload.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    payload: RefreshRequest | None = None,
    current_user: Annotated[User, Depends(get_current_active_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
    redis: Annotated[Redis, Depends(get_redis)] = None,
):
    service = AuthService(db, redis)
    access_token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    access_payload = decode_token(access_token)
    await service.logout(access_payload, payload.refresh_token if payload else None)
    return {"message": "Logged out"}


@router.get("/github/authorize", response_model=GithubAuthorizeResponse)
async def github_authorize(
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    service = AuthService(db, redis)
    return {"authorize_url": await service.github_authorize_url()}


@router.get("/github/callback", response_model=GithubCallbackResponse)
async def github_callback(
    code: str,
    state: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    service = AuthService(db, redis)
    tokens, is_new_user = await service.github_callback(code, state)
    return {**tokens, "is_new_user": is_new_user}


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: PasswordResetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    await AuthService(db, redis).forgot_password(payload.email)
    return {"message": "If the email exists, a password reset link has been sent."}


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: PasswordReset,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis)],
):
    await AuthService(db, redis).reset_password(payload.token, payload.new_password)
    return {"message": "Password updated"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return UserResponse.model_validate(current_user)
