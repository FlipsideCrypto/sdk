import axios, { AxiosError, AxiosResponse } from "axios";
import { ServerError, UnexpectedSDKError, UserError } from "./errors";
import {
  CreateQueryRunRpcParams,
  CreateQueryRunRpcRequestImplementation,
  CreateQueryRunRpcResponse,
  CreateQueryRunRpcResponseImplementation,
  CancelQueryRunRpcRequestParams,
  CancelQueryRunRpcResponse,
  GetQueryRunResultsRpcParams,
  GetQueryRunResultsRpcResponse,
  GetQueryRunRpcRequestParams,
  GetQueryRunRpcResponse,
  GetSqlStatementParams,
  GetSqlStatementResponse,
  GetQueryRunRpcRequestImplementation,
  GetQueryRunRpcResponseImplementation,
  GetQueryRunResultsRpcRequestImplementation,
  GetQueryRunResultsRpcResponseImplementation,
  GetSqlStatementRequestImplementation,
  GetSqlStatementResponseImplementation,
  CancelQueryRunRpcRequestImplementation,
  CancelQueryRunRpcResponseImplementation,
} from "./types";

const PARSE_ERROR_MSG = "the api returned an error and there was a fatal client side error parsing that error msg";

class Api {
  url: string;
  #baseUrl: string;
  #headers: Record<string, string>;
  #sdkVersion: string;
  #sdkPackage: string;
  #apiKey: string;
  #MAX_RETRIES: number;
  #BACKOFF_FACTOR: number;
  #STATUS_FORCE_LIST: number[];
  #METHOD_ALLOWLIST: string[];

  constructor(
    baseUrl: string,
    sdkPackage: string,
    sdkVersion: string,
    apiKey: string,
    max_retries: number = 10,
    backoff_factor: number = 1,
    status_forcelist: number[] = [429, 500, 502, 503, 504],
    method_allowlist: string[] = ["HEAD", "GET", "PUT", "POST", "DELETE", "OPTIONS", "TRACE"]
  ) {
    this.#baseUrl = baseUrl;
    this.url = this.getUrl();
    this.#apiKey = apiKey;
    this.#sdkPackage = sdkPackage;
    this.#sdkVersion = sdkVersion;
    this.#headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };
    // Session Settings
    this.#MAX_RETRIES = max_retries;
    this.#BACKOFF_FACTOR = backoff_factor;
    this.#STATUS_FORCE_LIST = status_forcelist;
    this.#METHOD_ALLOWLIST = method_allowlist;
  }

  getUrl(): string {
    return `${this.#baseUrl}/json-rpc`;
  }

  async createQuery(params: CreateQueryRunRpcParams): Promise<CreateQueryRunRpcResponse> {
    let result;
    const request = new CreateQueryRunRpcRequestImplementation([params]);

    try {
      result = await axios.post(this.url, request, { headers: this.#headers });
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    const data = this.#handleResponse(result, "createQueryRun");
    return new CreateQueryRunRpcResponseImplementation(data.id, data.result, data.error);
  }

  async getQueryRun(params: GetQueryRunRpcRequestParams): Promise<GetQueryRunRpcResponse> {
    let result;
    const request = new GetQueryRunRpcRequestImplementation([params]);

    try {
      result = await axios.post(this.url, request, { headers: this.#headers });
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    const data = this.#handleResponse(result, "getQueryRun");
    return new GetQueryRunRpcResponseImplementation(data.id, data.result, data.error);
  }

  async getQueryResult(params: GetQueryRunResultsRpcParams): Promise<GetQueryRunResultsRpcResponse> {
    let result;
    const request = new GetQueryRunResultsRpcRequestImplementation([params]);

    try {
      result = await axios.post(this.url, request, { headers: this.#headers });
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    const data = this.#handleResponse(result, "getQueryRunResults");
    return new GetQueryRunResultsRpcResponseImplementation(data.id, data.result, data.error);
  }

  async getSqlStatement(params: GetSqlStatementParams): Promise<GetSqlStatementResponse> {
    let result;
    const request = new GetSqlStatementRequestImplementation([params]);

    try {
      result = await axios.post(this.url, request, { headers: this.#headers });
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    const data = this.#handleResponse(result, "getSqlStatement");
    return new GetSqlStatementResponseImplementation(data.id, data.result, data.error);
  }

  async cancelQueryRun(params: CancelQueryRunRpcRequestParams): Promise<CancelQueryRunRpcResponse> {
    let result;
    const request = new CancelQueryRunRpcRequestImplementation([params]);

    try {
      result = await axios.post(this.url, request, { headers: this.#headers });
    } catch (err) {
      let errData = err as AxiosError;
      result = errData.response;
      if (!result) {
        throw new UnexpectedSDKError(PARSE_ERROR_MSG);
      }
    }

    const data = this.#handleResponse(result, "cancelQueryRun");
    return new CancelQueryRunRpcResponseImplementation(data.id, data.result, data.error);
  }

  #handleResponse(result: AxiosResponse, method: string): Record<string, any> {
    if (result.status === undefined) {
      throw new ServerError(0, `Unable to connect to server when calling '${method}'. Please try again later.`);
    }

    if (result.status >= 500) {
      throw new ServerError(
        result.status,
        `Unknown server error when calling '${method}': ${result.status} - ${result.statusText}. Please try again later.`
      );
    }

    if (result.status === 401 || result.status === 403) {
      throw new UserError(result.status, "Unauthorized: Invalid API Key.");
    }

    try {
      const data = result.data;
      return data;
    } catch (error) {
      throw new ServerError(
        result.status,
        `Unable to parse response for RPC response from '${method}': ${result.status} - ${result.statusText}. Please try again later.`
      );
    }
  }
}
