import { Query } from "../query.type";
import { CreateQueryResp } from "./create-query-resp.type";
import { QueryResultResp } from "./query-result-resp.type";

export interface ApiClient {
  getUrl(path: string): string;
  createQuery(query: Query): Promise<CreateQueryResp>;
  getQueryResult(queryID: string, pageNumber: number, pageSize: number): Promise<QueryResultResp>;
}
