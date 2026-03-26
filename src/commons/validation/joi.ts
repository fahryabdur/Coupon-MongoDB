// Import Modules
import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';

export abstract class JoiValidationPipe implements PipeTransform {
    public async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
        try {
            await this.buildSchema().validateAsync(value);
            return value;
        } catch (error) {
            const getMessage = error.message.replace(/\"/g, '');
            const getParams = error.details?.[0]?.path ?? [''];

            throw new BadRequestException(getParams, getMessage);
        }
    }

    public abstract buildSchema(): Joi.Schema;
}
