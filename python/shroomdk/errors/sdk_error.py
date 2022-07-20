
from .base_error import BaseError


class SDKError(BaseError):
    """
    Base class for all SDK errors.
    """
    
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)
