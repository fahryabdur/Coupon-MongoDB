// Import Modules
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Define Users Decorator
export const Users = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const getRequest = ctx.switchToHttp().getRequest();
    const getUser = getRequest?.user;

    return getUser;
});
