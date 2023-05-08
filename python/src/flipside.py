from typing import List, Optional, Union

from .integrations.query_integration.compass_query_integration import (
    CompassQueryIntegration,
)
from .models import Filter, Query, SortBy
from .models.compass.core.query_run import QueryRun
from .models.compass.core.sql_statement import SqlStatement
from .models.query_result_set import QueryResultSet
from .rpc import RPC

API_BASE_URL = "https://api-v2.flipsidecrypto.xyz"

SDK_VERSION = "2.0.4"
SDK_PACKAGE = "python"

DEFAULT_DATA_SOURCE = "snowflake-default"
DEFAULT_DATA_PROVIDER = "flipside"
DEFAULT_PAGE_SIZE = 100000
DEFAULT_PAGE_NUMBER = 1
DEFAULT_TIMEOUT_MINUTES = 15
DEFAULT_TTL_MINUTES = 60
DEFAULT_MAX_AGE_MINUTES = 0


class Flipside(object):
    def __init__(self, api_key: str, api_base_url: str = API_BASE_URL):
        if "api." in api_base_url.lower():
            api_base_url = API_BASE_URL
        self.rpc = RPC(api_base_url, api_key)
        self.query_integration = CompassQueryIntegration(self.rpc)

    def query(
        self,
        sql,
        ttl_minutes=DEFAULT_TTL_MINUTES,
        max_age_minutes=DEFAULT_MAX_AGE_MINUTES,
        cached=True,
        timeout_minutes=DEFAULT_TIMEOUT_MINUTES,
        retry_interval_seconds=1,
        page_size=DEFAULT_PAGE_SIZE,
        page_number=1,
        data_source=DEFAULT_DATA_SOURCE,
        data_provider=DEFAULT_DATA_PROVIDER,
    ) -> QueryResultSet:
        query_integration = CompassQueryIntegration(self.rpc)

        return query_integration.run(
            Query(
                sql=sql,
                ttl_minutes=ttl_minutes,
                timeout_minutes=timeout_minutes,
                max_age_minutes=max_age_minutes,
                retry_interval_seconds=retry_interval_seconds,
                page_size=page_size,
                page_number=page_number,
                cached=cached,
                sdk_package=SDK_PACKAGE,
                sdk_version=SDK_VERSION,
                data_source=data_source,
                data_provider=data_provider,
            )
        )

    def get_query_run(self, query_run_id: str) -> QueryRun:
        return self.query_integration.get_query_run(query_run_id)

    def get_query_results(
        self,
        query_run_id: str,
        page_number: int = 1,
        page_size: int = DEFAULT_PAGE_SIZE,
        filters: Optional[Union[List[Filter], None]] = [],
        sort_by: Optional[Union[List[SortBy], None]] = [],
    ) -> QueryResultSet:
        return self.query_integration.get_query_results(
            query_run_id,
            page_number=page_number,
            page_size=page_size,
            filters=filters,
            sort_by=sort_by,
        )

    def get_sql_statement(self, sql_statement_id: str) -> SqlStatement:
        return self.query_integration.get_sql_statement(sql_statement_id)

    def cancel_query_run(self, query_run_id: str) -> QueryRun:
        return self.query_integration.cancel_query_run(query_run_id)


class ShroomDK(Flipside):
    pass
