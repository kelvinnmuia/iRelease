import { ColumnConfig } from '../sirs-releases-column-visibility';
interface SirRelease {
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
}
interface SirsReleasesTableProps {
    data: SirRelease[];
    visibleColumns: ColumnConfig[];
    selectedRows: Set<number>;
    onToggleRowSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    onEditSIR: (sir: SirRelease) => void;
    onDeleteSIR: (sir: SirRelease) => void;
    onExportSingleSIR: (sir: SirRelease) => void;
}
export declare const SirsReleasesTable: ({ data, visibleColumns, selectedRows, onToggleRowSelection, onToggleSelectAll, onEditSIR, onDeleteSIR, onExportSingleSIR }: SirsReleasesTableProps) => import("react/jsx-runtime").JSX.Element;
export {};
