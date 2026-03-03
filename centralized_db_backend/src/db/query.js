'use strict';

const { getPool } = require('./pool');
const logger = require('../config/logger');

// PUBLIC_INTERFACE
async function dbQuery(text, params = [], { reqId, userId, purpose } = {}) {
  /** Execute a parameterized query through the shared pool with basic logging. */
  const start = Date.now();
  try {
    const result = await getPool().query(text, params);
    const durationMs = Date.now() - start;
    logger.debug({ reqId, userId, durationMs, purpose, rowCount: result.rowCount }, 'db.query.ok');
    return result;
  } catch (err) {
    const durationMs = Date.now() - start;
    logger.error({ reqId, userId, durationMs, purpose, err }, 'db.query.error');
    throw err;
  }
}

module.exports = { dbQuery };
