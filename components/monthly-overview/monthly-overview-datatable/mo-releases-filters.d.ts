import { SortOrder } from "./types/mo-releases";
interface ReleasesFiltersProps {
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
    dateRange: string;
    setDateRange: (range: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    columnVisibility: Record<string, boolean>;
    toggleColumnVisibility: (columnKey: string) => void;
    resetColumnVisibility: () => void;
    itemsPerPage: number;
    setItemsPerPage: (items: number) => void;
    onAddRelease: () => void;
    onBulkDelete: () => void;
    selectedRowsCount: number;
    exportToCSV: () => void;
    exportToExcel: () => void;
    exportToJSON: () => void;
    totalFilteredCount: number;
    onApplyDateRange: () => void;
    onClearDateRange: () => void;
}
export declare const ReleasesFilters: ({ globalFilter, setGlobalFilter, dateRange, setDateRange, startDate, setStartDate, endDate, setEndDate, sortOrder, setSortOrder, columnVisibility, toggleColumnVisibility, resetColumnVisibility, itemsPerPage, setItemsPerPage, onAddRelease, onBulkDelete, selectedRowsCount, exportToCSV, exportToExcel, exportToJSON, onApplyDateRange, onClearDateRange, totalFilteredCount }: ReleasesFiltersProps) => import("react/jsx-runtime").JSX.Element;
export {};
