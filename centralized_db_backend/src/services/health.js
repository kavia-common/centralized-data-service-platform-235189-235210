'use strict';

const { dbQuery } = require('../db/query');

class HealthService {
  // PUBLIC_INTERFACE
  async getStatus({ reqId } = {}) {
    /** Return service health; includes db ping when possible. */
    let db = { ok: false };
    try {
      // lightweight ping
      await dbQuery('SELECT 1 as ok', [], { reqId, purpose: 'health.ping' });
      db = { ok: true };
    } catch (err) {
      db = { ok: false, error: err.message };
    }

    return {
      status: 'ok',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db,
    };
  }
}

module.exports = new HealthService();
