// Import Modules
import { SetMetadata } from '@nestjs/common';

// Import Interfaces
import { RoleEnum } from './interfaces';

// Define Roles Decorator
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
