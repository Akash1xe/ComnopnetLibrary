from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Annotated

import stripe
from fastapi import APIRouter, Depends, Request
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import get_current_verified_user
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthorizationError, NotFoundError
from app.core.redis import get_redis
from app.models.subscription import SubscriptionPlan, SubscriptionStatus
from app.models.user import SubscriptionTier, User
from app.repositories.subscription_repo import SubscriptionRepository
from app.repositories.user_repo import UserRepository
from app.schemas.common import MessageResponse
from app.schemas.subscription import CheckoutRequest, CheckoutResponse, PlanInfo, SubscriptionResponse
from app.services.stripe_service import StripeService
from app.tasks.email_tasks import send_email_task

router = APIRouter()
webhook_router = APIRouter()


def plan_catalog() -> list[PlanInfo]:
    return [
        PlanInfo(
            name="free",
            price_monthly=0,
            price_annual=0,
            features=["30 components", "Community support", "MIT license"],
            stripe_price_id_monthly=None,
            stripe_price_id_annual=None,
        ),
        PlanInfo(
            name="pro",
            price_monthly=19,
            price_annual=190,
            features=["100+ components", "Templates", "Priority support", "Discord access"],
            stripe_price_id_monthly=settings.stripe_pro_monthly_price_id,
            stripe_price_id_annual=settings.stripe_pro_annual_price_id,
        ),
        PlanInfo(
            name="team",
            price_monthly=49,
            price_annual=490,
            features=["Everything in Pro", "Up to 5 seats", "Slack support", "SLA"],
            stripe_price_id_monthly=settings.stripe_team_monthly_price_id,
            stripe_price_id_annual=settings.stripe_team_annual_price_id,
        ),
    ]


@router.get("/plans", response_model=list[PlanInfo])
async def get_plans(redis: Annotated[Redis, Depends(get_redis)]):
    cache_key = "subscription:plans"
    cached = await redis.get(cache_key)
    if cached:
        return [PlanInfo.model_validate(item) for item in json.loads(cached)]
    payload = [plan.model_dump() for plan in plan_catalog()]
    await redis.setex(cache_key, 3600, json.dumps(payload))
    return payload


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    payload: CheckoutRequest,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    stripe_service = StripeService()
    users = UserRepository(db)
    price_id = {
        ("pro", "monthly"): settings.stripe_pro_monthly_price_id,
        ("pro", "annual"): settings.stripe_pro_annual_price_id,
        ("team", "monthly"): settings.stripe_team_monthly_price_id,
        ("team", "annual"): settings.stripe_team_annual_price_id,
    }[(payload.plan, payload.billing)]

    if not current_user.stripe_customer_id:
        current_user.stripe_customer_id = await stripe_service.create_customer(
            email=current_user.email,
            name=current_user.full_name,
            user_id=str(current_user.id),
        )
        await db.flush()

    has_subscription = await SubscriptionRepository(db).get_by_user_id(current_user.id)
    session = await stripe_service.create_checkout_session(
        current_user.stripe_customer_id,
        price_id,
        {"user_id": str(current_user.id), "plan": payload.plan},
        None if has_subscription else 14,
    )
    return {"checkout_url": session["url"]}


@router.get("/portal", response_model=dict)
async def billing_portal(
    current_user: Annotated[User, Depends(get_current_verified_user)],
):
    if not current_user.stripe_customer_id:
        raise NotFoundError("No Stripe customer found for user.")
    session = await StripeService().create_portal_session(
        current_user.stripe_customer_id,
        f"{settings.frontend_url}/dashboard/billing",
    )
    return {"portal_url": session["url"]}


@router.get("/me", response_model=SubscriptionResponse | None)
async def my_subscription(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    subscription = await SubscriptionRepository(db).get_by_user_id(current_user.id)
    if not subscription:
        return None
    return SubscriptionResponse.model_validate(subscription)


@router.post("/cancel", response_model=dict)
async def cancel_subscription(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = SubscriptionRepository(db)
    subscription = await repo.get_by_user_id(current_user.id)
    if not subscription or subscription.status not in {SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING}:
        raise AuthorizationError("No active subscription to cancel.")
    stripe_subscription = await StripeService().cancel_subscription(subscription.stripe_subscription_id)
    subscription.cancel_at_period_end = True
    await db.flush()
    send_email_task.delay(
        current_user.email,
        "Subscription cancellation scheduled",
        "<p>Your subscription will cancel at the end of the billing period.</p>",
    )
    return {"message": "Subscription will cancel at period end.", "cancels_at": stripe_subscription.get("current_period_end")}


@webhook_router.post("/stripe", response_model=MessageResponse)
async def stripe_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=signature, secret=settings.stripe_webhook_secret)
    except stripe.error.SignatureVerificationError as exc:
        raise AuthorizationError("Invalid Stripe signature.") from exc

    repo = SubscriptionRepository(db)
    users = UserRepository(db)
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user = await users.get_by_id(data["metadata"]["user_id"])
        if user:
            plan = SubscriptionPlan(data["metadata"]["plan"])
            existing = await repo.get_by_stripe_id(data["subscription"])
            if existing:
                existing.status = SubscriptionStatus.ACTIVE
                existing.plan = plan
            else:
                await repo.create(
                    {
                        "user_id": user.id,
                        "stripe_subscription_id": data["subscription"],
                        "stripe_price_id": data["metadata"].get("price_id", ""),
                        "plan": plan,
                        "status": SubscriptionStatus.ACTIVE,
                    }
                )
            user.subscription_tier = SubscriptionTier(plan.value)
            send_email_task.delay(user.email, "Welcome to premium", "<p>Your subscription is active.</p>")

    elif event_type == "customer.subscription.updated":
        subscription = await repo.get_by_stripe_id(data["id"])
        if subscription:
            subscription.status = SubscriptionStatus(data["status"])
            subscription.plan = SubscriptionPlan(data["metadata"].get("plan", subscription.plan.value))
            subscription.current_period_start = datetime.fromtimestamp(data["current_period_start"], UTC)
            subscription.current_period_end = datetime.fromtimestamp(data["current_period_end"], UTC)
            subscription.cancel_at_period_end = data["cancel_at_period_end"]

    elif event_type == "customer.subscription.deleted":
        subscription = await repo.get_by_stripe_id(data["id"])
        if subscription:
            subscription.status = SubscriptionStatus.CANCELED
            user = await users.get_by_id(subscription.user_id)
            if user:
                user.subscription_tier = SubscriptionTier.FREE
                send_email_task.delay(user.email, "Subscription downgraded", "<p>Your account has been moved to free.</p>")

    elif event_type == "invoice.payment_succeeded":
        subscription = await repo.get_by_stripe_id(data["subscription"])
        if subscription:
            subscription.status = SubscriptionStatus.ACTIVE
            subscription.current_period_end = datetime.fromtimestamp(data["lines"]["data"][0]["period"]["end"], UTC)

    elif event_type == "invoice.payment_failed":
        subscription = await repo.get_by_stripe_id(data["subscription"])
        if subscription:
            subscription.status = SubscriptionStatus.PAST_DUE
            user = await users.get_by_id(subscription.user_id)
            if user:
                send_email_task.delay(user.email, "Payment failed", "<p>Your latest payment failed. Please update billing.</p>")

    return {"message": "received"}
