import json

from shroomdk.api import API
from shroomdk.errors import (
    QueryRunExecutionError,
    QueryRunTimeoutError,
    SDKError,
    ServerError,
    UserError,
)
from shroomdk.integrations.query_integration import VelocityQueryIntegration
from shroomdk.integrations.query_integration.defaults import DEFAULTS
from shroomdk.models import Query, QueryStatus
from shroomdk.models.api import QueryResultJson

SDK_VERSION = "1.0.2"
SDK_PACKAGE = "python"


def get_api():
    return API("https://api.flipsidecrypto.xyz", "api_key")


def test_query_defaults():
    qi = VelocityQueryIntegration(get_api())

    # Test that the defaults are semi-overridden
    q = Query(sql="", ttl_minutes=5, page_number=5, page_size=10, sdk_package=SDK_PACKAGE, sdk_version=SDK_VERSION)  # type: ignore
    next_q = qi._set_query_defaults(q)

    assert next_q.page_number == 5
    assert next_q.page_size == 10
    assert next_q.ttl_minutes == 5
    assert next_q.sdk_package == SDK_PACKAGE
    assert next_q.sdk_version == SDK_VERSION
    assert next_q.cached == DEFAULTS.cached
    assert next_q.timeout_minutes == DEFAULTS.timeout_minutes

    # Test that the defaults are not overridden
    q = Query(sql="", sdk_package=SDK_PACKAGE, sdk_version=SDK_VERSION)  # type: ignore
    next_q = qi._set_query_defaults(q)

    assert next_q.page_number == DEFAULTS.page_number
    assert next_q.page_size == DEFAULTS.page_size
    assert next_q.ttl_minutes == DEFAULTS.ttl_minutes
    assert next_q.cached == DEFAULTS.cached
    assert next_q.timeout_minutes == DEFAULTS.timeout_minutes
    assert next_q.sdk_package == SDK_PACKAGE
    assert next_q.sdk_version == SDK_VERSION


def test_run_failed_to_create_query(requests_mock):
    api = get_api()
    qi = VelocityQueryIntegration(api)

    # Test 400 error
    q = Query(sql="", ttl_minutes=5, page_number=5, page_size=10, sdk_package=SDK_PACKAGE, sdk_version=SDK_VERSION)  # type: ignore
    requests_mock.post(
        api.get_url("queries"),
        text=json.dumps({"errors": "user_error"}),
        status_code=400,
        reason="User Error",
    )

    try:
        qi.run(q)
    except UserError as e:
        assert type(e) == UserError

    # Test 500 error
    requests_mock.post(
        api.get_url("queries"),
        text=json.dumps({"errors": "server_error"}),
        status_code=500,
        reason="Server Error",
    )

    try:
        qi.run(q)
    except ServerError as e:
        assert type(e) == ServerError

    # Unknown SDK Error
    requests_mock.post(
        api.get_url("queries"),
        text=json.dumps({"errors": "unknown_error"}),
        status_code=300,
        reason="Unknown Error",
    )

    try:
        qi.run(q)
    except SDKError as e:
        assert type(e) == SDKError

    # No query run data
    requests_mock.post(api.get_url("queries"), status_code=200, reason="OK")

    try:
        qi.run(q)
    except SDKError as e:
        assert type(e) == SDKError


def test_get_query_result_server_errors(requests_mock):
    api = get_api()
    qi = VelocityQueryIntegration(api)

    api = API("https://api.flipsidecrypto.xyz", "api_key")
    query_id = "test_query_id"

    # User Error
    requests_mock.get(
        api.get_url(f"queries/{query_id}"), status_code=400, reason="user_error"
    )

    try:
        qi._get_query_results("test_query_id")
    except UserError as e:
        assert type(e) == UserError

    # Server Error
    requests_mock.get(
        api.get_url(f"queries/{query_id}"), status_code=500, reason="server error"
    )

    try:
        qi._get_query_results("test_query_id")
    except ServerError as e:
        assert type(e) == ServerError

    # SDK Error
    requests_mock.get(api.get_url(f"queries/{query_id}"), status_code=200, reason="ok")

    try:
        qi._get_query_results("test_query_id")
    except SDKError as e:
        assert type(e) == SDKError


def test_get_query_result_query_errors(requests_mock):
    api = get_api()
    qi = VelocityQueryIntegration(api)

    api = API("https://api.flipsidecrypto.xyz", "api_key")
    query_id = "test_query_id"
    page_number = 1
    page_size = 10

    # Query Status: Error
    query_result_json = getQueryResultSetData(QueryStatus.Failed).dict()

    result = requests_mock.get(
        api.get_url(f"queries/{query_id}"),
        text=json.dumps(query_result_json),
        status_code=200,
        reason="OK",
    )

    try:
        result = qi._get_query_results(
            "test_query_id",
            page_number=page_number,
            page_size=page_size,
            attempts=0,
            timeout_minutes=1,
            retry_interval_seconds=0.0001,
        )
    except QueryRunExecutionError as e:
        assert type(e) == QueryRunExecutionError

    # Query Status: Finished
    query_result_json = getQueryResultSetData(QueryStatus.Success).dict()

    result = requests_mock.get(
        api.get_url(f"queries/{query_id}"),
        text=json.dumps(query_result_json),
        status_code=200,
        reason="OK",
    )

    result = qi._get_query_results(
        "test_query_id",
        page_number=page_number,
        page_size=page_size,
        attempts=0,
        timeout_minutes=1,
        retry_interval_seconds=0.0001,
    )
    assert result.results is not None
    assert type(result.results) is list
    assert len(result.results) == len(query_result_json["results"])

    # Query Execution Error
    query_result_json = getQueryResultSetData(QueryStatus.Failed).dict()

    result = requests_mock.get(
        api.get_url(f"queries/{query_id}"),
        text=json.dumps(query_result_json),
        status_code=200,
        reason="OK",
    )

    try:
        result = qi._get_query_results("test_query_id")
    except QueryRunExecutionError as e:
        assert type(e) == QueryRunExecutionError

    # Query Timeout
    query_result_json = getQueryResultSetData(QueryStatus.Running).dict()

    result = requests_mock.get(
        api.get_url(f"queries/{query_id}"),
        text=json.dumps(query_result_json),
        status_code=200,
        reason="OK",
    )

    try:
        result = qi._get_query_results(
            "test_query_id",
            page_number=page_number,
            page_size=page_size,
            attempts=0,
            timeout_minutes=0.1,
            retry_interval_seconds=0.0001,
        )
    except QueryRunTimeoutError as e:
        assert type(e) == QueryRunTimeoutError


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
        recordCount=4,
    )
