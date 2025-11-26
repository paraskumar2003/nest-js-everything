import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';
import { KeyLockService } from './key-lock.service';
import { KeyLockGuard } from './key-lock.guard';

@Module({
    imports: [RedisModule],
    providers: [KeyLockService],
    exports: [KeyLockService, KeyLockGuard],
})
export class KeyLockModule {}
