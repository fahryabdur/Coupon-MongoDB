// Import Modules
import { Request, Response } from 'express';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';

// Import Transports
import { apiLoggerTransports } from './api-logger.transport';

// Destructuring Winston
const { createLogger, format } = winston;
const { combine } = format;

// Define Logger Format
const apiLoggerFormat = format.printf(({ timestamp, level, message, stack, ms, ...meta }) => {
    return `${timestamp} [${Object.values(meta)}] ${level}: ${message || stack} (${ms})`;
});

// Define Logger Development Service
export const apiLoggerDevelopmentService = createLogger({
    format: combine(
        format.colorize(),
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.ms(),
        apiLoggerFormat,
    ),
    transports: [apiLoggerTransports.console],
});

// Define Logger Development Api
export const apiLoggerDevelopment: expressWinston.LoggerOptions = {
    format: combine(format.colorize(), format.json(), format.simple()),
    requestWhitelist: ['body', 'query', 'params', 'method', 'originalUrl', 'headers.x-forwarded-for', 'connection.remoteAddress'],
    responseWhitelist: [...expressWinston.responseWhitelist, 'body'],
    transports: [apiLoggerTransports.console],
    level: (req: Request, res: Response) => {
        return res.statusCode >= 400 ? 'error' : 'info';
    },
    ignoreRoute: (req: Request, res: Response) => {
        if (req.path.includes('/api/docs')) {
            return true;
        }
    },
};
