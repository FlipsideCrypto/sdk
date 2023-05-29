import { Api } from "../../api";
import { TracerHandle, TracerEvent, SubscriberHandle, EventsParams } from "../../types/indexer";
import { WorkerOpts, createWorker } from "./worker";

export class IndexerIntegration {
  #api: Api;

  constructor(api: Api) {
    this.#api = api;
  }

  createWorker({ tracer, subscriber, logger = console }: Omit<WorkerOpts, "client">) {
    return createWorker({ tracer, client: this.#api, subscriber, logger });
  }

  async listTracer() {
    return await this.#api.listTracers();
  }

  async getTracerDetails(tracer: TracerHandle) {
    return await this.#api.getTracerDetails(tracer);
  }

  async startTracer(tracer: TracerHandle) {
    return await this.#api.startTracer(tracer);
  }

  async cancelTracer(tracer: TracerHandle) {
    return await this.#api.cancelTracer(tracer);
  }

  subscriber(subscriber: string, tracer: TracerHandle): SubscriberHandle {
    return this.#api.subscriber(subscriber, tracer);
  }

  async getNextEvents(sub: SubscriberHandle, params: EventsParams) {
    return await this.#api.getNextEvents(sub, params);
  }

  async *streamEvents(subscriber: SubscriberHandle, params: EventsParams) {
    return this.#api.streamEvents(subscriber, params);
  }

  async saveCursorAt(event: TracerEvent, sub: SubscriberHandle) {
    return this.#api.saveCursorAt(event, sub);
  }

  async resetTo({ blockNumber, eventIndex }: { blockNumber: number; eventIndex: number }, sub: SubscriberHandle) {
    return this.#api.resetTo({ blockNumber, eventIndex }, sub);
  }

  async reIndex(tracer: TracerHandle) {
    return this.#api.reIndex(tracer);
  }
}
