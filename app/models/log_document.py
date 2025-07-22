from beanie import Document, Indexed
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pymongo import ASCENDING, DESCENDING, IndexModel


class LogDocument(Document):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    action: str
    module_id: str
    log_info: Optional[Dict[str, Any]] = None

    class Settings:
        name = "logs"
        indexes = [
            [("timestamp", ASCENDING)],
            [("action", ASCENDING)],
            [("module_id", ASCENDING)],
            [("module_id", ASCENDING), ("timestamp", DESCENDING)],
        ]
