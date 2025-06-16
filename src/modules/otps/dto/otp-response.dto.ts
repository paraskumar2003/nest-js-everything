import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class OtpResponseDto {
  @Expose()
  id: number;

  @Expose()
  mobile: string;

  @Expose()
  verified: boolean;

  @Expose()
  @Type(() => Date)
  verifiedAt: Date;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}