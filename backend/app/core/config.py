from functools import lru_cache
from typing import Literal

import json

from pydantic import AnyHttpUrl, EmailStr, Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Component Library SaaS API"
    api_v1_prefix: str = "/api/v1"
    version: str = "1.0.0"

    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = True

    database_url: str = Field(alias="DATABASE_URL")
    redis_url: str = Field(alias="REDIS_URL")
    celery_broker_url: str = Field(default="redis://redis:6379/1", alias="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://redis:6379/2", alias="CELERY_RESULT_BACKEND")

    postgres_db: str = Field(default="uikit_db", alias="POSTGRES_DB")
    postgres_user: str = Field(default="uikit_user", alias="POSTGRES_USER")
    postgres_password: str = Field(default="uikit_password", alias="POSTGRES_PASSWORD")

    secret_key: str = Field(alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")

    github_client_id: str = Field(alias="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(alias="GITHUB_CLIENT_SECRET")
    github_redirect_uri: AnyHttpUrl = Field(alias="GITHUB_REDIRECT_URI")

    stripe_secret_key: str = Field(alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: str = Field(alias="STRIPE_WEBHOOK_SECRET")
    stripe_pro_monthly_price_id: str = Field(alias="STRIPE_PRO_MONTHLY_PRICE_ID")
    stripe_pro_annual_price_id: str = Field(alias="STRIPE_PRO_ANNUAL_PRICE_ID")
    stripe_team_monthly_price_id: str = Field(alias="STRIPE_TEAM_MONTHLY_PRICE_ID")
    stripe_team_annual_price_id: str = Field(alias="STRIPE_TEAM_ANNUAL_PRICE_ID")

    sendgrid_api_key: str = Field(alias="SENDGRID_API_KEY")
    from_email: EmailStr = Field(alias="FROM_EMAIL")
    from_name: str = Field(default="UIKit", alias="FROM_NAME")

    aws_access_key_id: str = Field(alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(alias="AWS_SECRET_ACCESS_KEY")
    aws_s3_bucket: str = Field(alias="AWS_S3_BUCKET")
    aws_region: str = Field(alias="AWS_REGION")

    frontend_url: AnyHttpUrl = Field(alias="FRONTEND_URL")
    cors_origins_raw: str = Field(default="", alias="CORS_ORIGINS")

    rate_limit_free_per_hour: int = 100
    rate_limit_pro_per_hour: int = 1000
    rate_limit_team_per_hour: int = 5000
    login_attempt_limit: int = 5
    login_lock_minutes: int = 15
    component_detail_cache_ttl_seconds: int = 300
    categories_cache_ttl_seconds: int = 3600
    featured_cache_ttl_seconds: int = 1800
    tags_cache_ttl_seconds: int = 3600

    @computed_field  # type: ignore[prop-decorator]
    @property
    def allowed_origins(self) -> list[str]:
        origins = [str(self.frontend_url)]
        origins.extend(self.parsed_cors_origins)
        return list(dict.fromkeys(origins))

    @computed_field  # type: ignore[prop-decorator]
    @property
    def parsed_cors_origins(self) -> list[str]:
        value = self.cors_origins_raw
        if not value:
            return []
        stripped = value.strip()
        if stripped.startswith("["):
            parsed = json.loads(stripped)
            return [str(item).strip() for item in parsed if str(item).strip()]
        return [item.strip() for item in stripped.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
