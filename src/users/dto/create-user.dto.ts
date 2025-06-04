import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  upiId?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}