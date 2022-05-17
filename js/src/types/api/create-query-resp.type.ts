export type CreateQueryJson = {
  token: string;
};

export interface CreateQueryResp extends Response {
  json(): Promise<CreateQueryJson>;
}
