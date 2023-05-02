from typing import Optional, Union

from .base_error import BaseError


class QueryRunRateLimitError(BaseError):
    """
    Base class for all QueryRunRateLimitError errors.
    """

    def __init__(self):
        self.message = "QUERY_RUN_RATE_LIMIT_ERROR: you have exceeded the rate limit for creating/running new queries"
        super().__init__(self.message)


class QueryRunTimeoutError(BaseError):
    """
    Base class for all QueryRunTimeoutError errors.
    """

    def __init__(self, timeoutMinutes: Union[int, float, None] = None):
        if timeoutMinutes is None:
            self.message = f"QUERY_RUN_TIMEOUT_ERROR: your query has timed out."
        else:
            self.message = f"QUERY_RUN_TIMEOUT_ERROR: your query has timed out after {timeoutMinutes} minutes."
        super().__init__(self.message)


class QueryRunExecutionError(BaseError):
    """
    Base class for all QueryRunExecutionError errors.
    """

    def __init__(
        self,
        error_name: Optional[str] = None,
        error_message: Optional[str] = None,
        error_data: Optional[str] = None,
    ):
        self.message = f"QUERY_RUN_EXECUTION_ERROR: an error has occured while executing your query. errorName={error_name}, errorMessage={error_message}, errorData={error_data}"
        super().__init__(self.message)


class QueryRunCancelledError(BaseError):
    """
    Base class for all QueryRunCancelledError errors.
    """

    def __init__(
        self,
        error_name: Optional[str] = None,
        error_message: Optional[str] = None,
        error_data: Optional[str] = None,
    ):
        self.message = f"QUERY_RUN_CANCELLED_ERROR: your query has been cancelled. errorName={error_name}, errorMessage={error_message}, errorData={error_data}"
        super().__init__(self.message)


class QueryRunInvalidStateToCancel(BaseError):
    """
    Base class for all QueryRunInvalidStateToCancel errors.
    """

    def __init__(
        self,
        msg: Optional[str] = None,
    ):
        self.message = msg
        super().__init__(self.message)
