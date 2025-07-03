import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('districts')
@Index('IDX_DISTRICT_NAME', ['name']) // Index on district name
export class District extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        comment: 'Name of the district',
    })
    name: string;

    // Relationship: One district can have many users
    @OneToMany(() => User, user => user.district)
    users: User[];
}
