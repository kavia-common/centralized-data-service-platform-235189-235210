'use strict';

const healthService = require('../services/health');

class HealthController {
  // PUBLIC_INTERFACE
  async check(req, res, next) {
    /** Health endpoint: includes basic DB connectivity if configured. */
    try {
      const healthStatus = await healthService.getStatus({ reqId: req.requestId });
      return res.status(200).json(healthStatus);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new HealthController();
