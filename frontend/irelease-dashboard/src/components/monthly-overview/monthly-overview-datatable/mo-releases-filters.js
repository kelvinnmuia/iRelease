import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnVisibilityMenu } from "./mo-column-visibility-menu";
import { ExportMenu } from "./mo-export-menu";
import { DateRangePicker } from "./mo-date-range-picker";
export const ReleasesFilters = ({ globalFilter, setGlobalFilter, dateRange, setDateRange, startDate, setStartDate, endDate, setEndDate, sortOrder, setSortOrder, columnVisibility, toggleColumnVisibility, resetColumnVisibility, itemsPerPage, setItemsPerPage, onAddRelease, onBulkDelete, selectedRowsCount, exportToCSV, exportToExcel, exportToJSON, onApplyDateRange, onClearDateRange, totalFilteredCount }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);
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
    /*const applyDateRange = () => {
        if (startDate && endDate) {
            setShowDatePicker(false);
        }
    };

    const clearDateRange = () => {
        setDateRange("");
        setStartDate("");
        setEndDate("");
        setShowDatePicker(false);
    };*/
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-gray-50 border-b border-gray-200 pb-6 -mt-6", children: _jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-2 xl:flex-1 xl:max-w-2xl", children: [_jsxs("div", { className: "flex gap-2 flex-1 md:flex-none", children: [_jsx(ExportMenu, { onExportCSV: exportToCSV, onExportExcel: exportToExcel, onExportJSON: exportToJSON, selectedRowsCount: selectedRowsCount }), _jsx(ColumnVisibilityMenu, { columnVisibility: columnVisibility, toggleColumnVisibility: toggleColumnVisibility, resetColumnVisibility: resetColumnVisibility })] }), _jsx("div", { className: "flex-1 min-w-0", children: _jsxs("div", { className: "relative max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 lg:w-4 text-gray-500 pointer-events-none" }), _jsx(Input, { placeholder: "Search releases...", value: globalFilter, onChange: (e) => {
                                                    setGlobalFilter(e.target.value);
                                                }, className: "w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 focus:ring-2 focus:ring-offset-0 focus:outline-none" })] }) })] }), _jsxs("div", { className: "flex flex-col md:flex-row gap-2 xl:flex-1 xl:justify-end", children: [_jsxs("div", { className: "flex gap-2 flex-1 md:flex-none", children: [_jsx(DateRangePicker, { dateRange: dateRange, startDate: startDate, endDate: endDate, showDatePicker: showDatePicker, onShowDatePickerChange: setShowDatePicker, onStartDateChange: setStartDate, onEndDateChange: setEndDate, onApply: () => {
                                                onApplyDateRange();
                                                setShowDatePicker(false);
                                            }, onClear: () => {
                                                onClearDateRange();
                                                setShowDatePicker(false);
                                            }, datePickerRef: datePickerRef }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 flex-1 md:flex-none md:w-36 justify-center", children: [_jsx("span", { children: "Order by" }), _jsx(ChevronDown, { className: "w-4 h-4" })] }) }), _jsxs(DropdownMenuContent, { className: "min-w-[130px]", children: [_jsx(DropdownMenuItem, { onClick: () => setSortOrder("newest"), children: "Date (Newest)" }), _jsx(DropdownMenuItem, { onClick: () => setSortOrder("oldest"), children: "Date (Oldest)" })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32 lg:w-28", onClick: onAddRelease, disabled: true, children: "+ Add New" }), _jsx(Button, { size: "sm", className: "bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:w-32 lg:w-28", onClick: onBulkDelete, disabled: true, children: "- Delete" })] })] })] }) }), _jsxs("div", { className: "bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Rows:" }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 w-24 justify-between", children: [_jsx("span", { children: itemsPerPage }), _jsx(ChevronDown, { className: "w-4 h-4" })] }) }), _jsxs(DropdownMenuContent, { className: "min-w-[100px]", children: [_jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(10), children: "10" }), _jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(20), children: "20" }), _jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(50), children: "50" }), _jsx(DropdownMenuItem, { onClick: () => setItemsPerPage(100), children: "100" })] })] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [totalFilteredCount, " record(s) found"] })] })] }));
};
