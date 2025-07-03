import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ChecklistType } from './checklist-type.entity';

@Entity('checklist_parameters')
@Index('IDX_CHECKLIST_TYPE_ID', ['checklistType']) // Index on foreign key
export class ChecklistParameter extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        comment: 'Name of the checklist parameter',
    })
    parameter: string;

    @Column({
        type: 'text',
        name: 'parameter_description',
        nullable: true,
        comment: 'Detailed description of the checklist parameter',
    })
    parameterDescription: string;

    @ManyToOne(() => ChecklistType, { nullable: false })
    @JoinColumn({ name: 'checklist_type_id' })
    checklistType: ChecklistType;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates if the parameter is active',
    })
    active: boolean;
}
