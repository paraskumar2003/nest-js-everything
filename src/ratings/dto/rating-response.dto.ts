import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class RatingResponseDto {
  @Expose()
  id: number;

  @Expose()
  scale: number;

  @Expose()
  userId: string;

  @Expose()
  active: boolean;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}