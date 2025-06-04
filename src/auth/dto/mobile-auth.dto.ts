import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class MobileAuthDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile: string;
}