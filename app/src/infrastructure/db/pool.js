'use strict';

const { Pool } = require('pg');
const config = require('../../config/env');
const logger = require('../logger');

/**
 * Singleton pg connection pool.
 * Shared across all repository adapters.
 */
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.poolMax,
  idleTimeoutMillis: config.db.idleTimeoutMs,
  connectionTimeoutMillis: config.db.connectionTimeoutMs,
});

pool.on('error', (err) => {
  logger.error('Unexpected pg pool error', { error: err.message, stack: err.stack });
});

module.exports = pool;
