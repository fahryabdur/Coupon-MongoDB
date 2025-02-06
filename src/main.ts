// Import Modules
import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { logger } from 'express-winston';
import helmet from 'helmet';

// Import Commons
import { apiLogger } from '@commons/logger';
import { apiSwaggerConfig } from '@commons/config/swagger/api-swagger.config';

// Import App Modules
import { AppModule } from './app.module';

// Define App Bootsrap
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const SERVICE_PORT = configService.get('app.SERVICE_PORT');
    const SERVICE_PREFIX = configService.get('app.SERVICE_PREFIX');
    const SERVICE_DEFAULT_VERSION = configService.get('app.SERVICE_DEFAULT_VERSION');
    const SERVICE_DOCS = configService.get('app.SERVICE_DOCS');

    app.enableCors();
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: SERVICE_DEFAULT_VERSION,
    });

    app.use(json());
    app.use(urlencoded({ extended: true }));
    app.use(helmet());
    app.use(logger(apiLogger));

    app.setGlobalPrefix(SERVICE_PREFIX);

    if (SERVICE_DOCS) {
        const swaggerConfig = await apiSwaggerConfig(app);
        SwaggerModule.setup('/api/docs', app, swaggerConfig);
    }

    await app.listen(SERVICE_PORT, () => {
        new Logger('Bootstrap').log(`Service Running on Port ${SERVICE_PORT}`);
    });
}

bootstrap();
