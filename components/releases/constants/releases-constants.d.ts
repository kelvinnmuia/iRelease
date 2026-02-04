import { ColumnConfig, StatusConfig } from '../types/releases';
export declare const allColumns: ColumnConfig[];
export declare const statusConfig: Record<string, StatusConfig>;
export declare const deploymentStatusConfig: Record<string, StatusConfig>;
export declare const testStatusOptions: string[];
export declare const deploymentStatusOptions: string[];
export declare const releaseTypeOptions: string[];
export declare const monthOptions: string[];
export declare const generateFinancialYearOptions: () => string[];
export declare const financialYearOptions: string[];
export declare const STORAGE_KEYS: {
    readonly COLUMN_VISIBILITY: "releases-dashboard-column-visibility";
    readonly DATE_RANGE_FILTER: "releases-dashboard-date-range-filter";
    readonly DATE_RANGE_DETAILS: "releases-dashboard-date-range-details";
    readonly ITEMS_PER_PAGE: "releases-dashboard-items-per-page";
};
