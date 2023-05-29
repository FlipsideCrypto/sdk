import { TracerConfig } from "./tracer-config.type";
import { TracerState } from "./tracer-state.type";

export interface TracerDetails {
  id: string;
  namespace: string;
  version: string;
  config: TracerConfig;
  temporalWfId: string;
  blockchainId: string;
  userId: string;
  checkpointBlockNumber: number;
  createdAt: string;
  updatedAt: string;
  currentStateId: string;
  parentTracerId: string;
  currentState: TracerState;
  historicalState: TracerState[];
}
