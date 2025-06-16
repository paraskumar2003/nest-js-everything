// src/redis/redis-client.provider.ts
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT_TOKEN';

export const redisClientProvider: Provider = {
    provide: REDIS_CLIENT_TOKEN,
    useFactory: (configService: ConfigService) => {
        const client = new Redis({
            host: configService.get('REDIS_HOST', 'localhost'),
            port: +configService.get('REDIS_PORT', 6379),
        });

        client.on('error', err => {
            console.error('Redis Client Connection Error:', err);
        });

        client.on('ready', () => {
            console.log('Redis client connection ready');
        });

        return client; // Return the configured ioredis client instance
    },
    inject: [ConfigService],
};
