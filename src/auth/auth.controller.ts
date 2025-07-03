import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MobileAuthDto } from './dto/mobile-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CustomLoggerService } from '../logger/logger.service';
import { IdempotencyGuard } from '../idempotency/key-guard/idempotency.guard';
import { v4 as uuidv4 } from 'uuid';
import { RegisterHSWDto } from './dto/hsw/regsiter-hsw.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post('mobile')
    @UseGuards(IdempotencyGuard)
    async authenticateMobile(@Body() mobileAuthDto: MobileAuthDto) {
        const journeyId = uuidv4();
        this.logger.info('AUTH_MOBILE_REQUEST', journeyId, {
            mobile: mobileAuthDto.mobile,
        });

        try {
            const result = await this.authService.authenticateMobile(
                mobileAuthDto.mobile,
            );

            this.logger.info('AUTH_MOBILE_RESPONSE', journeyId, { result });
            return result;
        } catch (error) {
            this.logger.error('AUTH_MOBILE_ERROR', journeyId, {
                mobile: mobileAuthDto.mobile,
                error: error.message,
            });
            throw error;
        }
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        const journeyId = uuidv4();
        this.logger.info('VERIFY_OTP_REQUEST', journeyId, {
            mobile: verifyOtpDto.mobile,
            otp: verifyOtpDto.otp,
        });

        try {
            const result = await this.authService.verifyOtp(verifyOtpDto);

            this.logger.info('VERIFY_OTP_RESPONSE', journeyId, {
                success: result.success,
                verified: result.data.verified,
            });
            return result;
        } catch (error) {
            this.logger.error('VERIFY_OTP_ERROR', journeyId, {
                mobile: verifyOtpDto.mobile,
                error: error.message,
            });
            throw error;
        }
    }

    @Post('register')
    async register(@Body() registerHSWDto: RegisterHSWDto) {
        const journeyId = uuidv4();
        this.logger.info('REGISTER_HSW_REQUEST', journeyId, {
            mobile: registerHSWDto.mobile,
            name: registerHSWDto.name,
            districtId: registerHSWDto.district,
        });
        try {
            const result = await this.authService.registerHSW(registerHSWDto);
            this.logger.info('REGISTER_HSW_RESPONSE', journeyId, {
                success: result.success,
                userId: result.data.userId,
            });
            return result;
        } catch (error) {
            this.logger.error('REGISTER_HSW_ERROR', journeyId, {
                mobile: registerHSWDto.mobile,
                error: error.message,
            });
            throw error;
        }
    }
}
