import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class PaymentResponseDto {
  @Expose()
  id: number;

  @Expose()
  paidFor: number;

  @Expose()
  paidTo: number;

  @Expose()
  paidAmount: number;

  @Expose()
  upiId: string;

  @Expose()
  paymentStatus: string;

  @Expose()
  active: boolean;

  @Expose()
  @Type(() => Date)
  paidAt: Date;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}