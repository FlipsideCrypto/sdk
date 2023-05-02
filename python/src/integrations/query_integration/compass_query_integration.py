import json
from typing import List, Optional, Union

from ...errors import (
    QueryRunCancelledError,
    QueryRunExecutionError,
    QueryRunTimeoutError,
    SDKError,
)
from ...errors.api_error import get_exception_by_error_code
from ...errors.query_run_errors import QueryRunInvalidStateToCancel
from ...models import Query, QueryDefaults, QueryResultSet, QueryStatus, SleepConfig
from ...models.compass.cancel_query_run import CancelQueryRunRpcRequestParams
from ...models.compass.core.page import Page
from ...models.compass.core.query_run import QueryRun
from ...models.compass.core.result_format import ResultFormat
from ...models.compass.core.sql_statement import SqlStatement
from ...models.compass.core.tags import Tags
from ...models.compass.create_query_run import CreateQueryRunRpcParams
from ...models.compass.get_query_run import GetQueryRunRpcRequestParams
from ...models.compass.get_query_run_results import (
    Filter,
    GetQueryRunResultsRpcParams,
    GetQueryRunResultsRpcResult,
    SortBy,
)
from ...models.compass.get_sql_statement import GetSqlStatementParams
from ...rpc import RPC
from ...utils.sleep import get_elapsed_linear_seconds, linear_backoff
from .defaults import DEFAULTS
from .query_result_set_builder import QueryResultSetBuilder


class CompassQueryIntegration(object):
    def __init__(self, rpc: RPC, defaults: QueryDefaults = DEFAULTS):
        self.rpc = rpc
        self.defaults = defaults

    def run(self, query: Query) -> QueryResultSet:
        query = self._set_query_defaults(query)

        create_query_run_params = CreateQueryRunRpcParams(
            resultTTLHours=int(query.ttl_minutes / 60)
            if query.ttl_minutes
            else DEFAULTS.ttl_minutes,
            sql=query.sql,
            maxAgeMinutes=query.max_age_minutes
            if query.max_age_minutes
            else DEFAULTS.max_age_minutes,
            tags=Tags(
                sdk_language="python",
                sdk_package=query.sdk_package,
                sdk_version=query.sdk_version,
            ),
            dataSource=query.data_source if query.data_source else "snowflake-default",
            dataProvider=query.data_provider if query.data_provider else "flipside",
        )
        created_query = self.rpc.create_query(create_query_run_params)
        if created_query.error:
            raise get_exception_by_error_code(
                error_code=created_query.error.code if created_query.error else None,
                message=created_query.error.message if created_query.error else None,
            )

        if not created_query.result or not created_query.result.queryRun:
            raise SDKError("expected `query_run` from server but got `None`")

        query_run = self._get_query_run_loop(
            created_query.result.queryRun.id,
            page_number=query.page_number,
            page_size=query.page_size,
            timeout_minutes=query.timeout_minutes if query.timeout_minutes else 20,
            retry_interval_seconds=query.retry_interval_seconds
            if query.retry_interval_seconds
            else 1,
        )

        query_result = self._get_query_results(
            query_run.id,
            page_number=query.page_number if query.page_number else 1,
            page_size=query.page_size if query.page_size else 100000,
        )

        return QueryResultSetBuilder(
            query_run=query_run,
            query_result=query_result,
        ).build()

    def get_sql_statement(self, sql_statement_id: str) -> SqlStatement:
        response = self.rpc.get_sql_statement(
            GetSqlStatementParams(**{"sqlStatementId": sql_statement_id})
        )

        if response.error or not response.result:
            raise get_exception_by_error_code(
                error_code=response.error.code if response.error else None,
                message=response.error.message if response.error else None,
            )

        return response.result.sqlStatement

    def get_query_run(self, query_run_id: str) -> QueryRun:
        response = self.rpc.get_query_run(
            GetQueryRunRpcRequestParams(queryRunId=query_run_id)
        )

        if response.error or not response.result:
            raise get_exception_by_error_code(
                error_code=response.error.code if response.error else None,
                message=response.error.message if response.error else None,
            )

        return response.result.queryRun

    def cancel_query_run(self, query_run_id: str) -> QueryRun:
        response = self.rpc.cancel_query_run(
            CancelQueryRunRpcRequestParams(queryRunId=query_run_id)
        )
        if response.error or not response.result:
            raise get_exception_by_error_code(
                error_code=response.error.code if response.error else None,
                message=response.error.message if response.error else None,
            )

        return response.result.queryRun

    def get_query_results(
        self,
        query_run_id: str,
        page_number: int = 1,
        page_size: int = 100000,
        filters: Optional[Union[List[Filter], None]] = [],
        sort_by: Optional[Union[List[SortBy], None]] = [],
    ) -> QueryResultSet:
        query_result = self._get_query_results(
            query_run_id,
            page_number=page_number if page_number else 1,
            page_size=page_size if page_size else 10000,
            filters=filters,
            sort_by=sort_by,
        )

        query_run = (
            query_result.redirectedToQueryRun
            if query_result.redirectedToQueryRun
            else query_result.originalQueryRun
        )

        return QueryResultSetBuilder(
            query_run=query_run,
            query_result=query_result,
        ).build()

    def _get_query_results(
        self,
        query_run_id: str,
        page_number: int = 1,
        page_size: int = 100000,
        filters: Optional[Union[List[Filter], None]] = [],
        sort_by: Optional[Union[List[SortBy], None]] = [],
    ) -> GetQueryRunResultsRpcResult:
        query_results_resp = self.rpc.get_query_result(
            GetQueryRunResultsRpcParams(
                queryRunId=query_run_id,
                format=ResultFormat.csv,
                page=Page(
                    number=page_number,
                    size=page_size,
                ),
                filters=filters,
                sortBy=sort_by,
            )
        )

        if query_results_resp.error:
            raise get_exception_by_error_code(
                error_code=query_results_resp.error.code
                if query_results_resp.error
                else None,
                message=query_results_resp.error.message
                if query_results_resp.error
                else None,
            )

        if not query_results_resp.result:
            raise SDKError("expected `result` from server but got `None`")

        query_results = query_results_resp.result
        return query_results

    def _set_query_defaults(self, query: Query) -> Query:
        query_default_dict = self.defaults.dict()
        query_dict = query.dict()
        query_default_dict.update(
            {k: v for (k, v) in query_dict.items() if v is not None}
        )
        return Query(**query_default_dict)

    def _get_query_run_loop(
        self,
        query_run_id: str,
        page_number: int = 1,
        page_size: int = 100000,
        attempts: int = 0,
        timeout_minutes: Union[int, float] = 20,
        retry_interval_seconds: Union[int, float] = 1.0,
    ) -> QueryRun:
        query_run_rpc_resp = self.rpc.get_query_run(
            GetQueryRunRpcRequestParams(queryRunId=query_run_id)
        )

        if query_run_rpc_resp.error:
            raise get_exception_by_error_code(
                error_code=query_run_rpc_resp.error.code
                if query_run_rpc_resp.error
                else None,
                message=query_run_rpc_resp.error.message
                if query_run_rpc_resp.error
                else None,
            )

        if not query_run_rpc_resp.result:
            raise SDKError(
                "valid status msg returned from server but no data exists in the response"
            )

        query_run = query_run_rpc_resp.result.queryRun
        query_status = query_run.state

        if query_status == QueryStatus.Success:
            return query_run

        if query_status == QueryStatus.Failed:
            if query_run.errorName == "QueryRunTimedOut":
                raise QueryRunTimeoutError()

            raise QueryRunExecutionError(
                error_message=query_run.errorMessage,
                error_name=query_run.errorName,
                error_data=query_run.errorData,
            )

        if query_status == QueryStatus.Canceled:
            raise QueryRunCancelledError(
                error_message=query_run.errorMessage,
                error_name=query_run.errorName,
                error_data=query_run.errorData,
            )

        should_continue = linear_backoff(
            SleepConfig(
                attempts=attempts,
                timeout_minutes=timeout_minutes,
                interval_seconds=retry_interval_seconds,
            )
        )

        if not should_continue:
            elapsed_seconds = get_elapsed_linear_seconds(
                SleepConfig(
                    attempts=attempts,
                    timeout_minutes=timeout_minutes,
                    interval_seconds=retry_interval_seconds,
                )
            )

            raise QueryRunTimeoutError(elapsed_seconds)

        return self._get_query_run_loop(
            query_run_id,
            page_number,
            page_size,
            attempts + 1,
            timeout_minutes,
            retry_interval_seconds,
        )
