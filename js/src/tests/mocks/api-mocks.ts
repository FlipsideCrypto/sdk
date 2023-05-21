import {
  Query,
  CompassApiClient,
  CreateQueryRunRpcResponse,
  CreateQueryRunRpcParams,
  GetQueryRunRpcRequestParams,
  GetQueryRunRpcResponse,
  GetQueryRunResultsRpcResponse,
  GetQueryRunResultsRpcParams,
  GetSqlStatementResponse,
  GetSqlStatementParams,
  CancelQueryRunRpcRequestParams,
  CancelQueryRunRpcResponse,
} from "../../types";

export type MockApiClientInput = {
  createQueryResp: CreateQueryRunRpcResponse;
  getQueryRunResp: GetQueryRunRpcResponse;
  getQueryRunResultsResp: GetQueryRunResultsRpcResponse;
  getSqlStatementResp: GetSqlStatementResponse;
  cancelQueryRunResp: CancelQueryRunRpcResponse;
};

export function getMockApiClient(input: MockApiClientInput): CompassApiClient {
  class MockApiClient implements CompassApiClient {
    url: string;
    #baseUrl: string;
    #headers: Record<string, string>;

    constructor(baseUrl: string, apiKey: string) {
      this.#baseUrl = baseUrl;
      this.url = this.getUrl();
      this.#headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      };
    }

    getUrl(): string {
      return `${this.#baseUrl}/json-rpc`;
    }

    async createQuery(params: CreateQueryRunRpcParams): Promise<CreateQueryRunRpcResponse> {
      return new Promise<CreateQueryRunRpcResponse>((resolve, reject) => {
        resolve(input.createQueryResp);
      });
    }
    async getQueryRun(params: GetQueryRunRpcRequestParams): Promise<GetQueryRunRpcResponse> {
      return await new Promise<GetQueryRunRpcResponse>((resolve, reject) => {
        resolve(input.getQueryRunResp);
      });
    }
    async getQueryResult(params: GetQueryRunResultsRpcParams): Promise<GetQueryRunResultsRpcResponse> {
      return await new Promise<GetQueryRunResultsRpcResponse>((resolve, reject) => {
        resolve(input.getQueryRunResultsResp);
      });
    }
    async getSqlStatement(params: GetSqlStatementParams): Promise<GetSqlStatementResponse> {
      return await new Promise<GetSqlStatementResponse>((resolve, reject) => {
        resolve(input.getSqlStatementResp);
      });
    }
    async cancelQueryRun(params: CancelQueryRunRpcRequestParams): Promise<CancelQueryRunRpcResponse> {
      return await new Promise<CancelQueryRunRpcResponse>((resolve, reject) => {
        resolve(input.cancelQueryRunResp);
      });
    }
  }
  return new MockApiClient("https://test.com", "api key");
}
