// src/redis/redis.service.ts
import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { IRedisClient } from './interfaces/client.interface';
import { REDIS_CLIENT_TOKEN } from './client.provider';

@Injectable()
export class RedisService implements OnModuleDestroy {
    // Inject the pre-configured ioredis client instance using its token
    constructor(
        @Inject(REDIS_CLIENT_TOKEN) private readonly client: IRedisClient,
    ) {}

    async onModuleDestroy() {
        // Ensure the client is closed gracefully on application shutdown
        if (this.client && typeof (this.client as any).quit === 'function') {
            await (this.client as any).quit();
        }
    }

    async get(key: string): Promise<string> {
        return this.client.get(key); // Use the injected client
    }

    async set(
        key: string,
        value: string,
        options?: 'EX' | 'PX',
        ttl?: number,
    ): Promise<string> {
        return ttl
            ? this.client.set(key, value, options, ttl)
            : this.client.set(key, value);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    async exists(key: string): Promise<number> {
        return this.client.exists(key);
    }
}
