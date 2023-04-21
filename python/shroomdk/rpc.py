import json
from random import randint
from typing import List

import requests
from requests.adapters import HTTPAdapter, Retry

from .errors.server_error import ServerError
from .errors.user_error import UserError
from .models.compass.create_query_run import (
    CreateQueryRunRpcParams,
    CreateQueryRunRpcRequest,
    CreateQueryRunRpcResponse,
)
from .models.compass.get_query_run import (
    GetQueryRunRpcRequest,
    GetQueryRunRpcRequestParams,
    GetQueryRunRpcResponse,
)
from .models.compass.get_query_run_results import (
    GetQueryRunResultsRpcParams,
    GetQueryRunResultsRpcRequest,
    GetQueryRunResultsRpcResponse,
)


class RPC(object):
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

    def create_query(
        self, params: CreateQueryRunRpcParams
    ) -> CreateQueryRunRpcResponse:
        result = self._session.post(
            self.url,
            data=json.dumps(CreateQueryRunRpcRequest(params=[params]).dict()),
            headers=self._headers,
        )

        if result.status_code >= 500:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unknown server error when calling `createQueryRun`, status_code: {result.status_code}, status_text: {result.reason}. Please try again later.",
            )

        try:
            data = result.json()
        except json.decoder.JSONDecodeError:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unable to parse response for RPC response from `createQueryRun`, status_code: {result.status_code}, status_text: {result.reason}. Please try again later.",
            )

        create_query_resp = CreateQueryRunRpcResponse(**data)

        return create_query_resp

    def get_query_run(
        self, params: GetQueryRunRpcRequestParams
    ) -> GetQueryRunRpcResponse:
        result = self._session.post(
            self.url,
            data=json.dumps(GetQueryRunRpcRequest(params=[params]).dict()),
            headers=self._headers,
        )

        if result.status_code >= 500:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unknown server error when calling `getQueryRun` for query run id: {params.queryRunId}, status_code: {result.status_code}, status_text: {result.reason}. Please try again later.",
            )

        try:
            data = result.json()
        except json.decoder.JSONDecodeError:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unable to parse response for RPC response from `getQueryRun`. Status_code: {result.status_code}, status_text: {result.reason}. Please try again later.",
            )

        get_query_run_resp = GetQueryRunRpcResponse(**data)

        return get_query_run_resp

    def get_query_result(
        self, params: GetQueryRunResultsRpcParams
    ) -> GetQueryRunResultsRpcResponse:
        result = self._session.post(
            self.url,
            data=json.dumps(GetQueryRunResultsRpcRequest(params=[params]).dict()),
            headers=self._headers,
        )

        if result.status_code >= 500:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unknown server error when calling `getQueryRunResults` for query run id: {params.queryRunId}, status_code: {result.status_code}, status_text: {result.reason}. Please try again later.",
            )

        try:
            data = result.json()
        except json.decoder.JSONDecodeError:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unable to parse response for RPC response from `getQueryRunResults`. status_code: {result.status_code}, status_text: {result.reason}. Please try again later.",
            )

        get_query_run_results_resp = GetQueryRunResultsRpcResponse(**data)
        return get_query_run_results_resp

    @property
    def _headers(self) -> dict:
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-api-key": self._api_key,
        }

    @property
    def url(self) -> str:
        return f"{self._base_url}/json-rpc"

    @property
    def _session(self) -> requests.Session:
        if hasattr(self, "__session"):
            return self._session

        retry_strategy = Retry(
            total=self._MAX_RETRIES,
            backoff_factor=self._BACKOFF_FACTOR,  # type: ignore
            status_forcelist=self._STATUS_FORCE_LIST,
            allowed_methods=self._METHOD_ALLOWLIST,
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)  # type: ignore
        http = requests.Session()
        http.mount("https://", adapter)
        http.mount("http://", adapter)

        self.__session = http
        return self.__session
