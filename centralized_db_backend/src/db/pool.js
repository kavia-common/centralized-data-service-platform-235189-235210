'use strict';

const { Pool } = require('pg');
const { getEnv, getEnvInt } = require('../config/env');
const logger = require('../config/logger');

let pool;

/**
 * Uses the environment variables exposed by the DB container:
 * POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT
 */

// PUBLIC_INTERFACE
function getPool() {
  /** Singleton pool instance. */
  if (pool) return pool;

  const connectionString = getEnv('POSTGRES_URL', { required: false });

  // Prefer URL if available; otherwise construct connection from parts.
  const config = connectionString
    ? { connectionString }
    : {
        host: getEnv('POSTGRES_HOST', { required: false }), // optional fallback if provided
        user: getEnv('POSTGRES_USER', { required: true }),
        password: getEnv('POSTGRES_PASSWORD', { required: true }),
        database: getEnv('POSTGRES_DB', { required: true }),
        port: getEnvInt('POSTGRES_PORT', { required: true }),
      };

  pool = new Pool({
    ...config,
    max: getEnvInt('PG_POOL_MAX', { required: false, defaultValue: 10 }),
    idleTimeoutMillis: getEnvInt('PG_POOL_IDLE_MS', { required: false, defaultValue: 30000 }),
    connectionTimeoutMillis: getEnvInt('PG_POOL_CONN_TIMEOUT_MS', { required: false, defaultValue: 5000 }),
  });

  pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PG pool error');
  });

  return pool;
}

// PUBLIC_INTERFACE
async function closePool() {
  /** Gracefully close pool for shutdown/tests. */
  if (!pool) return;
  const p = pool;
  pool = undefined;
  await p.end();
}

module.exports = {
  getPool,
  closePool,
};
