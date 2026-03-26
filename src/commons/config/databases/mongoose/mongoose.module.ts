// Import Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Import Mongoose Config
import { MongooseConfigAsync } from './mongoose.config';

// Define Mongoose Config Module
@Module({
    imports: [MongooseModule.forRootAsync(MongooseConfigAsync)],
})

// Export Mongoose Config Module
export class MongooseConfigModule {}
