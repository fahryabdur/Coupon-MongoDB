import { Injectable, OnModuleInit } from '@nestjs/common';
import * as appRoot from 'app-root-path';
import * as path from 'path';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import * as csv from 'fast-csv';
import * as readline from 'readline';
import * as officeCrypto from 'officecrypto-tool';
import { ParseCsvDto, RewriteCsvDto } from './dto/parse.dto';

@Injectable()
export class ParseService implements OnModuleInit {
    private getDataDir = `${appRoot}/../data`;
    private getOutputDir = `${appRoot}/../output/coupon-parse-csv`;
    private getReportDir = `${appRoot}/../output/coupon-report`;

    onModuleInit() {
        this.getDirectory(this.getOutputDir);
        this.getDirectory(this.getReportDir);
    }

    private getDirectory(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    private getTimeDuration(duration: number): string {
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private async getDelimiter(filePath: string): Promise<string> {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        for await (const line of rl) {
            fileStream.close();
            return line.includes(';') ? ';' : ',';
        }

        return ',';
    }

    private async getXlsxWithPassword(filePath: string, passwords: string[]): Promise<unknown[]> {
        for (const password of passwords) {
            try {
                const inputPath = await fs.promises.readFile(filePath);
                const output = await officeCrypto.decrypt(inputPath, { password });
                const workbook = xlsx.read(output);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                return xlsx.utils.sheet_to_json(worksheet);
            } catch (error) {
                console.log(`Processing file ${filePath} with password ${password} failed`);
            }
        }

        return [];
    }

    async parseCsv(dto: ParseCsvDto): Promise<void> {
        const startTotalTime = Date.now();

        const folders = fs.readdirSync(this.getDataDir);
        const headers = ['coupon'];

        for (const folder of folders) {
            const folderPath = path.join(this.getDataDir, folder);
            const files = fs.readdirSync(folderPath);

            for (const file of files) {
                const startTime = Date.now();
                const filePath = path.join(folderPath, file);

                let data: unknown[] = [];

                if (dto.passwords.length > 0) {
                    data = await this.getXlsxWithPassword(filePath, dto.passwords);
                } else {
                    const workbook = xlsx.readFile(filePath);
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    data = xlsx.utils.sheet_to_json(worksheet);
                }

                const customData = data.map((row) => ({
                    coupon: row[dto.header],
                }));

                const newWorksheet = xlsx.utils.json_to_sheet(customData, { header: headers });
                const csvData = xlsx.utils.sheet_to_csv(newWorksheet);

                const outputFolderPath = path.join(this.getOutputDir, folder);
                const outputFileName = `${path.parse(file).name}.csv`;
                const outputFilePath = path.join(outputFolderPath, outputFileName);

                if (!fs.existsSync(outputFolderPath)) {
                    fs.mkdirSync(outputFolderPath, { recursive: true });
                }

                fs.promises.writeFile(outputFilePath, csvData);

                const duration = Date.now() - startTime;
                console.log(`Finished processing ${file}, Time: ${this.getTimeDuration(duration)}.`);
            }
        }

        const totalDuration = Date.now() - startTotalTime;
        console.log(`Total processing time: ${this.getTimeDuration(totalDuration)}`);
    }

    async rewriteCsv(dto: RewriteCsvDto): Promise<void> {
        const folders = fs.readdirSync(this.getDataDir);
        const headers = ['coupon', 'variantId'];

        for (const folder of folders) {
            const folderPath = path.join(this.getDataDir, folder);
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                const inputFilePath = path.join(folderPath, file);
                const getDelimiter = await this.getDelimiter(inputFilePath);

                let rowCount = 0;
                let fileCount = 0;
                let csvWriteStream = null;

                const createWriteStream = () => {
                    if (csvWriteStream) csvWriteStream.end();

                    const partDir = path.join(this.getOutputDir, folder);
                    const partFileName = `${path.parse(file).name}_part_${++fileCount}.csv`;
                    const partFilePath = path.join(partDir, partFileName);

                    if (!fs.existsSync(partDir)) {
                        fs.mkdirSync(partDir, { recursive: true });
                    }

                    csvWriteStream = csv.format({ headers, writeHeaders: true });
                    csvWriteStream.pipe(fs.createWriteStream(partFilePath));
                };

                const startTime = Date.now();

                fs.createReadStream(inputFilePath)
                    .pipe(csv.parse({ headers: true, trim: true, delimiter: getDelimiter }))
                    .on('data', (row) => {
                        let getCoupon = '';
                        let variantId = '';

                        for (const header of dto.header) {
                            if (row[header]?.trim()) {
                                getCoupon = row[header].trim();
                                variantId = folder;
                                break;
                            }
                        }

                        if (getCoupon) {
                            if (rowCount % 1_000_000 === 0 || !csvWriteStream) createWriteStream();
                            csvWriteStream.write({ coupon: getCoupon, variantId: variantId });
                            rowCount++;
                        }
                    })
                    .on('end', () => {
                        if (csvWriteStream) csvWriteStream.end();

                        const getDuration = Date.now() - startTime;
                        console.log(`Finished processing ${file}, Created ${fileCount} files. Time: ${this.getTimeDuration(getDuration)}.`);
                    })
                    .on('error', (error) => {
                        console.error(`Error processing file ${file}:`, error);
                    });
            }
        }
    }

    async reportCsv(): Promise<void> {
        const files = await fs.promises.readdir(this.getDataDir);
        const writeStream = fs.createWriteStream(`${this.getReportDir}/report.csv`);
        const csvStream = csv.format({ headers: true });
        csvStream.pipe(writeStream);

        const rows = [];

        const mapFile = (row) => {
            const removePartPattern = /_part_\d+/;
            const formatOriginFilename = row.origin_filename.match(removePartPattern);
            const formatDuplicateFilename = row.duplicate_filename.match(removePartPattern);

            if (formatOriginFilename && formatDuplicateFilename) {
                const cleanedOriginFilename = row.origin_filename.replace(removePartPattern, '');
                const cleanedDuplicateFilename = row.duplicate_filename.replace(removePartPattern, '');
                const findFile = rows.findIndex(
                    (r) => r.origin_filename === cleanedOriginFilename && r.duplicate_filename === cleanedDuplicateFilename,
                );
                if (findFile >= 0) {
                    rows[findFile].total += 1;
                } else {
                    rows.push({
                        origin_filename: cleanedOriginFilename,
                        duplicate_filename: cleanedDuplicateFilename,
                        total: 1,
                    });
                }
            }

            if (formatOriginFilename && !formatDuplicateFilename) {
                const cleanedOriginFilename = row.origin_filename.replace(removePartPattern, '');
                const findFile = rows.findIndex(
                    (r) => r.origin_filename === cleanedOriginFilename && r.duplicate_filename === row.duplicate_filename,
                );
                if (findFile >= 0) {
                    rows[findFile].total += 1;
                } else {
                    rows.push({
                        origin_filename: cleanedOriginFilename,
                        duplicate_filename: row.duplicate_filename,
                        total: 1,
                    });
                }
            }

            if (!formatOriginFilename && formatDuplicateFilename) {
                const cleanedDuplicateFilename = row.duplicate_filename.replace(removePartPattern, '');
                const findFile = rows.findIndex(
                    (r) => r.origin_filename === row.origin_filename && r.duplicate_filename === cleanedDuplicateFilename,
                );
                if (findFile >= 0) {
                    rows[findFile].total += 1;
                } else {
                    rows.push({
                        origin_filename: row.origin_filename,
                        duplicate_filename: cleanedDuplicateFilename,
                        total: 1,
                    });
                }
            }

            if (!formatOriginFilename && !formatDuplicateFilename) {
                const findFile = rows.findIndex(
                    (r) => r.origin_filename === row.origin_filename && r.duplicate_filename === row.duplicate_filename,
                );
                if (findFile >= 0) {
                    rows[findFile].total += 1;
                } else {
                    rows.push({
                        origin_filename: row.origin_filename,
                        duplicate_filename: row.duplicate_filename,
                        total: 1,
                    });
                }
            }
        };

        const processFile = (file) => {
            return new Promise<void>((resolve, reject) => {
                const inputPath = path.join(this.getDataDir, file);
                const startTime = Date.now();

                fs.createReadStream(inputPath)
                    .pipe(csv.parse({ headers: true, trim: true }))
                    .on('data', (row) => {
                        mapFile(row);
                    })
                    .on('end', () => {
                        const getDuration = Date.now() - startTime;
                        console.log(`Finished processing ${file}, Time: ${this.getTimeDuration(getDuration)}.`);
                        resolve();
                    })
                    .on('error', (error) => {
                        console.error(`Error processing file ${file}:`, error);
                        reject(error);
                    });
            });
        };

        for (const file of files) {
            await processFile(file);
        }

        rows.forEach((row) => csvStream.write(row));

        csvStream.end();
    }
}
