// Environment configuration with type safety and defaults

interface AppConfig {
  backendUrl: string;
  ktServiceUrl: string;
  enableAnalytics: boolean;
  disableTelemetry: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

function getEnvVar(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

function getEnvBool(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === true;
}

export const config: AppConfig = {
  backendUrl: getEnvVar('VITE_BACKEND_URL', 'http://localhost:3001'),
  ktServiceUrl: getEnvVar('VITE_KT_SERVICE_URL', 'http://localhost:8001'),
  enableAnalytics: getEnvBool('VITE_ENABLE_ANALYTICS', true),
  disableTelemetry: getEnvBool('VITE_DISABLE_TELEMETRY', false),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate required configuration
if (config.isProduction && !config.backendUrl) {
  throw new Error('VITE_BACKEND_URL must be set in production');
}

export default config;

