import json

from shroomdk.errors import (
    QueryRunExecutionError,
    QueryRunTimeoutError,
    SDKError,
    ServerError,
    UserError,
)
from shroomdk.integrations import CompassQueryIntegration
from shroomdk.integrations.query_integration.defaults import DEFAULTS
from shroomdk.models import Query, QueryStatus
from shroomdk.models.compass.core.rpc_error import RpcError
from shroomdk.rpc import RPC
from shroomdk.tests.utils.mock_data.create_query_run import create_query_run_response
from shroomdk.tests.utils.mock_data.get_query_results import get_query_results_response
from shroomdk.tests.utils.mock_data.get_query_run import get_query_run_response

SDK_VERSION = "1.0.2"
SDK_PACKAGE = "python"


def get_rpc():
    return RPC("https://compass.flipsidecrypto.xyz", "api_key")


def test_query_defaults():
    qi = CompassQueryIntegration(get_rpc())

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
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    # Test User Error, 400 error
    q = Query(sql="", ttl_minutes=5, page_number=5, page_size=10, sdk_package=SDK_PACKAGE, sdk_version=SDK_VERSION)  # type: ignore
    requests_mock.post(
        rpc.url,
        text=json.dumps(
            create_query_run_response(
                status=QueryStatus.Failed,
                error=RpcError(
                    code=-51000,
                    message="error at line 10 of sql statement",
                    data={"stack": "error at line 10 of sql statement"},
                ),
            )
        ),
        status_code=400,
        reason="User Error",
    )

    try:
        qi.run(q)
    except Exception as e:
        assert type(e) == UserError

    # Test Server Error: 500 error
    requests_mock.post(
        rpc.url,
        text="{err:",
        status_code=500,
        reason="Server Error",
    )

    try:
        qi.run(q)
    except Exception as e:
        assert type(e) == ServerError

    # Unknown SDK Error
    requests_mock.post(
        rpc.url,
        text=json.dumps(
            create_query_run_response(
                status=QueryStatus.Ready,
                result_null=True,
            )
        ),
        status_code=200,
        reason="ok",
    )

    try:
        qi.run(q)
    except Exception as e:
        assert type(e) == SDKError  # pydantic.error_wrappers.ValidationError


def test_get_query_run_query(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    query_id = "test_query_id"
    page_number = 1
    page_size = 10

    # Query Execution Error
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Failed,
                error=RpcError(
                    code=-51000,
                    message="error at line 10 of sql statement",
                    data={"stack": "error at line 10 of sql statement"},
                ),
            )
        ),
        status_code=400,
        reason="not ok",
    )

    try:
        result = qi._get_query_run_loop(
            "test_query_id",
            page_number=page_number,
            page_size=page_size,
            attempts=0,
            timeout_minutes=1,
            retry_interval_seconds=0.0001,
        )
    except Exception as e:
        assert type(e) == QueryRunExecutionError

    # Query User Error
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Ready,
                error=RpcError(code=-52000, message="Query Run Not Found", data={}),
            )
        ),
        status_code=404,
        reason="not ok",
    )

    try:
        result = qi._get_query_run_loop(
            "test_query_id",
            page_number=page_number,
            page_size=page_size,
            attempts=0,
            timeout_minutes=1,
            retry_interval_seconds=0.0001,
        )
    except Exception as e:
        assert type(e) == UserError

    # Query Status: Finished
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Success,
            )
        ),
        status_code=200,
        reason="OK",
    )

    result = qi._get_query_run_loop(
        "test_query_id",
        page_number=page_number,
        page_size=page_size,
        attempts=0,
        timeout_minutes=1,
        retry_interval_seconds=0.0001,
    )
    assert result is not None
    assert result.state == QueryStatus.Success

    # Query Timeout
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Running,
            )
        ),
        status_code=200,
        reason="OK",
    )

    try:
        result = qi._get_query_run_loop(
            "test_query_id",
            page_number=page_number,
            page_size=page_size,
            attempts=0,
            timeout_minutes=0.1,
            retry_interval_seconds=0.0001,
        )
    except Exception as e:
        assert type(e) == QueryRunTimeoutError


def test_get_query_results(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    page_number = 1
    page_size = 10

    # Query Result Success
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_results_response(
                status=QueryStatus.Success,
            )
        ),
        status_code=200,
        reason="ok",
    )

    result = qi._get_query_results("test_query_id")
    assert result is not None

    # Query Result Error
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_results_response(
                status=QueryStatus.Success,
                error=RpcError(
                    code=-53000,
                    message="query results not found",
                    data={},
                ),
            )
        ),
        status_code=404,
        reason="not ok",
    )

    try:
        result = qi._get_query_results("test_query_id")
    except Exception as e:
        assert type(e) == UserError


# def getQueryResultSetData(status: str) -> QueryResultJson:
#     return QueryResultJson(
#         queryId="test",
#         status=status,
#         results=[
#             [1, "0x-tx-id-0", "0xfrom-address-0", True, 0.5],
#             [2, "0x-tx-id-1", "0xfrom-address-1", False, 0.75],
#             [3, "0x-tx-id-2", "0xfrom-address-2", False, 1.75],
#             [4, "0x-tx-id-3", "0xfrom-address-3", True, 100.001],
#         ],
#         startedAt="2022-05-19T00:00:00.00Z",
#         endedAt="2022-05-19T00:01:30.00Z",
#         columnLabels=[
#             "block_id",
#             "tx_id",
#             "from_address",
#             "succeeded",
#             "amount",
#         ],
#         columnTypes=["number", "string", "string", "boolean", "number"],
#         message="",
#         errors=None,
#         pageSize=100,
#         pageNumber=0,
#         recordCount=4,
#     )
