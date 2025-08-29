import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { UserStatus } from '../enum/user-status.enum';

export enum UserRole {
    HSW = 'HSW',
    DC = 'DC',
    TRAINER = 'Trainer',
    ADMIN = 'Admin',
    RECKITT = 'Reckitt',
}

@Entity('users')
@Index('IDX_USER_NAME', ['name'])
@Index('IDX_USER_ROLE', ['role'])
@Index('IDX_USER_ACTIVE', ['active'])
export class User extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        comment: 'Full name of the user',
    })
    name: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        comment:
            'Role of the user in the system (HSW, DC, Trainer, Admin, Reckitt)',
    })
    role: UserRole;

    @Column({
        length: 15,
        unique: true,
        comment: 'Mobile phone number of the user',
    })
    @Index('idx_user_mobile') // already present
    mobile: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Email address of the user',
    })
    @Index('IDX_USER_EMAIL')
    email: string;

    @Column({
        default: true,
        comment: 'Whether the user account is active or not',
    })
    active: boolean;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.Active })
    status: UserStatus;
}
