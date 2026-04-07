from unittest.mock import AsyncMock

import pytest


@pytest.mark.asyncio
async def test_plans_endpoint(async_client):
    response = await async_client.get("/api/v1/subscriptions/plans")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
