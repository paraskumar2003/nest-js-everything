import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Coupon } from './entities/coupon.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsModule } from '../payments/payments.module';
import { IdempotencyModule } from 'src/idempotency/idempotency.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Coupon, User]),
        PaymentsModule,
        IdempotencyModule,
        RatingsModule,
    ],
    controllers: [CouponsController],
    providers: [CouponsService],
    exports: [CouponsService],
})
export class CouponsModule {}
