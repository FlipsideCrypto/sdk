import {
  ApiClient,
  CreateQueryResp,
  Query,
  QueryResultResp,
} from "../../types";

export type MockApiClientInput = {
  createQueryResp: CreateQueryResp;
  getQueryResultResp: QueryResultResp;
};

export function getMockApiClient(input: MockApiClientInput): ApiClient {
  class MockApiClient implements ApiClient {
    #baseUrl: string;
    #headers: Record<string, string>;

    constructor(baseUrl: string, apiKey: string) {
      this.#baseUrl = baseUrl;
      this.#headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      };
    }

    getUrl(path: string): string {
      return `${this.#baseUrl}/${path}`;
    }
    async createQuery(query: Query): Promise<CreateQueryResp> {
      return new Promise<CreateQueryResp>((resolve, reject) => {
        resolve(input.createQueryResp);
      });
    }
    async getQueryResult(queryID: string): Promise<QueryResultResp> {
      return await new Promise<QueryResultResp>((resolve, reject) => {
        resolve(input.getQueryResultResp);
      });
    }
  }
  return new MockApiClient("https://test.com", "api key");
}
