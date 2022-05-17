import { QueryRun, CreateQueryResp, QueryResultResp } from "./types";

export class API {
  private declare _apiKey: string;
  private declare _baseUrl: string;
  private declare _headers: Record<string, string>;

  constructor(baseUrl: string, apiKey: string) {
    this._apiKey = apiKey;
    this._baseUrl = baseUrl;
    this._headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };
  }

  getUrl(path: string): string {
    return `${this._baseUrl}/${path}`;
  }

  async createQuery(queryRun: QueryRun): Promise<CreateQueryResp> {
    return await fetch(this.getUrl("queries"), {
      method: "POST",
      headers: this._headers,
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
      headers: this._headers,
    });
  }
}
