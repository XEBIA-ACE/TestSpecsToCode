/**
 * Express Application Entry Point
 *
 * Wires together middleware and routes for the User_Management service.
 */

'use strict';

const express = require('express');
const { createProfileRouter } = require('./routes/profileRoutes');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Profile management endpoints
// TODO: add authentication middleware before this line in production
//   e.g. app.use('/api/profile', authMiddleware, createProfileRouter());
app.use('/api/profile', createProfileRouter());

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[App]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
