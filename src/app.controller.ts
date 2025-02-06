import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Welcome')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('welcome')
    async getWelcomeController(): Promise<string> {
        return await this.appService.getWelcome();
    }
}
