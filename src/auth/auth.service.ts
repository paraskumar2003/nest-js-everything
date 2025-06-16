import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpsService } from 'src/modules/otps/otps.service';
import { UsersService } from 'src/modules/users/users.service';
import { SmsService } from 'src/modules/sms/sms.service';
import { MobileAuthResponseDto } from './dto/mobile-auth-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly otpsService: OtpsService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly smsService: SmsService,
    ) {}

    async authenticateMobile(mobile: string): Promise<MobileAuthResponseDto> {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Save OTP
        await this.otpsService.create({
            mobile,
            otp,
        });

        // Send OTP via SMS
        const smsSent = await this.smsService.sendOtp(mobile, otp);

        if (!smsSent) {
            throw new BadRequestException('Failed to send OTP');
        }

        return {
            success: true,
            message: 'An OTP has been sent to your mobile number',
            data: null,
        };
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
        const result = await this.otpsService.verifyOtp(verifyOtpDto);

        if (!result.success) {
            return {
                success: false,
                message: 'Incorrect OTP',
                data: {
                    access_token: null,
                    verified: false,
                },
            };
        }

        // Find or create user
        let user = await this.usersService.findByMobile(verifyOtpDto.mobile);

        if (!user) {
            user = await this.usersService.create({
                mobile: verifyOtpDto.mobile,
                active: true,
            });
        }

        // Generate JWT token with user details
        const token = this.jwtService.sign({
            id: user.id,
            mobile: user.mobile,
            active: user.active,
        });

        return {
            success: true,
            message: 'OTP verified Successfully',
            data: {
                access_token: token,
                verified: true,
            },
        };
    }
}
