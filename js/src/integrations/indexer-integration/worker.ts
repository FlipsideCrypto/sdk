import { TracerConfig, TracerContract, TracerEvent, TracerStateName } from "../../types/indexer";
import type { Abi, ExtractAbiEventNames } from "abitype";
import { Api } from "../../api";
import { sleep } from "../../utils/sleep";

export interface WorkerOpts {
  tracer: Omit<TracerConfig, "contracts">;
  subscriber: string;
  client: Api;
  /** Optional logger to use for logging events and errors. */
  logger?: Pick<typeof console, "info" | "error">;
}

export interface WorkerContract<T extends Abi = Abi> extends TracerContract {
  name: string;
  addresses: string[];
  schema: T;
}

export interface WorkerEventFn {
  (event: TracerEvent): unknown;
}

export function createWorker({ tracer, client, subscriber, logger = console }: WorkerOpts) {
  /** Event handler registry */
  const handlerRegistry = new Map<string, Set<WorkerEventFn>>();

  /** Contract registry. */
  const contractRegistry = new Map<string, WorkerContract>();

  /**
   * Registers a contract for the tracer that can be used to subscribe to events.
   */
  function contract<T extends Abi>(name: string, opts: { schema: T; addresses: string[] }) {
    const newContract = { name, ...opts };
    contractRegistry.set(name, newContract);
    return newContract;
  }

  /**
   * Creates a contract handle that listens to contracts created from a factory contract.
   */
  function contractFromEvent<TAbi extends Abi, TContract extends WorkerContract>(
    name: string,
    opts: {
      contract: TContract;
      event: ExtractAbiEventNames<TContract["schema"]>;
      arg: string;
      schema: TAbi;
    }
  ) {
    const address = `${opts.event}.${opts.arg}@${opts.contract.name}`;
    const newContract = { name, addresses: [address], schema: opts.schema };
    contractRegistry.set(name, newContract);
    return newContract;
  }

  /**
   * Registers an event handler for a contract event
   *
   * @example
   * ```ts
   * onEvent(LaborMarket, "LaborMarketConfigured", ({ contract, event }) => {
   *  console.log(contract, event);
   * });
   */
  function onEvent<TContract extends WorkerContract, TEventName extends ExtractAbiEventNames<TContract["schema"]>>(
    contract: TContract,
    event: TEventName,
    fn: WorkerEventFn
  ) {
    const key = `${contract.name}.${event}`;
    const handlers = handlerRegistry.get(key) || new Set();
    handlers.add(async (event) => {
      return fn(event);
    });
    handlerRegistry.set(key, handlers);
  }

  /**
   * Starts the worker. This will block until the process is terminated.
   */
  async function run(exitOnCaughtUp = false) {
    const tracerHandle = { namespace: tracer.namespace, version: tracer.version };

    // Find or create the tracer.
    let tracerDetails;
    try {
      tracerDetails = await client.getTracerDetails(tracerHandle);
    } catch {
      logger.info(`tracer not found, creating...`, tracerHandle);
      tracerDetails = await client.createTracer({
        contracts: Array.from(contractRegistry.values()),
        ...tracer,
      });
      await client.startTracer(tracerHandle);
    }

    const subHandle = client.subscriber(subscriber, tracerHandle);

    // Loop through events and process them with the registered handlers, if any.
    logger.info(`subscribing to events...`, subHandle);
    if (tracerDetails) {
      let currentState = tracerDetails.currentState.state;
      // Wait for the tracer to finish backfilling
      if (currentState === TracerStateName.TRACER_STATE_BACKFILL) {
        const startTime = new Date().getTime();
        console.log(`Tracer '${tracer.namespace}' at version '${tracer.version}' is now backfilling events.`);
        while (currentState === TracerStateName.TRACER_STATE_BACKFILL) {
          // Get the latest tracer state
          const tracerDetails = await client.getTracerDetails({
            namespace: tracer.namespace,
            version: tracer.version,
          });

          // update the current state to the server-side tracer state
          currentState = tracerDetails.currentState.state;

          // sleep 5 seconds between iterations
          await sleep(5000);
          console.log("your tracer is still backfilling...");
        }
        console.log(`Tracer backfill complete in ${(new Date().getTime() - startTime) / 1000} seconds.`);
      }
    }

    //@ts-ignore
    for await (const event of client.streamEvents(subHandle, {
      limit: 1000,
      exitOnCaughtUp,
    })) {
      const key = `${event.contract.name}.${event.decoded.name}`;
      const handlers = handlerRegistry.get(key);
      if (!handlers) {
        // logger.info(`no handlers for event ${key}`, event);
      } else {
        for (const handler of handlers) {
          logger.info(`processing event ${key}`, event);
          await handler(event);
        }
      }
      await client.saveCursorAt(event, subHandle);
    }
  }

  return { contract, contractFromEvent, onEvent, run };
}
