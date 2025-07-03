import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ChecklistTypeEnum } from '../enums/checklisttype.enum';

@Entity('checklist_types')
export class ChecklistType extends BaseEntity {
    @Column({
        type: 'enum',
        enum: ChecklistTypeEnum,
        comment: 'Checklist category type',
    })
    type: ChecklistTypeEnum;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates if the checklist is active',
    })
    active: boolean;
}
