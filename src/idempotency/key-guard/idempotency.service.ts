import { Injectable, Inject } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class IdempotencyService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisService: RedisService,
    ) {}

    private readonly EXPIRY_TIME = 24 * 60 * 60; // 24 hours in seconds

    async isProcessed(key: string): Promise<boolean> {
        const exists = await this.redisService.exists(key);
        return exists === 1;
    }

    async markAsProcessed(key: string, data: any): Promise<void> {
        // await this.redis.setex(key, this.EXPIRY_TIME, JSON.stringify(data));
        await this.redisService.set(
            key,
            JSON.stringify(data),
            'EX',
            this.EXPIRY_TIME,
        );
    }

    async getProcessedData(key: string): Promise<any> {
        const data = await this.redisService.get(key);
        return data ? JSON.parse(data) : null;
    }
}
