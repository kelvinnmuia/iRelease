import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { allColumns } from '../sirs-releases-column-visibility';
import { EditSirsReleaseDialog } from "./edit-sirs-release-dialog";
import { SirsReleasesTable } from "./sirs-releases-table";
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
export function SirReleaseDataTable({ filteredData: externalFilteredData = [], onRowSelectionChange, visibleColumns: propVisibleColumns, columnVisibility = {}, toggleColumnVisibility = () => { }, resetColumnVisibility = () => { }, 
// Sync props
onDateRangeChange, onDeleteRows, onAddSIR, onEditSIR, onDeleteSIR, } = {}) {
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sirToDelete, setSirToDelete] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [sirToEdit, setSirToEdit] = useState(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const datePickerRef = useRef(null);
    // Notify parent when selection changes
    useEffect(() => {
        if (onRowSelectionChange) {
            onRowSelectionChange(selectedRows);
        }
    }, [selectedRows, onRowSelectionChange]);
    // Notify parent when date range changes
    const handleDateRangeChange = (range) => {
        setDateRange(range);
        if (onDateRangeChange) {
            onDateRangeChange(range);
        }
    };
    // Effect to handle clicks outside the date picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };
        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);
    // Reset to first page when items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);
    // Reset to first page when external filtered data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [externalFilteredData]);
    // Get visible columns
    const visibleColumns = propVisibleColumns || allColumns.filter(col => columnVisibility[col.key]);
    // Apply date range when both dates are selected
    const applyDateRange = () => {
        if (startDate && endDate) {
            const start = parseDate(startDate);
            const end = parseDate(endDate);
            if (start && end) {
                const formattedStart = formatDate(start);
                const formattedEnd = formatDate(end);
                const newDateRange = `${formattedStart} - ${formattedEnd}`;
                setDateRange(newDateRange);
                handleDateRangeChange(newDateRange);
            }
        }
        setShowDatePicker(false);
    };
    // Clear date range
    const clearDateRange = () => {
        setDateRange("");
        setStartDate("");
        setEndDate("");
        setShowDatePicker(false);
        setCurrentPage(1);
        handleDateRangeChange("");
    };
    // All data is already filtered by parent, so we just use externalFilteredData directly
    const sortedAndFilteredData = [...externalFilteredData];
    const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage);
    // Get IDs of all items on the current page
    const currentPageIds = new Set(paginatedData.map(item => item.id));
    // Check if all items on current page are selected
    const allCurrentPageSelected = paginatedData.length > 0 &&
        paginatedData.every(item => selectedRows.has(item.id));
    // Check if some items on current page are selected (for indeterminate state)
    const someCurrentPageSelected = paginatedData.length > 0 &&
        paginatedData.some(item => selectedRows.has(item.id)) &&
        !allCurrentPageSelected;
    const toggleRowSelection = (id) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };
    const toggleSelectAllOnPage = () => {
        const newSelected = new Set(selectedRows);
        if (allCurrentPageSelected) {
            currentPageIds.forEach(id => newSelected.delete(id));
        }
        else {
            currentPageIds.forEach(id => newSelected.add(id));
        }
        setSelectedRows(newSelected);
    };
    // Edit SIR functions
    const openEditDialog = (sir) => {
        setSirToEdit(sir);
        setEditDialogOpen(true);
    };
    // Bulk delete functions
    const openBulkDeleteDialog = () => {
        if (selectedRows.size === 0) {
            toast.error("Please select at least one SIR to delete");
            return;
        }
        setBulkDeleteDialogOpen(true);
    };
    const cancelBulkDelete = () => {
        setBulkDeleteDialogOpen(false);
    };
    const confirmBulkDelete = () => {
        if (onDeleteRows) {
            onDeleteRows(selectedRows);
            setSelectedRows(new Set());
            toast.success(`Successfully deleted ${selectedRows.size} SIR(s)`);
            setBulkDeleteDialogOpen(false);
            setCurrentPage(1);
        }
    };
    // Export single SIR to Excel
    const exportSingleSIR = (sir) => {
        const filteredSIR = visibleColumns.reduce((acc, col) => {
            acc[col.label] = sir[col.key];
            return acc;
        }, {});
        const worksheet = XLSX.utils.json_to_sheet([filteredSIR]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Details');
        const cols = visibleColumns.map(col => ({ wch: Math.max(col.label.length, 15) }));
        worksheet['!cols'] = cols;
        XLSX.writeFile(workbook, `sir-${sir.sir_id}-${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success(`SIR ${sir.sir_id} exported successfully!`);
    };
    // Delete SIR functions
    const openDeleteDialog = (sir) => {
        setSirToDelete(sir);
        setDeleteDialogOpen(true);
    };
    const confirmDelete = () => {
        if (sirToDelete && onDeleteSIR) {
            onDeleteSIR(sirToDelete.id);
            toast.success(`Successfully deleted SIR ${sirToDelete.sir_id}`);
            setDeleteDialogOpen(false);
            setSirToDelete(null);
        }
    };
    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setSirToDelete(null);
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "bg-gray-50 border-b border-gray-200 p-6", children: [_jsx("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4", children: _jsx("div", { className: "flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end", children: _jsxs("div", { className: "flex gap-2 flex-1 md:flex-none", children: [_jsxs("div", { className: "relative flex-1 md:flex-none md:w-56 lg:w-64", ref: datePickerRef, children: [_jsxs("div", { className: "flex items-center cursor-pointer", onClick: () => setShowDatePicker(!showDatePicker), children: [_jsx(Calendar, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" }), _jsx(Input, { placeholder: "Date range", value: dateRange, readOnly: true, className: "w-full pl-10 pr-4 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer focus:ring-2 focus:ring-offset-0 focus:outline-none text-sm min-w-0 truncate", title: dateRange })] }), showDatePicker && (_jsx("div", { className: "absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-72", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }), _jsx(Input, { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date" }), _jsx(Input, { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx(Button, { onClick: applyDateRange, disabled: !startDate || !endDate, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50", variant: "outline", size: "sm", children: "Apply" }), _jsx(Button, { onClick: clearDateRange, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500", size: "sm", children: "Clear" })] })] }) }))] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { size: "sm", className: "bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:w-32", onClick: openBulkDeleteDialog, disabled: true, children: "- Delete" }) })] }) }) }), selectedRows.size > 0 && (_jsxs("div", { className: "mt-4 text-sm text-gray-600", children: [selectedRows.size, " of ", sortedAndFilteredData.length, " row(s) selected"] })), dateRange && (_jsxs("div", { className: "mt-2 text-sm text-gray-500", children: ["Showing ", sortedAndFilteredData.length, " SIR(s) within date range: ", dateRange] }))] }), _jsxs("div", { className: "bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Rows:" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 w-24 justify-between", children: [_jsx("span", { children: itemsPerPage }), _jsx(ChevronDown, { className: "w-4 h-4" })] }) }), _jsxs(DropdownMenuContent, { className: "min-w-[100px] z-[100]", children: [_jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(10), children: "10" }), _jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(20), children: "20" }), _jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(50), children: "50" }), _jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(100), children: "100" })] })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [sortedAndFilteredData.length, " record(s) found"] })] }), _jsxs("div", { className: "flex-1 flex flex-col min-h-0 isolate", children: [_jsx("div", { className: "flex-1 overflow-hidden relative", children: _jsx(SirsReleasesTable, { data: paginatedData, visibleColumns: visibleColumns, selectedRows: selectedRows, onToggleRowSelection: toggleRowSelection, onToggleSelectAll: toggleSelectAllOnPage, onEditSIR: openEditDialog, onDeleteSIR: openDeleteDialog, onExportSingleSIR: exportSingleSIR }) }), _jsxs("div", { className: "border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4", children: [_jsxs("div", { className: "text-sm text-gray-600 text-center sm:text-left", children: ["Viewing ", startIndex + 1, "-", Math.min(startIndex + itemsPerPage, sortedAndFilteredData.length), " of ", sortedAndFilteredData.length, dateRange && (_jsx("span", { className: "ml-2", children: "(filtered by date range)" })), _jsxs("span", { className: "ml-2", children: ["\u2022 ", visibleColumns.length, " columns visible"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), (() => {
                                        const pages = [];
                                        const maxVisiblePages = 5;
                                        const ellipsis = "...";
                                        if (totalPages <= maxVisiblePages) {
                                            // Show all pages if total pages is small
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        }
                                        else {
                                            // Always show first page
                                            pages.push(1);
                                            if (currentPage <= 3) {
                                                // Near the beginning: 1, 2, 3, 4, ..., last
                                                for (let i = 2; i <= 4; i++) {
                                                    pages.push(i);
                                                }
                                                pages.push(ellipsis);
                                                pages.push(totalPages);
                                            }
                                            else if (currentPage >= totalPages - 2) {
                                                // Near the end: 1, ..., n-3, n-2, n-1, n
                                                pages.push(ellipsis);
                                                for (let i = totalPages - 3; i <= totalPages; i++) {
                                                    pages.push(i);
                                                }
                                            }
                                            else {
                                                // In the middle: 1, ..., current-1, current, current+1, ..., last
                                                pages.push(ellipsis);
                                                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                                    pages.push(i);
                                                }
                                                pages.push(ellipsis);
                                                pages.push(totalPages);
                                            }
                                        }
                                        return pages.map((page, index) => {
                                            if (page === ellipsis) {
                                                return (_jsx("span", { className: "min-w-9 h-9 flex items-center justify-center text-gray-500 px-2", children: ellipsis }, `ellipsis-${index}`));
                                            }
                                            return (_jsx(Button, { size: "sm", variant: currentPage === page ? "default" : "outline", onClick: () => setCurrentPage(page), className: `min-w-9 h-9 p-0 ${currentPage === page
                                                    ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                                                    : "border-gray-300 hover:bg-gray-50"}`, children: page }, page));
                                        });
                                    })(), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] })] })] }), _jsx(EditSirsReleaseDialog, { open: editDialogOpen, onOpenChange: setEditDialogOpen, sirToEdit: sirToEdit, onSave: (editedSIR) => {
                    if (onEditSIR) {
                        onEditSIR(editedSIR);
                        setEditDialogOpen(false);
                        setSirToEdit(null);
                        toast.success(`Successfully updated SIR ${editedSIR.sir_id}`);
                    }
                } }), _jsx(Dialog, { open: bulkDeleteDialogOpen, onOpenChange: setBulkDeleteDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm Bulk Deletion" }), _jsxs(DialogDescription, { children: ["Are you sure you want to delete ", selectedRows.size, " selected SIR(s)? This action cannot be undone."] })] }), _jsxs(DialogFooter, { className: "flex gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: cancelBulkDelete, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2", children: "No, Cancel" }), _jsxs(Button, { onClick: confirmBulkDelete, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2", children: ["Yes, Delete ", selectedRows.size, " SIR(s)"] })] })] }) }), _jsx(Dialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm Deletion" }), _jsxs(DialogDescription, { children: ["Are you sure you want to delete SIR ", sirToDelete?.sir_id, "? This action cannot be undone."] })] }), _jsxs(DialogFooter, { className: "flex gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: cancelDelete, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2", children: "No, Cancel" }), _jsx(Button, { onClick: confirmDelete, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2", children: "Yes, Delete" })] })] }) })] }));
}
