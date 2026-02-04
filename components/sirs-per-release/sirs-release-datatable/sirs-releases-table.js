import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { SirsReleasesTruncatedText } from "./sirs-releases-truncated-text";
import { useEffect, useRef, useState } from "react";
// Status configurations (moved from datatable)
const bugSeverity = {
    "Critical": { color: "text-gray-600", dot: "bg-yellow-400" },
    "Minor": { color: "text-gray-600", dot: "bg-gray-500" },
    "Major": { color: "text-gray-600", dot: "bg-slate-600" },
    "Blocker": { color: "text-gray-600", dot: "bg-red-500" },
};
const bugStatus = {
    "Resolved": { color: "text-gray-600", dot: "bg-green-500" },
    "Verified": { color: "text-gray-600", dot: "bg-slate-600" },
    "Closed": { color: "text-gray-600", dot: "bg-gray-500" },
    "Open": { color: "text-gray-600", dot: "bg-blue-500" },
    "In Progress": { color: "text-gray-600", dot: "bg-yellow-500" },
};
const resolutionStatus = {
    "Fixed": { color: "text-gray-600", dot: "bg-green-500" },
    "Verified": { color: "text-gray-600", dot: "bg-slate-600" },
    "Closed": { color: "text-gray-600", dot: "bg-gray-500" },
    "Unresolved": { color: "text-gray-600", dot: "bg-red-500" },
    "Working": { color: "text-gray-600", dot: "bg-yellow-500" },
};
const priorityConfig = {
    "P1": { color: "text-red-600", bgColor: "bg-red-50" },
    "P2": { color: "text-orange-600", bgColor: "bg-orange-50" },
    "P3": { color: "text-yellow-600", bgColor: "bg-yellow-50" },
    "P4": { color: "text-blue-600", bgColor: "bg-blue-50" },
};
// Helper functions
const parseDate = (dateStr) => {
    if (!dateStr)
        return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
};
const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
};
const formatBugSeverity = (severity) => {
    const formatted = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
    return formatted;
};
const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
};
export const SirsReleasesTable = ({ data, visibleColumns, selectedRows, onToggleRowSelection, onToggleSelectAll, onEditSIR, onDeleteSIR, onExportSingleSIR }) => {
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
        const stringValue = String(value);
        // Special rendering for certain columns
        if (column.key === 'bug_severity') {
            const formattedSeverity = formatBugSeverity(stringValue);
            const severityConfig = bugSeverity[formattedSeverity] || { color: "text-gray-600", dot: "bg-gray-400" };
            return (_jsxs("div", { className: `flex items-center gap-2 ${severityConfig.color}`, children: [_jsx("span", { className: `inline-block w-2 h-2 rounded-full ${severityConfig.dot}` }), formattedSeverity] }));
        }
        if (column.key === 'bug_status') {
            const formattedStatus = formatStatus(stringValue);
            const statusConfig = bugStatus[formattedStatus] || { color: "text-gray-600", dot: "bg-gray-400" };
            return (_jsxs("div", { className: `flex items-center gap-2 ${statusConfig.color}`, children: [_jsx("span", { className: `inline-block w-2 h-2 rounded-full ${statusConfig.dot}` }), formattedStatus] }));
        }
        if (column.key === 'resolution') {
            const formattedResolution = formatStatus(stringValue);
            const resolutionConfig = resolutionStatus[formattedResolution] || { color: "text-gray-600", dot: "bg-gray-400" };
            return (_jsxs("div", { className: `flex items-center gap-2 ${resolutionConfig.color}`, children: [_jsx("span", { className: `inline-block w-2 h-2 rounded-full ${resolutionConfig.dot}` }), formattedResolution] }));
        }
        if (column.key === 'priority') {
            const config = priorityConfig[stringValue] || { color: "text-gray-600", bgColor: "bg-gray-100" };
            return (_jsx(Badge, { className: `${config.bgColor} ${config.color} border-0 font-medium`, variant: "secondary", children: stringValue }));
        }
        if (column.key === 'short_desc') {
            return _jsx(SirsReleasesTruncatedText, { text: stringValue, maxLength: 40 });
        }
        if (column.key === 'changed_date') {
            const date = parseDate(stringValue);
            return (_jsx("span", { className: "text-gray-600", children: date ? formatDate(date) : stringValue }));
        }
        return _jsx("span", { className: "text-gray-600", children: stringValue });
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
                                            }, onChange: handleSelectAll, className: "rounded border-gray-300 text-red-400 focus:ring-red-400" }) }), visibleColumns.map((col) => (_jsx(TableHead, { className: `px-4 text-sm font-semibold text-gray-900 h-12 ${col.width}`, children: col.label }, col.key))), _jsx(TableHead, { className: "w-12 px-4 text-sm font-semibold text-gray-900 h-12", children: "Actions" })] }) }), _jsx(TableBody, { className: "bg-white", children: data.length > 0 ? (data.map((row) => (_jsxs(TableRow, { className: "bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12", children: [_jsx(TableCell, { className: "px-4 h-12", children: _jsx("input", { type: "checkbox", checked: selectedRows.has(row.id), onChange: () => onToggleRowSelection(row.id), className: "rounded border-gray-300 text-red-400 focus:ring-red-400" }) }), visibleColumns.map((col) => (_jsx(TableCell, { className: "px-4 h-12", children: renderCellContent(col, row) }, col.key))), _jsx(TableCell, { className: "px-4 h-12", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", className: "w-4 h-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none", children: _jsx(MoreVertical, { className: "w-4 h-4 text-gray-400" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48 z-50", children: [_jsx(DropdownMenuItem, { className: "cursor-pointer", onClick: () => onEditSIR(row), disabled: true, children: "Edit" }), _jsx(DropdownMenuItem, { className: "cursor-pointer", onClick: () => onExportSingleSIR(row), children: "Export" }), _jsx(DropdownMenuItem, { className: "cursor-pointer text-red-600", onClick: () => onDeleteSIR(row), disabled: true, children: "Delete" })] })] }) })] }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: visibleColumns.length + 2, className: "h-24 text-center", children: "No results found." }) })) })] }) })] }));
};
