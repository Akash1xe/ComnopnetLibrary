from fastapi import APIRouter

from app.api.v1.endpoints import admin, analytics, auth, collections, components, subscriptions, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(components.router, prefix="/components", tags=["components"])
api_router.include_router(collections.router, prefix="/collections", tags=["collections"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(subscriptions.webhook_router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
