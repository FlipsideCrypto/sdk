export type QueryRun = {
  sql: string;
  ttlMinutes?: number;
  cached?: boolean;
  timeoutMinutes?: number;
};
