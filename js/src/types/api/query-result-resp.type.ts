import { QueryStatus } from "../query-status.type";

export type Row = (string | number | boolean | null)[];
export type QueryResultJson = {
  status: QueryStatus;
  results: Row[];
  startedAt: string;
  columnLabels: string[];
  columnTypes: string[];
  message?: string;
  errors?: Record<string, string>;
};

export interface QueryResultResp extends Response {
  json(): Promise<QueryResultJson>;
}
