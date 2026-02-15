"""Custom exception classes for standardized error handling."""


class AppException(Exception):
    """Base application exception with status code."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(AppException):
    """Resource not found exception (404)."""

    def __init__(self, resource: str, id: int | str | None = None):
        if id is not None:
            message = f"{resource} with id={id} not found"
        else:
            message = f"{resource} not found"
        super().__init__(message, status_code=404)


class UnauthorizedError(AppException):
    """Unauthorized access exception (401)."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class ForbiddenError(AppException):
    """Forbidden access exception (403)."""

    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403)


class ValidationError(AppException):
    """Validation error exception (422)."""

    def __init__(self, message: str):
        super().__init__(message, status_code=422)


class ConflictError(AppException):
    """Resource conflict exception (409)."""

    def __init__(self, message: str):
        super().__init__(message, status_code=409)
