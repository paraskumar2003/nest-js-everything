import { IsNotEmpty, IsNumber, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateOtpDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile: string;

  @IsNumber()
  @Min(100000)
  @Max(999999)
  otp: number;
}