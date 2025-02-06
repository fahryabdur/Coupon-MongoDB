// Import All Entities Schema
import { CouponSchema } from './coupon.entity';
import { CouponDuplicateSchema } from './coupon_duplicate.entity';

// Define All Mongo Entities
export const MongoDbEntitiesModels = [
    {
        name: 'Coupon',
        schema: CouponSchema,
    },
    {
        name: 'Coupon_Duplicate',
        schema: CouponDuplicateSchema,
    },
];
