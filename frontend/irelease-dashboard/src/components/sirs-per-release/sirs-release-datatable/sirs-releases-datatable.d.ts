import { ColumnConfig } from '../sirs-releases-column-visibility';
interface SirReleaseDataTableProps {
    filteredData?: Array<{
        id: number;
        sir_release_id: string;
        sir_id: number | string;
        release_version: string;
        iteration: number | string;
        changed_date: string;
        bug_severity: string;
        priority: string;
        assigned_to: string;
        bug_status: string;
        resolution: string;
        component: string;
        op_sys: string;
        short_desc: string;
        cf_sirwith: string;
    }>;
    onRowSelectionChange?: (selectedIds: Set<number>) => void;
    visibleColumns?: ColumnConfig[];
    columnVisibility?: Record<string, boolean>;
    toggleColumnVisibility?: (columnKey: string) => void;
    resetColumnVisibility?: () => void;
    onDateRangeChange?: (dateRange: string) => void;
    onDeleteRows?: (ids: Set<number>) => void;
    onAddSIR?: (sirData: any) => void;
    onEditSIR?: (sirData: any) => void;
    onDeleteSIR?: (id: number) => void;
}
export declare function SirReleaseDataTable({ filteredData: externalFilteredData, onRowSelectionChange, visibleColumns: propVisibleColumns, columnVisibility, toggleColumnVisibility, resetColumnVisibility, onDateRangeChange, onDeleteRows, onAddSIR, onEditSIR, onDeleteSIR, }?: SirReleaseDataTableProps): import("react/jsx-runtime").JSX.Element;
export {};
