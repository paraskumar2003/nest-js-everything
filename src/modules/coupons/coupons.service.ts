import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponRedemptionResponseDto } from './dto/coupon-response.dto';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { RatingsService } from '../ratings/ratings.service';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly paymentsService: PaymentsService,
        private readonly ratingsService: RatingsService,
        private readonly dataSource: DataSource,
    ) {}

    async redeemCoupon(
        couponCode: string,
        userId: number,
    ): Promise<CouponRedemptionResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const existingRedemption = await queryRunner.manager.findOne(
                Coupon,
                {
                    where: { redeemedBy: { id: userId } },
                },
            );

            const coupon = await queryRunner.manager.findOne(Coupon, {
                where: { couponCode, active: true },
                lock: { mode: 'pessimistic_write' },
            });

            if (!coupon) {
                throw new Error('COUPON_NOT_FOUND');
            }

            if (coupon.isRedeemed) {
                throw new Error('COUPON_ALREADY_REDEEMED');
            }

            const user = await queryRunner.manager.findOne(User, {
                where: { id: userId },
            });

            if (!user) {
                throw new Error('USER_NOT_FOUND');
            }

            coupon.isRedeemed = true;
            coupon.redeemedBy = user;
            coupon.redeemedAt = new Date();
            await queryRunner.manager.save(coupon);

            if (existingRedemption) {
                await queryRunner.commitTransaction();
                return {
                    success: true,
                    message: 'You are already gratified',
                    data: {
                        isGratified: 0,
                        amount: 0,
                        message: 'Thankyou for your participation',
                    },
                };
            }

            if (!user.upiId) {
                throw new Error('Please add or confirm UPI id first');
            }

            await this.paymentsService.create(
                {
                    paidFor: coupon.id,
                    paidTo: userId,
                    paidAmount: 40,
                },
                queryRunner,
            );

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: 'User Gratified Successfully',
                data: {
                    isGratified: 1,
                    amount: 40,
                    message:
                        'You won a cashback of Rs.40. Your cashback will be credited in next 24-48 hours.',
                },
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async rateCoupon(userId: number, scale: number) {
        const user = await this.userRepository.findOneBy({ id: userId });

        const rating = await this.ratingsService.create({
            user,
            scale,
        });

        return {
            success: true,
            message: 'Rating submitted successfully',
            data: rating,
        };
    }
}
