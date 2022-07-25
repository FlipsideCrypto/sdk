import json
from typing import List

import requests
from requests.adapters import HTTPAdapter, Retry

from .models import Query
from .models.api import (
    CreateQueryJson,
    CreateQueryResp,
    QueryResultJson,
    QueryResultResp,
)


class API(object):
    def __init__(
        self,
        base_url: str,
        api_key: str,
        max_retries: int = 10,
        backoff_factor: float = 1,
        status_forcelist: List[int] = [429, 500, 502, 503, 504],
        method_allowlist: List[str] = [
            "HEAD",
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "OPTIONS",
            "TRACE",
        ],
    ):
        self._base_url = base_url
        self._api_key = api_key

        # Session Settings
        self._MAX_RETRIES = max_retries
        self._BACKOFF_FACTOR = backoff_factor
        self._STATUS_FORCE_LIST = status_forcelist
        self._METHOD_ALLOWLIST = method_allowlist

    def get_url(self, path: str) -> str:
        return f"{self._base_url}/{path}"

    def create_query(self, query: Query) -> CreateQueryResp:
        result = self._session.post(
            self.get_url("queries"),
            data=json.dumps(query.dict()),
            headers=self._headers,
        )

        try:
            data = result.json()
        except json.decoder.JSONDecodeError:
            data = None

        return CreateQueryResp(
            status_code=result.status_code,
            status_msg=result.reason,
            error_msg=data.get("errors") if data else None,
            data=CreateQueryJson(**data)
            if data and data.get("errors") is None
            else None,
        )

    def get_query_result(
        self, query_id: str, page_number: int, page_size: int
    ) -> QueryResultResp:
        result = self._session.get(
            self.get_url(f"queries/{query_id}"),
            params={"pageNumber": page_number, "pageSize": page_size},
            headers=self._headers,
        )

        try:
            data = result.json()
        except json.decoder.JSONDecodeError:
            data = None

        return QueryResultResp(
            status_code=result.status_code,
            status_msg=result.reason,
            error_msg=data.get("errors") if data else None,
            data=QueryResultJson(**data)
            if data and data.get("errors") is None
            else None,
        )

    @property
    def _headers(self) -> dict:
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-api-key": self._api_key,
        }

    @property
    def _session(self) -> requests.Session:
        if hasattr(self, "__session"):
            return self._session

        retry_strategy = Retry(
            total=self._MAX_RETRIES,
            backoff_factor=self._BACKOFF_FACTOR,
            status_forcelist=self._STATUS_FORCE_LIST,
            allowed_methods=self._METHOD_ALLOWLIST,
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        http = requests.Session()
        http.mount("https://", adapter)
        http.mount("http://", adapter)

        self.__session = http
        return self.__session
