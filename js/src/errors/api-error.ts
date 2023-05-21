export class ApiError extends Error {
  constructor(name: string, code: number, message: string) {
    super(`${name}: message=${message}, code=${code}`);
  }
}

export const errorCodes: { [key: string]: number } = {
  MethodValidationError: -32000,
  QueryRunNotFound: -32099,
  SqlStatementNotFound: -32100,
  TemporalError: -32150,
  QueryRunNotFinished: -32151,
  ResultTransformError: -32152,
  ResultFormatNotSupported: -32153,
  RowCountCouldNotBeComputed: -32154,
  QueryResultColumnMetadataMissing: -32155,
  InvalidSortColumn: -32156,
  ColumnSummaryQueryFailed: -32157,
  QueryResultColumnMetadataMissingColumnName: -32158,
  QueryResultColumnMetadataMissingColumnType: -32159,
  NoQueryRunsFoundinQueryText: -32160,
  DuckDBError: -32161,
  RefreshableQueryNotFound: -32162,
  AuthorizationError: -32163,
  DataSourceNotFound: -32164,
  QueryRunInvalidStateToCancel: -32165,
  DataProviderAlreadyExists: -32166,
  DataProviderNotFound: -32167,
  DataSourceAlreadyExists: -32168,
  AdminOnly: -32169,
  RequestedPageSizeTooLarge: -32170,
  MaxConcurrentQueries: -32171,
};

export function getExceptionByErrorCode(errorCode?: number, message?: string): ApiError {
  if (!errorCode || !message) {
    return new ApiError("UnknownAPIError", errorCode || -1, message || "");
  }

  let errorName: string | null = null;
  for (const key of Object.keys(errorCodes)) {
    if (errorCodes[key] === errorCode) {
      errorName = key;
      break;
    }
  }

  if (errorName === null) {
    return new ApiError("UnknownAPIError", errorCode, message);
  }

  return new ApiError(errorName, errorCode, message);
}
