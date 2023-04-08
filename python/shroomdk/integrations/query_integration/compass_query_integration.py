import json
from typing import Union

from shroomdk.errors import (
    QueryRunCancelledError,
    QueryRunExecutionError,
    QueryRunTimeoutError,
    SDKError,
    UserError,
)
from shroomdk.models import (
    Query,
    QueryDefaults,
    QueryResultSet,
    QueryStatus,
    SleepConfig,
)
from shroomdk.models.api import QueryResultJson
from shroomdk.models.compass.core.page import Page
from shroomdk.models.compass.core.query_run import QueryRun
from shroomdk.models.compass.core.result_format import ResultFormat
from shroomdk.models.compass.core.tags import Tags
from shroomdk.models.compass.create_query_run import CreateQueryRunRpcParams
from shroomdk.models.compass.get_query_run import GetQueryRunRpcRequestParams
from shroomdk.models.compass.get_query_run_results import (
    GetQueryRunResultsRpcParams,
    GetQueryRunResultsRpcResult,
)
from shroomdk.rpc import RPC
from shroomdk.utils.sleep import get_elapsed_linear_seconds, linear_backoff

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
            raise UserError(
                status_code=created_query.error.code,
                message=f"{created_query.error.message}: {json.dumps(created_query.error.dict())}",
            )

        if not created_query.result or not created_query.result.queryRun:
            raise SDKError("expected `query_run` from server but got `None`")

        query_run = self._get_query_run(
            created_query.result.queryRun.id,
            page_number=query.page_number,
            page_size=query.page_size,
            timeout_minutes=query.timeout_minutes if query.timeout_minutes else 20,
            retry_interval_seconds=query.retry_interval_seconds
            if query.retry_interval_seconds
            else 1,
        )

        query_results = self._get_query_results(
            query_run.id,
            page_number=query.page_number if query.page_number else 1,
            page_size=query.page_size if query.page_size else 100000,
        )

        return QueryResultSetBuilder(
            QueryResultJson(
                queryId=query_run.id,
                status=query_run.state,
                results=query_results.rows,
                columnLabels=query_results.columnNames,
                columnTypes=query_results.columnTypes,
                pageNumber=query_results.page.currentPageNumber,
                pageSize=query_results.page.currentPageSize,
                startedAt=query_run.startedAt,
                endedAt=query_run.endedAt,
                message=query_run.errorMessage,
                errors=query_run.errorMessage,
                recordCount=query_results.page.totalRows,
            )
        ).build()

    def _get_query_results(
        self, query_run_id: str, page_number: int = 1, page_size: int = 100000
    ) -> GetQueryRunResultsRpcResult:
        query_results_resp = self.rpc.get_query_result(
            GetQueryRunResultsRpcParams(
                queryRunId=query_run_id,
                format=ResultFormat.csv,
                page=Page(
                    number=page_number,
                    size=page_size,
                ),
            )
        )

        if query_results_resp.error:
            raise UserError(
                status_code=query_results_resp.error.code,
                message=f"{query_results_resp.error.message}: {json.dumps(query_results_resp.error.dict())}",
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

    def _get_query_run(
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

        if not query_run_rpc_resp.result:
            raise SDKError(
                "valid status msg returned from server but no data exists in the response"
            )

        query_run = query_run_rpc_resp.result.queryRun
        query_status = query_run.state

        if query_status == QueryStatus.Success:
            return query_run

        if query_status == QueryStatus.Failed:
            raise QueryRunExecutionError(
                error_message=query_run.errorMessage,
                error_name=query_run.errorName,
                error_data=query_run.errorData,
            )
        elif query_status != QueryStatus.Failed and query_run_rpc_resp.error:
            raise UserError(
                status_code=query_run_rpc_resp.error.code,
                message=f"{query_run_rpc_resp.error.message}: {json.dumps(query_run_rpc_resp.error.dict())}",
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

        return self._get_query_run(
            query_run_id,
            page_number,
            page_size,
            attempts + 1,
            timeout_minutes,
            retry_interval_seconds,
        )
