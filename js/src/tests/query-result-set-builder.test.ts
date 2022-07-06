import { assert, describe, it } from "vitest";
import { QueryResultSetBuilder } from "../integrations/query-integration/query-result-set-builder";
import {
  QueryResultSetBuilderInput,
  QueryStatus,
  QueryStatusError,
  QueryStatusFinished,
  QueryStatusPending,
} from "../types";

function getQueryResultSetBuilder(
  status: QueryStatus
): QueryResultSetBuilderInput {
  return {
    queryResultJson: {
      queryId: "test",
      status,
      results: [
        [1, "0x-tx-id-0", "0xfrom-address-0", true, 0.5],
        [2, "0x-tx-id-1", "0xfrom-address-1", false, 0.75],
        [3, "0x-tx-id-2", "0xfrom-address-2", false, 1.75],
        [4, "0x-tx-id-3", "0xfrom-address-3", true, 100.001],
      ],
      startedAt: "2022-05-19T00:00:00Z",
      endedAt: "2022-05-19T00:01:30Z",
      columnLabels: [
        "block_id",
        "tx_id",
        "from_address",
        "succeeded",
        "amount",
      ],
      columnTypes: ["number", "string", "string", "boolean", "number"],
      message: "",
      errors: null,
      pageSize: 100,
      pageNumber: 0,
    },
    error: null,
  };
}

describe("runStats", () => {
  const queryResultSet = new QueryResultSetBuilder(
    getQueryResultSetBuilder(QueryStatusFinished)
  );
  it("runStats startedAt is Date type", async () => {
    assert.typeOf(queryResultSet.runStats?.startedAt, "Date");
  });

  it("runStats endedAt is Date type", async () => {
    assert.typeOf(queryResultSet.runStats?.startedAt, "Date");
  });

  it("runStats recordCount = 4", async () => {
    assert.equal(queryResultSet.runStats?.recordCount, 4);
  });

  it("runStats elpasedSeconds = 90", async () => {
    assert.equal(queryResultSet.runStats?.elapsedSeconds, 90);
  });
});

describe("records", () => {
  const queryResultSet = new QueryResultSetBuilder(
    getQueryResultSetBuilder(QueryStatusFinished)
  );
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
      cells.forEach((cellValue, colIndex) => {
        let columns = queryResultSet?.columns;
        if (!columns) {
          throw new Error(
            "QueryResultSetBuilder columns cannot be null for tests"
          );
        }
        let column = columns[colIndex];
        if (records === null) {
          throw new Error(
            "QueryResultSetBuilder records cannot be null for tests"
          );
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
    const queryResultSet = new QueryResultSetBuilder(
      getQueryResultSetBuilder(QueryStatusFinished)
    );
    assert.equal(queryResultSet?.status, QueryStatusFinished);
  });
  it("isPending", async () => {
    const queryResultSet = new QueryResultSetBuilder(
      getQueryResultSetBuilder(QueryStatusPending)
    );
    assert.equal(queryResultSet?.status, QueryStatusPending);
  });
  it("isError", async () => {
    const queryResultSet = new QueryResultSetBuilder(
      getQueryResultSetBuilder(QueryStatusError)
    );
    assert.equal(queryResultSet?.status, QueryStatusError);
  });
});

describe("queryID", () => {
  it("queryId is set", async () => {
    const queryResultSet = new QueryResultSetBuilder(
      getQueryResultSetBuilder(QueryStatusFinished)
    );
    assert.notEqual(queryResultSet?.queryId, null);
  });
  it("queryId is test", async () => {
    const queryResultSet = new QueryResultSetBuilder(
      getQueryResultSetBuilder(QueryStatusFinished)
    );
    assert.equal(queryResultSet?.queryId, "test");
  });
});
