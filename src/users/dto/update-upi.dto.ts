import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUpiDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  upi_id: string;
}