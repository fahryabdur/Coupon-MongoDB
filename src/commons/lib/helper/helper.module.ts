// Import Modules
import { Global, Module } from '@nestjs/common';

// Import Helper Service
import { HelperService } from './helper.service';

// Define Helper Config Module
@Global()
@Module({
    providers: [HelperService],
    exports: [HelperService],
})

// Export Helper Config Module
export class HelperConfigModule {}
