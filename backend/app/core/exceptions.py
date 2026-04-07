from http import HTTPStatus

from fastapi import HTTPException


class AppHTTPException(HTTPException):
    def __init__(self, status_code: int, detail: str, code: str | None = None) -> None:
        super().__init__(status_code=status_code, detail={"message": detail, "code": code})


class AuthenticationError(AppHTTPException):
    def __init__(self, detail: str = "Authentication failed.") -> None:
        super().__init__(HTTPStatus.UNAUTHORIZED, detail, code="authentication_error")


class AuthorizationError(AppHTTPException):
    def __init__(self, detail: str = "You do not have access to this resource.") -> None:
        super().__init__(HTTPStatus.FORBIDDEN, detail, code="authorization_error")


class NotFoundError(AppHTTPException):
    def __init__(self, detail: str = "Resource not found.") -> None:
        super().__init__(HTTPStatus.NOT_FOUND, detail, code="not_found")


class ConflictError(AppHTTPException):
    def __init__(self, detail: str = "Resource already exists.") -> None:
        super().__init__(HTTPStatus.BAD_REQUEST, detail, code="conflict")


class RateLimitError(AppHTTPException):
    def __init__(self, detail: str = "Rate limit exceeded.") -> None:
        super().__init__(HTTPStatus.TOO_MANY_REQUESTS, detail, code="rate_limit_exceeded")
