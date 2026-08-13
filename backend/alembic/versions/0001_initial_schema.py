"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-08-12 00:00:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("ticket_id", sa.String(length=20), nullable=False),
        sa.Column("customer_name", sa.String(length=255), nullable=False),
        sa.Column("customer_email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("ticket_id"),
    )
    op.create_index(op.f("ix_tickets_id"), "tickets", ["id"], unique=False)
    op.create_index(
        op.f("ix_tickets_ticket_id"), "tickets", ["ticket_id"], unique=False
    )
    op.create_index(
        op.f("ix_tickets_customer_email"), "tickets", ["customer_email"], unique=False
    )

    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column(
            "ticket_id", sa.Integer(), sa.ForeignKey("tickets.id"), nullable=False
        ),
        sa.Column("note_text", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notes_id"), "notes", ["id"], unique=False)
    op.create_index(op.f("ix_notes_ticket_id"), "notes", ["ticket_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notes_ticket_id"), table_name="notes")
    op.drop_index(op.f("ix_notes_id"), table_name="notes")
    op.drop_table("notes")

    op.drop_index(op.f("ix_tickets_customer_email"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_ticket_id"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_id"), table_name="tickets")
    op.drop_table("tickets")
