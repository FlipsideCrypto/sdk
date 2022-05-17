export type CreateQueryJson = {
  token: string;
  errors?: string | null;
};

export interface CreateQueryResp extends Response {
  json(): Promise<CreateQueryJson>;
}
