"""component platform upgrade

Revision ID: 002_component_platform_upgrade
Revises: 001_initial
Create Date: 2026-04-07 18:30:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "002_component_platform_upgrade"
down_revision = "001_initial"
branch_labels = None
depends_on = None

component_status_enum = postgresql.ENUM("draft", "published", "rejected", "archived", name="component_status_enum", create_type=False)
trust_badge_type_enum = postgresql.ENUM(
    "team_curated",
    "verified_creator",
    "accessible",
    "responsive",
    "dark_mode_ready",
    "recently_updated",
    "popular",
    "trending",
    "typescript",
    "tested",
    name="trust_badge_type_enum",
    create_type=False,
)
component_submission_status_enum = postgresql.ENUM(
    "pending_review",
    "approved",
    "rejected",
    name="component_submission_status_enum",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    component_status_enum.create(bind, checkfirst=True)
    trust_badge_type_enum.create(bind, checkfirst=True)
    component_submission_status_enum.create(bind, checkfirst=True)

    op.create_table(
        "categories",
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("icon", sa.String(length=80), nullable=True),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["parent_id"], ["categories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_categories"),
        sa.UniqueConstraint("slug", name="uq_categories_slug"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=False)
    op.create_index("ix_categories_parent_id", "categories", ["parent_id"], unique=False)

    op.create_table(
        "tags",
        sa.Column("name", sa.String(length=60), nullable=False),
        sa.Column("slug", sa.String(length=60), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.PrimaryKeyConstraint("id", name="pk_tags"),
        sa.UniqueConstraint("slug", name="uq_tags_slug"),
    )
    op.create_index("ix_tags_slug", "tags", ["slug"], unique=False)

    op.add_column("components", sa.Column("short_description", sa.Text(), nullable=True))
    op.add_column("components", sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("components", sa.Column("creator_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("components", sa.Column("is_free", sa.Boolean(), nullable=False, server_default="true"))
    op.add_column("components", sa.Column("status", component_status_enum, nullable=False, server_default="draft"))
    op.add_column("components", sa.Column("is_trending", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("components", sa.Column("preview_url", sa.Text(), nullable=True))
    op.add_column("components", sa.Column("published_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("components", sa.Column("install_command", sa.Text(), nullable=True))
    op.add_column("components", sa.Column("dependencies", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("components", sa.Column("compatibility_notes", sa.Text(), nullable=True))

    op.execute(
        """
        INSERT INTO categories (name, slug, description, icon, "order")
        SELECT DISTINCT initcap(category::text), category::text, NULL, NULL, 0
        FROM components
        WHERE category IS NOT NULL
        ON CONFLICT (slug) DO NOTHING
        """
    )
    op.execute("UPDATE components SET short_description = description WHERE short_description IS NULL")
    op.execute(
        """
        UPDATE components c
        SET category_id = categories.id,
            creator_id = c.author_id,
            is_free = NOT c.is_pro,
            status = CASE WHEN c.is_published THEN 'published'::component_status_enum ELSE 'draft'::component_status_enum END,
            published_at = CASE WHEN c.is_published THEN c.created_at ELSE NULL END
        FROM categories
        WHERE categories.slug = c.category::text
        """
    )

    op.alter_column("components", "category_id", nullable=False)
    op.alter_column("components", "creator_id", nullable=False)
    op.create_foreign_key("fk_components_category_id_categories", "components", "categories", ["category_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_components_creator_id_users", "components", "users", ["creator_id"], ["id"], ondelete="CASCADE")
    op.create_index("ix_components_category_id", "components", ["category_id"], unique=False)
    op.create_index("ix_components_creator_id", "components", ["creator_id"], unique=False)
    op.create_index("ix_components_status", "components", ["status"], unique=False)
    op.create_index("ix_components_is_free", "components", ["is_free"], unique=False)
    op.create_index("ix_components_is_featured", "components", ["is_featured"], unique=False)
    op.create_index("ix_components_is_trending", "components", ["is_trending"], unique=False)
    op.create_index("ix_components_creator_created_at", "components", ["creator_id", "created_at"], unique=False)
    op.create_index("ix_components_status_created_at", "components", ["status", "created_at"], unique=False)

    op.execute(
        """
        INSERT INTO tags (name, slug)
        SELECT DISTINCT initcap(tag), tag
        FROM (
            SELECT unnest(tags) AS tag
            FROM components
            WHERE tags IS NOT NULL
        ) source
        ON CONFLICT (slug) DO NOTHING
        """
    )

    op.create_table(
        "component_tags",
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_component_tags"),
        sa.UniqueConstraint("component_id", "tag_id", name="uq_component_tags_component_id"),
    )
    op.create_index("ix_component_tags_component_id", "component_tags", ["component_id"], unique=False)
    op.create_index("ix_component_tags_tag_id", "component_tags", ["tag_id"], unique=False)

    op.execute(
        """
        INSERT INTO component_tags (component_id, tag_id)
        SELECT c.id, t.id
        FROM components c
        CROSS JOIN LATERAL unnest(c.tags) AS raw_tag(tag)
        JOIN tags t ON t.slug = raw_tag.tag
        WHERE c.tags IS NOT NULL
        ON CONFLICT (component_id, tag_id) DO NOTHING
        """
    )

    op.add_column("component_versions", sa.Column("version_string", sa.String(length=20), nullable=True))
    op.add_column("component_versions", sa.Column("files_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.execute("UPDATE component_versions SET version_string = version")
    op.execute("UPDATE component_versions SET files_snapshot = jsonb_build_object('legacy_snapshot', code_snapshot)")
    op.alter_column("component_versions", "version_string", nullable=False)
    op.alter_column("component_versions", "files_snapshot", nullable=False)

    op.create_table(
        "trust_badges",
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("badge_type", trust_badge_type_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_trust_badges"),
        sa.UniqueConstraint("component_id", "badge_type", name="uq_trust_badges_component_id"),
    )
    op.create_index("ix_trust_badges_component_id", "trust_badges", ["component_id"], unique=False)
    op.create_index("ix_trust_badges_badge_type", "trust_badges", ["badge_type"], unique=False)

    op.create_table(
        "component_submissions",
        sa.Column("creator_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("component_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=True),
        sa.Column("long_description", sa.Text(), nullable=True),
        sa.Column("framework", postgresql.ENUM("react", "vue", "svelte", "angular", "html", name="component_framework_enum", create_type=False), nullable=False),
        sa.Column("status", component_submission_status_enum, nullable=False, server_default="pending_review"),
        sa.Column("reviewer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewer_notes", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.ForeignKeyConstraint(["component_id"], ["components.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_component_submissions"),
    )
    op.create_index("ix_component_submissions_creator_id", "component_submissions", ["creator_id"], unique=False)
    op.create_index("ix_component_submissions_component_id", "component_submissions", ["component_id"], unique=False)
    op.create_index("ix_component_submissions_slug", "component_submissions", ["slug"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_component_submissions_slug", table_name="component_submissions")
    op.drop_index("ix_component_submissions_component_id", table_name="component_submissions")
    op.drop_index("ix_component_submissions_creator_id", table_name="component_submissions")
    op.drop_table("component_submissions")
    op.drop_index("ix_trust_badges_badge_type", table_name="trust_badges")
    op.drop_index("ix_trust_badges_component_id", table_name="trust_badges")
    op.drop_table("trust_badges")
    op.drop_column("component_versions", "files_snapshot")
    op.drop_column("component_versions", "version_string")
    op.drop_index("ix_component_tags_tag_id", table_name="component_tags")
    op.drop_index("ix_component_tags_component_id", table_name="component_tags")
    op.drop_table("component_tags")
    op.drop_index("ix_tags_slug", table_name="tags")
    op.drop_table("tags")
    op.drop_index("ix_components_status_created_at", table_name="components")
    op.drop_index("ix_components_creator_created_at", table_name="components")
    op.drop_index("ix_components_is_trending", table_name="components")
    op.drop_index("ix_components_is_featured", table_name="components")
    op.drop_index("ix_components_is_free", table_name="components")
    op.drop_index("ix_components_status", table_name="components")
    op.drop_index("ix_components_creator_id", table_name="components")
    op.drop_index("ix_components_category_id", table_name="components")
    op.drop_constraint("fk_components_creator_id_users", "components", type_="foreignkey")
    op.drop_constraint("fk_components_category_id_categories", "components", type_="foreignkey")
    op.drop_column("components", "compatibility_notes")
    op.drop_column("components", "dependencies")
    op.drop_column("components", "install_command")
    op.drop_column("components", "published_at")
    op.drop_column("components", "preview_url")
    op.drop_column("components", "is_trending")
    op.drop_column("components", "status")
    op.drop_column("components", "is_free")
    op.drop_column("components", "creator_id")
    op.drop_column("components", "category_id")
    op.drop_column("components", "short_description")
    op.drop_index("ix_categories_parent_id", table_name="categories")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_table("categories")
    component_submission_status_enum.drop(op.get_bind(), checkfirst=True)
    trust_badge_type_enum.drop(op.get_bind(), checkfirst=True)
    component_status_enum.drop(op.get_bind(), checkfirst=True)
