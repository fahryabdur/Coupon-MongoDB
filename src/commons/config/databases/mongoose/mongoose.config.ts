// Import Modules
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions, MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

// Define Mongoose Options
export class MongooseConfig implements MongooseOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    public createMongooseOptions(): MongooseModuleOptions {
        return {
            uri: this.configService.get('db.SERVICE_MONGO_DB_HOST'),
            user: this.configService.get('db.SERVICE_MONGO_DB_USER'),
            pass: this.configService.get('db.SERVICE_MONGO_DB_PASS'),
            authSource: this.configService.get('db.SERVICE_MONGO_DB_AUTH'),
            replicaSet: this.configService.get('db.SERVICE_MONGO_DB_REPLICA'),
            retryWrites: true,
            authMechanism: 'DEFAULT',
            connectTimeoutMS: 30000,
        };
    }
}

// Define Mongoose Config
export const MongooseConfigAsync: MongooseModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => {
        return new MongooseConfig(configService).createMongooseOptions();
    },
};
