'use strict';

const rateLimit = require('express-rate-limit');
const { getEnvInt } = require('../config/env');

// PUBLIC_INTERFACE
function createRateLimiter() {
  /** Global rate limiter, configured via RATE_LIMIT_WINDOW_S and RATE_LIMIT_MAX. */
  const windowS = getEnvInt('RATE_LIMIT_WINDOW_S', { required: false, defaultValue: 60 });
  const max = getEnvInt('RATE_LIMIT_MAX', { required: false, defaultValue: 100 });

  return rateLimit({
    windowMs: windowS * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests' },
  });
}

module.exports = createRateLimiter;
