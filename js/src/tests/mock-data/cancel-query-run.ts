import { QueryStatus, RpcError, CancelQueryRunRpcResponse, mapApiQueryStateToStatus } from "../../../src/types";

export function cancelQueryRunResponse(
  status: string = "QUERY_STATE_SUCCESS",
  error: RpcError | null = null
): CancelQueryRunRpcResponse {
  let base: CancelQueryRunRpcResponse = {
    jsonrpc: "2.0",
    id: 1,
    error: null,
    result: null,
  };

  const defaultResult = {
    canceledQueryRun: {
      id: "clg44olzq00cbn60tasvob5l2",
      sqlStatementId: "clg44oly200c9n60tviq17sng",
      state: status,
      path: "2023/04/05/20/clg44olzq00cbn60tasvob5l2",
      fileCount: 1,
      lastFileNumber: 1,
      fileNames: "clg44olzq00cbn60tasvob5l2-consolidated-results.parquet",
      errorName: null,
      errorMessage: null,
      errorData: null,
      dataSourceQueryId: null,
      dataSourceSessionId: "17257398387030526",
      startedAt: "2023-04-05T20:14:55.000Z",
      queryRunningEndedAt: "2023-04-05T20:15:00.000Z",
      queryStreamingEndedAt: "2023-04-05T20:15:45.000Z",
      endedAt: "2023-04-05T20:15:46.000Z",
      rowCount: 10000,
      totalSize: 24904891,
      tags: {
        sdk_package: "js",
        sdk_version: "1.0.0",
        sdk_language: "javascript",
      },
      dataSourceId: "clf90gwee0002jvbu63diaa8u",
      userId: "clf8qd1eb0000jv08kbuw0dy4",
      createdAt: "2023-04-05T20:14:55.000Z",
      updatedAt: "2023-04-05T20:14:55.000Z",
      archivedAt: "2023-04-05T20:14:55.000Z",
    },
    redirectedToQueryRun: null,
  };

  if (error !== null) {
    base = {
      ...base,
      error: error,
    };
  }

  base = {
    ...base,
    result: defaultResult,
  };

  return base;
}
