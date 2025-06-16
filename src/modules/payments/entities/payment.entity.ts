import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from '../../users/entities/user.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

@Entity('payments')
export class Payment extends BaseEntity {
    @ManyToOne(() => Coupon, coupon => coupon.id, { nullable: false })
    @JoinColumn({ name: 'paid_for' })
    paidFor: Coupon;

    @ManyToOne(() => User, user => user.id, { nullable: false })
    @JoinColumn({ name: 'paid_to' })
    paidTo: User;

    @Column({
        name: 'paid_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    paidAt: Date;

    @Column({ name: 'paid_amount', type: 'decimal', precision: 10, scale: 2 })
    paidAmount: number;

    @Column({ name: 'upi_id', type: 'varchar', length: 255, nullable: true })
    upiId: string;

    @Column({
        name: 'payment_status',
        type: 'varchar',
        length: 20,
        default: 'pending',
    })
    paymentStatus: string;

    @Column({ default: true })
    active: boolean;
}
