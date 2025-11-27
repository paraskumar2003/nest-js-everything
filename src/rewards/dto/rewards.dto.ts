import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRewardDto {
  
  @IsString()
  name: string;

  @IsNumber()
  points: number;

  @IsOptional()
  @IsString()
  description?: string;
}
