import { QueryStatus } from "../query-status.type";

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

export interface QueryResultResp extends Response {
  json(): Promise<QueryResultJson>;
}
