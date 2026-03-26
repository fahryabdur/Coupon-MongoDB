// Import Modules
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as appRoot from 'app-root-path';

// Import Constants
import { SERVICE_NAME } from '@commons/constants';

// Define Logger Transports
export const apiLoggerTransports = {
    error: new DailyRotateFile({
        filename: `${appRoot}/../logs/${SERVICE_NAME}/error/%DATE%.log`,
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '14d',
        frequency: '1h',
        level: 'error',
    }),
    combine: new DailyRotateFile({
        filename: `${appRoot}/../logs/${SERVICE_NAME}/combine/%DATE%.log`,
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '14d',
        frequency: '1h',
        level: 'info',
    }),
    console: new winston.transports.Console(),
};
