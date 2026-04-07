from __future__ import annotations

from typing import Any

import asyncio
import stripe

from app.core.config import settings

stripe.api_key = settings.stripe_secret_key


class StripeService:
    async def create_customer(self, email: str, name: str | None, user_id: str) -> str:
        customer = await asyncio.to_thread(
            stripe.Customer.create,
            email=email,
            name=name,
            metadata={"user_id": user_id},
        )
        return customer["id"]

    async def create_checkout_session(self, customer_id: str, price_id: str, metadata: dict[str, str], trial_days: int | None) -> dict[str, Any]:
        params: dict[str, Any] = {
            "mode": "subscription",
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": f"{settings.frontend_url}/dashboard?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{settings.frontend_url}/pricing?checkout=canceled",
            "customer": customer_id,
            "metadata": metadata,
            "allow_promotion_codes": True,
        }
        if trial_days:
            params["subscription_data"] = {"trial_period_days": trial_days}
        return await asyncio.to_thread(stripe.checkout.Session.create, **params)

    async def create_portal_session(self, customer_id: str, return_url: str) -> dict[str, Any]:
        return await asyncio.to_thread(
            stripe.billing_portal.Session.create,
            customer=customer_id,
            return_url=return_url,
        )

    async def get_subscription(self, subscription_id: str) -> dict[str, Any]:
        return await asyncio.to_thread(stripe.Subscription.retrieve, subscription_id)

    async def cancel_subscription(self, subscription_id: str) -> dict[str, Any]:
        return await asyncio.to_thread(
            stripe.Subscription.modify,
            subscription_id,
            cancel_at_period_end=True,
        )
