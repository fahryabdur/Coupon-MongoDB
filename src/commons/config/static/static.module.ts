// Import Modules
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as appRoot from 'app-root-path';

// Define Server Static Config Module
@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: `${appRoot}/../public`,
            serveRoot: '/api/image',
        }),
    ],
})

// Export Server Static Config Module
export class StaticConfigModule {}
