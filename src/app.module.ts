// Import Modules
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Import Commons
import { ConfigurationConfigModule } from '@commons/config/configuration/configuration.module';
import { MongooseConfigModule } from '@commons/config/databases/mongoose/mongoose.module';
import { StaticConfigModule } from '@commons/config/static/static.module';
import { HelperConfigModule } from '@commons/lib/helper/helper.module';
import { ApiTransformInterceptor } from '@commons/interceptor/api-transform.interceptor';
import { ApiExceptionsFilter } from '@commons/filter/api-exception-filter';

// Import All Service Modules
import { CouponModule } from '@modules/coupon/coupon.module';
import { ParseModule } from '@modules/parse/parse.module';

// Import Service
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Define App Module
@Module({
    imports: [ConfigurationConfigModule, MongooseConfigModule, StaticConfigModule, HelperConfigModule, CouponModule, ParseModule],
    controllers: [AppController],
    providers: [
        { provide: APP_INTERCEPTOR, useClass: ApiTransformInterceptor },
        { provide: APP_FILTER, useClass: ApiExceptionsFilter },
        AppService,
    ],
})

// Export App Module
export class AppModule {}
