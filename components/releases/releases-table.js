import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { statusConfig, deploymentStatusConfig } from "./constants/releases-constants";
import { TruncatedText } from "./truncated-text";
import { useEffect, useRef, useState } from "react";
import { formatISODate } from "./utils/date-utils";
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
export const ReleasesTable = ({ data, visibleColumns, selectedRows, onToggleRowSelection, onToggleSelectAll, onEditRelease, onDeleteRelease, onExportSingleRelease }) => {
    const currentPageIds = new Set(data.map(item => item.id));
    const allCurrentPageSelected = data.length > 0 && data.every(item => selectedRows.has(item.id));
    const someCurrentPageSelected = data.length > 0 &&
        data.some(item => selectedRows.has(item.id)) &&
        !allCurrentPageSelected;
    // Refs for scroll synchronization
    const mainScrollRef = useRef(null);
    const topScrollRef = useRef(null);
    const tableRef = useRef(null);
    const [tableWidth, setTableWidth] = useState(0);
    const handleSelectAll = () => {
        onToggleSelectAll();
    };
    // Sync horizontal scrolling and get table width
    useEffect(() => {
        const mainContainer = mainScrollRef.current;
        const topScrollbar = topScrollRef.current;
        const table = tableRef.current;
        if (!mainContainer || !topScrollbar || !table)
            return;
        // Update table width
        const updateTableWidth = () => {
            const width = table.scrollWidth;
            setTableWidth(width);
        };
        const handleMainScroll = () => {
            if (topScrollRef.current) {
                topScrollRef.current.scrollLeft = mainContainer.scrollLeft;
            }
        };
        const handleTopScroll = () => {
            if (mainScrollRef.current) {
                mainScrollRef.current.scrollLeft = topScrollbar.scrollLeft;
            }
        };
        // Initial update
        updateTableWidth();
        // Add resize observer to update width when table changes
        const resizeObserver = new ResizeObserver(updateTableWidth);
        resizeObserver.observe(table);
        // Also update on window resize
        window.addEventListener('resize', updateTableWidth);
        mainContainer.addEventListener('scroll', handleMainScroll);
        topScrollbar.addEventListener('scroll', handleTopScroll);
        return () => {
            resizeObserver.disconnect();
            mainContainer.removeEventListener('scroll', handleMainScroll);
            topScrollbar.removeEventListener('scroll', handleTopScroll);
            window.removeEventListener('resize', updateTableWidth);
        };
    }, []);
    const renderCellContent = (column, row) => {
        const value = row[column.key];
        if (column.key === 'testStatus') {
            const config = statusConfig[String(value)];
            return (_jsxs("div", { className: `flex items-center gap-2 ${config?.color}`, children: [_jsx("span", { className: `inline-block w-2 h-2 rounded-full ${config?.dot}` }), String(value)] }));
        }
        if (column.key === 'deploymentStatus') {
            const config = deploymentStatusConfig[String(value)];
            return (_jsxs("div", { className: `flex items-center gap-2 ${config?.color}`, children: [_jsx("span", { className: `inline-block w-2 h-2 rounded-full ${config?.dot}` }), String(value)] }));
        }
        // Handle date formatting for date fields
        const dateFields = [
            'deliveredDate', 'tdNoticeDate', 'testDeployDate',
            'testStartDate', 'testEndDate', 'prodDeployDate'
        ];
        if (dateFields.includes(column.key)) {
            return _jsx("span", { className: "text-gray-600", children: formatISODate(String(value)) });
        }
        if (['releaseDescription', 'functionalityDelivered', 'comments', 'outstandingIssues'].includes(column.key)) {
            const maxLength = ['comments', 'outstandingIssues'].includes(column.key) ? 25 : 30;
            return _jsx(TruncatedText, { text: String(value), maxLength: maxLength });
        }
        return _jsx("span", { className: "text-gray-600", children: String(value) });
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden bg-white", style: { maxHeight: 'calc(100vh - 280px)' }, children: [_jsx("div", { ref: topScrollRef, className: "sticky top-0 z-20 bg-white overflow-x-auto overflow-y-hidden border-b border-gray-200", style: {
                    height: '20px',
                    minHeight: '20px'
                }, children: _jsx("div", { style: {
                        width: `${tableWidth}px`,
                        height: '1px',
                        minWidth: `${tableWidth}px`
                    } }) }), _jsx("div", { ref: mainScrollRef, className: "flex-1 overflow-y-auto overflow-x-hidden", children: _jsxs(Table, { ref: tableRef, className: "text-sm min-w-full", children: [_jsx(TableHeader, { className: "sticky top-0 z-10 bg-white", children: _jsxs(TableRow, { className: "border-b border-gray-200 h-12 bg-white hover:bg-gray-50 transition-colors duration-150", children: [_jsx(TableHead, { className: "w-12 px-4 text-sm font-semibold text-gray-900 h-12", children: _jsx("input", { type: "checkbox", checked: allCurrentPageSelected, ref: (input) => {
                                                if (input) {
                                                    input.indeterminate = someCurrentPageSelected;
                                                }
                                            }, onChange: handleSelectAll, className: "rounded border-gray-300 text-red-400 focus:ring-red-400" }) }), visibleColumns.map((col) => (_jsx(TableHead, { className: `px-4 text-sm font-semibold text-gray-900 h-12 ${col.width}`, children: col.label }, col.key))), _jsx(TableHead, { className: "w-12 px-4 text-sm font-semibold text-gray-900 h-12", children: "Actions" })] }) }), _jsx(TableBody, { className: "bg-white", children: data.length > 0 ? (data.map((row) => (_jsxs(TableRow, { className: "bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12", children: [_jsx(TableCell, { className: "px-4 h-12", children: _jsx("input", { type: "checkbox", checked: selectedRows.has(row.id), onChange: () => onToggleRowSelection(row.id), className: "rounded border-gray-300 text-red-400 focus:ring-red-400" }) }), visibleColumns.map((col) => (_jsx(TableCell, { className: "px-4 h-12", children: renderCellContent(col, row) }, col.key))), _jsx(TableCell, { className: "px-4 h-12", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "w-4 h-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none", children: _jsx(MoreVertical, { className: "w-4 h-4 text-gray-400" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48 z-50", children: [_jsx(DropdownMenuItem, { className: "cursor-pointer", onClick: () => onEditRelease(row), children: "Edit" }), _jsx(DropdownMenuItem, { className: "cursor-pointer", onClick: () => onExportSingleRelease(row), children: "Export" }), _jsx(DropdownMenuItem, { className: "cursor-pointer text-red-600", onClick: () => onDeleteRelease(row), children: "Delete" })] })] }) })] }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: visibleColumns.length + 2, className: "h-24 text-center", children: "No results found." }) })) })] }) })] }));
};
