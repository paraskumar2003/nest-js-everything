import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { School } from '../../../modules/schools/entities/school.entity';
import { User } from '../../../modules/users/entities/user.entity';
import { SanitationActivityIssue } from './sanitation-issues.entity';
import { SanitationActivityPhoto } from './sanitation-photos.entity';

export enum SanitationStatus {
    STARTED = 'Started',
    COMPLETED = 'Completed',
    SKIPPED = 'Skipped',
}

@Entity('sanitation_activities')
@Index('IDX_SCHOOL_ID', ['school'])
@Index('IDX_HSW_ID', ['hsw'])
@Index('IDX_DATE', ['date'])
@Index('IDX_SCHOOL_DATE', ['school', 'date'])
export class SanitationActivity extends BaseEntity {
    @ManyToOne(() => School, { nullable: false })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'hsw_id' })
    hsw: User;

    @Column({
        type: 'date',
        comment: 'Date of the sanitation activity',
    })
    date: string;

    @Column({
        type: 'enum',
        enum: SanitationStatus,
        comment: 'Status of the activity',
    })
    status: SanitationStatus;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates whether the record is active',
    })
    active: boolean;

    @OneToMany(
        () => SanitationActivityIssue,
        issue => issue.sanitationActivity,
        {
            cascade: true,
        },
    )
    issues: SanitationActivityIssue[];

    @OneToMany(
        () => SanitationActivityPhoto,
        photo => photo.sanitationActivity,
        {
            cascade: true,
        },
    )
    photos: SanitationActivityPhoto[];
}
