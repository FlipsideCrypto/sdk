import { QueryRun, CreateQueryResp, QueryResultResp } from "./types";

export class API {
  #apiKey: string;
  #baseUrl: string;
  #headers: Record<string, string>;

  constructor(baseUrl: string, apiKey: string) {
    this.#apiKey = apiKey;
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

  async createQuery(queryRun: QueryRun): Promise<CreateQueryResp> {
    return await fetch(this.getUrl("queries"), {
      method: "POST",
      headers: this.#headers,
      body: JSON.stringify({
        sql: queryRun.sql,
        ttl_minutes: queryRun.ttlMinutes,
        cached: queryRun.cached,
      }),
    });
  }

  async getQueryResult(queryID: string): Promise<QueryResultResp> {
    return await fetch(this.getUrl(`queries/${queryID}`), {
      method: "GET",
      headers: this.#headers,
    });
  }
}
