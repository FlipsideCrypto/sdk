import json

from shroomdk.api import API
from shroomdk.models import Query, QueryStatus
from shroomdk.models.api import QueryResultJson


def test_create_query_success(requests_mock):
    api = API("https://api.flipsidecrypto.xyz", "api_key")

    result = requests_mock.post(
        api.get_url("queries"),
        text=json.dumps({"token": "mytoken", "cached": False}),
        status_code=200,
        reason="OK",
    )

    q = Query(sql="SELECT * FROM mytable", ttl_minutes=5)  # type: ignore

    result = api.create_query(q)

    assert result.data is not None
    assert result.data.token == "mytoken"
    assert result.data.cached is False
    assert result.status_code == 200


def test_create_query_user_error(requests_mock):
    api = API("https://api.flipsidecrypto.xyz", "api_key")

    result = requests_mock.post(
        api.get_url("queries"),
        text=json.dumps({"errors": "user_error"}),
        status_code=400,
        reason="User Error",
    )

    q = Query(sql="SELECT * FROM mytable", ttl_minutes=5)  # type: ignore

    result = api.create_query(q)
    assert result.data is None
    assert result.status_msg == "User Error"
    assert result.status_code == 400
    assert result.error_msg == "user_error"


def test_create_query_server_error(requests_mock):
    api = API("https://api.flipsidecrypto.xyz", "api_key")

    result = requests_mock.post(api.get_url("queries"), status_code=500, reason="Server Error")

    q = Query(sql="SELECT * FROM mytable", ttl_minutes=5)  # type: ignore

    result = api.create_query(q)
    assert result.data is None
    assert result.status_msg == "Server Error"
    assert result.status_code == 500
    assert result.error_msg is None


def getQueryResultSetData(status: str) -> QueryResultJson:
    return QueryResultJson(
        queryId="test",
        status=status,
        results=[
            [1, "0x-tx-id-0", "0xfrom-address-0", True, 0.5],
            [2, "0x-tx-id-1", "0xfrom-address-1", False, 0.75],
            [3, "0x-tx-id-2", "0xfrom-address-2", False, 1.75],
            [4, "0x-tx-id-3", "0xfrom-address-3", True, 100.001],
        ],
        startedAt="2022-05-19T00:00:00.00Z",
        endedAt="2022-05-19T00:01:30.00Z",
        columnLabels=[
            "block_id",
            "tx_id",
            "from_address",
            "succeeded",
            "amount",
        ],
        columnTypes=["number", "string", "string", "boolean", "number"],
        message="",
        errors=None,
        pageSize=100,
        pageNumber=0,
    )


def test_get_query_result(requests_mock):
    api = API("https://api.flipsidecrypto.xyz", "api_key")
    query_id = "test_query_id"
    page_number = 1
    page_size = 10

    query_result_json = getQueryResultSetData(QueryStatus.Finished).dict()

    result = requests_mock.get(
        api.get_url(f"queries/{query_id}"),
        text=json.dumps(query_result_json),
        status_code=200,
        reason="OK",
    )

    result = api.get_query_result(query_id, page_number, page_size)
    assert result.data is not None
    assert result.status_code == 200


def test_get_query_result_user_error(requests_mock):
    api = API("https://api.flipsidecrypto.xyz", "api_key")
    query_id = "test_query_id"
    page_number = 1
    page_size = 10

    result = requests_mock.get(
        api.get_url(f"queries/{query_id}"),
        text=json.dumps({"errors": "user_error"}),
        status_code=400,
        reason="User Error",
    )

    result = api.get_query_result(query_id, page_number, page_size)
    assert result.data is None
    assert result.status_msg == "User Error"
    assert result.status_code == 400
    assert result.error_msg == "user_error"


def test_get_query_result_server_error(requests_mock):
    api = API("https://api.flipsidecrypto.xyz", "api_key")
    query_id = "test_query_id"
    page_number = 1
    page_size = 10

    result = requests_mock.get(api.get_url(f"queries/{query_id}"), status_code=500, reason="Server Error")

    result = api.get_query_result(query_id, page_number, page_size)
    assert result.data is None
    assert result.status_msg == "Server Error"
    assert result.status_code == 500
    assert result.error_msg is None
