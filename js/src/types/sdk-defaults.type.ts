export type SdkDefaults = {
  apiBaseUrl: string;
  ttlMinutes: number;
  maxAgeMinutes: number;
  dataSource: string;
  dataProvider: string;
  cached: boolean;
  timeoutMinutes: number;
  retryIntervalSeconds: number;
  pageSize: number;
  pageNumber: number;
  sdkPackage: string;
  sdkVersion: string;
};
