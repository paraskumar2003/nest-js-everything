import { Module } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { redisClientProvider } from './client.provider';

@Module({
    controllers: [RedisController],
    providers: [redisClientProvider, RedisService],
    exports: [RedisService, redisClientProvider],
})
export class RedisModule {}
