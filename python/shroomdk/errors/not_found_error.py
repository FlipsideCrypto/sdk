from typing import Union

from .base_error import BaseError


class NotFoundError(BaseError):
    """
    When an object is not found on the server.
    """

    def __init__(self, message: Union[str, None]):
        self.message = message
        super().__init__(self.message)
