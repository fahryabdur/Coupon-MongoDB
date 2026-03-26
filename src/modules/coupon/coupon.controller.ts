import { Controller, Get, Res } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Coupon')
@Controller('coupon')
export class CouponController {
    constructor(private readonly couponService: CouponService) {}

    @Get('/insert-csv')
    async processInsertCsvController() {
        return await this.couponService.processAllCSVFiles();
    }

    @Get('/process-duplicate')
    async processDuplicateCsvController(@Res() res: Response) {
        res.status(200).send({
            statusCode: 200,
            message: 'Success',
        });

        return await this.couponService.processAllDuplicateCSVFiles();
    }

    @Get('/delete')
    async processDeleteCsvController() {
        return await this.couponService.processAllDeleteCSVFiles();
    }
}
