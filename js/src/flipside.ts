import { API } from "./api";
import { Query } from "./integrations";

const API_BASE_URL = "https://api.flipsidecrypto.com";

export class Flipside {
  query: Query;

  constructor(apiKey: string, apiBaseUrl: string = API_BASE_URL) {
    // Setup API, which will be passed to integrations
    const api = new API(apiBaseUrl, apiKey);

    // declare integrations on Flipside client
    this.query = new Query(api);
  }
}

export * from "./types";
export * from "./errors";
