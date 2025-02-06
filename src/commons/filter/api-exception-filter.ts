// Import Modules
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

// Import Logger Service
import { apiLoggerService } from '../logger';

@Catch()
export class ApiExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const getContext = host.switchToHttp();
        const getContextApi = httpAdapter.getRequestUrl(getContext.getRequest());
        const getHttpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        if (getHttpStatus >= 500) {
            apiLoggerService.error(`${exception}`, { service: getContextApi });
        }

        const getResponse = {
            statusCode: getHttpStatus,
            message: 'API_SERVER_ERROR',
            errors: [
                {
                    path: getContextApi,
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        const responseBody = exception instanceof HttpException ? exception.getResponse() : getResponse;

        httpAdapter.reply(getContext.getResponse(), responseBody, getHttpStatus);
    }
}
