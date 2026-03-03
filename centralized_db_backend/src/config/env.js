'use strict';

/**
 * Environment/config helpers.
 * Keep all env access centralized so it is easy to validate and test.
 */

// PUBLIC_INTERFACE
function getEnv(name, { required = false, defaultValue = undefined } = {}) {
  /** Get environment variable with optional requirement/default. */
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (required) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return defaultValue;
  }
  return value;
}

// PUBLIC_INTERFACE
function getEnvInt(name, { required = false, defaultValue = undefined } = {}) {
  /** Get environment variable parsed as integer. */
  const raw = getEnv(name, { required, defaultValue });
  if (raw === undefined) {
    return raw;
  }
  const parsed = Number.parseInt(String(raw), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }
  return parsed;
}

module.exports = {
  getEnv,
  getEnvInt,
};
