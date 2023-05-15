export const QueryStatusFinished = "finished";
export const QueryStatusPending = "pending";
export const QueryStatusError = "error";
export type QueryStatus = "finished" | "pending" | "error";

export function mapApiQueryStateToStatus(state: string): QueryStatus {
  switch (state) {
    case "QUERY_STATE_READY":
      return QueryStatusPending;
    case "QUERY_STATE_RUNNING":
      return QueryStatusPending;
    case "QUERY_STATE_STREAMING_RESULTS":
      return QueryStatusPending;
    case "QUERY_STATE_FAILED":
      return QueryStatusError;
    case "QUERY_STATE_CANCELED":
      return QueryStatusError;
    case "QUERY_STATE_SUCCESS":
      return QueryStatusFinished;
    default:
      throw new Error(`Unknown query state: ${state}`);
  }
}
