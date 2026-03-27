"""Sample Python module for tree-sitter extraction tests."""

import os
from pathlib import Path
from typing import Optional, List


class UserService:
    """Manages user operations."""

    def __init__(self, db_url: str):
        self._db_url = db_url

    def get_user(self, user_id: int) -> dict:
        """Fetch a user by ID."""
        return {"id": user_id}

    def list_users(self) -> list:
        return []


def create_app(config: dict) -> object:
    """Factory function to create the application."""
    return object()


def _internal_helper():
    """Private helper — should still appear since Python uses all-top-level."""
    pass


TIMEOUT = 30
