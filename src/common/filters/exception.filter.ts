// common/filters/all-exceptions.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IdempotencyService } from '../../idempotency';
import { v4 as uuidv4 } from 'uuid';
import { CachedResponseException } from '../exceptions/cached.exception';
import { CustomLoggerService } from '../../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly idempotencyService: IdempotencyService,
        private readonly loggerService: CustomLoggerService,
    ) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>() as any;

        const timestamp = new Date().toISOString();
        const path = request.url;
        const requestId = request.headers['x-request-id'] || uuidv4();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = [];
        let errorStack = null;
        let data = null;

        if (exception instanceof Error) {
            this.loggerService.error('Exception', request.journeyId, {
                error: exception.message,
                stack: exception.stack,
            });
            errors = [exception.message];
            errorStack = exception.stack.split('\n')[0];
        }

        if (exception instanceof HttpException) {
            const res: any = exception.getResponse();
            statusCode = exception.getStatus();
            message = res.message || exception.message;
            errors = res.message instanceof Array ? res.message : [res.message];
        }

        if (exception instanceof BadRequestException) {
            statusCode = HttpStatus.BAD_REQUEST;
        }

        let responseObj = {
            success: false,
            message: typeof message === 'string' ? message : message[0],
            data,
            errors,
            requestId,
            timestamp,
            statusCode,
            path,
            errorStack,
        };

        if (exception instanceof CachedResponseException) {
            responseObj = {
                ...responseObj,
                ...exception.cachedData,
                statusCode: exception.cachedData.statusCode,
            };
        }

        const key = request['idempotencyKey'];
        const shouldCache = request['shouldCacheResponse'];

        if (shouldCache && key) {
            this.idempotencyService
                .markAsProcessed(key, {
                    statusCode,
                    message,
                    errors,
                })
                .catch(console.error);
        }
        if (!response.headersSent)
            response.status(responseObj.statusCode).json(responseObj);
    }
}
