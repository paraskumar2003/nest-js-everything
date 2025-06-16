import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('coupons')
@Unique('unique_coupon_user', ['couponCode', 'redeemedBy'])
export class Coupon extends BaseEntity {
    @Column({ name: 'coupon_code', length: 50, unique: true })
    @Index('idx_coupon_code')
    couponCode: string;

    @Column({ name: 'is_redeemed', default: false })
    isRedeemed: boolean;

    @Column({ name: 'redeemed_at', nullable: true })
    redeemedAt: Date;

    @Column({ default: true })
    active: boolean;

    @ManyToOne(() => User, user => user.redeemedCoupons, { nullable: true })
    @JoinColumn({ name: 'redeemed_by' })
    redeemedBy: User;
}
