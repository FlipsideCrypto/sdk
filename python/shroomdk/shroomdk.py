from shroomdk.integrations.query_integration.compass_query_integration import (
    CompassQueryIntegration,
)
from shroomdk.models import Query
from shroomdk.rpc import RPC

API_BASE_URL = "https://rpc-prod.flompass.pizza"

SDK_VERSION = "2.0.0"
SDK_PACKAGE = "python"


class ShroomDK(object):
    def __init__(self, api_key: str, api_base_url: str = API_BASE_URL):
        self.rpc = RPC(api_base_url, api_key)

    def query(
        self,
        sql,
        ttl_minutes=60,
        max_age_minutes=60,
        cached=True,
        timeout_minutes=20,
        retry_interval_seconds=1,
        page_size=100000,
        page_number=1,
        data_source="snowflake-default",
        data_provider="flipside",
    ):
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
