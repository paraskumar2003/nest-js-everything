import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}