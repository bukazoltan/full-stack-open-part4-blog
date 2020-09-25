const logger = require("./logger");

const requestLogger = (request, response, next) => {
  logger.info(`Method: ${request.method}`);
  logger.info(`Path: ${request.path}`);
  logger.info(`Body: ${request.body}`);
  logger.info("---");
  next();
};

const getTokenFrom = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
    next();
  } else {
    request.token = null;
    next();
  }
};

module.exports = { requestLogger, getTokenFrom };
