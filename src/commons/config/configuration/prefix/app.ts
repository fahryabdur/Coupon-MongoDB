// Import Modules
import { registerAs } from '@nestjs/config';

// Define Prefix Config App
export default registerAs('app', () => ({
    SERVICE_PORT: process.env.SERVICE_PORT,
    SERVICE_NAME: process.env.SERVICE_NAME,
    SERVICE_PREFIX: process.env.SERVICE_PREFIX,
    SERVICE_DEFAULT_VERSION: process.env.SERVICE_DEFAULT_VERSION,
    SERVICE_DOCS: process.env.SERVICE_DOCS,
    SERVICE_BASE_URL: process.env.SERVICE_BASE_URL,
}));
