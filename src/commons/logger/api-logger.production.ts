// Import Modules
import * as winston from 'winston';
import * as expressWinston from 'express-winston';

// Import Transports
import { apiLoggerTransports } from './api-logger.transport';

// Destructuring Winston
const { createLogger, format } = winston;
const { combine, timestamp } = format;

// Define Logger Production Service
export const apiLoggerProductionService = createLogger({
    format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json()),
    transports: [apiLoggerTransports.error],
});

// Define Logger Production Api
export const apiLoggerProduction: expressWinston.LoggerOptions = {
    format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), format.json()),
    requestWhitelist: ['body', 'query', 'params', 'method', 'originalUrl', 'headers.x-forwarded-for', 'connection.remoteAddress'],
    responseWhitelist: [...expressWinston.responseWhitelist, 'body'],
    transports: [apiLoggerTransports.combine],
};
