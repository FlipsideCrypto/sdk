from datetime import datetime

from shroomdk.integrations.query_integration.query_result_set_builder import (
    QueryResultSetBuilder,
)
from shroomdk.models.compass.get_query_run import GetQueryRunRpcResponse
from shroomdk.models.compass.get_query_run_results import GetQueryRunResultsRpcResponse
from shroomdk.models.query_status import QueryStatus
from shroomdk.tests.utils.mock_data.get_query_results import get_query_results_response
from shroomdk.tests.utils.mock_data.get_query_run import get_query_run_response


def getQueryResultSetData(status: str) -> dict:
    query_run_resp = GetQueryRunRpcResponse(**get_query_run_response(status=status))
    query_result_resp = GetQueryRunResultsRpcResponse(
        **get_query_results_response(status=status)
    )
    return {
        "query_run": query_run_resp.result.queryRun if query_run_resp.result else None,
        "query_result": query_result_resp.result if query_result_resp.result else None,
    }
    # return QueryResultJson(
    #     queryId="test",
    #     status=status,
    #     results=[
    #         [1, "0x-tx-id-0", "0xfrom-address-0", True, 0.5],
    #         [2, "0x-tx-id-1", "0xfrom-address-1", False, 0.75],
    #         [3, "0x-tx-id-2", "0xfrom-address-2", False, 1.75],
    #         [4, "0x-tx-id-3", "0xfrom-address-3", True, 100.001],
    #     ],
    #     startedAt="2022-05-19T00:00:00.00Z",
    #     endedAt="2022-05-19T00:01:30.00Z",
    #     columnLabels=[
    #         "block_id",
    #         "tx_id",
    #         "from_address",
    #         "succeeded",
    #         "amount",
    #     ],
    #     columnTypes=["number", "string", "string", "boolean", "number"],
    #     message="",
    #     errors=None,
    #     pageSize=100,
    #     pageNumber=0,
    #     recordCount=4,
    # )


def test_run_stats():
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Success))

    # Start/end are datetime objects?
    assert type(qr.run_stats.started_at) == datetime
    assert type(qr.run_stats.ended_at) == datetime

    # Elapsed seconds
    assert qr.run_stats.elapsed_seconds == 51

    # Streaming seconds
    assert qr.run_stats.streaming_seconds == 45

    # Exec Seconds
    assert qr.run_stats.query_exec_seconds == 5

    # Record count
    assert qr.run_stats.record_count == 10000


def test_records():
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Success))

    # Records Length Matches Row Length?
    assert qr.records is not None
    assert qr.rows is not None
    assert qr.columns is not None
    assert len(qr.records) == len(qr.rows)

    # Column Length Matches Records Key Length
    for record in qr.records:
        assert record is not None

        assert len(record.keys()) == len(qr.columns)

    # Columns = Record Keys
    for record in qr.records:
        for column in qr.columns:
            assert column in record.keys()

    # Record values match row values?
    for record, row in zip(qr.records, qr.rows):
        for column, value in zip(qr.columns, row):
            assert record[column] == value


def test_status():
    # Status is ready?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Ready))
    assert qr.status == QueryStatus.Ready

    # Status is running?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Running))
    assert qr.status == QueryStatus.Running

    # Status is streaming?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.StreamingResults))
    assert qr.status == QueryStatus.StreamingResults

    # Status is cancelled?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Canceled))
    assert qr.status == QueryStatus.Canceled

    # Status is finished?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Success))
    assert qr.status == QueryStatus.Success

    # Status is failed?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Failed))
    assert qr.status == QueryStatus.Failed


def test_query_id():
    # Query ID is set?
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Success))
    assert qr.query_id is not None

    # Query ID is test
    qr = QueryResultSetBuilder(**getQueryResultSetData(QueryStatus.Success))
    assert qr.query_id == "clg44olzq00cbn60tasvob5l2"
