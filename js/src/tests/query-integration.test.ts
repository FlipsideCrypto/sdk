import { assert, describe, it } from "vitest";
import { ApiError, ERROR_TYPES } from "..";
import { QueryIntegration } from "../integrations/query-integration";
import { QueryStatus, QueryStatusError, QueryStatusFinished, QueryStatusPending, SqlStatement } from "../types";
import { Query } from "../types/query.type";
import { getMockApiClient } from "./mocks/api-mocks";
import { createQueryRunResponse } from "./mock-data/create-query-run";
import {
  cancelQueryRunResponse,
  getQueryResultsResponse,
  getQueryRunResponse,
  getSqlStatementResponse,
} from "./mock-data";

let defaultQueryData: Query = {
  sql: "select 1",
  ttlMinutes: 1,
};

describe("getQueryResults", () => {
  it("with page data", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_SUCCESS"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getQueryResults({
      queryRunId: "123",
      pageNumber: 1,
      pageSize: 1,
    });
    assert.equal(result.status, QueryStatusFinished);
  });

  it("without page data", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_SUCCESS"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getQueryResults({
      queryRunId: "123",
    });
    assert.equal(result.status, QueryStatusFinished);
  });

  it("with filters & sortby", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_SUCCESS"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getQueryResults({
      queryRunId: "123",
      filters: [
        {
          column: "test",
          eq: "test",
        },
        {
          column: "test",
          neq: "test",
        },
        {
          column: "test",
          gt: 5,
        },
        {
          column: "test",
          gte: 5,
        },
        {
          column: "test",
          lt: 5,
        },
        {
          column: "test",
          lte: 5,
        },
        {
          column: "test",
          like: "some value",
        },
        {
          column: "test",
          in: ["some value"],
        },
        {
          column: "test",
          in: [5],
        },
        {
          column: "test",
          notIn: ["some value"],
        },
        {
          column: "test",
          notIn: [5],
        },
      ],
      sortBy: [
        {
          column: "test",
          direction: "asc",
        },
        {
          column: "test2",
          direction: "desc",
        },
      ],
    });
    assert.equal(result.status, QueryStatusFinished);
  });
});

describe("getQueryRun", () => {
  it("success", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_SUCCESS"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getQueryRun({ queryRunId: "123" });
    assert.equal(result.state, "QUERY_STATE_SUCCESS");
  });
  it("streaming", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_STREAMING"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_STREAMING"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_STREAMING"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getQueryRun({ queryRunId: "123" });
    assert.equal(result.state, "QUERY_STATE_STREAMING");
  });
  it("failed", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_FAILED"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_FAILED"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_FAILED"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getQueryRun({ queryRunId: "123" });
    assert.equal(result.state, "QUERY_STATE_FAILED");
  });
});

describe("getSqlStatement", () => {
  it("success", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_SUCCESS"),
      getSqlStatementResp: getSqlStatementResponse("123"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.getSqlStatement({ sqlStatementId: "123" });
    assert.equal(result.id, "123");
  });
});

describe("cancelQueryRun", () => {
  it("success", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_CANCELLED"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_CANCELLED"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_CANCELLED"),
      getSqlStatementResp: getSqlStatementResponse("123"),
      cancelQueryRunResp: cancelQueryRunResponse("QUERY_STATE_CANCELLED"),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.cancelQueryRun({ queryRunId: "123" });
    assert.equal(result.state, "QUERY_STATE_CANCELLED");
  });
});

describe("run", () => {
  it("run success", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResp: getQueryRunResponse("QUERY_STATE_SUCCESS"),
      getQueryRunResultsResp: getQueryResultsResponse("QUERY_STATE_SUCCESS"),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.status, QueryStatusFinished);
  });
});

describe("run: api_error", () => {
  it("#createQuery ApiError", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueryRunResponse("QUERY_STATE_READY", {
        code: -32164,
        message: "DataSourceNotFound",
        data: {},
      }),
      getQueryRunResp: getQueryRunResponse(),
      getQueryRunResultsResp: getQueryResultsResponse(),
      getSqlStatementResp: getSqlStatementResponse("t"),
      cancelQueryRunResp: cancelQueryRunResponse(),
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.error instanceof ApiError, true);
    assert.notEqual(result.error?.message, null);
  });

  // it("#getQueryResult user error", async () => {
  //   const api = getMockApiClient({
  //     createQueryResp: createQueries.noError,
  //     getQueryResultResp: getQueryResult.userError,
  //   });

  //   const queryIntegration = new QueryIntegration(api);
  //   const result = await queryIntegration.run(defaultQueryData);
  //   assert.equal(result.error?.errorType, ERROR_TYPES.user_error);
  //   assert.notEqual(result.error?.message, null);
  // });

  // it("#getQueryResult sql exec error", async () => {
  //   const api = getMockApiClient({
  //     createQueryResp: createQueries.noError,
  //     getQueryResultResp: getQueryResult.sqlExecError,
  //   });

  //   const queryIntegration = new QueryIntegration(api);
  //   const result = await queryIntegration.run(defaultQueryData);
  //   assert.equal(result.error?.errorType, ERROR_TYPES.query_run_execution_error);
  //   assert.notEqual(result.error?.message, null);
  // });
});

// describe("run: timeout_error", () => {
//   it("query is pending", async () => {
//     const api = getMockApiClient({
//       createQueryResp: createQueries.noError,
//       getQueryResultResp: getQueryResult.noErrorPending,
//     });

//     const queryIntegration = new QueryIntegration(api, {
//       ttlMinutes: 1,
//       cached: false,
//       timeoutMinutes: 0.01,
//       retryIntervalSeconds: 0.001,
//       pageNumber: 1,
//       pageSize: 100,
//     });
//     const result = await queryIntegration.run(defaultQueryData);
//     assert.equal(result.error?.errorType, ERROR_TYPES.query_run_timeout_error);
//     assert.notEqual(result.error?.message, null);
//   });

//   it("query is rate limited", async () => {
//     const api = getMockApiClient({
//       createQueryResp: createQueries.rateLimitError,
//       getQueryResultResp: getQueryResult.noErrorPending,
//     });

//     const queryIntegration = new QueryIntegration(api, {
//       ttlMinutes: 1,
//       cached: false,
//       timeoutMinutes: 0.01,
//       retryIntervalSeconds: 0.001,
//       pageNumber: 1,
//       pageSize: 100,
//     });
//     const result = await queryIntegration.run(defaultQueryData);
//     assert.equal(result.error?.errorType, ERROR_TYPES.query_run_rate_limit_error);
//     assert.notEqual(result.error?.message, null);
//   });
// });
