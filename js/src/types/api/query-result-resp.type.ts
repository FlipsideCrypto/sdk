import { QueryStatus } from "../query-status.type";
import { ApiResponse } from "./api-response.type";

export type Row = (string | number | boolean | null)[];
export type QueryResultJson = {
  queryId: string;
  status: QueryStatus;
  results: Row[];
  startedAt: string;
  endedAt: string;
  columnLabels: string[];
  columnTypes: string[];
  message?: string;
  errors?: string | null;
};

export interface QueryResultResp extends ApiResponse {
  data: QueryResultJson | null;
}
