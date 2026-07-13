'use strict';

const { Pool } = require('pg');
const config = require('../../../config/env');
const logger = require('../../logger');

/** Singleton pg Pool shared across the process. */
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
  logger.error('Unexpected pg pool error', { message: err.message });
});

module.exports = pool;
