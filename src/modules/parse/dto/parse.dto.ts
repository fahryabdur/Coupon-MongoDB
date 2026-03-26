import { ApiProperty } from '@nestjs/swagger';

export class ParseCsvDto {
    @ApiProperty({ example: 'unikode' })
    header: string;

    @ApiProperty({ example: [] })
    passwords: string[];
}

export class RewriteCsvDto {
    @ApiProperty({ example: ['unikode'] })
    header: string[];

    @ApiProperty({ example: 1000000 })
    total_count: number;
}
