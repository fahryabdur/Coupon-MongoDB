import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Writable } from 'stream';
import * as appRoot from 'app-root-path';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as pLimit from 'p-limit';
import * as os from 'os';

import { Coupon } from '@datasource/mongo-db/models/coupon.entity';
import { CouponDuplicate } from '@datasource/mongo-db/models/coupon_duplicate.entity';

const cpus = os.cpus().length;
const folderLimit = pLimit(1);
const fileLimit = pLimit(cpus);

@Injectable()
export class CouponService implements OnModuleInit {
    private getDataDir = `${appRoot}/../data`;
    private getReportDir = `${appRoot}/../output/coupon-report`;
    private getDuplicateDir = `${appRoot}/../output/coupon-duplicate`;
    private getBatchSize = 1000;
    private getDuplicateBatchSize = 100_000;
    private getSkipSize = 0;
    private getMoreSize = true;

    constructor(
        @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
        @InjectModel(CouponDuplicate.name) private readonly couponDuplicateModel: Model<CouponDuplicate>,
    ) {}

    onModuleInit() {
        this.getDirectory(this.getReportDir);
        this.getDirectory(this.getDuplicateDir);
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

    private getReadDir(dirname: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dirname, (error, filenames) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(filenames);
                }
            });
        });
    }

    private async getCouponData(coupon: string, filename: string) {
        const getCoupon = await this.couponModel.findOne({ coupon }).lean();

        if (getCoupon) {
            return {
                coupon,
                origin_filename: filename,
                duplicate_filename: getCoupon.filename,
            };
        }

        return {
            coupon,
            origin_filename: filename,
            duplicate_filename: 'Not Found',
        };
    }

    private async processCSVFile(filePath: string): Promise<void> {
        const getBatch = [];

        const getFilename = path.basename(filePath);
        const getTotalFilename = `${this.getReportDir}/total-duplicate.csv`;

        const getReadStream = fs.createReadStream(filePath);

        let totalRecords = 0;
        let totalErrors = 0;

        const startTime = Date.now();

        const processBatch = async () => {
            if (getBatch.length > 0) {
                try {
                    await this.couponModel.insertMany(getBatch, { ordered: false });
                } catch (error) {
                    const res = await this.processErrorFiles(error, getBatch);
                    totalErrors += res.total;
                } finally {
                    getBatch.length = 0;
                }
            }
        };

        const createWritable = new Writable({
            objectMode: true,
            write: async (row, encoding, callback) => {
                getBatch.push({
                    coupon: row.coupon,
                    variantId: row.variantId,
                    filename: getFilename,
                    length: row.coupon.length,
                });

                totalRecords++;

                if (getBatch.length >= this.getBatchSize) {
                    await processBatch();
                }

                setImmediate(callback);
            },
            final: async (callback) => {
                await processBatch();
                callback();
            },
        });

        getReadStream
            .pipe(csv.parse({ headers: true, trim: true }))
            .pipe(createWritable)
            .on('error', (error) => {
                console.error(`Error processing CSV file ${getFilename}:`, error);
            })
            .on('finish', () => {
                const duration = Date.now() - startTime;
                console.log(`Finished processing ${getFilename}`);
                console.log(`Total records processed: ${totalRecords}`);
                console.log(`Successfully inserted: ${totalRecords - totalErrors} coupons`);
                console.log(`Failed to insert: ${totalErrors} coupons`);
                console.log(`Running time: ${this.getTimeDuration(duration)}`);

                if (totalErrors > 0) {
                    const writeStream = fs.createWriteStream(getTotalFilename, { flags: 'a' });
                    const csvWriteStream = csv.format({ includeEndRowDelimiter: true });

                    csvWriteStream.pipe(writeStream);

                    csvWriteStream.write({ file: getFilename, total: totalErrors });
                    csvWriteStream.end();
                }
            });
    }

    private async processDeleteCSVFile(filePath: string, isLastFile: boolean): Promise<void> {
        const getBatch = [];

        const getFilename = path.basename(filePath);
        const getReadStream = fs.createReadStream(filePath);

        let totalRecords = 0;

        const startTime = Date.now();

        const processBatch = async () => {
            if (getBatch.length > 0) {
                await this.couponModel.deleteMany({ coupon: { $in: getBatch } });
                totalRecords += getBatch.length;
                getBatch.length = 0;
            }
        };

        const createWritable = new Writable({
            objectMode: true,
            write: async (row, encoding, callback) => {
                getBatch.push(row.coupon);

                if (getBatch.length >= this.getBatchSize) {
                    await processBatch();
                }

                setImmediate(callback);
            },
            final: async (callback) => {
                await processBatch();
                callback();
            },
        });

        getReadStream
            .pipe(csv.parse({ headers: true, trim: true }))
            .pipe(createWritable)
            .on('error', (error) => {
                console.error(`Error processing CSV file ${getFilename}:`, error);
            })
            .on('finish', () => {
                const duration = Date.now() - startTime;
                console.log(`Finished processing ${getFilename}`);
                console.log(`Total records processed: ${totalRecords}`);
                console.log(`Running time: ${this.getTimeDuration(duration)}`);

                if (isLastFile) {
                    console.log('Processing complete.');
                }
            });
    }

    private async processErrorFiles(error, batch) {
        if (!error.writeErrors || error.writeErrors.length === 0) {
            return { total: 0 };
        }

        const writeErrors = error.writeErrors;
        const errorRecords = writeErrors.map((writeError) => batch[writeError.index]).filter(Boolean);

        await this.couponDuplicateModel.insertMany(errorRecords);

        return { total: writeErrors.length };
    }

    async processAllCSVFiles(): Promise<void> {
        try {
            const folders = await this.getReadDir(this.getDataDir);

            for (const folder of folders) {
                const folderPath = path.join(this.getDataDir, folder);
                const files = await fs.promises.readdir(folderPath);

                for (let i = 0; i < files.length; i++) {
                    const filePath = path.join(folderPath, files[i]);
                    await this.processCSVFile(filePath);
                }
            }

            console.log('All folders have been processed.');
        } catch (error) {
            console.error('Error processing CSV files:', error);
        }
    }

    async processAllCSVFilesV2(): Promise<void> {
        try {
            const folders = await this.getReadDir(this.getDataDir);

            await Promise.all(
                folders.map((folder) =>
                    folderLimit(async () => {
                        console.log(`Processing folder: ${folder}`);

                        const folderPath = path.join(this.getDataDir, folder);
                        const files = await fs.promises.readdir(folderPath);

                        const processingFiles = files
                            .filter((file) => file.endsWith('.csv'))
                            .map((file) => {
                                const filePath = path.join(folderPath, file);
                                return fileLimit(() => this.processCSVFile(filePath));
                            });

                        await Promise.all(processingFiles);
                    }),
                ),
            );

            console.log('All folders have been processed.');
        } catch (error) {
            console.error('Error processing CSV files:', error);
        }
    }

    async processAllDuplicateCSVFiles(): Promise<void> {
        let currentRowCount = 0;
        let currentFileIndex = 1;

        const createNewCSVStream = () => {
            const filePath = `${this.getDuplicateDir}/coupon-duplicate-${currentFileIndex}.csv`;
            const fileStream = fs.createWriteStream(filePath);
            const csvStream = csv.format({ headers: true });
            csvStream.pipe(fileStream);
            return csvStream;
        };

        let csvStream = createNewCSVStream();

        const startTime = Date.now();

        while (this.getMoreSize) {
            const getCouponDuplicateBatch = await this.couponDuplicateModel
                .find()
                .skip(this.getSkipSize)
                .limit(this.getDuplicateBatchSize)
                .lean();

            if (getCouponDuplicateBatch.length > 0) {
                const processedBatch = await Promise.all(
                    getCouponDuplicateBatch.map((duplicate) => this.getCouponData(duplicate.coupon, duplicate.filename)),
                );

                for (const doc of processedBatch) {
                    csvStream.write(doc);
                    currentRowCount++;

                    if (currentRowCount >= 500_000) {
                        csvStream.end();
                        console.log(`Completed writing file ${currentFileIndex}.csv with ${currentRowCount} rows.`);

                        currentFileIndex++;
                        csvStream = createNewCSVStream();
                        currentRowCount = 0;
                    }
                }
                this.getSkipSize += this.getDuplicateBatchSize;
            } else {
                this.getMoreSize = false;
            }
        }

        if (currentRowCount > 0) {
            csvStream.end();
            console.log(`Completed writing file ${currentFileIndex}.csv with ${currentRowCount} rows.`);
        }

        const duration = Date.now() - startTime;
        console.log('All duplicate coupons have been completed.');
        console.log(`Running time: ${this.getTimeDuration(duration)}`);
    }

    async processAllDeleteCSVFiles(): Promise<void> {
        const folders = await this.getReadDir(this.getDataDir);

        for (const folder of folders) {
            const folderPath = path.join(this.getDataDir, folder);
            const files = await fs.promises.readdir(folderPath);

            for (let i = 0; i < files.length; i++) {
                const filePath = path.join(folderPath, files[i]);
                const isLastFile = i === files.length - 1;
                await this.processDeleteCSVFile(filePath, isLastFile);
            }
        }

        console.log('All folders have been deleted.');
    }
}
