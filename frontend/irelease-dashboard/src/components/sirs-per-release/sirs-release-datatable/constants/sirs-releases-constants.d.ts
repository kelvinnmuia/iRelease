export declare const allColumns: {
    key: string;
    label: string;
    width: string;
}[];
export declare const bugSeverity: Record<string, {
    color: string;
    dot: string;
}>;
export declare const bugStatus: Record<string, {
    color: string;
    dot: string;
}>;
export declare const resolutionStatus: Record<string, {
    color: string;
    dot: string;
}>;
export declare const priorityConfig: Record<string, {
    color: string;
    bgColor: string;
}>;
export declare const bugSeverityOptions: string[];
export declare const bugStatusOptions: string[];
export declare const resolutionOptions: string[];
export declare const priorityOptions: string[];
export declare const componentOptions: string[];
export declare const osOptions: string[];
export declare const STORAGE_KEYS: {
    readonly COLUMN_VISIBILITY: "releases-dashboard-column-visibility";
    readonly DATE_RANGE_FILTER: "releases-dashboard-date-range-filter";
    readonly DATE_RANGE_DETAILS: "releases-dashboard-date-range-details";
    readonly ITEMS_PER_PAGE: "releases-dashboard-items-per-page";
};
