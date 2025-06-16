import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  couponCode: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}