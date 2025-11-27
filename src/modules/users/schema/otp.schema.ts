import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base.schema';
 
export type OtpDocument = Otp & Document;
 
export enum OtpStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    EXPIRED = 'expired',
}
 
@Schema({
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'otps',
})
export class Otp extends BaseSchema {
    @Prop({
        required: true,
        enum: Object.values(OtpStatus),
        default: OtpStatus.PENDING,
        index: true,
    })
    status: OtpStatus;
 
    @Prop({
        required: true,
        minlength: 4,
        maxlength: 6,
    })
    otp: string;
 
    @Prop({
        required: true,
        index: true,
        minlength: 10,
        maxlength: 30,
    })
    email: string;
 
    @Prop({
        default: true,
        index: true,
    })
    active: boolean;
}
 
export const OtpSchema = SchemaFactory.createForClass(Otp);
 
// Additional indexes matching SQL indexes
OtpSchema.index({ status: 1 });
OtpSchema.index({ active: 1 });