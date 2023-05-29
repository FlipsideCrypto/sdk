import { TracerStateName } from "./tracer-state-name.type";

export interface TracerState {
  id: string;
  state: TracerStateName;
  details: string | null;
  createdAt: string;
  updatedAt: string;
  tracerId: string;
}
