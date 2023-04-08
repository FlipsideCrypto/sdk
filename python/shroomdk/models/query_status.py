QueryStatusReady = "QUERY_STATE_READY"
QueryStatusRunning = "QUERY_STATE_RUNNING"
QueryStatusStreamingResults = "QUERY_STATE_STREAMING_RESULTS"
QueryStatusSuccess = "QUERY_STATE_SUCCESS"
QueryStatusFailed = "QUERY_STATE_FAILED"
QueryStatusCanceled = "QUERY_STATE_CANCELED"


class QueryStatus(object):
    Ready: str = QueryStatusReady
    Running: str = QueryStatusRunning
    StreamingResults: str = QueryStatusStreamingResults
    Success: str = QueryStatusSuccess
    Failed: str = QueryStatusFailed
    Canceled: str = QueryStatusCanceled
