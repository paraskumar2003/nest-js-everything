import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLoggerService } from 'src/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: CustomLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, url, headers, body, params, query } = request as any;
        const start = Date.now();

        return next.handle().pipe(
            tap(resBody => {
                const duration = Date.now() - start;
                this.logger.log('API_SUCCESS', String(Date.now()), {
                    method,
                    url,
                    headers,
                    params,
                    query,
                    body,
                    response: resBody?.data || {},
                    statusCode: response.statusCode,
                    duration,
                });
            }),
            catchError(err => {
                const duration = Date.now() - start;
                this.logger.error('API_ERROR', String(Date.now()), {
                    method,
                    url,
                    headers,
                    params,
                    query,
                    body,
                    error: err.message,
                    stack: err.stack,
                    statusCode: err.status || 500,
                    duration,
                });
                throw err; // ✅ let ExceptionFilter handle the response
            }),
        );
    }
}
