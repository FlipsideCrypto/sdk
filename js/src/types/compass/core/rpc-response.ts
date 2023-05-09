import { RpcError } from "./rpc-error";

export interface RpcResponse<T> {
  jsonrpc: string;
  id: number;
  result: T | null;
  error: RpcError | null;
}

export abstract class BaseRpcResponse<T> implements RpcResponse<T> {
  jsonrpc: string = "2.0";
  id: number;
  result: T | null;
  error: RpcError | null;

  constructor(id: number, result: T | null, error: RpcError | null) {
    this.id = id;
    this.result = result;
    this.error = error;
  }
}
