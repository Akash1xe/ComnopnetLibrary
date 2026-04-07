import os
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://uikit_user:uikit_password@localhost:5432/uikit_db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("GITHUB_CLIENT_ID", "github")
os.environ.setdefault("GITHUB_CLIENT_SECRET", "github")
os.environ.setdefault("GITHUB_REDIRECT_URI", "http://localhost/callback")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test")
os.environ.setdefault("STRIPE_PRO_MONTHLY_PRICE_ID", "price_pro_month")
os.environ.setdefault("STRIPE_PRO_ANNUAL_PRICE_ID", "price_pro_year")
os.environ.setdefault("STRIPE_TEAM_MONTHLY_PRICE_ID", "price_team_month")
os.environ.setdefault("STRIPE_TEAM_ANNUAL_PRICE_ID", "price_team_year")
os.environ.setdefault("SENDGRID_API_KEY", "SG.test")
os.environ.setdefault("FROM_EMAIL", "tests@example.com")
os.environ.setdefault("FROM_NAME", "UIKit")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "test")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "test")
os.environ.setdefault("AWS_S3_BUCKET", "bucket")
os.environ.setdefault("AWS_REGION", "us-east-1")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")

from app.main import app
from app.models.user import SubscriptionTier, User


@pytest.fixture
async def async_client() -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        yield client


@pytest.fixture
def test_user() -> User:
    user = User(
        email="user@example.com",
        username="test_user",
        full_name="Test User",
        hashed_password="hashed",
        is_active=True,
        is_verified=True,
        subscription_tier=SubscriptionTier.FREE,
    )
    user.id = "00000000-0000-0000-0000-000000000001"  # type: ignore[assignment]
    return user


@pytest.fixture
def test_superuser() -> User:
    user = User(
        email="admin@example.com",
        username="admin",
        full_name="Admin User",
        hashed_password="hashed",
        is_active=True,
        is_verified=True,
        is_superuser=True,
        subscription_tier=SubscriptionTier.TEAM,
    )
    user.id = "00000000-0000-0000-0000-000000000002"  # type: ignore[assignment]
    return user
