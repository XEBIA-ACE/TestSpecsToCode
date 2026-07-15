'use strict';

const { Pool } = require('pg');
const config = require('../../config/env');
const logger = require('../logger');

/**
 * Singleton pg Pool instance.
 * Lazily created on first access so tests can mock before import.
 */
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
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
      logger.error('Unexpected pg pool error', { error: err.message });
    });
  }
  return pool;
}

/**
 * Execute a parameterised query.
 * @param {string} text  SQL statement
 * @param {Array}  params Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}

module.exports = { getPool, query };
