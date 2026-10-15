// COMP 3123 Assignment 1 - Express app
// Cem Dudu - 101496484
//
// This file builds the Express app and exports it.
// server.js starts it locally, and Vercel uses this file directly.

const express = require('express');
const connectDB = require('./config/db');
const { getHealth } = require('./controllers/healthController');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

// Read JSON request bodies (small limit to block very large requests)
app.use(express.json({ limit: '10kb' }));

// Health check
app.get('/health', getHealth);

// Make sure MongoDB is connected before any API request.
// The connection is created once and then reused.
app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
});

// API routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);

// Unknown routes and errors (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
