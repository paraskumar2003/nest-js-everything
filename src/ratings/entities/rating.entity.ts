import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('ratings')
export class Rating extends BaseEntity {
    @Column()
    scale: number;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn()
    user: User;

    @Column({ default: true })
    active: boolean;
}
