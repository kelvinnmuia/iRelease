import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { SirsReleaseFilters } from './sir-release-filters';
import { SirReleaseHeader } from './sirs-releases-header';
import { MapSirsDialog } from './map-sirs-dialog';
import { SirsStatCards } from './sirs-stats-cards';
import { SirReleasesChart } from './sirs-releases-chart';
import { SirReleaseDataTable } from './sirs-release-datatable/sirs-releases-datatable';
import { exportToCSV, exportToExcel, exportToJSON } from './sirs-release-datatable/utils/sirs-release-export-utils';
import { useColumnVisibility } from './sirs-releases-column-visibility';
import { parseDate, dateMatchesSearch } from './sirs-release-datatable/utils/sirs-release-date-utils';
import { toast } from "sonner";
import { transformSirsReleaseData } from './sirs-release-datatable/utils/sirs-release-data-transform';
import { getAllSirsReleases } from '@/db/ireleasedb';
export function SirsRelease() {
    // State for filters
    const [selectedRelease, setSelectedRelease] = useState('');
    const [selectedIteration, setSelectedIteration] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');
    const [dateRange, setDateRange] = useState('');
    // Add these states to track the actual release/iteration names
    const [selectedReleaseName, setSelectedReleaseName] = useState('');
    const [selectedIterationName, setSelectedIterationName] = useState('');
    // State for selection and counts in DataTable
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectedRowsCount, setSelectedRowsCount] = useState(0);
    const [totalFilteredCount, setTotalFilteredCount] = useState(0);
    const [allData, setAllData] = useState([]);
    // Add state to control dialog visibility
    const [showMapSirsDialog, setShowMapSirsDialog] = useState(false);
    // Add state to control tab/view
    const [activeView, setActiveView] = useState('overview');
    // Add loading state
    const [isLoading, setIsLoading] = useState(true);
    // Function to transform Dexie SirsReleaseRecord to SirReleaseData format
    const transformDexieToSirReleaseData = useCallback((dexieData) => {
        return dexieData.map((item, index) => ({
            id: item.id || index + 1, // Use Dexie id or fallback to index
            sir_release_id: item.Sir_Rel_Id || '',
            sir_id: item.Sir_id || 0,
            release_version: item.Release_version || '',
            iteration: item.Iteration ? parseInt(item.Iteration) : 0,
            changed_date: item.Change_date || '',
            bug_severity: item.Bug_severity || '',
            priority: item.Priority || '',
            assigned_to: item.Assigned_to || '',
            bug_status: item.Bug_status || '',
            resolution: item.Resolution || '',
            component: item.Component || '',
            op_sys: item.Op_sys || '',
            short_desc: item.Short_desc || '',
            cf_sirwith: item.Cf_sirwith || ''
        }));
    }, []);
    // Load data from Dexie on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                console.log('📥 Loading SIRs-Releases data from Dexie...');
                // Fetch data from Dexie
                const dexieData = await getAllSirsReleases();
                console.log(`✅ Loaded ${dexieData.length} SIRs-Releases from Dexie`);
                if (dexieData.length === 0) {
                    console.log('ℹ️ No SIRs-Releases data found in Dexie');
                }
                // Transform to component format
                const transformedData = transformDexieToSirReleaseData(dexieData);
                // Apply additional transformation if needed
                const finalData = transformSirsReleaseData(transformedData);
                setAllData(finalData);
            }
            catch (error) {
                console.error('❌ Failed to load data from Dexie:', error);
                toast.error("Failed to load SIRs-Releases data");
            }
            finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [transformDexieToSirReleaseData]);
    // Extract unique release versions and iterations from the JSON data
    const releaseVersions = useMemo(() => {
        const versions = [...new Set(allData.map(item => item.release_version))];
        return versions.map((version, index) => ({
            id: (index + 1).toString(),
            name: version
        }));
    }, [allData]);
    const iterations = useMemo(() => {
        const uniqueIterations = [...new Set(allData.map(item => item.iteration.toString()))];
        return uniqueIterations.map((iteration, index) => ({
            id: (index + 1).toString(),
            name: iteration
        }));
    }, [allData]);
    // Update the actual names when IDs are selected
    useEffect(() => {
        if (selectedRelease) {
            const releaseObj = releaseVersions.find(r => r.id === selectedRelease);
            setSelectedReleaseName(releaseObj?.name || '');
        }
        else {
            setSelectedReleaseName('');
        }
    }, [selectedRelease, releaseVersions]);
    useEffect(() => {
        if (selectedIteration) {
            const iterationObj = iterations.find(i => i.id === selectedIteration);
            setSelectedIterationName(iterationObj?.name || '');
        }
        else {
            setSelectedIterationName('');
        }
    }, [selectedIteration, iterations]);
    // MEMOIZED: Filter data based on selected release and iteration
    const filteredData = useMemo(() => {
        let filtered = allData;
        // Filter by release version (using the actual name, not ID)
        if (selectedReleaseName) {
            filtered = filtered.filter(item => item.release_version === selectedReleaseName);
        }
        // Filter by iteration (using the actual iteration number, not ID)
        if (selectedIterationName) {
            filtered = filtered.filter(item => item.iteration.toString() === selectedIterationName);
        }
        // Apply global filter
        if (globalFilter) {
            const searchTerm = globalFilter.toLowerCase();
            filtered = filtered.filter(item => {
                // Check standard text fields
                const textMatch = item.short_desc?.toLowerCase().includes(searchTerm) ||
                    item.bug_severity?.toLowerCase().includes(searchTerm) ||
                    item.component?.toLowerCase().includes(searchTerm) ||
                    item.assigned_to?.toLowerCase().includes(searchTerm) ||
                    item.bug_status?.toLowerCase().includes(searchTerm) ||
                    item.resolution?.toLowerCase().includes(searchTerm) ||
                    item.op_sys?.toLowerCase().includes(searchTerm) ||
                    item.cf_sirwith?.toLowerCase().includes(searchTerm) ||
                    item.release_version?.toLowerCase().includes(searchTerm) ||
                    item.priority?.toLowerCase().includes(searchTerm) ||
                    // Basic text search on date field
                    (item.changed_date && item.changed_date.toLowerCase().includes(searchTerm)) ||
                    item.sir_id?.toString().toLowerCase().includes(searchTerm) ||
                    item.sir_release_id?.toString().toLowerCase().includes(searchTerm) ||
                    item.iteration?.toString().toLowerCase().includes(searchTerm);
                // If standard text matches, return true
                if (textMatch)
                    return true;
                // Special handling for date searching
                if (item.changed_date) {
                    return dateMatchesSearch(item.changed_date, searchTerm);
                }
                return false;
            });
        }
        return filtered;
    }, [selectedReleaseName, selectedIterationName, globalFilter, allData]);
    // Apply date range filter to the data
    const filteredDataWithDateRange = useMemo(() => {
        if (!dateRange)
            return filteredData;
        const rangeParts = dateRange.split(' - ');
        if (rangeParts.length !== 2)
            return filteredData;
        const [startStr, endStr] = rangeParts;
        const startDate = parseDate(startStr.trim());
        const endDate = parseDate(endStr.trim());
        if (!startDate || !endDate)
            return filteredData;
        return filteredData.filter(item => {
            const itemDate = parseDate(item.changed_date);
            return itemDate && itemDate >= startDate && itemDate <= endDate;
        });
    }, [filteredData, dateRange]);
    // Update total filtered count
    useEffect(() => {
        setTotalFilteredCount(filteredDataWithDateRange.length);
    }, [filteredDataWithDateRange]);
    // Update selected rows count when selection changes
    useEffect(() => {
        setSelectedRowsCount(selectedRows.size);
    }, [selectedRows]);
    // Get column visibility hook first (before using visibleColumns)
    const { columnVisibility, toggleColumnVisibility, resetColumnVisibility, visibleColumns } = useColumnVisibility();
    // Export handlers - UPDATED: Now uses id directly
    const handleExportCSV = useCallback(() => {
        // Get the data to export - ONLY the filtered data (with date range applied)
        let dataToExport = filteredDataWithDateRange;
        // If there are selected rows, filter to only include selected rows
        if (selectedRows.size > 0) {
            dataToExport = filteredDataWithDateRange.filter(item => selectedRows.has(item.id));
        }
        const success = exportToCSV(dataToExport, visibleColumns, selectedRows);
        if (success) {
            toast.success("CSV exported successfully!");
        }
        else {
            toast.error("Failed to export CSV");
        }
    }, [filteredDataWithDateRange, visibleColumns, selectedRows]);
    const handleExportExcel = useCallback(() => {
        // Get the data to export - ONLY the filtered data (with date range applied)
        let dataToExport = filteredDataWithDateRange;
        // If there are selected rows, filter to only include selected rows
        if (selectedRows.size > 0) {
            dataToExport = filteredDataWithDateRange.filter(item => selectedRows.has(item.id));
        }
        const success = exportToExcel(dataToExport, visibleColumns, selectedRows);
        if (success) {
            toast.success("Excel file exported successfully!");
        }
        else {
            toast.error("Failed to export Excel file");
        }
    }, [filteredDataWithDateRange, visibleColumns, selectedRows]);
    const handleExportJSON = useCallback(() => {
        // Get the data to export - ONLY the filtered data (with date range applied)
        let dataToExport = filteredDataWithDateRange;
        // If there are selected rows, filter to only include selected rows
        if (selectedRows.size > 0) {
            dataToExport = filteredDataWithDateRange.filter(item => selectedRows.has(item.id));
        }
        const success = exportToJSON(dataToExport, visibleColumns, selectedRows);
        if (success) {
            toast.success("JSON exported successfully!");
        }
        else {
            toast.error("Failed to export JSON");
        }
    }, [filteredDataWithDateRange, visibleColumns, selectedRows]);
    const handleMapSirs = useCallback(() => {
        console.log('Map SIRs clicked');
        setShowMapSirsDialog(true);
    }, []);
    const handleMapSirsSubmit = useCallback((releaseVersion, iteration, sirs) => {
        console.log('Placeholder - will implement later:', { releaseVersion, iteration, sirs });
        setShowMapSirsDialog(false);
    }, []);
    // Callback to handle row selection from DataTable
    const handleRowSelectionChange = useCallback((selectedIds) => {
        setSelectedRows(selectedIds);
    }, []);
    // Handle date range change from DataTable
    const handleDateRangeChange = useCallback((range) => {
        setDateRange(range);
    }, []);
    // CRUD operations - UPDATED to use id
    const handleAddSIR = useCallback((sirData) => {
        // Generate new id
        const newId = allData.length > 0 ? Math.max(...allData.map(item => item.id)) + 1 : 1;
        const newItem = {
            id: newId,
            sir_release_id: sirData.sir_release_id,
            sir_id: sirData.sir_id,
            release_version: sirData.release_version,
            iteration: Number(sirData.iteration),
            changed_date: sirData.changed_date,
            bug_severity: sirData.bug_severity,
            priority: sirData.priority,
            assigned_to: sirData.assigned_to,
            bug_status: sirData.bug_status,
            resolution: sirData.resolution,
            component: sirData.component,
            op_sys: sirData.op_sys,
            short_desc: sirData.short_desc,
            cf_sirwith: sirData.cf_sirwith
        };
        const newData = [...allData, newItem];
        setAllData(newData);
    }, [allData]);
    const handleEditSIR = useCallback((sirData) => {
        const updatedData = allData.map(item => item.id === sirData.id ? {
            ...item,
            sir_release_id: sirData.sir_release_id,
            sir_id: sirData.sir_id,
            release_version: sirData.release_version,
            iteration: Number(sirData.iteration),
            changed_date: sirData.changed_date,
            bug_severity: sirData.bug_severity,
            priority: sirData.priority,
            assigned_to: sirData.assigned_to,
            bug_status: sirData.bug_status,
            resolution: sirData.resolution,
            component: sirData.component,
            op_sys: sirData.op_sys,
            short_desc: sirData.short_desc,
            cf_sirwith: sirData.cf_sirwith
        } : item);
        setAllData(updatedData);
    }, [allData]);
    const handleDeleteSIR = useCallback((id) => {
        const updatedData = allData.filter(item => item.id !== id);
        setAllData(updatedData);
        // Remove from selected rows if it was selected
        const newSelectedRows = new Set(selectedRows);
        newSelectedRows.delete(id);
        setSelectedRows(newSelectedRows);
    }, [allData, selectedRows]);
    const handleDeleteRows = useCallback((ids) => {
        const updatedData = allData.filter(item => !ids.has(item.id));
        setAllData(updatedData);
        setSelectedRows(new Set());
    }, [allData]);
    // MEMOIZED: Format the filtered data for the DataTable - ADD id field
    const formattedDataForDataTable = useMemo(() => {
        return filteredDataWithDateRange.map(item => ({
            id: item.id,
            sir_release_id: item.sir_release_id,
            sir_id: item.sir_id,
            release_version: item.release_version,
            iteration: item.iteration.toString(),
            changed_date: item.changed_date,
            bug_severity: item.bug_severity,
            priority: item.priority,
            assigned_to: item.assigned_to,
            bug_status: item.bug_status,
            resolution: item.resolution,
            component: item.component,
            op_sys: item.op_sys,
            short_desc: item.short_desc,
            cf_sirwith: item.cf_sirwith
        }));
    }, [filteredDataWithDateRange]);
    // Check if we have data to show - UPDATED LOGIC
    const hasReleaseAndIteration = selectedRelease && selectedIteration;
    const hasDataAfterReleaseIterationFilter = hasReleaseAndIteration && filteredData.length > 0; // Use filteredData (before date range)
    const hasSearch = !!globalFilter;
    const hasDateRange = !!dateRange;
    const noDataAndNoSearch = hasReleaseAndIteration && filteredData.length === 0 && !hasSearch && !hasDateRange;
    // Show loading state
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Loading SIRs-Releases data..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(MapSirsDialog, { open: showMapSirsDialog, onOpenChange: setShowMapSirsDialog, onMapSirs: handleMapSirsSubmit }), _jsx(SirReleaseHeader, { selectedRowsCount: selectedRowsCount, totalFilteredCount: filteredDataWithDateRange.length, globalFilter: globalFilter }), _jsx(SirsReleaseFilters, { selectedRelease: selectedRelease, selectedIteration: selectedIteration, globalFilter: globalFilter, selectedRowsCount: selectedRowsCount, setSelectedRelease: setSelectedRelease, setSelectedIteration: setSelectedIteration, setGlobalFilter: setGlobalFilter, releaseVersions: releaseVersions, iterations: iterations, isDatatableView: activeView === 'datatable', onExportCSV: handleExportCSV, onExportExcel: handleExportExcel, onExportJSON: handleExportJSON, onMapSirs: handleMapSirs, columnVisibility: columnVisibility, toggleColumnVisibility: toggleColumnVisibility, resetColumnVisibility: resetColumnVisibility }), !selectedRelease || !selectedIteration ? (
            // Show when no release/iteration is selected
            _jsx("div", { className: "px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6", children: _jsxs("div", { className: "bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center", children: [_jsxs("div", { className: "flex justify-center mb-5 sm:mb-6 relative", children: [_jsx("div", { className: "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full" }), _jsx("svg", { className: "w-25 h-25 sm:w-30 sm:h-30 text-gray-400 relative z-10", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" }) })] }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2", children: "No SIRs Analysis Data" }), _jsxs("div", { className: "mt-2 sm:mt-2 max-w-lg sm:max-w-xl", children: [_jsx("p", { className: "text-gray-600 mx-auto text-sm sm:text-base leading-relaxed", children: "Please select a release version and iteration to view its SIRs analysis." }), allData.length === 0 && (_jsx("p", { className: "text-gray-500 text-sm mt-2", children: "No SIRs-Releases data found in local database." }))] })] }) })) : noDataAndNoSearch ? (
            // Show when release/iteration has no data AND no search is active AND no date range is applied
            _jsx("div", { className: "px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6", children: _jsxs("div", { className: "bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center", children: [_jsxs("div", { className: "flex justify-center mb-5 sm:mb-6 relative", children: [_jsx("div", { className: "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full" }), _jsx("svg", { className: "w-25 h-25 sm:w-30 sm:h-30 text-gray-400 relative z-10", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })] }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2", children: "No SIRs Found" }), _jsxs("div", { className: "mt-2 sm:mt-2 max-w-lg sm:max-w-xl", children: [_jsxs("p", { className: "text-gray-600 mx-auto text-sm sm:text-base leading-relaxed", children: ["No SIRs found for Release ", selectedReleaseName, " \u2022 Iteration ", selectedIterationName] }), _jsx("p", { className: "text-gray-500 text-sm mt-2", children: "Try selecting a different release or iteration." })] })] }) })) : (
            // Show tabs/datatable when:
            // 1. There IS data (before date range is applied), OR
            // 2. User is searching (even with 0 results), OR
            // 3. User has applied a date range (even if it filters out all data)
            _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "px-4 sm:px-6 pt-1", children: _jsxs("div", { className: "flex space-x-1 border-b border-gray-200", children: [_jsx("button", { onClick: () => setActiveView('overview'), className: `px-4 py-2 text-sm font-medium transition-colors ${activeView === 'overview'
                                        ? 'text-red-600 border-b-2 border-red-600'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Overview" }), _jsx("button", { onClick: () => setActiveView('datatable'), className: `px-4 py-2 text-sm font-medium transition-colors ${activeView === 'datatable'
                                        ? 'text-red-600 border-b-2 border-red-600'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Data Table" })] }) }), activeView === 'overview' ? (_jsxs("div", { className: "px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6", children: [_jsxs("h3", { className: "text-base font-medium text-gray-500 mb-8", children: ["SIRs breakdown for release version ", selectedReleaseName, " iteration ", selectedIterationName, globalFilter && ` • Matching "${globalFilter}"`, dateRange && ` • Date range: ${dateRange}`] }), _jsx("div", { className: "mb-6", children: _jsx(SirsStatCards, { sirReleaseData: filteredDataWithDateRange.map(item => ({
                                        ...item,
                                        sir_release_id: Number(item.sir_release_id)
                                    })) }) }), _jsx(SirReleasesChart, { sirReleaseData: filteredDataWithDateRange.map(item => ({
                                    ...item,
                                    sir_release_id: Number(item.sir_release_id)
                                })), selectedReleaseName: selectedReleaseName, selectedIterationName: selectedIterationName })] })) : (_jsxs("div", { className: "px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6", children: [_jsx("div", { className: "mb-2", children: _jsxs("h3", { className: "text-base font-medium text-gray-500", children: ["SIRs Data Table for release version ", selectedReleaseName, " iteration ", selectedIterationName, dateRange && ` • Date range: ${dateRange}`] }) }), _jsx(SirReleaseDataTable, { filteredData: formattedDataForDataTable, onRowSelectionChange: handleRowSelectionChange, visibleColumns: visibleColumns, columnVisibility: columnVisibility, toggleColumnVisibility: toggleColumnVisibility, resetColumnVisibility: resetColumnVisibility, onDateRangeChange: handleDateRangeChange, onDeleteRows: handleDeleteRows, onAddSIR: handleAddSIR, onEditSIR: handleEditSIR, onDeleteSIR: handleDeleteSIR })] }))] }))] }));
}
