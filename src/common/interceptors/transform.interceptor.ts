import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../interfaces/api-response.interface';
import { IdempotencyService } from '../../idempotency';
import { CachedResponseException } from '../exceptions/cached.exception';
import { Reflector } from '@nestjs/core';
import { SKIP_INTERCEPTOR } from './skip-tranform.interceptor';

/**
 * Global response transformer interceptor.
 * - Wraps all responses in a consistent format.
 * - Supports idempotent response caching via request metadata.
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>>
{
    constructor(
        private readonly idempotencyService: IdempotencyService, // Injected service for caching support
        private readonly reflector: Reflector,
    ) {}

    private readonly sensitiveFields = [
        'id',
        'password',
        'created_at',
        'updated_at',
        'active',
        'deleted_at',
        'createdAt',
        'updatedAt',
        'deletedAt',
    ];

    /**
     * Recursively removes sensitive fields from an object or array.
     */
    private sanitize<T>(value: T): T {
        if (Array.isArray(value)) {
            return value.map(v => this.sanitize(v)) as any;
        }

        // Skip Date, Buffer, or any other special objects
        if (value instanceof Date || Buffer.isBuffer(value)) {
            return value;
        }

        if (typeof value === 'object' && value !== null) {
            const clean = {} as any;
            for (const key in value) {
                if (!this.sensitiveFields.includes(key)) {
                    clean[key] = this.sanitize((value as any)[key]);
                }
            }
            return clean;
        }

        return value;
    }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>() as any;
        const response = ctx.getResponse<Response>();

        const isSkipped =
            this.reflector.get<boolean>(
                SKIP_INTERCEPTOR,
                context.getHandler(),
            ) ||
            this.reflector.get<boolean>(SKIP_INTERCEPTOR, context.getClass());

        if (isSkipped) {
            return next.handle(); // no wrapping or sanitizing
        }

        // Generate or extract requestId for traceability
        const requestId = request.headers['x-request-id'] || uuidv4();

        // Standard metadata for all responses
        const timestamp = new Date().toISOString();
        const statusCode = response.statusCode;
        const path = request.url;

        return next.handle().pipe(
            map(data => {
                // Custom metadata injected by IdempotencyGuard
                const idempotencyKey: string = request['idempotencyKey'];
                const shouldCacheResponse: boolean =
                    request['shouldCacheResponse'];
                const cachedResponse = request['idempotencyCachedResponse'];

                /**
                 * 1. If a cached response was found by the guard,
                 *    return it in the wrapped format immediately.
                 */
                if (cachedResponse) {
                    return {
                        success: true,
                        message: 'Idempotent response',
                        data: cachedResponse,
                        ...cachedResponse,
                        requestId,
                        timestamp,
                        statusCode,
                        path,
                    };
                }

                /**
                 * 2. Check if the controller already returned a wrapped response
                 *    (i.e., it contains `success` and `message` fields).
                 */
                const isWrapped =
                    data &&
                    typeof data === 'object' &&
                    'success' in data &&
                    'message' in data;

                /**
                 * 3. Format the final API response.
                 *    - If already wrapped, just add metadata.
                 *    - Otherwise, wrap it with standard structure.
                 */
                const transformedData: ApiResponse<T> = isWrapped
                    ? {
                          ...(this.sanitize(data) as any),
                          requestId,
                          timestamp,
                          statusCode,
                          path,
                      }
                    : {
                          success: data?.success || true,
                          message: 'Request processed successfully',
                          data: this.sanitize(data),
                          requestId,
                          timestamp,
                          statusCode,
                          path,
                      };

                /**
                 * 4. If we should cache this response, store it using the service.
                 *    This is done asynchronously without blocking the response.
                 */
                if (shouldCacheResponse && idempotencyKey) {
                    this.idempotencyService
                        .markAsProcessed(idempotencyKey, transformedData)
                        .catch(err =>
                            console.error(
                                'Error caching idempotent response:',
                                err,
                            ),
                        );
                }

                return transformedData;
            }),
            catchError(err => {
                if (err instanceof CachedResponseException) {
                    return of({
                        success: true,
                        message: 'Idempotent response',
                        data: this.sanitize(err.cachedData),
                        ...err.cachedData,
                        requestId,
                        timestamp,
                        statusCode: 200,
                        path,
                    });
                }
                return throwError(() => err); // propagate other errors
            }),
        );
    }
}
