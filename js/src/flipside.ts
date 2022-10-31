import { API } from "./api";
import { QueryIntegration } from "./integrations";
import { version } from '../package.json';


const API_BASE_URL = "https://api.flipsidecrypto.com";
const SDK_PACKAGE = "js";
const SDK_VERSION = version;

export class Flipside {
  query: QueryIntegration;

  constructor(apiKey: string, apiBaseUrl: string = API_BASE_URL) {
    // Setup API, which will be passed to integrations
    const api = new API(apiBaseUrl, SDK_PACKAGE, SDK_VERSION, apiKey);

    // declare integrations on Flipside client
    this.query = new QueryIntegration(api);
  }
}

export * from "./types";
export * from "./errors";
import { QueryResultSet } from "./types";
export { QueryResultSet };
