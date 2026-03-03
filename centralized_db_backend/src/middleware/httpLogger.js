'use strict';

const pinoHttp = require('pino-http');
const logger = require('../config/logger');

// PUBLIC_INTERFACE
function httpLogger() {
  /** HTTP logging middleware with requestId binding. */
  return pinoHttp({
    logger,
    customProps(req) {
      return {
        requestId: req.requestId,
        userId: req.user ? req.user.id : undefined,
        role: req.user ? req.user.role : undefined,
      };
    },
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          requestId: req.requestId,
          remoteAddress: req.remoteAddress,
        };
      },
    },
  });
}

module.exports = httpLogger;
