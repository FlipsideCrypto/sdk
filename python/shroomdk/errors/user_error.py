
from .base_error import BaseError


class UserError(BaseError):
    """
    Base class for all user errors.
    """
    
    def __init__(self, status_code: int, message: str):
        self.message = f"user error occured with status code: {status_code}, msg: {message}"
        super().__init__(self.message)