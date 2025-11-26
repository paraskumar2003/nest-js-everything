// express.d.ts (or any .d.ts in your src folder)

import 'express';

declare module 'express' {
    interface Request {
        method: string; // explicitly declare method as string
        path: string; // explicitly declare path as string
        headers: {
            [key: string]: string | undefined;
            'idempotency-key'?: string;
        };
    }
}
