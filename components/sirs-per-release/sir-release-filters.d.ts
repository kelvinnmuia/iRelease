export interface SirsReleaseFiltersProps {
    selectedRelease: string;
    selectedIteration: string;
    globalFilter: string;
    selectedRowsCount?: number;
    isDatatableView?: boolean;
    setSelectedRelease: (release: string) => void;
    setSelectedIteration: (iteration: string) => void;
    setGlobalFilter: (filter: string) => void;
    releaseVersions: Array<{
        id: string;
        name: string;
    }>;
    iterations: Array<{
        id: string;
        name: string;
    }>;
    onExportCSV: () => void;
    onExportExcel: () => void;
    onExportJSON: () => void;
    onToggleColumns?: () => void;
    onResetColumns?: () => void;
    onMapSirs?: () => void;
    columnVisibility?: Record<string, boolean>;
    toggleColumnVisibility?: (columnKey: string) => void;
    resetColumnVisibility?: () => void;
}
export declare const SirsReleaseFilters: ({ selectedRelease, selectedIteration, globalFilter, selectedRowsCount, isDatatableView, setSelectedRelease, setSelectedIteration, setGlobalFilter, releaseVersions, iterations, onExportCSV, onExportExcel, onExportJSON, onToggleColumns, onResetColumns, onMapSirs, columnVisibility, toggleColumnVisibility, resetColumnVisibility }: SirsReleaseFiltersProps) => import("react/jsx-runtime").JSX.Element;
