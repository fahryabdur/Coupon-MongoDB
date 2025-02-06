// Import Modules
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Import Configuration
import configSchema from './configuration.pipe';
import prefix from './prefix';

// Define Configuration Config Module
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: configSchema,
            load: prefix,
        }),
    ],
})

// Export Configuration Config Module
export class ConfigurationConfigModule {}
