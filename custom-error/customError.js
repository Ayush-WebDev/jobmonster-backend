const { StatusCodes } = require("http-status-codes");

class CustomAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class UnauthorizedError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

class UnauthenticatedError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

class BadRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = CustomAPIError;
