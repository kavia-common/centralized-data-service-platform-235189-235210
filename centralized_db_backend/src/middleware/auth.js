'use strict';

const jwt = require('jsonwebtoken');
const ApiError = require('../errors/apiError');

function getJwtSecret() {
  // NOTE: must be provided in .env by orchestrator/user.
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return secret;
}

// PUBLIC_INTERFACE
function signAccessToken(payload, { expiresIn = '1h' } = {}) {
  /** Create a signed JWT access token. */
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

// PUBLIC_INTERFACE
function requireAuth(req, _res, next) {
  /** Require a valid Bearer token and attach decoded user context to req.user. */
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) {
    return next(new ApiError(401, 'Missing Bearer token', { code: 'AUTH_REQUIRED' }));
  }

  try {
    const decoded = jwt.verify(match[1], getJwtSecret());
    req.user = decoded;
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Invalid or expired token', { code: 'AUTH_INVALID' }));
  }
}

module.exports = {
  signAccessToken,
  requireAuth,
};
