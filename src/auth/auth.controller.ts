import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MobileAuthDto } from './dto/mobile-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CustomLoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { IdempotencyGuard } from 'src/idempotency';

@Controller('auth')
@UseGuards(IdempotencyGuard)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post('mobile')
    async authenticateMobile(@Body() mobileAuthDto: MobileAuthDto) {
        const journeyId = uuidv4();
        this.logger.info('AUTH_MOBILE_REQUEST', journeyId, {
            mobile: mobileAuthDto.mobile,
        });

        const result = await this.authService.authenticateMobile(
            mobileAuthDto.mobile,
        );

        this.logger.info('AUTH_MOBILE_RESPONSE', journeyId, { result });
        return result;
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        const journeyId = uuidv4();
        this.logger.info('VERIFY_OTP_REQUEST', journeyId, {
            mobile: verifyOtpDto.mobile,
            otp: verifyOtpDto.otp,
        });

        const result = await this.authService.verifyOtp(verifyOtpDto);

        this.logger.info('VERIFY_OTP_RESPONSE', journeyId, { result });
        return result;
    }
}
