import json

from ....errors import (
    ApiError,
    QueryRunCancelledError,
    QueryRunExecutionError,
    QueryRunTimeoutError,
)
from ....errors.api_error import error_codes
from ....integrations import CompassQueryIntegration
from ....integrations.query_integration.defaults import DEFAULTS
from ....models import Query, QueryStatus
from ....models.compass.core.rpc_error import RpcError
from ....rpc import RPC
from ...utils.mock_data.create_query_run import create_query_run_response
from ...utils.mock_data.get_query_results import get_query_results_response
from ...utils.mock_data.get_query_run import get_query_run_response
from ...utils.mock_data.get_sql_statement import get_sql_statement_response

SDK_VERSION = "1.0.2"
SDK_PACKAGE = "python"


def get_rpc():
    return RPC("https://test.com", "api_key")


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


def test_query_success(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    page_number = 1
    page_size = 10

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


def test_query_failed(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    page_number = 1
    page_size = 10

    # Query Execution Error
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Failed,
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
            timeout_minutes=1,
            retry_interval_seconds=0.0001,
        )
    except Exception as e:
        assert type(e) == QueryRunExecutionError


def test_query_cancelled(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    page_number = 1
    page_size = 10

    # Query Execution Error
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Canceled,
            )
        ),
        status_code=200,
        reason="OK",
    )

    try:
        qi._get_query_run_loop(
            "test_query_id",
            page_number=page_number,
            page_size=page_size,
            attempts=0,
            timeout_minutes=1,
            retry_interval_seconds=0.0001,
        )
    except Exception as e:
        assert type(e) == QueryRunCancelledError


def test_query_timeout(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    page_number = 1
    page_size = 10

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


def test_api_error_codes(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    page_number = 1
    page_size = 10

    for key, value in error_codes.items():

        requests_mock.reset()
        result = requests_mock.post(
            rpc.url,
            text=json.dumps(
                get_query_run_response(
                    status=QueryStatus.Running,
                    error=RpcError(code=value, message="", data={}),
                )
            ),
            status_code=200,
            reason="OK",
        )

        try:
            qi._get_query_run_loop(
                f"test_query_{key}",
                page_number=page_number,
                page_size=page_size,
                attempts=0,
                timeout_minutes=0.1,
                retry_interval_seconds=0.0001,
            )
        except Exception as e:
            assert type(e) == ApiError


def test_get_private_query_results(requests_mock):
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
        status_code=200,
        reason="ok",
    )

    try:
        result = qi._get_query_results("test_query_id")
    except Exception as e:
        assert type(e) == ApiError


def test_cancel_query_run(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Success,
            )
        ),
        status_code=200,
        reason="ok",
    )

    result = qi.cancel_query_run("cancel_query_run_id")
    assert result is not None


def test_get_query_results(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

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

    result = qi.get_query_results("get_query_results_id")
    assert result is not None


def test_get_query_run(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_query_run_response(
                status=QueryStatus.Success,
            )
        ),
        status_code=200,
        reason="ok",
    )

    result = qi.get_query_run("get_query_run_id")
    assert result is not None


def test_get_sql_statement(requests_mock):
    rpc = get_rpc()
    qi = CompassQueryIntegration(rpc)

    sql_id = "get_sql_statement_id"
    requests_mock.reset()
    result = requests_mock.post(
        rpc.url,
        text=json.dumps(
            get_sql_statement_response(
                id=sql_id,
            )
        ),
        status_code=200,
        reason="ok",
    )

    result = qi.get_sql_statement(sql_id)
    assert result.id == sql_id
