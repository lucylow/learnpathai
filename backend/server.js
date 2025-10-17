/**
 * LearnPathAI Backend Server
 * Main Express application with API routes
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const badgeRoutes = require('./routes/badges');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'LearnPathAI Backend'
  });
});

// API Routes
app.use('/api/badges', badgeRoutes);

// Mock data endpoint (for demo)
app.get('/api/mock-data', (req, res) => {
  const mockData = require('./data/mock-data.json');
  res.json(mockData);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 LearnPathAI Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🎫 Badge API: http://localhost:${PORT}/api/badges`);
    console.log(`📊 Mock data: http://localhost:${PORT}/api/mock-data`);
  });
}

module.exports = app;

