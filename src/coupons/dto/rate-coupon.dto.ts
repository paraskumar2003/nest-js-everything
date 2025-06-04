import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class RateCouponDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  scale: number;
}