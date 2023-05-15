import { Tags } from "./tags.type";

export interface QueryRequest {
  id: string;
  sqlStatementId: string;
  userId: string;
  tags: Tags;
  maxAgeMinutes: number;
  resultTTLHours: number;
  userSkipCache: boolean;
  triggeredQueryRun: boolean;
  queryRunId: string;
  createdAt: string;
  updatedAt: string;
}
