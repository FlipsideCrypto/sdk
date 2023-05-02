from typing import Dict, List

from pydantic import BaseModel


class PageStats(BaseModel):
    currentPageNumber: int
    currentPageSize: int
    totalRows: int
    totalPages: int
