import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Exclude()
export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    role: UserRole;

    @Expose()
    mobile: string;

    @Expose()
    email: string;

    @Expose()
    districtId: number;

    @Expose()
    active: boolean;

    @Expose()
    @Type(() => Date)
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    updatedAt: Date;

    // Include district information when populated
    @Expose()
    district?: {
        id: number;
        name: string;
    };
}
