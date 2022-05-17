import { QueryStatus } from "../query-status.type";

export type QueryResultJson = {
  status: QueryStatus;
  results: (string | number | boolean)[];
  startedAt: string;
  columnLabels: string[];
  columnTypes: string[];
  message?: string;
  errors?: Record<string, string>;
};

export interface QueryResultResp extends Response {
  json(): Promise<QueryResultJson>;
}
