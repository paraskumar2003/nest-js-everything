import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { SanitationActivity } from './sanitation-activity.entity';

@Entity('sanitation_activity_photos')
@Index('IDX_SANITATION_ACTIVITY_ID', ['sanitationActivity'])
export class SanitationActivityPhoto extends BaseEntity {
    @ManyToOne(() => SanitationActivity, { nullable: false })
    @JoinColumn({ name: 'sanitation_activity_id' })
    sanitationActivity: SanitationActivity;

    @Column({
        type: 'text',
        name: 'image_url',
        comment: 'URL of the photo',
    })
    imageUrl: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Optional description of the photo',
    })
    description: string;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Indicates if the record is active',
    })
    active: boolean;
}
