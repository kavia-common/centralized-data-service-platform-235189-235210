'use strict';

const requestContext = require('./requestContext');
const httpLogger = require('./httpLogger');
const createRateLimiter = require('./rateLimit');
const validate = require('./validate');
const errorHandler = require('./errorHandler');
const { requireAuth, signAccessToken } = require('./auth');
const { requireRole } = require('./rbac');

module.exports = {
  requestContext,
  httpLogger,
  createRateLimiter,
  validate,
  errorHandler,
  requireAuth,
  signAccessToken,
  requireRole,
};
