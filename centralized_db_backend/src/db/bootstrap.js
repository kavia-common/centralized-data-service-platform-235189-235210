'use strict';

const { dbQuery } = require('./query');
const logger = require('../config/logger');

/**
 * Minimal bootstrap to ensure auth + audit tables exist.
 * This is intentionally idempotent.
 */

// PUBLIC_INTERFACE
async function bootstrapDatabase() {
  /** Ensure required internal tables exist. */
  await dbQuery(
    `
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','developer','viewer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `
  );

  await dbQuery(
    `
    CREATE TABLE IF NOT EXISTS audit_log (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      request_id TEXT,
      actor_user_id BIGINT,
      actor_role TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      success BOOLEAN NOT NULL,
      ip TEXT,
      user_agent TEXT,
      metadata JSONB
    );
  `
  );

  logger.info('Database bootstrap complete');
}

module.exports = { bootstrapDatabase };
