from typing import Union
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
    
    def __init__(self, timeoutMinutes: Union[int, float]):
        self.message = f"QUERY_RUN_TIMEOUT_ERROR: your query has timed out after {timeoutMinutes} minutes."
        super().__init__(self.message)


class QueryRunExecutionError(BaseError):
    """
    Base class for all QueryRunExecutionError errors.
    """
    
    def __init__(self):
        self.message = "QUERY_RUN_EXECUTION_ERROR: an error has occured while executing your query."
        super().__init__(self.message)
