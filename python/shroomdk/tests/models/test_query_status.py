from shroomdk.models.query_status import (
    QueryStatusFinished,
    QueryStatusPending,
    QueryStatusError,
    QueryStatus
)


def test_query_status():
    assert QueryStatusFinished == "finished"
    assert QueryStatusPending == "pending"
    assert QueryStatusError == "error"

    assert QueryStatus.Finished == "finished"
    assert QueryStatus.Pending == "pending"
    assert QueryStatus.Error == "error"
