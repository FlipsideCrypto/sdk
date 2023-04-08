from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class Tags(BaseModel):
    sdk_package: Optional[str]
    sdk_version: Optional[str]
    sdk_language: Optional[str]
