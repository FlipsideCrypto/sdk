from .models import Query
from .api import API
from .integrations import (
    QueryIntegration
)

API_BASE_URL = "https://api.flipsidecrypto.com"


class ShroomDK(object):

    def __init__(self, api_key: str, api_base_url: str = API_BASE_URL):
        self.api = API(api_base_url, api_key)

    def query(self, sql, ttl_minutes=60, cached=True, timeout_minutes=20, retry_interval_seconds=0.5, page_size=100000, page_number=1):
        query_integration = QueryIntegration(self.api)

        return query_integration.run(Query(
            sql=sql,
            ttl_minutes=ttl_minutes,
            timeout_minutes=timeout_minutes,
            retry_interval_seconds=retry_interval_seconds,
            page_size=page_size,
            page_number=page_number,
            cached=cached
        ))
