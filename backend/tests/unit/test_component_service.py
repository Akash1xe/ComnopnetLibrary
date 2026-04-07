import pytest

from app.services.component_service import ComponentService


@pytest.mark.asyncio
async def test_slug_generation_uses_kebab_case():
    service = ComponentService.__new__(ComponentService)

    async def fake_get_by_slug(_: str):
        return None

    service.repo = type("Repo", (), {"get_by_slug": fake_get_by_slug})()
    slug = await ComponentService.generate_unique_slug(service, "Fancy Button Card")
    assert slug == "fancy-button-card"
