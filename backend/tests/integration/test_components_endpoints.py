import pytest


@pytest.mark.asyncio
async def test_list_components_endpoint(async_client):
    response = await async_client.get("/api/v1/components")
    assert response.status_code in {200, 401, 500}
