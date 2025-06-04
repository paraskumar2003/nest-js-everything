import { Request as ExpressRequest } from 'express';

declare global {
    namespace Express {
        interface Request extends ExpressRequest {
            json?: Record<string, any>;
        }
    }
}

export {};