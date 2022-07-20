QueryStatusFinished = "finished"
QueryStatusPending = "pending"
QueryStatusError = "error"


class QueryStatus(object):
    Finished: str = QueryStatusFinished
    Pending: str = QueryStatusPending
    Error: str = QueryStatusError
