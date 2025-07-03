import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { District } from '../../../modules/districts/entities/district.entity';

@Entity('schools')
@Index('IDX_SCHOOL_NAME', ['name'])
@Index('IDX_DISTRICT_ID', ['district'])
@Index('IDX_BLOCK', ['block'])
export class School extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        comment: 'Name of the school',
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: 'Block where the school is located',
    })
    block: string;

    @Column({
        type: 'int',
        name: 'total_students',
        comment: 'Total number of students in the school',
    })
    totalStudents: number;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Is school active?',
    })
    active: boolean;

    @ManyToOne(() => District, district => district.id)
    @JoinColumn({ name: 'district_id' })
    district: District;
}
