export type Query = {
  // SQL query to execute
  sql: string;
  // The number of minutes to cache the query results
  ttlMinutes?: number;
  // An override on the cahce. A value of true will reexecute the query.
  cached?: boolean;
  // The number of minutes until your query time out
  timeoutMinutes?: number;
};
