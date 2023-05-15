export interface RpcRequest<T> {
  jsonrpc: string;
  method: string;
  params: T[];
  id: number;
}

export abstract class BaseRpcRequest<T> implements RpcRequest<T> {
  jsonrpc: string = "2.0";
  abstract method: string;
  params: T[];
  id: number;

  constructor(params: T[], id: number = 1) {
    this.params = params;
    this.id = id;
  }
}
