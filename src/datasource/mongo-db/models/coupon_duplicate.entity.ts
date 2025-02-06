// Import Modules
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Define Coupon Duplicate Document
export type CouponDuplicateDocument = HydratedDocument<CouponDuplicate>;

@Schema({ collection: 'coupon_duplicate', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CouponDuplicate {
    @Prop({ isRequired: true })
    coupon: string;

    @Prop({ isRequired: true })
    filename: string;

    @Prop({ isRequired: true })
    length: number;

    @Prop({ default: 0 })
    is_delete: number;

    @Prop({ default: null })
    deleted_at: Date;
}

// Define Coupon Duplicate Schema
export const CouponDuplicateSchema = SchemaFactory.createForClass(CouponDuplicate);
