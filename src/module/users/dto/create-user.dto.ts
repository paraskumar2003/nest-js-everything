import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { UserRole } from '../interfaces/user.interface';

export class CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  external_user_id: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}