"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-04-07 00:00:00
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None

subscription_tier_enum = postgresql.ENUM("free", "pro", "team", name="subscription_tier_enum", create_type=False)
component_category_enum = postgresql.ENUM("button", "card", "modal", "form", "layout", "navigation", "data", "animation", "other", name="component_category_enum", create_type=False)
component_framework_enum = postgresql.ENUM("react", "vue", "svelte", "angular", name="component_framework_enum", create_type=False)
code_language_enum = postgresql.ENUM("tsx", "jsx", "css", "ts", "js", name="code_language_enum", create_type=False)
subscription_plan_enum = postgresql.ENUM("free", "pro", "team", name="subscription_plan_enum", create_type=False)
subscription_status_enum = postgresql.ENUM("active", "canceled", "past_due", "trialing", "incomplete", name="subscription_status_enum", create_type=False)
analytics_event_type_enum = postgresql.ENUM("view", "copy", "download", name="analytics_event_type_enum", create_type=False)


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    for enum_type in (
        subscription_tier_enum,
        component_category_enum,
        component_framework_enum,
        code_language_enum,
        subscription_plan_enum,
        subscription_status_enum,
        analytics_event_type_enum,
    ):
        enum_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("hashed_password", sa.Text(), nullable=True),
        sa.Column("github_id", sa.String(length=50), nullable=True),
        sa.Column("github_username", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("subscription_tier", subscription_tier_enum, nullable=False, server_default="free"),
        sa.Column("stripe_customer_id", sa.String(length=100), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.UniqueConstraint("username", name="uq_users_username"),
        sa.UniqueConstraint("github_id", name="uq_users_github_id"),
        sa.UniqueConstraint("stripe_customer_id", name="uq_users_stripe_customer_id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_index("ix_users_github_id", "users", ["github_id"], unique=False)
    op.create_index("ix_users_stripe_customer_id", "users", ["stripe_customer_id"], unique=False)
    op.create_index("ix_users_username", "users", ["username"], unique=False)

    op.create_table(
        "components",
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("long_description", sa.Text(), nullable=True),
        sa.Column("category", component_category_enum, nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("framework", component_framework_enum, nullable=False, server_default="react"),
        sa.Column("is_pro", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("preview_image_url", sa.Text(), nullable=True),
        sa.Column("preview_video_url", sa.Text(), nullable=True),
        sa.Column("author_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False, server_default="1.0.0"),
        sa.Column("downloads_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("views_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("copies_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_components"),
        sa.UniqueConstraint("slug", name="uq_components_slug"),
    )
    op.create_index("ix_components_slug", "components", ["slug"], unique=False)
    op.create_index("ix_components_tags_gin", "components", ["tags"], unique=False, postgresql_using="gin")
    op.execute(
        "CREATE INDEX ix_components_search_vector ON components USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));"
    )

    op.create_table(
        "collections",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("slug", sa.String(length=150), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_collections"),
        sa.UniqueConstraint("slug", name="uq_collections_slug"),
    )

    op.create_table(
        "subscriptions",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stripe_subscription_id", sa.String(length=100), nullable=False),
        sa.Column("stripe_price_id", sa.String(length=100), nullable=False),
        sa.Column("plan", subscription_plan_enum, nullable=False),
        sa.Column("status", subscription_status_enum, nullable=False, server_default="incomplete"),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_subscriptions"),
        sa.UniqueConstraint("stripe_subscription_id", name="uq_subscriptions_stripe_subscription_id"),
    )

    op.create_table(
        "component_codes",
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=100), nullable=False),
        sa.Column("language", code_language_enum, nullable=False),
        sa.Column("code", sa.Text(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_component_codes"),
    )

    op.create_table(
        "component_versions",
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False),
        sa.Column("changelog", sa.Text(), nullable=True),
        sa.Column("code_snapshot", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_component_versions"),
    )

    op.create_table(
        "component_analytics",
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("event_type", analytics_event_type_enum, nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("referrer", sa.Text(), nullable=True),
        sa.Column("country_code", sa.String(length=2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_component_analytics"),
    )
    op.create_index("ix_component_analytics_component_event_created", "component_analytics", ["component_id", "event_type", "created_at"], unique=False)

    op.create_table(
        "collection_components",
        sa.Column("collection_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["collection_id"], ["collections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("collection_id", "component_id", name="pk_collection_components"),
    )

    op.create_table(
        "webhook_event_logs",
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("event_id", sa.String(length=255), nullable=False),
        sa.Column("event_type", sa.String(length=255), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.PrimaryKeyConstraint("id", name="pk_webhook_event_logs"),
        sa.UniqueConstraint("event_id", name="uq_webhook_event_logs_event_id"),
    )


def downgrade() -> None:
    op.drop_table("webhook_event_logs")
    op.drop_table("collection_components")
    op.drop_index("ix_component_analytics_component_event_created", table_name="component_analytics")
    op.drop_table("component_analytics")
    op.drop_table("component_versions")
    op.drop_table("component_codes")
    op.drop_table("subscriptions")
    op.drop_table("collections")
    op.drop_index("ix_components_tags_gin", table_name="components")
    op.execute("DROP INDEX IF EXISTS ix_components_search_vector")
    op.drop_index("ix_components_slug", table_name="components")
    op.drop_table("components")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_stripe_customer_id", table_name="users")
    op.drop_index("ix_users_github_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    for enum_type in (
        analytics_event_type_enum,
        subscription_status_enum,
        subscription_plan_enum,
        code_language_enum,
        component_framework_enum,
        component_category_enum,
        subscription_tier_enum,
    ):
        enum_type.drop(op.get_bind(), checkfirst=True)
