import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { SanitationActivity } from './sanitation-activity.entity';
import { User } from '../../../modules/users/entities/user.entity';

@Entity('sanitation_activity_issues')
@Index('IDX_SANITATION_ACTIVITY_ID', ['sanitationActivity'])
@Index('IDX_RAISED_BY_ID', ['raisedBy'])
@Index('IDX_IS_RESOLVED', ['isResolved'])
export class SanitationActivityIssue extends BaseEntity {
    @ManyToOne(() => SanitationActivity, { nullable: false })
    @JoinColumn({ name: 'sanitation_activity_id' })
    sanitationActivity: SanitationActivity;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'raise_by' })
    raisedBy: User;

    @Column({
        type: 'boolean',
        name: 'is_resolved',
        default: false,
        comment: 'Indicates whether the issue has been resolved',
    })
    isResolved: boolean;

    @Column({
        type: 'text',
        comment: 'Title or brief of the issue',
    })
    issue: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Detailed description of the issue',
    })
    description: string;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates if the record is active',
    })
    active: boolean;
}
