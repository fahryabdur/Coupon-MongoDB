// Import Modules
import * as Joi from 'joi';

// Define All Config Schema
const configSchema = Joi.object({
    SERVICE_PORT: Joi.number().required(),
    SERVICE_NAME: Joi.string().required(),
    SERVICE_PREFIX: Joi.string().required(),
    SERVICE_DEFAULT_VERSION: Joi.string().required(),
    SERVICE_DOCS: Joi.string().allow(''),
    SERVICE_BASE_URL: Joi.string().required(),
    SERVICE_MONGO_DB_HOST: Joi.string().required(),
    SERVICE_MONGO_DB_USER: Joi.string().allow(''),
    SERVICE_MONGO_DB_PASS: Joi.string().allow(''),
    SERVICE_MONGO_DB_AUTH: Joi.string().allow(''),
    SERVICE_MONGO_DB_REPLICA: Joi.string().allow(''),
});

// Export Config Schema
export default configSchema;
