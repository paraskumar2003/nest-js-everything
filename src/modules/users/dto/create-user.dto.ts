import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    name: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @IsString()
    @IsNotEmpty()
    @Length(10, 15)
    @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
    mobile: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
