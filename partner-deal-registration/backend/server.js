const app = require('./src/app');

// Use environment PORT or default based on environment
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 10000 : 5000);

const server = app.listen(PORT, () => {
  console.log(`🚀 Daxa Partner Portal API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Dynamic base URL based on environment
  if (process.env.NODE_ENV === 'production') {
    // In production, don't log localhost URLs
    console.log(`🔗 API Base URL: https://your-domain.com/api/v1`);
  } else {
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = server;