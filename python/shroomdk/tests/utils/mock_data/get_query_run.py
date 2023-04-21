from typing import Union

from shroomdk.models.compass.core.rpc_error import RpcError
from shroomdk.models.query_status import QueryStatus


def get_query_run_response(
    status: str = QueryStatus.Ready, error: Union[RpcError, None] = None
):
    base = {
        "jsonrpc": "2.0",
        "id": 1,
    }

    default_result = {
        "queryRun": {
            "id": "clg44olzq00cbn60tasvob5l2",
            "sqlStatementId": "clg44oly200c9n60tviq17sng",
            "state": status,
            "path": "2023/04/05/20/clg44olzq00cbn60tasvob5l2",
            "fileCount": 1,
            "lastFileNumber": 1,
            "fileNames": "clg44olzq00cbn60tasvob5l2-consolidated-results.parquet",
            "errorName": None,
            "errorMessage": None,
            "errorData": None,
            "dataSourceQueryId": None,
            "dataSourceSessionId": "17257398387030526",
            "startedAt": "2023-04-05T20:14:55.000Z",
            "queryRunningEndedAt": "2023-04-05T20:15:00.000Z",
            "queryStreamingEndedAt": "2023-04-05T20:15:45.000Z",
            "endedAt": "2023-04-05T20:15:46.000Z",
            "rowCount": 10000,
            "totalSize": 24904891,
            "tags": {
                "sdk_package": "python",
                "sdk_version": "1.0.2",
                "sdk_language": "python",
            },
            "dataSourceId": "clf90gwee0002jvbu63diaa8u",
            "userId": "clf8qd1eb0000jv08kbuw0dy4",
            "createdAt": "2023-04-05T20:14:55.000Z",
            "updatedAt": "2023-04-05T20:14:55.000Z",
            "archivedAt": None,
        },
        "redirectedToQueryRun": None,
    }

    if error is not None:
        base.update({"error": error.dict()})

    base.update({"result": default_result})

    return base
