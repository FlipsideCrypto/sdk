import axios, { AxiosError, AxiosResponse } from "axios";
import { ServerError, UnexpectedSDKError, UserError } from "./errors";
import {
  CompassApiClient,
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
import {
  SubscriberHandle,
  TracerHandle,
  TracerEvent,
  TracerDetails,
  TracerConfig,
  SDKResponse,
  EventsParams,
} from "./types/indexer";
import { sleep } from "./utils/sleep";

const PARSE_ERROR_MSG = "the api returned an error and there was a fatal client side error parsing that error msg";

export class Api implements CompassApiClient {
  url: string;
  #baseUrl: string;
  #apiKey: string;
  #headers: Record<string, string>;

  constructor(baseUrl: string, apiKey: string) {
    this.#baseUrl = baseUrl;
    this.url = this.getUrl();
    this.#apiKey = apiKey;
    this.#headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };
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
        throw new UnexpectedSDKError(errData.message);
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
        throw new UnexpectedSDKError(errData.message);
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
        throw new UnexpectedSDKError(errData.message);
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

  /**
   * Makes an authenticated request to the Pine API.
   * @returns The response data.
   * @throws An error if the response status is not 200.
   */
  private async indexerRequest<T>(path: string, options: RequestInit) {
    const res = await fetch(`${this.#baseUrl}/indexer/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.#apiKey,
      },
    });
    const json = (await res.json()) as SDKResponse<T>;
    if (json.status === "error") {
      throw new Error(json.error.msg);
    }
    return json.data;
  }

  /**
   * Identify function that returns a TracerHandle.
   */
  public tracer(handle: TracerHandle) {
    return handle;
  }

  /**
   * Creates a tracer.
   */
  public createTracer(tracer: TracerConfig): Promise<TracerDetails> {
    return this.indexerRequest("/tracers", {
      method: "post",
      body: JSON.stringify(tracer),
    });
  }

  /**
   * Lists all tracers for the current user.
   */
  public listTracers() {
    return this.indexerRequest<TracerDetails[]>("/tracers", { method: "get" });
  }

  public async getTracerDetails(tracer: TracerHandle) {
    return this.indexerRequest<TracerDetails>(`/tracers/${tracer.namespace}/versions/${tracer.version}`, {
      method: "get",
    });
  }

  /**
   * Starts a tracer.
   */
  public startTracer(tracer: TracerHandle) {
    return this.indexerRequest(`/tracers/${tracer.namespace}/versions/${tracer.version}/start`, { method: "post" });
  }

  /**
   * Cancels a tracer.
   */
  public cancelTracer(tracer: TracerHandle) {
    return this.indexerRequest(`/tracers/${tracer.namespace}/versions/${tracer.version}/cancel`, { method: "post" });
  }

  /**
   * Identify function that returns a SubscriberHandle.
   */
  public subscriber(subscriber: string, tracer: TracerHandle): SubscriberHandle {
    return { tracer, subscriber };
  }

  /**
   * Gets the latest events for a subscriber.
   */
  public async getNextEvents(sub: SubscriberHandle, params: EventsParams) {
    const url = `/events/tracers/${sub.tracer.namespace}/versions/${sub.tracer.version}?subscriber=${sub.subscriber}&limit=${params.limit}`;
    const res = await this.indexerRequest<{ events: TracerEvent[] } | null>(url, {
      method: "get",
    });
    return res ?? { events: [] };
  }

  /**
   * Returns a generator that yields new events as they are received.
   * If there are no more events then we poll every 5s until there are more.
   * Will loop indefinitely or until an error occurs.
   *
   * ```ts
   * const subscrber = client.subscriber(tracer, "my-subscriber");
   * for await (const event of client.streamEvents(subscriber, { count: 100 })) {
   *  console.log(event);
   * }
   * ```
   */
  async *streamEvents(subscriber: SubscriberHandle, params: EventsParams) {
    const currentBatch = await this.getNextEvents(subscriber, params);
    let events = currentBatch.events;

    while (true) {
      if (events.length === 0) {
        const newBatch = await this.getNextEvents(subscriber, params);
        events = newBatch.events;
      }

      // if its still empty, wait a bit and try again
      if (events.length === 0) {
        if (params.exitOnCaughtUp) {
          console.log("Indexing caught up. Exiting.");
          // @ts-ignore
          process.exit(0);
        }
        await sleep(5000);
        continue;
      }
      const nextEvent = events.shift()!;
      yield nextEvent;
    }
  }

  /**
   * Saves the current position of the subscriber in the event stream. Usually used within a `streamEvents` loop.
   *
   * @example
   * ```ts
   * const stream = client.streamEvents(subscriber, { count: 10 });
   * for await (const event of events) {
   *  await client.saveCursorAt(event, subscriber);
   * }
   * ```
   */
  public saveCursorAt(event: TracerEvent, sub: SubscriberHandle) {
    const url = `/events/tracers/${sub.tracer.namespace}/versions/${sub.tracer.version}/commit?subscriber=${sub.subscriber}`;
    return this.indexerRequest(url, {
      method: "post",
      body: JSON.stringify({
        blockNumber: event.block.number,
        eventIndex: event.decoded.index,
      }),
    });
  }

  public resetTo({ blockNumber, eventIndex }: { blockNumber: number; eventIndex: number }, sub: SubscriberHandle) {
    const url = `/events/tracers/${sub.tracer.namespace}/versions/${sub.tracer.version}/commit?subscriber=${sub.subscriber}`;
    return this.indexerRequest(url, {
      method: "post",
      body: JSON.stringify({
        blockNumber,
        eventIndex,
      }),
    });
  }

  public reIndex(tracer: TracerHandle) {
    return this.indexerRequest(`/tracers/${tracer.namespace}/versions/${tracer.version}/start?forceBackfill=true`, {
      method: "post",
    });
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
