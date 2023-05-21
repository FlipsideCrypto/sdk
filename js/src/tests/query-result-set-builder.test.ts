import { assert, describe, it } from "vitest";

import { QueryResultSetBuilder } from "../integrations/query-integration/query-result-set-builder";
import { QueryStatus, QueryStatusError, QueryStatusFinished, QueryStatusPending } from "../types";
import { getQueryResultsResponse, getQueryRunResponse } from "./mock-data";

describe("runStats", () => {
  const queryResultSet = new QueryResultSetBuilder({
    getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_SUCCESS").result,
    getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_SUCCESS").result,
    error: null,
  });
  it("runStats startedAt is Date type", async () => {
    assert.typeOf(queryResultSet.runStats?.startedAt, "Date");
  });

  it("runStats endedAt is Date type", async () => {
    assert.typeOf(queryResultSet.runStats?.startedAt, "Date");
  });

  it("runStats recordCount = 1", async () => {
    assert.equal(queryResultSet.runStats?.recordCount, 10000);
  });

  it("runStats elpasedSeconds = 51", async () => {
    assert.equal(queryResultSet.runStats?.elapsedSeconds, 51);
  });

  it("runStats queuedSeconds = 0", async () => {
    assert.equal(queryResultSet.runStats?.queuedSeconds, 0);
  });

  it("runStats streamingSeconds = 45", async () => {
    assert.equal(queryResultSet.runStats?.streamingSeconds, 45);
  });

  it("runStats queryExecSeconds = 5", async () => {
    assert.equal(queryResultSet.runStats?.queryExecSeconds, 5);
  });
});

describe("records", () => {
  const queryResultSet = new QueryResultSetBuilder({
    getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_SUCCESS").result,
    getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_SUCCESS").result,
    error: null,
  });

  it("records length = rows length", async () => {
    assert.equal(queryResultSet.records?.length, queryResultSet.rows?.length);
  });

  it("columns length = records keys length", () => {
    queryResultSet.records?.map((record) => {
      let recordKeys = Object.keys(record);
      assert.equal(recordKeys.length, queryResultSet.columns?.length);
    });
  });

  it("columns = record keys", () => {
    let globalRecordKeysSet = new Set();
    queryResultSet.records?.map((record) => {
      let recordKeys = Object.keys(record);
      Object.keys(record).forEach((k) => globalRecordKeysSet.add(k));
    });
    let globalRecordKeys = [...globalRecordKeysSet];

    queryResultSet.columns?.forEach((c) => {
      assert.notEqual(globalRecordKeys.indexOf(c), -1);
    });
  });

  it("record values match row values", () => {
    let records = queryResultSet?.records;
    queryResultSet?.rows?.forEach((cells, rowIndex) => {
      cells.forEach((cellValue: any, colIndex: number) => {
        let columns = queryResultSet?.columns;
        if (!columns) {
          throw new Error("QueryResultSetBuilder columns cannot be null for tests");
        }
        let column = columns[colIndex];
        if (records === null) {
          throw new Error("QueryResultSetBuilder records cannot be null for tests");
        }
        let record = records[rowIndex];
        let recordValue = record[column];

        assert.equal(cellValue, recordValue);
      });
    });
  });
});

describe("status", () => {
  it("isFinished", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_SUCCESS").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_SUCCESS").result,
      error: null,
    });

    assert.equal(queryResultSet?.status, QueryStatusFinished);
  });
  it("isPending: QUERY_STATE_READY", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_READY").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_READY").result,
      error: null,
    });
    assert.equal(queryResultSet?.status, QueryStatusPending);
  });
  it("isPending: QUERY_STATE_RUNNING", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_RUNNING").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_RUNNING").result,
      error: null,
    });
    assert.equal(queryResultSet?.status, QueryStatusPending);
  });
  it("isPending: QUERY_STATE_STREAMING_RESULTS", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_STREAMING_RESULTS").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_STREAMING_RESULTS").result,
      error: null,
    });
    assert.equal(queryResultSet?.status, QueryStatusPending);
  });

  it("isError: QUERY_STATE_FAILED", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_FAILED").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_FAILED").result,
      error: null,
    });
    assert.equal(queryResultSet?.status, QueryStatusError);
  });
  it("isError: QUERY_STATE_CANCELLED", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_CANCELED").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_CANCELED").result,
      error: null,
    });
    assert.equal(queryResultSet?.status, QueryStatusError);
  });
});

describe("queryID", () => {
  it("queryId is set", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_SUCCESS").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_SUCCESS").result,
      error: null,
    });
    assert.notEqual(queryResultSet?.queryId, null);
  });
  it("queryId is test", async () => {
    const queryResultSet = new QueryResultSetBuilder({
      getQueryRunResultsRpcResult: getQueryResultsResponse("QUERY_STATE_SUCCESS").result,
      getQueryRunRpcResult: getQueryRunResponse("QUERY_STATE_SUCCESS").result,
      error: null,
    });
    assert.equal(queryResultSet?.queryId, "clg44olzq00cbn60tasvob5l2");
  });
});
