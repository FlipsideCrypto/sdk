import { Api } from "./api";
import { QueryIntegration } from "./integrations";
import { QueryResultSet } from "./types";
import { DEFAULTS } from "./defaults";

export class Flipside {
  query: QueryIntegration;

  constructor(apiKey: string, apiBaseUrl: string = DEFAULTS.apiBaseUrl) {
    // Setup API, which will be passed to integrations
    const api = new Api(apiBaseUrl, apiKey);

    // declare integrations on Flipside client
    this.query = new QueryIntegration(api);
  }
}

export * from "./types";
export * from "./errors";

export { QueryResultSet };
