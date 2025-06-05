import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { UserRole } from '../interfaces/user.interface';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'external_user_id' })
  externalUserId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER
  })
  role: UserRole;

  @Column()
  name: string;

  @Column({ default: true })
  active: boolean;
}