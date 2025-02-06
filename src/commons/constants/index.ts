// Import Modules
import { config } from 'dotenv';
config();

// Define Service Constants Variables
const SERVICE_ENV_DEVELOPMENT = process.env.NODE_ENV === 'development';
const SERVICE_NAME = process.env.SERVICE_NAME;
const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL;

// Export All Constants
export { SERVICE_ENV_DEVELOPMENT, SERVICE_NAME, SERVICE_BASE_URL };
