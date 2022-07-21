from shroomdk.api import API
from shroomdk.models import (
    QueryDefaults,
    Query,
    QueryResultSet,
    QueryStatus,
    SleepConfig
)
from shroomdk.models.api import (
    QueryResultJson
)
from shroomdk.errors import (
    UserError, 
    QueryRunExecutionError, 
    QueryRunTimeoutError, 
    SDKError,
    ServerError
)
from shroomdk.utils.sleep import (
    get_elapsed_linear_seconds, 
    linear_backoff
)
from .query_result_set_builder import QueryResultSetBuilder


DEFAULTS: QueryDefaults = QueryDefaults(
  ttl_minutes=60,
  cached=True,
  timeout_minutes=20,
  retry_interval_seconds=0.5,
  page_size=100000,
  page_number=1,
)


class QueryIntegration(object):
    
    def __init__(self, api: API, defaults: QueryDefaults = DEFAULTS):
        self.api = api
        self.defaults = defaults

    def run(self, query: Query) -> QueryResultSet:
        query = self._set_query_defaults(query)

        created_query = self.api.create_query(query)
        if created_query.status_code > 299:
            if created_query.status_code < 500 and created_query.status_code >= 400:
                raise UserError(created_query.status_code, created_query.error_msg)
            elif created_query.status_code >= 500:
                raise ServerError(created_query.status_code, created_query.error_msg)
            else:
                raise SDKError(f"unknown SDK error when calling `api.create_query`, {created_query.error_msg}")

        query_run = created_query.data
        if not query_run:
            raise SDKError( "expected `created_query.data` from server but got `None`")

        query_results = self._get_query_results(
            query_run.token, 
            page_number=query.page_number, 
            page_size=query.page_size,
            timeout_minutes=query.timeout_minutes,
            retry_interval_seconds=query.retry_interval_seconds
        )

        return QueryResultSetBuilder(query_results).build()

    def _set_query_defaults(self, query: Query) -> Query:
        query_default_dict = self.defaults.dict()
        query_dict = query.dict()
        query_default_dict.update({k:v for (k,v) in query_dict.items() if v is not None})
        return Query(**query_default_dict)

    def _get_query_results(self, query_run_id: str, page_number: int = 1, 
        page_size: int = 100000, attempts: int = 0, timeout_minutes: int = 20, 
        retry_interval_seconds: int = 1) -> QueryResultJson:

        query_run = self.api.get_query_result(query_run_id, page_number, page_size)
        status_code = query_run.status_code

        if status_code > 299:
            error_msg = query_run.status_msg if query_run.status_msg else "error"
            if query_run.error_msg:
                error_msg = query_run.error_msg
            if status_code >= 400 and status_code <= 499:
                raise UserError(status_code, error_msg)
            elif status_code >= 500:
                raise ServerError(status_code, error_msg)

        if not query_run.data:
            raise SDKError("valid status msg returned from server but no data exists in the response")

        query_status = query_run.data.status

        if query_status == QueryStatus.Finished:
            return query_run.data
        
        if query_status == QueryStatus.Error:
            raise QueryRunExecutionError()
        
        should_continue = linear_backoff(
            SleepConfig(
                attempts=attempts, 
                timeout_minutes=timeout_minutes, 
                interval_seconds=retry_interval_seconds
            )
        )

        if not should_continue:
            elapsed_seconds = get_elapsed_linear_seconds(
                SleepConfig(
                    attempts=attempts, 
                    timeout_minutes=timeout_minutes, 
                    interval_seconds=retry_interval_seconds
                )
            )
            
            raise QueryRunTimeoutError(elapsed_seconds)

        return self._get_query_results(query_run_id, page_number, page_size, attempts + 1, timeout_minutes, retry_interval_seconds)

