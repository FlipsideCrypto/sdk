import json
from typing import List

import requests
from requests.adapters import HTTPAdapter, Retry

from .errors.api_error import ApiError
from .errors.server_error import ServerError
from .models.compass.cancel_query_run import (
    CancelQueryRunRpcRequest,
    CancelQueryRunRpcRequestParams,
    CancelQueryRunRpcResponse,
)
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
from .models.compass.get_sql_statement import (
    GetSqlStatementParams,
    GetSqlStatementRequest,
    GetSqlStatementResponse,
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
        with self.session.post(
            self.url,
            data=json.dumps(CreateQueryRunRpcRequest(params=[params]).dict()),
            headers=self._headers,
        ) as result:
            data = self._handle_response(result, "createQueryRun")

            create_query_resp = CreateQueryRunRpcResponse(**data)

            return create_query_resp

    def get_query_run(
        self, params: GetQueryRunRpcRequestParams
    ) -> GetQueryRunRpcResponse:
        with self.session.post(
            self.url,
            data=json.dumps(GetQueryRunRpcRequest(params=[params]).dict()),
            headers=self._headers,
        ) as result:

            data = self._handle_response(result, "getQueryRun")

            get_query_run_resp = GetQueryRunRpcResponse(**data)

            return get_query_run_resp

    def get_sql_statement(
        self, params: GetSqlStatementParams
    ) -> GetSqlStatementResponse:
        with self.session.post(
            self.url,
            data=json.dumps(GetSqlStatementRequest(params=[params]).dict()),
            headers=self._headers,
        ) as result:
            data = self._handle_response(result, "getSqlStatement")

            get_sql_statement_resp = GetSqlStatementResponse(**data)

            return get_sql_statement_resp

    def cancel_query_run(
        self, params: CancelQueryRunRpcRequestParams
    ) -> CancelQueryRunRpcResponse:
        with self.session.post(
            self.url,
            data=json.dumps(CancelQueryRunRpcRequest(params=[params]).dict()),
            headers=self._headers,
        ) as result:
            data = self._handle_response(result, "cancelQueryRun")

            cancel_query_run_resp = CancelQueryRunRpcResponse(**data)

            return cancel_query_run_resp

    def get_query_result(
        self, params: GetQueryRunResultsRpcParams
    ) -> GetQueryRunResultsRpcResponse:
        with self.session.post(
            self.url,
            data=json.dumps(GetQueryRunResultsRpcRequest(params=[params]).dict()),
            headers=self._headers,
        ) as result:
            data = self._handle_response(result, "getQueryRunResults")
            get_query_run_results_resp = GetQueryRunResultsRpcResponse(**data)
            return get_query_run_results_resp

    def _handle_response(self, result: requests.Response, method: str) -> dict:
        if result.status_code is None:
            raise ServerError(
                status_code=0,
                message=f"Unable to connect to server when calling `{method}`. Please try again later.",
            )

        if result.status_code >= 500:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unknown server error when calling `{method}`: {result.status_code} - {result.reason}. Please try again later.",
            )

        if result.status_code == 401 or result.status_code == 403:
            raise ApiError("Unauthorized", result.status_code, "Invalid API Key.")

        try:
            data = result.json()
        except json.decoder.JSONDecodeError:
            raise ServerError(
                status_code=result.status_code,
                message=f"Unable to parse response for RPC response from `{method}`: {result.status_code} - {result.reason}. Please try again later.",
            )

        return data

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
    def session(self) -> requests.Session:
        retry_strategy = Retry(
            total=self._MAX_RETRIES,
            backoff_factor=self._BACKOFF_FACTOR,  # type: ignore
            status_forcelist=self._STATUS_FORCE_LIST,
            allowed_methods=self._METHOD_ALLOWLIST,
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)  # type: ignore
        session = requests.Session()
        session.mount("https://", adapter)
        session.mount("http://", adapter)

        return session
