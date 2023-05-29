export interface TracerEvent {
  storeIndex: number;
  txHash: string;
  contract: {
    name: string;
    address: string;
  };
  block: {
    number: number;
    timestamp: string;
  };
  decoded: {
    index: number;
    name: string;
    inputs: Record<string, string>;
  };
  topics?: string[];
  data?: string;
}
