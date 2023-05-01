import json

from ..errors.server_error import ServerError
from ..models import Query, QueryStatus
from ..models.compass.core.page import Page
from ..models.compass.core.result_format import ResultFormat
from ..models.compass.core.rpc_error import RpcError
from ..models.compass.core.tags import Tags
from ..models.compass.create_query_run import CreateQueryRunRpcParams
from ..models.compass.get_query_run import GetQueryRunRpcRequestParams
from ..models.compass.get_query_run_results import GetQueryRunResultsRpcParams
from ..rpc import RPC
from .utils.mock_data.create_query_run import create_query_run_response
from .utils.mock_data.get_query_results import get_query_results_response
from .utils.mock_data.get_query_run import get_query_run_response

"""
Test Defaults
"""
tags = Tags(sdk_language="python", sdk_package="shroomdk", sdk_version="0.0.1")
SERVICE_URL = "https://rpc.flipsidecrypto.xyz"

"""
CreateQuery Run tests
"""


def test_url(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")
    assert rpc.url == f"{SERVICE_URL}/json-rpc"


def test_create_query_success(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")

    result = requests_mock.post(
        rpc.url,
        text=json.dumps(create_query_run_response(status=QueryStatus.Success)),
        status_code=200,
        reason="OK",
    )

    q = CreateQueryRunRpcParams(
        resultTTLHours=1,
        maxAgeMinutes=5,
        sql="SELECT * FROM mytable",
        tags=tags,
        dataSource="snowflake-default",
        dataProvider="flipside",
    )

    result = rpc.create_query(q)

    assert result.result is not None
    assert result.result.queryRun is not None
    assert result.result.queryRequest is not None
    assert result.result.sqlStatement is not None
    assert result.result.queryRun.state == QueryStatus.Success
    assert result.error is None


def test_create_query_server_error(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")
    result = requests_mock.post(
        rpc.url,
        text="{'bad json', 'data",
        status_code=500,
        reason="OK",
    )

    q = CreateQueryRunRpcParams(
        resultTTLHours=1,
        maxAgeMinutes=5,
        sql="SELECT * FROM mytable",
        tags=tags,
        dataSource="snowflake-default",
        dataProvider="flipside",
    )

    try:
        rpc.create_query(q)
    except Exception as e:
        assert type(e) == ServerError
        return

    assert "ServerError not raised" == False


"""
GetQueryRun tests
"""


def test_get_query_run_success(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")

    result = requests_mock.post(
        rpc.url,
        text=json.dumps(get_query_run_response(status=QueryStatus.Success)),
        status_code=200,
        reason="OK",
    )

    q = GetQueryRunRpcRequestParams(
        queryRunId="randomid",
    )

    result = rpc.get_query_run(q)

    assert result.result is not None
    assert result.result.queryRun is not None
    assert result.error is None


def test_get_query_run_server_error(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")
    result = requests_mock.post(
        rpc.url,
        text="{'bad json', 'data",
        status_code=500,
        reason="OK",
    )

    q = GetQueryRunRpcRequestParams(
        queryRunId="randomid",
    )

    try:
        rpc.get_query_run(q)
    except Exception as e:
        assert type(e) == ServerError
        return

    assert "ServerError not raised" == False


"""
GetQueryResult tests
"""


def test_get_query_results_success(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")

    result = requests_mock.post(
        rpc.url,
        text=json.dumps(get_query_results_response(status=QueryStatus.Success)),
        status_code=200,
        reason="OK",
    )

    q = GetQueryRunResultsRpcParams(
        queryRunId="randomid", format=ResultFormat.csv, page=Page(size=1, number=1)
    )

    result = rpc.get_query_result(q)

    assert result.result is not None
    assert result.result.rows is not None
    assert len(result.result.rows) == q.page.size
    assert result.result.page is not None
    assert result.result.page.currentPageNumber == q.page.number
    assert result.result.page.currentPageSize == q.page.size
    assert result.result.originalQueryRun is not None
    assert result.result.sql is not None
    assert result.result.format is not None
    assert result.result.format == q.format
    assert result.result.columnNames is not None
    assert result.result.columnTypes is not None
    assert len(result.result.columnNames) == len(result.result.columnTypes)
    assert len(result.result.columnNames) == len(result.result.rows[0])
    assert result.error is None


def test_get_query_results_server_error(requests_mock):
    rpc = RPC(SERVICE_URL, "api_key")

    result = requests_mock.post(
        rpc.url,
        text="{'bad json', 'data",
        status_code=200,
        reason="OK",
    )

    q = GetQueryRunResultsRpcParams(
        queryRunId="randomid", format=ResultFormat.csv, page=Page(size=1, number=1)
    )

    try:
        rpc.get_query_result(q)
    except Exception as e:
        assert type(e) == ServerError
        return

    assert "ServerError not raised" == False
