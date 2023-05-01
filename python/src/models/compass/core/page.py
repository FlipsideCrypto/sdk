from typing import Dict, List

from pydantic import BaseModel


class Page(BaseModel):
    number: int
    size: int
