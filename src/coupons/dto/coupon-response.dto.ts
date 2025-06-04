export class CouponRedemptionResponseDto {
  success: boolean;
  message: string;
  data: {
    isGratified: number;
    amount: number;
    message: string;
  };
}