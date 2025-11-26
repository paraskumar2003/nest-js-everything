// src/modules/otps/dto/update-otp.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateOtpDto } from './create-otp.dto';
import {
    IsOptional,
    IsEnum,
    IsString,
    Length,
    IsMobilePhone,
    IsBoolean,
} from 'class-validator';
import { OtpStatus } from '../../entities/otp.entity';

export class UpdateOtpDto extends PartialType(CreateOtpDto) {
    @IsOptional()
    @IsEnum(OtpStatus, {
        message: 'Status must be one of: pending, verified, expired',
    })
    status?: OtpStatus;

    @IsOptional()
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    otp?: string;

    @IsOptional()
    @IsMobilePhone(
        'en-IN',
        {},
        { message: 'Mobile number must be a valid Indian mobile number' },
    )
    mobile?: string;

    @IsOptional()
    @IsBoolean({ message: 'Active must be a boolean value' })
    active?: boolean;
}
