import { ApiResponse } from "./api-response.type";

export type CreateQueryJson = {
  token: string;
  errors?: string | null;
};

export interface CreateQueryResp extends ApiResponse {
  data: CreateQueryJson | null;
}
