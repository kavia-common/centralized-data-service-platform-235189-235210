'use strict';

const crypto = require('crypto');

// PUBLIC_INTERFACE
function requestContext() {
  /** Create middleware that attaches a stable request ID to every request. */
  return (req, res, next) => {
    const incoming = req.get('x-request-id');
    const requestId = incoming && incoming.length <= 128 ? incoming : crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  };
}

module.exports = requestContext;
