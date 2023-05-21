import { version } from "../package.json";
import { SdkDefaults } from "./types";

export const DEFAULTS: SdkDefaults = {
  apiBaseUrl: "https://api-v2.flipsidecrypto.xyz",
  ttlMinutes: 60,
  maxAgeMinutes: 0,
  cached: true,
  dataProvider: "flipside",
  dataSource: "snowflake-default",
  timeoutMinutes: 20,
  retryIntervalSeconds: 0.5,
  pageSize: 100000,
  pageNumber: 1,
  sdkPackage: "js",
  sdkVersion: version,
};
