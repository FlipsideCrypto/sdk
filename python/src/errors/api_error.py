class ApiError(Exception):
    def __init__(self, name, code, message):
        super().__init__(f"{name}: message={message}, code={code}")


error_codes = {
    "MethodValidationError": -32000,
    "QueryRunNotFound": -32099,
    "SqlStatementNotFound": -32100,
    "TemporalError": -32150,
    "QueryRunNotFinished": -32151,
    "ResultTransformError": -32152,
    "ResultFormatNotSupported": -32153,
    "RowCountCouldNotBeComputed": -32154,
    "QueryResultColumnMetadataMissing": -32155,
    "InvalidSortColumn": -32156,
    "ColumnSummaryQueryFailed": -32157,
    "QueryResultColumnMetadataMissingColumnName": -32158,
    "QueryResultColumnMetadataMissingColumnType": -32159,
    "NoQueryRunsFoundinQueryText": -32160,
    "DuckDBError": -32161,
    "RefreshableQueryNotFound": -32162,
    "AuthorizationError": -32163,
    "DataSourceNotFound": -32164,
    "QueryRunInvalidStateToCancel": -32165,
    "DataProviderAlreadyExists": -32166,
    "DataProviderNotFound": -32167,
    "DataSourceAlreadyExists": -32168,
    "AdminOnly": -32169,
    "RequestedPageSizeTooLarge": -32170,
    "MaxConcurrentQueries": -32171,
}


def get_exception_by_error_code(error_code=None, message=None):
    if not error_code or not message:
        return ApiError("UnknownAPIError", error_code, message)

    error_name = None
    for key, value in error_codes.items():
        if value == error_code:
            error_name = key
            break

    if error_name is None:
        return ApiError("UnknownAPIError", error_code, message)

    return ApiError(error_name, error_code, message)
