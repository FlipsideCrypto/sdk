import { TracerContract } from "./tracer-contract.type";

export interface TracerConfig {
  namespace: string;
  version: string;
  blockchain: {
    name: string;
    network: string;
  };
  contracts: TracerContract[];
  fromBlock?: number;
  toBlock?: number;
}
