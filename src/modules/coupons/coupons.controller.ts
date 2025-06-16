import {
    Controller,
    Post,
    Body,
    UseGuards,
    BadRequestException,
    ForbiddenException,
    Request,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';
import { RateCouponDto } from './dto/rate-coupon.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IdempotencyGuard } from 'src/idempotency/idempotency.guard';
import { CustomLoggerService } from 'src/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('coupon')
@UseGuards(JwtAuthGuard)
export class CouponsController {
    constructor(
        private readonly couponsService: CouponsService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post('redeem')
    @UseGuards(IdempotencyGuard)
    async redeemCoupon(
        @Request() req,
        @Body() redeemCouponDto: RedeemCouponDto,
    ) {
        const journeyId = uuidv4();
        this.logger.info('REDEEM_COUPON_REQUEST', journeyId, {
            couponCode: redeemCouponDto.coupon_code,
            userId: req.user.id,
        });

        try {
            const result = await this.couponsService.redeemCoupon(
                redeemCouponDto.coupon_code,
                req.user.id,
            );

            if (
                result.data.isGratified === 0 &&
                result.message === 'You are already gratified'
            ) {
                this.logger.warn('REDEEM_COUPON_ALREADY_GRATIFIED', journeyId, {
                    userId: req.user.id,
                    couponCode: redeemCouponDto.coupon_code,
                });
            } else {
                this.logger.info('REDEEM_COUPON_SUCCESS', journeyId, {
                    result,
                });
            }

            return result;
        } catch (error) {
            if (error.message === 'COUPON_NOT_FOUND') {
                this.logger.warn('REDEEM_COUPON_NOT_FOUND', journeyId, {
                    couponCode: redeemCouponDto.coupon_code,
                });
                return {
                    success: false,
                    message: 'No such coupon code found !!',
                    data: {
                        isGratified: 0,
                        amount: 0,
                        message: 'Please enter a valid coupon !',
                    },
                };
            }

            if (error.message === 'COUPON_ALREADY_REDEEMED') {
                this.logger.warn('REDEEM_COUPON_ALREADY_REDEEMED', journeyId, {
                    couponCode: redeemCouponDto.coupon_code,
                });
                throw new ForbiddenException({
                    success: false,
                    message: 'Coupon already redeemed!!',
                    data: {
                        isGratified: 0,
                        amount: 0,
                        message: 'This coupon is already redeemed',
                    },
                });
            }

            this.logger.error('REDEEM_COUPON_ERROR', journeyId, {
                error: error.message,
                couponCode: redeemCouponDto.coupon_code,
            });
            throw new BadRequestException(error.message);
        }
    }

    @Post('rating')
    @UseGuards(IdempotencyGuard)
    async rateCoupon(@Request() req, @Body() rateCouponDto: RateCouponDto) {
        const journeyId = uuidv4();
        this.logger.info('RATE_COUPON_REQUEST', journeyId, {
            userId: req.user.mobile,
            scale: rateCouponDto.scale,
        });

        try {
            const result = await this.couponsService.rateCoupon(
                req.user.id,
                rateCouponDto.scale,
            );

            this.logger.info('RATE_COUPON_SUCCESS', journeyId, { result });
            return result;
        } catch (error) {
            this.logger.error('RATE_COUPON_ERROR', journeyId, {
                error: error.message,
                userId: req.user.mobile,
            });
            throw new BadRequestException(error.message);
        }
    }
}
