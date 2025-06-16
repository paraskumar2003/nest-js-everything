import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import * as express from 'express';

@Injectable()
export class IdempotencyGuard implements CanActivate {
    constructor(private readonly idempotencyService: IdempotencyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<express.Request>();
        const response = context.switchToHttp().getResponse<express.Response>();

        // Only apply to POST/PUT/PATCH methods
        if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
            return true;
        }

        const idempotencyKey = request.headers['idempotency-key'] as string;

        if (!idempotencyKey) {
            throw new HttpException(
                'Idempotency-Key header is required',
                HttpStatus.BAD_REQUEST,
            );
        }

        const key = `idempotency:${request.path}:${idempotencyKey}`;

        const isProcessed = await this.idempotencyService.isProcessed(key);

        if (isProcessed) {
            const data = await this.idempotencyService.getProcessedData(key);
            response.status(HttpStatus.OK).json(data);
            return false;
        }

        // Store the original json method
        const originalJson = response.json.bind(response);
        const idempotencyService = this.idempotencyService;

        // Override the json method to store the response
        response.json = (body: any) => {
            idempotencyService.markAsProcessed(key, body).catch(console.error);
            return originalJson(body);
        };

        return true;
    }
}
