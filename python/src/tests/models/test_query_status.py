from ...models.query_status import (
    QueryStatus,
    QueryStatusCanceled,
    QueryStatusFailed,
    QueryStatusReady,
    QueryStatusRunning,
    QueryStatusStreamingResults,
    QueryStatusSuccess,
)


def test_query_status():
    assert QueryStatusReady == "QUERY_STATE_READY"
    assert QueryStatusRunning == "QUERY_STATE_RUNNING"
    assert QueryStatusStreamingResults == "QUERY_STATE_STREAMING_RESULTS"
    assert QueryStatusSuccess == "QUERY_STATE_SUCCESS"
    assert QueryStatusFailed == "QUERY_STATE_FAILED"
    assert QueryStatusCanceled == "QUERY_STATE_CANCELED"

    assert QueryStatus.Ready == "QUERY_STATE_READY"
    assert QueryStatus.Running == "QUERY_STATE_RUNNING"
    assert QueryStatus.StreamingResults == "QUERY_STATE_STREAMING_RESULTS"
    assert QueryStatus.Success == "QUERY_STATE_SUCCESS"
    assert QueryStatus.Failed == "QUERY_STATE_FAILED"
    assert QueryStatus.Canceled == "QUERY_STATE_CANCELED"
