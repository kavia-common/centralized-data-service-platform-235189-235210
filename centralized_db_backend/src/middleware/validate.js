'use strict';

const { validationResult } = require('express-validator');
const ApiError = require('../errors/apiError');

// PUBLIC_INTERFACE
function validate(req, _res, next) {
  /** Convert express-validator errors into a consistent 400 response. */
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(
      new ApiError(400, 'Validation failed', {
        code: 'VALIDATION_ERROR',
        details: result.array(),
      })
    );
  }
  return next();
}

module.exports = validate;
