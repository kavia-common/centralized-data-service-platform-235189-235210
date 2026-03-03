'use strict';

const ApiError = require('../errors/apiError');

const ROLE_ORDER = ['viewer', 'developer', 'admin'];

function rank(role) {
  const idx = ROLE_ORDER.indexOf(role);
  return idx === -1 ? -1 : idx;
}

// PUBLIC_INTERFACE
function requireRole(minRole) {
  /** Require req.user to have at least minRole. */
  return (req, _res, next) => {
    const role = req.user && req.user.role;
    if (!role) {
      return next(new ApiError(401, 'Authentication required', { code: 'AUTH_REQUIRED' }));
    }
    if (rank(role) < rank(minRole)) {
      return next(new ApiError(403, 'Forbidden', { code: 'FORBIDDEN' }));
    }
    return next();
  };
}

module.exports = { requireRole };
