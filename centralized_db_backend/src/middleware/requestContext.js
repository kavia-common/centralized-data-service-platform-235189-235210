'use strict';

const crypto = require('crypto');

// PUBLIC_INTERFACE
function requestContext(req, res, next) {
  /** Attach stable request ID to every request. */
  const incoming = req.get('x-request-id');
  const requestId = incoming && incoming.length <= 128 ? incoming : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

module.exports = requestContext;
