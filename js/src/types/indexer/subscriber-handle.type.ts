import { TracerHandle } from "./tracer-handle.type";

export interface SubscriberHandle {
  tracer: TracerHandle;
  subscriber: string;
}
