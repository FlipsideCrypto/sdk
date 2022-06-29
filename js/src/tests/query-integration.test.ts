import { assert, describe, it } from "vitest";
import { ERROR_TYPES } from "..";
import { QueryIntegration } from "../integrations/query-integration";
import {
  QueryStatus,
  QueryStatusError,
  QueryStatusFinished,
  QueryStatusPending,
} from "../types";
import { Query } from "../types/query.type";
import { getMockApiClient } from "./mocks/api-mocks";

let createQueryData = {
  token: "flipside test token",
  errors: null,
};

let defaultQueryData: Query = {
  sql: "select 1",
  ttlMinutes: 1,
};

let createQueries = {
  userError: {
    data: createQueryData,
    statusCode: 400,
    statusMsg: null,
    errorMsg: null,
  },
  serverError: {
    data: createQueryData,
    statusCode: 500,
    statusMsg: null,
    errorMsg: null,
  },
  rateLimitError: {
    data: createQueryData,
    statusCode: 429,
    statusMsg: null,
    errorMsg: null,
  },
  noError: {
    data: createQueryData,
    statusCode: 200,
    statusMsg: null,
    errorMsg: null,
  },
};

function generateQueryResultData(status: QueryStatus) {
  return {
    queryId: "test",
    status,
    results: [],
    startedAt: "2022-05-19T00:00:00Z",
    endedAt: "2022-05-19T00:00:00Z",
    columnLabels: ["block_id", "tx_id"],
    columnTypes: ["string", "string"],
    message: "",
    errors: "invalid sql",
    pageNumber: 1,
    pageSize: 100,
  };
}

let getQueryResult = {
  userError: {
    data: generateQueryResultData(QueryStatusError),
    statusCode: 400,
    statusMsg: null,
    errorMsg: null,
  },
  serverError: {
    data: generateQueryResultData(QueryStatusPending),
    statusCode: 500,
    statusMsg: null,
    errorMsg: null,
  },
  noErrorPending: {
    data: generateQueryResultData(QueryStatusPending),
    statusCode: 200,
    statusMsg: null,
    errorMsg: null,
  },
  noErrorFinished: {
    data: generateQueryResultData(QueryStatusFinished),
    statusCode: 200,
    statusMsg: null,
    errorMsg: null,
  },
  sqlExecError: {
    data: generateQueryResultData(QueryStatusError),
    statusCode: 200,
    statusMsg: null,
    errorMsg: null,
  },
};

describe("run: server_error", () => {
  it("#createQuery server error", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.serverError,
      getQueryResultResp: getQueryResult.noErrorPending,
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.error?.errorType, ERROR_TYPES.server_error);
    assert.notEqual(result.error?.message, null);
  });

  it("#getQueryResult server error", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.noError,
      getQueryResultResp: getQueryResult.serverError,
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.error?.errorType, ERROR_TYPES.server_error);
    assert.notEqual(result.error?.message, null);
  });
});

describe("run: user_error", () => {
  it("#createQuery user error", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.userError,
      getQueryResultResp: getQueryResult.noErrorPending,
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.error?.errorType, ERROR_TYPES.user_error);
    assert.notEqual(result.error?.message, null);
  });

  it("#getQueryResult user error", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.noError,
      getQueryResultResp: getQueryResult.userError,
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.error?.errorType, ERROR_TYPES.user_error);
    assert.notEqual(result.error?.message, null);
  });

  it("#getQueryResult sql exec error", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.noError,
      getQueryResultResp: getQueryResult.sqlExecError,
    });

    const queryIntegration = new QueryIntegration(api);
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(
      result.error?.errorType,
      ERROR_TYPES.query_run_execution_error
    );
    assert.notEqual(result.error?.message, null);
  });
});

describe("run: timeout_error", () => {
  it("query is pending", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.noError,
      getQueryResultResp: getQueryResult.noErrorPending,
    });

    const queryIntegration = new QueryIntegration(api, {
      ttlMinutes: 1,
      cached: false,
      timeoutMinutes: 0.01,
      retryIntervalSeconds: 0.001,
      pageNumber: 1,
      pageSize: 100,
    });
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(result.error?.errorType, ERROR_TYPES.query_run_timeout_error);
    assert.notEqual(result.error?.message, null);
  });

  it("query is rate limited", async () => {
    const api = getMockApiClient({
      createQueryResp: createQueries.rateLimitError,
      getQueryResultResp: getQueryResult.noErrorPending,
    });

    const queryIntegration = new QueryIntegration(api, {
      ttlMinutes: 1,
      cached: false,
      timeoutMinutes: 0.01,
      retryIntervalSeconds: 0.001,
      pageNumber: 1,
      pageSize: 100,
    });
    const result = await queryIntegration.run(defaultQueryData);
    assert.equal(
      result.error?.errorType,
      ERROR_TYPES.query_run_rate_limit_error
    );
    assert.notEqual(result.error?.message, null);
  });
});
