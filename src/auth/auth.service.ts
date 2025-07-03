import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { MobileAuthResponseDto } from './dto/mobile-auth-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';
import { CustomLoggerService } from 'src/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { RegisterHSWDto } from './dto/hsw/regsiter-hsw.dto';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { DistrictsService } from 'src/modules/districts/districts.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly districtService: DistrictsService,
        private readonly logger: CustomLoggerService,
    ) {
        this.logger = logger;
    }

    async authenticateMobile(mobile: string): Promise<MobileAuthResponseDto> {
        let journeyId = uuidv4();
        let user = await this.usersService.findByMobile(mobile);

        this.logger.info('USER_LOGIN_REQUEST', journeyId, {
            mobile,
            user,
            found: !!user,
        });

        if (!user) {
            throw new BadRequestException(
                'User not found. Please register first.',
            );
        }

        // Generate and send OTP
        const otp = await this.usersService.generateOtp(mobile);

        this.logger.info('OTP_GENERATED', journeyId, {
            mobile,
            otp, // In production, don't log the actual OTP
        });

        // In a real application, you would send the OTP via SMS here
        // For now, we'll just log it for testing purposes
        console.log(`OTP for ${mobile}: ${otp}`);

        return {
            success: true,
            message: 'OTP sent. Please verify to log in.',
            data: null,
        };
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
        const journeyId = uuidv4();

        // Find user
        let user = await this.usersService.findByMobile(verifyOtpDto.mobile);

        if (!user) {
            this.logger.error('VERIFY_OTP_USER_NOT_FOUND', journeyId, {
                mobile: verifyOtpDto.mobile,
            });
            return {
                success: false,
                message: 'User not found. Please contact administrator.',
                data: {
                    access_token: null,
                    verified: false,
                },
            };
        }

        // Verify OTP
        const isOtpValid = await this.usersService.verifyOtp(
            verifyOtpDto.mobile,
            verifyOtpDto.otp,
        );

        if (!isOtpValid) {
            this.logger.error('VERIFY_OTP_INVALID', journeyId, {
                mobile: verifyOtpDto.mobile,
                otp: verifyOtpDto.otp,
            });
            return {
                success: false,
                message: 'OTP did not match.',
                data: {
                    access_token: null,
                    verified: false,
                },
            };
        }

        // Generate JWT token with user details
        const token = this.jwtService.sign({
            id: user.id,
            mobile: user.mobile,
            role: user.role,
            active: user.active,
        });

        this.logger.info('VERIFY_OTP_SUCCESS', journeyId, {
            mobile: verifyOtpDto.mobile,
            userId: user.id,
        });

        return {
            success: true,
            message: 'User verified successfully!',
            data: {
                access_token: token,
                verified: true,
            },
        };
    }

    async registerHSW(registerHwsDto: RegisterHSWDto): Promise<any> {
        const journeyId = uuidv4();
        let district = await this.districtService.findByName(
            registerHwsDto.district,
        );

        if (!district) {
            this.logger.error('REGISTER_HSW_DISTRICT_NOT_FOUND', journeyId, {
                districtId: registerHwsDto.district,
            });
            throw new BadRequestException('District not found.');
        }

        let isUserAlreadyExists = await this.usersService.findByMobile(
            registerHwsDto.mobile.trim(),
        );

        if (isUserAlreadyExists) {
            throw new BadRequestException('User already exists!');
        }

        const user = await this.usersService.create({
            name: registerHwsDto.name,
            mobile: registerHwsDto.mobile,
            role: UserRole.HSW,
            districtId: district.id,
        });
        return {
            success: true,
            message: 'HSW registered successfully!',
            data: {
                userId: user.id,
            },
        };
    }
}
