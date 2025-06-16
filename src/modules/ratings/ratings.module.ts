import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from './entities/rating.entity';
import { IdempotencyModule } from 'src/idempotency/idempotency.module';

@Module({
    imports: [TypeOrmModule.forFeature([Rating]), IdempotencyModule],
    controllers: [RatingsController],
    providers: [RatingsService],
    exports: [RatingsService],
})
export class RatingsModule {}
