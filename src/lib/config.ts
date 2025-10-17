// src/lib/config.ts
const config = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  aiServiceUrl: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001',
  enableTelemetry: import.meta.env.VITE_ENABLE_TELEMETRY === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

export default config;
