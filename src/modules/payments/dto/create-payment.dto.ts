import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  paidFor: number;

  @IsNotEmpty()
  @IsNumber()
  paidTo: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  paidAmount: number;
}