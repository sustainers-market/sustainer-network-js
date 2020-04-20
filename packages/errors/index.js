const {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
  ResourceNotFoundError,
  InvalidArgumentError,
  InvalidCredentialsError,
  ForbiddenError,
  PreconditionFailedError,
} = require("restify-errors");

const toJSON = require("./src/to_json");

const badRequest = {
  message: (message, { cause, info } = {}) =>
    new BadRequestError({ cause, info, toJSON }, message),
};
const internalServer = {
  message: (message, { cause, info } = {}) =>
    new InternalServerError({ cause, info, toJSON }, message),
};
const unauthorized = {
  message: (message, { cause, info } = {}) =>
    new UnauthorizedError({ cause, info, toJSON }, message),
};
const resourceNotFound = {
  message: (message, { cause, info } = {}) =>
    new ResourceNotFoundError({ cause, info, toJSON }, message),
};
const invalidCredentials = {
  message: (message, { cause, info } = {}) =>
    new InvalidCredentialsError({ cause, info, toJSON }, message),
};
const forbidden = {
  message: (message, { cause, info } = {}) =>
    new ForbiddenError({ cause, info, toJSON }, message),
};
const invalidArgument = {
  message: (message, { cause, info } = {}) =>
    new InvalidArgumentError({ cause, info, toJSON }, message),
};
const preconditionFailed = {
  message: (message, { cause, info } = {}) =>
    new PreconditionFailedError({ cause, info, toJSON }, message),
};

const construct = ({ statusCode, message }) => {
  switch (statusCode) {
    case 400:
      return badRequest.message(message);
    case 401:
      return unauthorized.message(message);
    case 403:
      return forbidden.message(message);
    case 404:
      return resourceNotFound.message(message);
    case 409:
      return invalidArgument.message(message);
    case 500:
      return internalServer.message(message);
  }
};

module.exports = {
  badRequest,
  resourceNotFound,
  construct,
  internalServer,
  invalidCredentials,
  invalidArgument,
  forbidden,
  unauthorized,
  preconditionFailed,
};
