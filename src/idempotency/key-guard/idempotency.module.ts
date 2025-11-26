import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdempotencyService } from './idempotency.service';
import { IdempotencyGuard } from './idempotency.guard';
import Redis from 'ioredis';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [ConfigModule, RedisModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: (configService: ConfigService) => {
                return new Redis(configService.get('REDIS_HOST'));
            },
            inject: [ConfigService],
        },
        IdempotencyService,
        IdempotencyGuard,
    ],
    exports: [IdempotencyService, IdempotencyGuard],
})
export class IdempotencyModule {}
