export type QueryRunStats = {
  startedAt: Date;
  endedAt: Date;
  elapsedSeconds: number;
  queryExecStartedAt: Date;
  queryExecEndedAt: Date;
  streamingStartedAt: Date;
  streamingEndedAt: Date;
  queuedSeconds: number;
  streamingSeconds: number;
  queryExecSeconds: number;
  bytes: number; // the number of bytes returned by the query
  recordCount: number;
};
