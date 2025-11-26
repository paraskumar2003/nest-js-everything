// src/modules/otps/dto/create-otp.dto.ts

import {
    IsEnum,
    IsMobilePhone,
    IsString,
    Length,
    IsBoolean,
    IsOptional,
} from 'class-validator';
import { OtpStatus } from '../../entities/otp.entity';

export class CreateOtpDto {
    @IsEnum(OtpStatus, {
        message: 'Status must be one of: pending, verified, expired',
    })
    status: OtpStatus;

    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp: string;

    @IsMobilePhone(
        'en-IN',
        {},
        { message: 'Mobile number must be a valid Indian mobile number' },
    )
    mobile: string;

    @IsOptional()
    @IsBoolean({ message: 'Active must be a boolean value' })
    active?: boolean = true;
}
