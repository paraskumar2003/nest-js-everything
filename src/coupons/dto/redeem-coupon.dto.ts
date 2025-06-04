import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemCouponDto {
  @IsString()
  @IsNotEmpty()
  coupon_code: string;
}