export declare const loadColumnVisibility: () => Record<string, boolean>;
export declare const saveColumnVisibility: (visibility: Record<string, boolean>) => void;
export declare const loadDateRangeFilter: () => string;
export declare const saveDateRangeFilter: (dateRange: string) => void;
export declare const loadDateRangeDetails: () => {
    startDate: string;
    endDate: string;
};
export declare const saveDateRangeDetails: (startDate: string, endDate: string) => void;
export declare const clearDateRangeDetails: () => void;
export declare const loadItemsPerPage: () => number;
export declare const saveItemsPerPage: (itemsPerPage: number) => void;
