import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IdempotencyService } from './idempotency.service';
import { IdempotencyGuard } from './idempotency.guard';
import Redis from 'ioredis';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: (configService: ConfigService) => {
                const env = configService.get('NODE_ENV');
                const redisUrl =
                    env === 'production'
                        ? configService.get('REDIS_URL_PROD')
                        : configService.get('REDIS_URL_DEV');

                return new Redis(redisUrl);
            },
            inject: [ConfigService],
        },
        IdempotencyService,
        IdempotencyGuard,
    ],
    exports: [IdempotencyService, IdempotencyGuard],
})
export class IdempotencyModule {}
