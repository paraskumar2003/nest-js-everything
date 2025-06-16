import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ length: 15, unique: true })
    @Index('idx_user_mobile')
    mobile: string;

    @Column({ default: true })
    active: boolean;

    @Column({ name: 'upi_id', length: 255, nullable: true })
    upiId: string;

    @Column({ name: 'is_custom_upi', default: false })
    isCustomUpi: boolean;

    @OneToMany(() => Coupon, coupon => coupon.redeemedBy)
    redeemedCoupons: Coupon[];
}
