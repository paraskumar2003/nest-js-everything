import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { SanitationActivity } from '../../../modules/activity/entities/sanitation-activity.entity';
import { ChecklistType } from './checklist-type.entity';
import { ChecklistParameter } from './checklist-parameter.entity';
import { User } from '../../../modules/users/entities/user.entity';

@Entity('checklist_submissions')
@Unique('IDX_ACTIVITY_TYPE_UNIQUE', ['sanitationActivity', 'checklistType'])
@Index('IDX_SANITATION_ACTIVITY', ['sanitationActivity'])
@Index('IDX_CHECKLIST_TYPE', ['checklistType'])
@Index('IDX_CHECKLIST_PARAMETER', ['checklistParameter'])
@Index('IDX_HSW', ['hsw'])
export class ChecklistSubmission extends BaseEntity {
    @ManyToOne(() => SanitationActivity, { nullable: false })
    @JoinColumn({ name: 'sanitation_activity_id' })
    sanitationActivity: SanitationActivity;

    @ManyToOne(() => ChecklistType, { nullable: false })
    @JoinColumn({ name: 'checklist_type_id' })
    checklistType: ChecklistType;

    @ManyToOne(() => ChecklistParameter, { nullable: false })
    @JoinColumn({ name: 'checklist_parameter_id' })
    checklistParameter: ChecklistParameter;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'hsw_id' })
    hsw: User;

    @Column({
        type: 'varchar',
        length: 255,
        comment: 'Submitted value for the checklist parameter',
    })
    value: string;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates if the submission is active',
    })
    active: boolean;
}
