from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class Tags(BaseModel):
    sdk_package: Optional[str] = None
    sdk_version: Optional[str] = None
    sdk_language: Optional[str] = None
