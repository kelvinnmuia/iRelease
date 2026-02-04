import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnVisibilityMenu } from "./mo-column-visibility-menu";
import { ExportMenu } from "./mo-export-menu";
import { DateRangePicker } from "./mo-date-range-picker";
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

export const ReleasesFilters = ({
    globalFilter,
    setGlobalFilter,
    dateRange,
    setDateRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortOrder,
    setSortOrder,
    columnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
    itemsPerPage,
    setItemsPerPage,
    onAddRelease,
    onBulkDelete,
    selectedRowsCount,
    exportToCSV,
    exportToExcel,
    exportToJSON,
    onApplyDateRange,
    onClearDateRange,
    totalFilteredCount
}: ReleasesFiltersProps) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
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

    return (
        <>
            {/* Enhanced Responsive Controls */}
            <div className="bg-gray-50 border-b border-gray-200 pb-6 -mt-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    {/* Left Section - Export, Show/Hide, Search */}
                    <div className="flex flex-col md:flex-row gap-2 xl:flex-1 xl:max-w-2xl">
                        {/* Export and Show/Hide - Always visible */}
                        <div className="flex gap-2 flex-1 md:flex-none">
                            <ExportMenu
                                onExportCSV={exportToCSV}
                                onExportExcel={exportToExcel}
                                onExportJSON={exportToJSON}
                                selectedRowsCount={selectedRowsCount}
                            />

                            <ColumnVisibilityMenu
                                columnVisibility={columnVisibility}
                                toggleColumnVisibility={toggleColumnVisibility}
                                resetColumnVisibility={resetColumnVisibility}
                            />
                        </div>

                        {/* Search Input */}
                        <div className="flex-1 min-w-0">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 lg:w-4 text-gray-500 pointer-events-none" />
                                <Input
                                    placeholder="Search releases..."
                                    value={globalFilter}
                                    onChange={(e) => {
                                        setGlobalFilter(e.target.value);
                                    }}
                                    className="w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 focus:ring-2 focus:ring-offset-0 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Date Range, Ordering, Add/Delete */}
                    <div className="flex flex-col md:flex-row gap-2 xl:flex-1 xl:justify-end">
                        {/* Date Range and Ordering - Always visible */}
                        <div className="flex gap-2 flex-1 md:flex-none">
                            <DateRangePicker
                                dateRange={dateRange}
                                startDate={startDate}
                                endDate={endDate}
                                showDatePicker={showDatePicker}
                                onShowDatePickerChange={setShowDatePicker}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                                onApply={() => {
                                    onApplyDateRange();
                                    setShowDatePicker(false);
                                }}
                                onClear={() => {
                                    onClearDateRange();
                                    setShowDatePicker(false);
                                }}
                                datePickerRef={datePickerRef as RefObject<HTMLDivElement>}
                            />

                            {/* Ordering */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 flex-1 md:flex-none md:w-36 justify-center">
                                        <span>Order by</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="min-w-[130px]">
                                    <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                                        Date (Newest)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                                        Date (Oldest)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Add and Delete Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32 lg:w-28"
                                onClick={onAddRelease}
                                disabled={true}
                            >
                                + Add New
                            </Button>
                            <Button
                                size="sm"
                                className="bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:w-32 lg:w-28"
                                onClick={onBulkDelete}
                                disabled={true}
                            >
                                - Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rows Per Page Selector */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 w-24 justify-between">
                                <span>{itemsPerPage}</span>
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-[100px]">
                            <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                                10
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemsPerPage(20)}>
                                20
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                                50
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemsPerPage(100)}>
                                100
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="text-sm text-gray-600">
                    {totalFilteredCount} record(s) found
                </div>
            </div>
        </>
    );
};