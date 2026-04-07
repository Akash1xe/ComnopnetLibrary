from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import SubscriptionTier, User
from app.repositories.component_repo import ComponentRepository
from app.repositories.user_repo import UserRepository
from app.services.component_service import ComponentService

SEEDS_ROOT = Path(__file__).resolve().parents[2] / "seeds" / "components"


def read_seed_component(seed_dir: Path) -> dict[str, Any]:
    meta = json.loads((seed_dir / "meta.json").read_text(encoding="utf-8"))
    files = []
    for file_config in meta.pop("files"):
        file_path = seed_dir / "files" / file_config["path"]
        files.append(
            {
                "filename": file_config["filename"],
                "language": file_config["language"],
                "code": file_path.read_text(encoding="utf-8"),
                "is_primary": file_config.get("is_primary", False),
                "order": file_config.get("order", len(files)),
            }
        )
    meta["code_files"] = files
    return meta


async def ensure_user(users: UserRepository, payload: dict[str, Any]) -> User:
    existing = await users.get_by_email(payload["email"])
    if existing:
        changed = False
        for field in ("username", "full_name", "avatar_url", "is_verified", "is_superuser", "subscription_tier"):
            value = payload.get(field)
            if value is not None and getattr(existing, field) != value:
                setattr(existing, field, value)
                changed = True
        if changed:
            users.session.add(existing)
            await users.session.flush()
        return existing

    return await users.create(
        {
            "email": payload["email"],
            "username": payload["username"],
            "full_name": payload.get("full_name"),
            "avatar_url": payload.get("avatar_url"),
            "hashed_password": hash_password(payload.get("password", "SeedPassword1")),
            "is_verified": payload.get("is_verified", True),
            "is_superuser": payload.get("is_superuser", False),
            "subscription_tier": payload.get("subscription_tier", SubscriptionTier.FREE),
        }
    )


async def upsert_component(seed_dir: Path) -> str:
    seed = read_seed_component(seed_dir)
    creator_payload = seed.pop("creator")

    async with AsyncSessionLocal() as session:
        users = UserRepository(session)
        creator = await ensure_user(users, creator_payload)
        service = ComponentService(session, None)
        repo = ComponentRepository(session)

        slug = seed["slug"]
        payload = {
            **seed,
            "category_slug": seed["category_slug"],
            "tag_slugs": seed["tag_slugs"],
            "trust_badges": seed.get("trust_badges", []),
        }

        existing = await repo.get_by_slug(slug, include_unpublished=True)
        if existing:
            await service.update_component(existing, payload, creator)
            return f"updated:{slug}"

        await service.create_component(payload, creator)
        return f"created:{slug}"


async def seed_all() -> list[str]:
    if not SEEDS_ROOT.exists():
        return []

    results = []
    for seed_dir in sorted(path for path in SEEDS_ROOT.iterdir() if path.is_dir()):
        results.append(await upsert_component(seed_dir))
    return results


def main() -> None:
    results = asyncio.run(seed_all())
    if not results:
        print("No component seed data found.")
        return
    for item in results:
        print(item)


if __name__ == "__main__":
    main()
