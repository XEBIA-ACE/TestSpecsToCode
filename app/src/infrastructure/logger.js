'use strict';

const { createLogger, format, transports } = require('winston');

/**
 * Shared Winston logger instance for structured logging.
 * Log level is controlled via the LOG_LEVEL environment variable.
 */
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

module.exports = logger;
