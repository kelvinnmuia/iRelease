import { Release, ColumnConfig } from "./types/mo-releases";
interface ReleasesTableProps {
    data: Release[];
    visibleColumns: ColumnConfig[];
    selectedRows: Set<number>;
    onToggleRowSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    onEditRelease: (release: Release) => void;
    onDeleteRelease: (release: Release) => void;
    onExportSingleRelease: (release: Release) => void;
}
export declare const ReleasesTable: ({ data, visibleColumns, selectedRows, onToggleRowSelection, onToggleSelectAll, onEditRelease, onDeleteRelease, onExportSingleRelease }: ReleasesTableProps) => import("react/jsx-runtime").JSX.Element;
export {};
