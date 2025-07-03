import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { School } from './school.entity';
import { SanitationActivity } from '../../../modules/activity/entities/sanitation-activity.entity';

@Entity('school_feedback')
@Index('IDX_SCHOOL_ID', ['school'])
@Index('IDX_SANITATION_ACTIVITY_ID', ['sanitationActivity'])
@Index('IDX_GIVEN_BY', ['givenBy'])
export class SchoolFeedback extends BaseEntity {
    @ManyToOne(() => School, { nullable: false })
    @JoinColumn({ name: 'school_id' })
    school: School;

    @Column({
        type: 'varchar',
        length: 255,
        name: 'given_by',
        comment: 'Name of the person who gave feedback',
    })
    givenBy: string;

    @ManyToOne(
        () => SanitationActivity,
        sanitationActivity => sanitationActivity.id,
        { nullable: false },
    )
    @JoinColumn({ name: 'sanitation_activity_id' })
    sanitationActivity: SanitationActivity;

    @Column({
        type: 'json',
        comment:
            'Ratings in structured format (e.g., { hygiene: 4, toilets: 3 })',
    })
    ratings: Record<string, any>;

    @Column({
        type: 'text',
        name: 'signature_url',
        nullable: true,
        comment: 'URL to the signature image',
    })
    signatureUrl: string;

    @Column({
        type: 'text',
        name: 'photo_url',
        nullable: true,
        comment: 'URL to the feedback photo',
    })
    photoUrl: string;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates if the feedback is active',
    })
    active: boolean;
}
