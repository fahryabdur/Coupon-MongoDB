// Import Modules
import { registerAs } from '@nestjs/config';

// Define Prefix Config DB
export default registerAs('db', () => ({
    SERVICE_MONGO_DB_HOST: process.env.SERVICE_MONGO_DB_HOST,
    SERVICE_MONGO_DB_USER: process.env.SERVICE_MONGO_DB_USER,
    SERVICE_MONGO_DB_PASS: process.env.SERVICE_MONGO_DB_PASS,
    SERVICE_MONGO_DB_AUTH: process.env.SERVICE_MONGO_DB_AUTH,
    SERVICE_MONGO_DB_REPLICA: process.env.SERVICE_MONGO_DB_REPLICA,
}));
