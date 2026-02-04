import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Release, SortOrder } from "./types/releases";
import { allColumns } from "./constants/releases-constants";
import {
    loadColumnVisibility,
    saveColumnVisibility,
    loadDateRangeFilter,
    saveDateRangeFilter,
    loadDateRangeDetails,
    saveDateRangeDetails,
    clearDateRangeDetails,
    loadItemsPerPage,
    saveItemsPerPage
} from "./utils/storage-utils";
import { parseDate, getLatestDate, getEarliestDate, formatDate, formatISODate } from "./utils/date-utils";
import { exportToCSV, exportToExcel, exportToJSON, exportSingleRelease } from "./utils/export-utils";
import { ReleasesHeader } from "./release-header";
import { ReleasesFilters } from "./releases-filters";
import { ReleasesTable } from "./releases-table";
import { ReleasesPagination } from "./releases-pagination";
import { AddReleaseDialog } from "./add-release-dialog";
import { EditReleaseDialog } from "./edit-release-dialog";
import { DeleteDialogs } from "./delete-dialogs";
import { transformReleasesData } from "./utils/data-transform";
import { getAllReleases, initializeReleasesDatabase } from "@/db/ireleasedb";
import { deleteReleaseFromFrontendData } from "@/db/delete-release";

export function ReleasesDataTable() {
    // State management
    const [data, setData] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [globalFilter, setGlobalFilter] = useState("");
    const [dateRange, setDateRange] = useState(() => loadDateRangeFilter());
    const [startDate, setStartDate] = useState(() => loadDateRangeDetails().startDate);
    const [endDate, setEndDate] = useState(() => loadDateRangeDetails().endDate);
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
        () => loadColumnVisibility()
    );
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [releaseToDelete, setReleaseToDelete] = useState<Release | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(() => loadItemsPerPage());

    // Load data from Dexie on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                
                // Initialize the database (will fetch from AppScript if empty)
                await initializeReleasesDatabase();
                
                // Fetch all releases from Dexie
                const releases = await getAllReleases();
                
                // Transform the data to match your Release type
                const transformedData = transformReleasesData(releases);
                setData(transformedData);
                
            } catch (err) {
                console.error("Error loading data from Dexie:", err);
                toast.error("Failed to load releases data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []); // Empty dependency array means this runs once on mount

    // Save to localStorage whenever state changes
    useEffect(() => saveColumnVisibility(columnVisibility), [columnVisibility]);
    useEffect(() => saveDateRangeFilter(dateRange), [dateRange]);
    useEffect(() => {
        if (startDate || endDate) saveDateRangeDetails(startDate, endDate);
    }, [startDate, endDate]);
    useEffect(() => saveItemsPerPage(itemsPerPage), [itemsPerPage]);
    useEffect(() => setCurrentPage(1), [itemsPerPage]);

    // Filter and sort data
    const filteredData = data.filter(item => {
        // Global text search
        const matchesGlobalSearch = !globalFilter ||
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(globalFilter.toLowerCase())
            );

        // Date range filter
        const matchesDateRange = !dateRange || (() => {
            const rangeParts = dateRange.split(' - ');
            if (rangeParts.length !== 2) return true;

            const [startStr, endStr] = rangeParts;
            const startDateObj = parseDate(startStr.trim());
            const endDateObj = parseDate(endStr.trim());

            if (!startDateObj || !endDateObj) return true;

            // Check if any of the date fields fall within the range
            const dateFields = [
                'deliveredDate', 'tdNoticeDate', 'testDeployDate',
                'testStartDate', 'testEndDate', 'prodDeployDate'
            ];

            return dateFields.some(field => {
                const itemDate = parseDate(item[field as keyof Release] as string);
                return itemDate && itemDate >= startDateObj && itemDate <= endDateObj;
            });
        })();

        return matchesGlobalSearch && matchesDateRange;
    });

    const sortedAndFilteredData = [...filteredData].sort((a, b) => {
        if (!sortOrder) return 0;

        let dateA: Date | null = null;
        let dateB: Date | null = null;

        if (sortOrder === "newest") {
            dateA = getLatestDate(a);
            dateB = getLatestDate(b);
        } else {
            dateA = getEarliestDate(a);
            dateB = getEarliestDate(b);
        }

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        if (sortOrder === "newest") {
            return dateB.getTime() - dateA.getTime();
        } else {
            return dateA.getTime() - dateB.getTime();
        }
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage);
    const visibleColumns = allColumns.filter(col => columnVisibility[col.key]);

    // Get IDs of all items on the current page
    const currentPageIds = new Set(paginatedData.map(item => item.id));

    // Check if all items on current page are selected
    const allCurrentPageSelected = paginatedData.length > 0 &&
        paginatedData.every(item => selectedRows.has(item.id));

    // Check if some items on current page are selected (for indeterminate state)
    const someCurrentPageSelected = paginatedData.length > 0 &&
        paginatedData.some(item => selectedRows.has(item.id)) &&
        !allCurrentPageSelected;

    // Row selection handlers
    const toggleRowSelection = useCallback((id: number) => {
        setSelectedRows(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(id)) {
                newSelected.delete(id);
            } else {
                newSelected.add(id);
            }
            return newSelected;
        });
    }, []);

    // Select/deselect all rows on current page
    const toggleSelectAllOnPage = useCallback(() => {
        const newSelected = new Set(selectedRows);

        if (allCurrentPageSelected) {
            // Deselect all items on current page
            currentPageIds.forEach(id => newSelected.delete(id));
        } else {
            // Select all items on current page
            currentPageIds.forEach(id => newSelected.add(id));
        }

        setSelectedRows(newSelected);
    }, [allCurrentPageSelected, currentPageIds, selectedRows]);

    // Column visibility handlers
    const toggleColumnVisibility = useCallback((columnKey: string) => {
        setColumnVisibility(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    }, []);

    const resetColumnVisibility = useCallback(() => {
        const defaultVisibility = allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
        setColumnVisibility(defaultVisibility);
        toast.success("Column visibility reset to default");
    }, []);

    // Date range handlers
    const applyDateRange = useCallback(() => {
        if (startDate && endDate) {
            const start = parseDate(startDate);
            const end = parseDate(endDate);

            if (start && end) {
                const formattedStart = formatDate(start);
                const formattedEnd = formatDate(end);
                setDateRange(`${formattedStart} - ${formattedEnd}`);
                setCurrentPage(1);
            }
        }
    }, [startDate, endDate]);

    const clearDateRange = useCallback(() => {
        setDateRange("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        saveDateRangeFilter("");
        clearDateRangeDetails();
    }, []);

    // Release management handlers
    const handleAddRelease = useCallback((newRelease: Release) => {
        setData(prev => [...prev, newRelease]);
        setAddDialogOpen(false);
        setCurrentPage(1);
        // toast.success(`Successfully created new release ${newRelease.releaseId}`);
    }, []);

    const handleEditRelease = useCallback((updatedRelease: Release) => {
        setData(prev => prev.map(item =>
            item.id === updatedRelease.id ? updatedRelease : item
        ));
        setEditDialogOpen(false);
        setReleaseToEdit(null);
        // toast.success(`Successfully updated release ${updatedRelease.releaseVersion}`);
    }, []);

    const handleBulkDelete = useCallback(() => {
        setData(prev => prev.filter(item => !selectedRows.has(item.id)));
        setSelectedRows(new Set());
        setBulkDeleteDialogOpen(false);
        setCurrentPage(1);
        toast.success(`Successfully deleted ${selectedRows.size} release(s)`);
    }, [selectedRows]);

    const handleSingleDelete = useCallback(() => {
        if (releaseToDelete) {
            setData(prev => prev.filter(item => item.id !== releaseToDelete.id));
            setDeleteDialogOpen(false);
            setReleaseToDelete(null);
            setCurrentPage(1);
           // toast.success(`Successfully deleted release ${releaseToDelete.releaseVersion}`);
        }
    }, [releaseToDelete]);

    // Export handlers
    const handleExportCSV = useCallback(() => {
        exportToCSV(sortedAndFilteredData, visibleColumns, selectedRows);
        toast.success("CSV exported successfully!");
    }, [sortedAndFilteredData, visibleColumns, selectedRows]);

    const handleExportExcel = useCallback(() => {
        exportToExcel(sortedAndFilteredData, visibleColumns, selectedRows);
        toast.success("Excel file exported successfully!");
    }, [sortedAndFilteredData, visibleColumns, selectedRows]);

    const handleExportJSON = useCallback(() => {
        const success = exportToJSON(sortedAndFilteredData, visibleColumns, selectedRows);
        if (success) {
            toast.success("JSON exported successfully!");
        } else {
            toast.error("Failed to export JSON");
        }
    }, [sortedAndFilteredData, visibleColumns, selectedRows]);

    const handleExportSingleRelease = useCallback((release: Release) => {
        exportSingleRelease(release);
        toast.success(`Release ${release.releaseId} exported successfully!`);
    }, []);

    // Dialog handlers
    const openBulkDeleteDialog = useCallback(() => {
        if (selectedRows.size === 0) {
            toast.error("Please select at least one release to delete");
            return;
        }
        setBulkDeleteDialogOpen(true);
    }, [selectedRows.size]);

    const openDeleteDialog = useCallback((release: Release) => {
        setReleaseToDelete(release);
        setDeleteDialogOpen(true);
    }, []);

    const openEditDialog = useCallback((release: Release) => {
        setReleaseToEdit(release);
        setEditDialogOpen(true);
    }, []);

    // Show loading state
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading releases from database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
             <div className="flex-shrink-0 bg-white">
            <ReleasesHeader
                selectedRowsCount={selectedRows.size}
                totalFilteredCount={sortedAndFilteredData.length}
                globalFilter={globalFilter}
                dateRange={dateRange}
            />

            <ReleasesFilters
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                columnVisibility={columnVisibility}
                toggleColumnVisibility={toggleColumnVisibility}
                resetColumnVisibility={resetColumnVisibility}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                onAddRelease={() => setAddDialogOpen(true)}
                onBulkDelete={openBulkDeleteDialog}
                selectedRowsCount={selectedRows.size}
                totalFilteredCount={sortedAndFilteredData.length}
                exportToCSV={handleExportCSV}
                exportToExcel={handleExportExcel}
                exportToJSON={handleExportJSON}
                onApplyDateRange={applyDateRange}
                onClearDateRange={clearDateRange}
            />
            </div>

            {/* Scrollable container ONLY for the table and pagination */}
            <div className="flex-1 flex flex-col min-h-0 isolate">
                {/* Table with vertical scrolling - NO sticky headers interfering with filters */}
                <div className="flex-1 overflow-hidden relative">
                    <ReleasesTable
                        data={paginatedData}
                        visibleColumns={visibleColumns}
                        selectedRows={selectedRows}
                        onToggleRowSelection={toggleRowSelection}
                        onToggleSelectAll={toggleSelectAllOnPage}
                        onEditRelease={openEditDialog}
                        onDeleteRelease={openDeleteDialog}
                        onExportSingleRelease={handleExportSingleRelease}
                    />
                </div>

                <ReleasesPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={sortedAndFilteredData.length}
                    startIndex={startIndex}
                    onPageChange={setCurrentPage}
                    visibleColumnsCount={visibleColumns.length}
                />
            </div>

            <AddReleaseDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onSave={handleAddRelease}
                existingData={data}
            />

            <EditReleaseDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                release={releaseToEdit}
                onSave={handleEditRelease}
            />

            <DeleteDialogs
                bulkDeleteOpen={bulkDeleteDialogOpen}
                setBulkDeleteOpen={setBulkDeleteDialogOpen}
                singleDeleteOpen={deleteDialogOpen}
                setSingleDeleteOpen={setDeleteDialogOpen}
                releaseToDelete={releaseToDelete}
                selectedRowsCount={selectedRows.size}
                onBulkDelete={handleBulkDelete}
                onSingleDelete={handleSingleDelete}
            />
        </div>
    );
}