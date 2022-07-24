from typing import Union

from .base_error import BaseError


class ServerError(BaseError):
    """
    Base class for all server errors.
    """

    def __init__(self, status_code: int, message: Union[str, None]):
        self.message = f"unexpected server error occured with status code: {status_code}, msg: {message}"
        super().__init__(self.message)
