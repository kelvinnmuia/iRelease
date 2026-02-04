import { Release, ColumnConfig } from "./types/releases";
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
/**
 * A table component for displaying releases.
 *
 * @param {Release[]} data - The list of releases to display.
 * @param {ColumnConfig[]} visibleColumns - The columns to display in the table.
 * @param {Set<number>} selectedRows - The set of release IDs that are currently selected.
 * @param {(id: number) => void} onToggleRowSelection - A function to call when a row is selected or deselected.
 * @param {() => void} onToggleSelectAll - A function to call when the select all checkbox is toggled.
 * @param {(release: Release) => void} onEditRelease - A function to call when the edit button is clicked for a release.
 * @param {(release: Release) => void} onDeleteRelease - A function to call when the delete button is clicked for a release.
 * @param {(release: Release) => void} onExportSingleRelease - A function to call when the export button is clicked for a release.
 */
export declare const ReleasesTable: ({ data, visibleColumns, selectedRows, onToggleRowSelection, onToggleSelectAll, onEditRelease, onDeleteRelease, onExportSingleRelease }: ReleasesTableProps) => import("react/jsx-runtime").JSX.Element;
export {};
