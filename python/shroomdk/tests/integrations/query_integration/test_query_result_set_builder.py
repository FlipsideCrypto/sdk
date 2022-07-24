from datetime import datetime

from shroomdk.integrations.query_integration.query_result_set_builder import (
    QueryResultSetBuilder,
)
from shroomdk.models.api import QueryResultJson
from shroomdk.models.query_status import QueryStatus


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


def test_run_stats():
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Finished))

    # Start/end are datetime objects?
    assert type(qr.run_stats.started_at) == datetime
    assert type(qr.run_stats.ended_at) == datetime

    # Elapsed seconds
    assert qr.run_stats.elapsed_seconds == 90

    # Record count
    assert qr.run_stats.record_count == 4


def test_records():
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Finished))

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
    # Status is finished?
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Finished))
    assert qr.status == QueryStatus.Finished

    # Status is pending?
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Pending))
    assert qr.status == QueryStatus.Pending

    # Status is error?
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Error))
    assert qr.status == QueryStatus.Error


def test_query_id():
    # Query ID is set?
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Finished))
    assert qr.query_id is not None

    # Query ID is test
    qr = QueryResultSetBuilder(getQueryResultSetData(QueryStatus.Finished))
    assert qr.query_id == "test"
