import re


class UserService:
    @staticmethod
    def build_collection_slug(name: str, username: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", f"{username}-{name}".lower()).strip("-")
        return slug or "collection"
