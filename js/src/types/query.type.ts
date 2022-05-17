export type Query = {
  sql: string;
  ttlMinutes?: number;
  cached?: boolean;
  timeoutMinutes?: number;
};
