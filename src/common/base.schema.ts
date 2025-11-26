import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BaseSchema {
    @Prop({ type: Date, default: Date.now })
    created_at: Date;

    @Prop({ type: Date, default: Date.now })
    updated_at: Date;

    @Prop({ type: Date, default: null })
    deleted_at: Date | null;
}
