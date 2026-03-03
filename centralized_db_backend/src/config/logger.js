'use strict';

const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

/**
 * In dev, pino-pretty can be enabled via LOG_PRETTY=true.
 * We keep this minimal and environment-driven.
 */
const transport =
  process.env.LOG_PRETTY === 'true'
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', singleLine: false },
      }
    : undefined;

const logger = pino({
  level,
  transport,
  base: undefined, // avoid pid/hostname noise unless desired
});

module.exports = logger;
