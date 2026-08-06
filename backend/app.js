/**
 * Express Application
 * Registers middleware and routes for the User Management backend.
 */

const express = require('express');
const app = express();

// Parse JSON request bodies
app.use(express.json());

// Routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

module.exports = app;
