import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class DistrictResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    @Type(() => Date)
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    updatedAt: Date;
}
