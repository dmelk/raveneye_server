from beanie import Document, Indexed
from typing import Optional, Dict, Any

class ModuleDocument(Document):
    module_id: Indexed(str)
    name: str
    type: str
    status: Optional[str] = None
    sw_version: Optional[str] = None
    serial_number: Optional[str] = None
    tuner: Optional[Dict[str, Any]] = None  # raw associative array
    sdr: Optional[Dict[str, Any]] = None  # raw associative array

    class Settings:
        name = "modules"
