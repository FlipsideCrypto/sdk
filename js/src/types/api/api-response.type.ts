export interface ApiResponse {
  statusCode: number;
  statusMsg: string | null;
  errorMsg: string | null | undefined;
  data: Record<string, any> | null;
}
