import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
 
export class VerifyEmailOtpDto {
    @IsEmail()
    email: string;
 
    @IsNotEmpty({ message: 'OTP is required' })
    @IsString({ message: 'OTP must be a string' })
    @Length(6, 6, { message: 'OTP must be 6 characters long' })
    otp: string;
}
 