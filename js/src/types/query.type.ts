export type Query = {
  // SQL query to execute
  sql: string;
  // the maximum age of the query results in minutes you will accept, defaults to zero
  maxAgeMinutes?: number;
  // The number of minutes to cache the query results
  ttlMinutes?: number;
  // An override on the cache. A value of true will reexecute the query.
  cached?: boolean;
  // The number of minutes until your query times out
  timeoutMinutes?: number;
  // The number of records to return
  pageSize?: number;
  // The page number to return
  pageNumber?: number;
  // The number of seconds to use between retries
  retryIntervalSeconds?: number | string;
  // The SDK package used for the query
  sdkPackage?: string;
  // The SDK version used for the query
  sdkVersion?: string;
  // The data source to execute the query against
  dataSource?: string;
  // The owner of the data source
  dataProvider?: string;
};
