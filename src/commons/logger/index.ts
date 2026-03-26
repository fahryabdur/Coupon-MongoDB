// Import All Logs
import { apiLoggerDevelopment, apiLoggerDevelopmentService } from './api-logger.development';
import { apiLoggerProduction, apiLoggerProductionService } from './api-logger.production';

// Import Constants
import { SERVICE_ENV_DEVELOPMENT } from '@commons/constants';

// Define Log Service
export const apiLoggerService = SERVICE_ENV_DEVELOPMENT ? apiLoggerDevelopmentService : apiLoggerProductionService;
export const apiLogger = SERVICE_ENV_DEVELOPMENT ? apiLoggerDevelopment : apiLoggerProduction;
