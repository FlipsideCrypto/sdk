import { Tags } from "./tags";

export interface QueryRun {
  id: string;
  sqlStatementId: string;
  state: string;
  path: string;
  fileCount: number | null;
  lastFileNumber: number | null;
  fileNames: string | null;
  errorName: string | null;
  errorMessage: string | null;
  errorData: any | null;
  dataSourceQueryId: string | null;
  dataSourceSessionId: string | null;
  startedAt: string | null;
  queryRunningEndedAt: string | null;
  queryStreamingEndedAt: string | null;
  endedAt: string | null;
  rowCount: number | null;
  totalSize: number | null;
  tags: Tags;
  dataSourceId: string;
  userId: string;
  createdAt: string;
  updatedAt: string; // Assuming that datetime translates to a string in TypeScript
  archivedAt: string | null; // Assuming that datetime translates to a string in TypeScript
}
