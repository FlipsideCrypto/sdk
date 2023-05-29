export interface SDKError {
  // type?: ValueOf<typeof ERROR_TYPES> | "NETWORK_ERROR";
  name?: string;
  msg: string;
}
