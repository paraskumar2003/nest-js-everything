import { Injectable } from '@nestjs/common';
import { KeyLockServiceInterface } from './interfaces';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class KeyLockService implements KeyLockServiceInterface {
    constructor(private readonly redisService: RedisService) {}

    // service for acquiring lock
    async lock(key: string, ttl: number = 10): Promise<void> {
        this.redisService.set(`keyLock${key}`, '1', 'EX', ttl);
    }

    // service for realesing lock
    async release(key: string): Promise<void> {
        this.redisService.del(`keyLock${key}`);
    }

    // service for waiting until the lock is released
    async wait(key: string): Promise<void> {
        while (true) {
            let ifKeyExists = await this.redisService.get(`keyLock${key}`);
            if (!ifKeyExists) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}
