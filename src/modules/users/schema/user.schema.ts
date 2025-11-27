import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from 'src/common/base.schema';

export type MongoUserDocument = User & Document;

// Enum for roles
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Schema({
    timestamps: { createdAt: 'registered_at', updatedAt: true },
    collection: 'users',
})
export class User extends BaseSchema {
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: true })
    is_active: boolean;

    @Prop({
        type: [String],
        enum: Object.values(UserRole),
        default: [UserRole.USER],
    })
    roles: UserRole[];
}

export const MongoUserSchema = SchemaFactory.createForClass(User);
