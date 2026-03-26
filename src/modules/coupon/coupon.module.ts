import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '@datasource/mongo-db/models/coupon.entity';
import { CouponDuplicate, CouponDuplicateSchema } from '@datasource/mongo-db/models/coupon_duplicate.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Coupon.name, schema: CouponSchema },
            { name: CouponDuplicate.name, schema: CouponDuplicateSchema },
        ]),
    ],
    controllers: [CouponController],
    providers: [CouponService],
})
export class CouponModule {}
