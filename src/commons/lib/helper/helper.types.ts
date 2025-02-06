/* eslint-disable @typescript-eslint/no-unused-vars */

// Define Validate String Type
type TValidateString = 'char' | 'numeric' | 'emoji' | 'encode' | 'decode';

// Define Validate Time Type
type TValidateTime = 'date' | 'date-time-1' | 'date-time-2' | 'date-time-3' | 'date-add' | 'date-subs' | 'date-time-add' | 'date-time-subs';

// Define Validate Replace Phone Type
type TValidateReplacePhone = '08' | '62';

// Define Validate Random Char Type
type TValidateRandomChar = 'alpha' | 'numeric' | 'alphanumeric';

// Define Validate Pagination Sort Type
type TValidatePaginationSort = 'ASC' | 'DESC';

// Define General Params Interface
interface IGeneralParams {
    expiredOtp?: string;
    taxAdmin?: string;
    taxShipping?: string;
}

// Define Pagination Interface
interface IPagination {
    lastIndex: number;
    limit: number;
    sort: TValidatePaginationSort;
    sortCondition?: string;
    search: string;
    startDate?: string;
    endDate?: string;
    lastMonth?: string;
    users?: IUsers;
}

// Define Pagination Filter Interface
interface IPaginationFilter {
    startDate: string;
    endDate: string;
    lastMonth: string;
    column: string;
}

// Define Pagination Last index Interface
interface IPaginationLastIndex {
    id: number;
}

// Define Pagination Response Interface
interface IPaginationResponse<T> {
    data?: T[];
    limit?: number;
    lastIndex?: number;
    getMore?: boolean;
}

// Define Users Interface
interface IUsers {
    userId: number;
    device: number;
    role: string;
    verified: number;
}
