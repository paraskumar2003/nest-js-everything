import { IsNotEmpty, IsNumber, IsString, Length, Matches, Max, Min } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(100000)
  @Max(999999)
  otp: number;
}