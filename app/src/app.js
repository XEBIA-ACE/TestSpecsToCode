'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const logger = require('./infrastructure/logger');
const userRouter = require('./adapters/inbound/http/userRouter');

/**
 * Creates and configures the Express application.
 * Pure factory — no side-effects (no listen, no DB connections).
 *
 * @returns {import('express').Application}
 */
function createApp() {
  const app = express();

  // ── Security & parsing middleware ──────────────────────────────────────
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // ── HTTP request logging ───────────────────────────────────────────────
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );

  // ── Health check ───────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'user-management-service' });
  });

  // ── Domain routes ──────────────────────────────────────────────────────
  app.use('/api/v1/users', userRouter);

  // ── 404 handler ────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // ── Global error handler ───────────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    logger.error(err.message, { stack: err.stack });
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

module.exports = createApp();
