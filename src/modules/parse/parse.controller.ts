import { Body, Controller, Post, Res } from '@nestjs/common';
import { ParseService } from './parse.service';
import { ApiTags } from '@nestjs/swagger';
import { ParseCsvDto, RewriteCsvDto } from './dto/parse.dto';
import { Response } from 'express';

@ApiTags('Parse')
@Controller('parse')
export class ParseController {
    constructor(private readonly parseService: ParseService) {}

    @Post('/csv')
    async parseCsv(@Res() res: Response, @Body() dto: ParseCsvDto) {
        res.status(200).send({
            statusCode: 200,
            message: 'Success',
        });

        return await this.parseService.parseCsv(dto);
    }

    @Post('/rewrite-csv')
    async rewriteCsv(@Body() dto: RewriteCsvDto) {
        return await this.parseService.rewriteCsv(dto);
    }

    @Post('/report-csv')
    async reportCsv(@Res() res: Response) {
        res.status(200).send({
            statusCode: 200,
            message: 'Success',
        });

        return await this.parseService.reportCsv();
    }
}
