// Import Modules
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import * as dayjs from 'dayjs';

@Injectable()
export class HelperService {
    constructor(private readonly configService: ConfigService) {}

    public validateString(request: string, type: TValidateString): string {
        if (!request) return '';

        switch (type) {
            case 'char':
                return request.replace(/[^a-z\d\s]+/gi, '');

            case 'numeric':
                return request.replace(/[^0-9]/g, '');

            case 'emoji':
                return request.replace(/\p{Extended_Pictographic}/gu, (m: any) => `[e-${m.codePointAt(0).toString(16)}]`);

            case 'encode':
                return Buffer.from(request).toString('base64');

            case 'decode':
                return Buffer.from(request, 'base64').toString('ascii');
        }
    }

    public validateUpperCase(request: string): string {
        if (!request) return '';

        const splitRequest = request.split(' ');
        const result = [];

        splitRequest.forEach((value) => {
            result.push(value.charAt(0).toUpperCase() + value.slice(1));
        });

        return result.join(' ');
    }

    public validateTime(request: string | Date, type: TValidateTime, value?: number, unit?: dayjs.ManipulateType): string {
        if (!request || !dayjs(request).isValid()) return '';

        switch (type) {
            case 'date':
                return dayjs(request).format('YYYY-MM-DD');

            case 'date-time-1':
                return dayjs(request).format('YYYY-MM-DD HH:mm:ss');

            case 'date-time-2':
                return dayjs(request).format('YYYYMMDDHHmmss');

            case 'date-time-3':
                return dayjs(request).format('YYYYMMDD');

            case 'date-add':
                if (!value || !unit) return '';
                return dayjs(request).add(value, unit).format('YYYY-MM-DD');

            case 'date-time-add':
                if (!value || !unit) return '';
                return dayjs(request).add(value, unit).format('YYYY-MM-DD HH:mm:ss');

            case 'date-subs':
                if (!value || !unit) return '';
                return dayjs(request).subtract(value, unit).format('YYYY-MM-DD');

            case 'date-time-subs':
                if (!value || !unit) return '';
                return dayjs(request).subtract(value, unit).format('YYYY-MM-DD HH:mm:ss');
        }
    }

    public validateReplaceMessage(request: string, variables: string[]): string {
        if (!request) return '';

        variables.forEach((v, i) => {
            request = request.replace(`{{${i + 1}}}`, v);
        });

        return request;
    }

    public validateReplacePhone(request: string, type: TValidateReplacePhone): string {
        if (!request) return '';

        const checkPhone = request.substring(0, 2);

        switch (type) {
            case '08':
                if (checkPhone === '08') {
                    return request;
                }
                return request.replace(checkPhone, '0');

            case '62':
                if (checkPhone === '62') {
                    return request;
                }
                return request.replace(checkPhone, '628');
        }
    }

    public validateRandomChar(request: number, type: TValidateRandomChar): string {
        if (!request) return '';

        let characters = '';
        let charactersResult = '';

        switch (type) {
            case 'alpha':
                characters = 'qwertyuiopasdfghjklzxcvbnm';
                break;

            case 'numeric':
                characters = '1234567890';
                break;

            case 'alphanumeric':
                characters = '1234567890qwertyuiopasdfghjklzxcvbnm';
                break;
        }

        for (let index = 0; index < request; index++) {
            const random = Math.floor(Math.random() * characters.length);
            charactersResult += characters[random];
        }

        return charactersResult.toUpperCase();
    }

    public validateEncrypt(request: string): string {
        const cryptoIv = Buffer.from(randomBytes(16)).toString('hex').substring(0, 16);
        const cipher = createCipheriv(
            this.configService.get('app.SERVICE_CRYPTO_ALGORITHM'),
            this.configService.get('app.SERVICE_CRYPTO_SECRET_KEY'),
            cryptoIv,
        );
        const encrypted = Buffer.concat([cipher.update(request), cipher.final()]).toString('base64');
        const finalResult = Buffer.from(cryptoIv + ':' + encrypted).toString('base64');

        return finalResult;
    }

    public validateDecrypt(request: string): string {
        const decodeRequest = Buffer.from(request, 'base64').toString('ascii');
        const splitRequest = decodeRequest.split(':');

        const cryptoIv = Buffer.from(splitRequest?.shift() || '', 'binary');
        const encryptedText = Buffer.from(splitRequest.join(':'), 'base64');
        const decipher = createDecipheriv(
            this.configService.get('app.SERVICE_CRYPTO_ALGORITHM'),
            this.configService.get('app.SERVICE_CRYPTO_SECRET_KEY'),
            cryptoIv,
        );
        const finalResult = Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString();

        return finalResult;
    }

    public validatePagination(request: IPagination): IPagination {
        const getLastIndex = +request.lastIndex || 0;
        const getLimit = +request.limit || 10;
        const getSort = (request.sort.toUpperCase() as IPagination['sort']) || 'ASC';
        const getSortCondition = getSort === 'ASC' ? '>' : '<';
        const getSearch = request?.search || '';
        const getStartDate = this.validateTime(request?.startDate, 'date');
        const getEndDate = this.validateTime(request?.endDate, 'date');
        const getLastMonth = this.validateTime(new Date(), 'date-subs', +request?.lastMonth, 'day');
        const getUsers = request?.users;

        return {
            lastIndex: getLastIndex,
            limit: getLimit,
            sort: getSort,
            sortCondition: getSortCondition,
            search: getSearch,
            startDate: getStartDate,
            endDate: getEndDate,
            lastMonth: getLastMonth,
            users: getUsers,
        };
    }

    public validatePaginationFilter(request: IPaginationFilter): string {
        const getStartDate = request.startDate;
        const getEndDate = request.endDate;
        const getLastMonth = request.lastMonth;
        const getColumn = request.column;

        if (getStartDate && getEndDate) {
            return `AND ${getColumn} BETWEEN '${getStartDate}' AND '${getEndDate}'`;
        }
        if (getLastMonth) {
            return `AND ${getColumn} >= '${getLastMonth}'`;
        }

        return '';
    }

    public validatePaginationResponse<T extends IPaginationLastIndex>(request: IPaginationResponse<T>): IPaginationResponse<T> {
        const getData = request.data;
        const getLimit = request.limit;
        const getLastIndex = getData[getData.length - 1]?.id || 0;
        const getMore = getData.length >= getLimit;

        return {
            lastIndex: getLastIndex,
            getMore: getMore,
        };
    }
}
