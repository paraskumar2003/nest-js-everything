import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity('otps')
export class Otp extends BaseEntity {
  @Column({ length: 15 })
  @Index('idx_otp_mobile')
  mobile: string;

  @Column()
  otp: number;

  @Column({ default: false })
  verified: boolean;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;
}