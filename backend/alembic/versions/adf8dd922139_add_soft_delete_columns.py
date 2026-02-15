"""add_soft_delete_columns

Revision ID: adf8dd922139
Revises: 187a74dce15e
Create Date: 2026-02-15 15:52:35.615438

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'adf8dd922139'
down_revision: Union[str, Sequence[str], None] = '187a74dce15e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add deleted_at column to all tables for soft delete support."""
    # Add deleted_at column to users table
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Add deleted_at column to prompts table
    op.add_column('prompts', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Add deleted_at column to guides table
    op.add_column('guides', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Add deleted_at column to agents table
    op.add_column('agents', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Add deleted_at column to rulesets table
    op.add_column('rulesets', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Add deleted_at column to proposals table
    op.add_column('proposals', sa.Column('deleted_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Remove deleted_at columns from all tables."""
    # Remove deleted_at column from proposals table
    op.drop_column('proposals', 'deleted_at')

    # Remove deleted_at column from rulesets table
    op.drop_column('rulesets', 'deleted_at')

    # Remove deleted_at column from agents table
    op.drop_column('agents', 'deleted_at')

    # Remove deleted_at column from guides table
    op.drop_column('guides', 'deleted_at')

    # Remove deleted_at column from prompts table
    op.drop_column('prompts', 'deleted_at')

    # Remove deleted_at column from users table
    op.drop_column('users', 'deleted_at')
