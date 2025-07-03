import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

export enum OtpStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    EXPIRED = 'expired',
}

@Entity('otps')
@Index('IDX_OTP_STATUS', ['status'])
@Index('IDX_OTP_ACTIVE', ['active'])
export class Otp extends BaseEntity {
    @Column({
        type: 'enum',
        enum: OtpStatus,
        comment: 'Status of the OTP',
    })
    status: OtpStatus;

    @Column({
        type: 'varchar',
        length: 6,
        comment: 'OTP code',
    })
    otp: string;

    @Column({
        length: 15,
        unique: true,
        comment: 'Mobile phone number of the user',
    })
    @Index('idx_user_mobile')
    mobile: string;

    @Column({
        default: true,
        comment: 'Whether the OTP record is active or not',
    })
    active: boolean;
}
