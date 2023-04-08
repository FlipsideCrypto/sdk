from shroomdk.models.compass.core.rpc_error import RpcError
from shroomdk.models.query_status import QueryStatus


def create_query_run_response(
    status: str = QueryStatus.Ready,
    error: RpcError | None = None,
    result_null: bool = False,
):
    base = {
        "jsonrpc": "2.0",
        "id": 1,
    }

    default_result = {
        "queryRequest": {
            "id": "clg44na8m00iund0uymg1n60i",
            "sqlStatementId": "clg44k7gt00iind0ul763yjf8",
            "userId": "clf8qd1eb0000jv08kbuw0dy4",
            "tags": {"source": "ctlab", "flipsideUsername": "j1mmy"},
            "maxAgeMinutes": 30,
            "resultTTLHours": 720,
            "userSkipCache": False,
            "triggeredQueryRun": False,
            "queryRunId": "clg44k7ij00iknd0u60y2zfyx",
            "createdAt": "2023-04-05T20:13:53.000Z",
            "updatedAt": "2023-04-05T20:13:53.000Z",
        },
        "queryRun": {
            "id": "clg44k7ij00iknd0u60y2zfyx",
            "sqlStatementId": "clg44k7gt00iind0ul763yjf8",
            "state": status,
            "path": "2023/04/05/20/clg44k7ij00iknd0u60y2zfyx",
            "fileCount": 1,
            "lastFileNumber": 1,
            "fileNames": "clg44k7ij00iknd0u60y2zfyx-consolidated-results.parquet",
            "errorName": None,
            "errorMessage": None,
            "errorData": None,
            "dataSourceQueryId": None,
            "dataSourceSessionId": "17257398387015434",
            "startedAt": "2023-04-05T20:11:30.000Z",
            "queryRunningEndedAt": "2023-04-05T20:11:46.000Z",
            "queryStreamingEndedAt": "2023-04-05T20:13:16.000Z",
            "endedAt": "2023-04-05T20:13:16.000Z",
            "rowCount": 13000,
            "totalSize": 18412529,
            "tags": {
                "sdk_package": "python",
                "sdk_version": "1.0.2",
                "sdk_language": "python",
            },
            "dataSourceId": "clf90gwee0002jvbu63diaa8u",
            "userId": "clf8qd1eb0000jv08kbuw0dy4",
            "createdAt": "2023-04-05T20:11:29.000Z",
            "updatedAt": "2023-04-05T20:11:29.000Z",
            "archivedAt": None,
        },
        "sqlStatement": {
            "id": "clg44k7gt00iind0ul763yjf8",
            "statementHash": "36aa1767e72b9c9be3d9cfabe8992da861571629b45e57a834a44d6f2aeabf5d",
            "sql": "SELECT * FROM ethereum.core.fact_transactions LIMIT 13000",
            "columnMetadata": {
                "types": [
                    "fixed",
                    "timestamp_ntz",
                    "text",
                    "text",
                    "real",
                    "fixed",
                    "text",
                    "text",
                    "text",
                    "real",
                    "real",
                    "real",
                    "fixed",
                    "real",
                    "real",
                    "text",
                    "text",
                    "object",
                ],
                "columns": [
                    "BLOCK_NUMBER",
                    "BLOCK_TIMESTAMP",
                    "BLOCK_HASH",
                    "TX_HASH",
                    "NONCE",
                    "POSITION",
                    "ORIGIN_FUNCTION_SIGNATURE",
                    "FROM_ADDRESS",
                    "TO_ADDRESS",
                    "ETH_VALUE",
                    "TX_FEE",
                    "GAS_PRICE",
                    "GAS_LIMIT",
                    "GAS_USED",
                    "CUMULATIVE_GAS_USED",
                    "INPUT_DATA",
                    "STATUS",
                    "TX_JSON",
                ],
                "colTypeMap": {
                    "NONCE": "real",
                    "STATUS": "text",
                    "TX_FEE": "real",
                    "TX_HASH": "text",
                    "TX_JSON": "object",
                    "GAS_USED": "real",
                    "POSITION": "fixed",
                    "ETH_VALUE": "real",
                    "GAS_LIMIT": "fixed",
                    "GAS_PRICE": "real",
                    "BLOCK_HASH": "text",
                    "INPUT_DATA": "text",
                    "TO_ADDRESS": "text",
                    "BLOCK_NUMBER": "fixed",
                    "FROM_ADDRESS": "text",
                    "BLOCK_TIMESTAMP": "timestamp_ntz",
                    "CUMULATIVE_GAS_USED": "real",
                    "ORIGIN_FUNCTION_SIGNATURE": "text",
                },
            },
            "userId": "clf8qd1eb0000jv08kbuw0dy4",
            "tags": {
                "sdk_package": "python",
                "sdk_version": "1.0.2",
                "sdk_language": "python",
            },
            "createdAt": "2023-04-05T20:11:29.000Z",
            "updatedAt": "2023-04-05T20:11:29.000Z",
        },
    }

    if error is not None:
        base.update({"error": error.dict()})

    base.update({"result": default_result})
    if result_null:
        base.update({"result": None})

    return base
