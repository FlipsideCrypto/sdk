import requests
import json

from .models import (
    Query
)
from .models.api import (
    CreateQueryResp, 
    CreateQueryJson,
    QueryResultResp,
    QueryResultJson
)


class API(object):

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-api-key": api_key,
        }

    def get_url(self, path: str) -> str:
        return f"{self.base_url}/{path}"
    
    def create_query(self, query: Query) -> CreateQueryResp:
        result = requests.post(
            self.get_url("queries"),
            data=json.dumps(query.dict()),
            headers=self.headers,
        )

        data = None
        if result.status_code >= 200 and result.status_code < 300:
            data = result.json()
  
        return CreateQueryResp(
            status_code=result.status_code,
            status_msg=result.reason,
            error_msg=data.get('errors') if data else None,
            data=CreateQueryJson(**data) if data else None,
        )

    def get_query_result(self, query_id: str, page_number: int, page_size: int) -> QueryResultResp:
        result = requests.get(
            self.get_url(f"queries/{query_id}"),
            params={"pageNumber": page_number, "pageSize": page_size},
            headers=self.headers,
        )

        data = None
        if result.status_code >= 200 and result.status_code < 300:
            data = result.json()

        return QueryResultResp(
            status_code=result.status_code,
            status_msg=result.reason,
            error_msg=data.get('errors') if data else None,
            data=QueryResultJson(**data) if data else None,
        )
