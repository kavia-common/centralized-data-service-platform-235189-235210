'use strict';

const ApiError = require('../errors/apiError');
const logger = require('../config/logger');
const { writeAuditLog } = require('../services/audit');

// PUBLIC_INTERFACE
function errorHandler(err, req, res, _next) {
  /** Standardized error handler: maps ApiError to status code, logs structured, returns JSON. */
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  const body = {
    status: 'error',
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    code: err instanceof ApiError ? err.code : 'INTERNAL_ERROR',
    requestId: req.requestId,
  };

  if (err instanceof ApiError && err.details) {
    body.details = err.details;
  }

  logger.error(
    {
      err,
      requestId: req.requestId,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user.id : undefined,
      role: req.user ? req.user.role : undefined,
    },
    'request.error'
  );

  // Best-effort audit for failures.
  Promise.resolve()
    .then(async () => {
      await writeAuditLog({
        requestId: req.requestId,
        actorUserId: req.user ? req.user.id : null,
        actorRole: req.user ? req.user.role : null,
        action: 'request.error',
        targetType: 'http',
        targetId: `${req.method} ${req.originalUrl}`,
        success: false,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { message: err.message, code: body.code },
      });
    })
    .catch(() => {});

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
