import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { SirsReleaseFilters } from './sir-release-filters'
import { SirReleaseHeader } from './sirs-releases-header'
import { MapSirsDialog } from './map-sirs-dialog'
import { SirsStatCards } from './sirs-stats-cards'
import { SirReleasesChart } from './sirs-releases-chart'
import { SirReleaseDataTable } from './sirs-release-datatable/sirs-releases-datatable'
import sirReleaseData from './sir-release-data.json'
import { SirReleaseData, ColumnConfig } from './sirs-release-datatable/types/sirs-releases-types'
import { exportToCSV, exportToExcel, exportToJSON } from './sirs-release-datatable/utils/sirs-release-export-utils'
import { useColumnVisibility } from './sirs-releases-column-visibility'
import { parseDate, formatDate, dateMatchesSearch } from './sirs-release-datatable/utils/sirs-release-date-utils'
import { toast } from "sonner"
import { transformSirsReleaseData } from './sirs-release-datatable/utils/sirs-release-data-transform'

export function MonthlyOverview() {
    // State for filters
    const [selectedRelease, setSelectedRelease] = useState<string>('')
    const [selectedIteration, setSelectedIteration] = useState<string>('')
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [dateRange, setDateRange] = useState<string>('')

    // Add these states to track the actual release/iteration names
    const [selectedReleaseName, setSelectedReleaseName] = useState<string>('')
    const [selectedIterationName, setSelectedIterationName] = useState<string>('')

    // State for selection and counts in DataTable
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0)
    const [totalFilteredCount, setTotalFilteredCount] = useState<number>(0)
    const [allData, setAllData] = useState<SirReleaseData[]>([])

    // Add state to control dialog visibility
    const [showMapSirsDialog, setShowMapSirsDialog] = useState<boolean>(false)

    // Add state to control tab/view
    const [activeView, setActiveView] = useState<'overview' | 'datatable'>('overview')

    // Load data from JSON on component mount
    useEffect(() => {
        // Transform the data to include the id field
        const transformedData = transformSirsReleaseData(sirReleaseData)
        setAllData(transformedData)
    }, [])

    // Extract unique release versions and iterations from the JSON data
    const releaseVersions = useMemo(() => {
        const versions = [...new Set(allData.map(item => item.release_version))]
        return versions.map((version, index) => ({
            id: (index + 1).toString(),
            name: version
        }))
    }, [allData])

    const iterations = useMemo(() => {
        const uniqueIterations = [...new Set(allData.map(item => item.iteration.toString()))]
        return uniqueIterations.map((iteration, index) => ({
            id: (index + 1).toString(),
            name: iteration
        }))
    }, [allData])

    // Update the actual names when IDs are selected
    useEffect(() => {
        if (selectedRelease) {
            const releaseObj = releaseVersions.find(r => r.id === selectedRelease)
            setSelectedReleaseName(releaseObj?.name || '')
        } else {
            setSelectedReleaseName('')
        }
    }, [selectedRelease, releaseVersions])

    useEffect(() => {
        if (selectedIteration) {
            const iterationObj = iterations.find(i => i.id === selectedIteration)
            setSelectedIterationName(iterationObj?.name || '')
        } else {
            setSelectedIterationName('')
        }
    }, [selectedIteration, iterations])

    // MEMOIZED: Filter data based on selected release and iteration
    const filteredData = useMemo(() => {
        let filtered = allData

        // Filter by release version (using the actual name, not ID)
        if (selectedReleaseName) {
            filtered = filtered.filter(item => item.release_version === selectedReleaseName)
        }

        // Filter by iteration (using the actual iteration number, not ID)
        if (selectedIterationName) {
            filtered = filtered.filter(item => item.iteration.toString() === selectedIterationName)
        }

        // Apply global filter
        if (globalFilter) {
            const searchTerm = globalFilter.toLowerCase()
            filtered = filtered.filter(item => {
                // Check standard text fields
                const textMatch =
                    item.short_desc?.toLowerCase().includes(searchTerm) ||
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
                    item.iteration?.toString().toLowerCase().includes(searchTerm)

                // If standard text matches, return true
                if (textMatch) return true

                // Special handling for date searching
                if (item.changed_date) {
                    return dateMatchesSearch(item.changed_date, searchTerm)
                }

                return false
            })
        }

        return filtered
    }, [selectedReleaseName, selectedIterationName, globalFilter, allData])

    // Apply date range filter to the data
    const filteredDataWithDateRange = useMemo(() => {
        if (!dateRange) return filteredData

        const rangeParts = dateRange.split(' - ')
        if (rangeParts.length !== 2) return filteredData

        const [startStr, endStr] = rangeParts
        const startDate = parseDate(startStr.trim())
        const endDate = parseDate(endStr.trim())

        if (!startDate || !endDate) return filteredData

        return filteredData.filter(item => {
            const itemDate = parseDate(item.changed_date)
            return itemDate && itemDate >= startDate && itemDate <= endDate
        })
    }, [filteredData, dateRange])

    // Update total filtered count
    useEffect(() => {
        setTotalFilteredCount(filteredDataWithDateRange.length)
    }, [filteredDataWithDateRange])

    // Update selected rows count when selection changes
    useEffect(() => {
        setSelectedRowsCount(selectedRows.size)
    }, [selectedRows])

    // Get column visibility hook first (before using visibleColumns)
    const {
        columnVisibility,
        toggleColumnVisibility,
        resetColumnVisibility,
        visibleColumns
    } = useColumnVisibility()

    // Export handlers - UPDATED: Now uses id directly
    const handleExportCSV = useCallback(() => {
        // Get the data to export - ONLY the filtered data (with date range applied)
        let dataToExport = filteredDataWithDateRange
        
        // If there are selected rows, filter to only include selected rows
        if (selectedRows.size > 0) {
            dataToExport = filteredDataWithDateRange.filter(item => 
                selectedRows.has(item.id)
            )
        }
        
        const success = exportToCSV(dataToExport, visibleColumns, selectedRows)
        if (success) {
            toast.success("CSV exported successfully!")
        } else {
            toast.error("Failed to export CSV")
        }
    }, [filteredDataWithDateRange, visibleColumns, selectedRows])

    const handleExportExcel = useCallback(() => {
        // Get the data to export - ONLY the filtered data (with date range applied)
        let dataToExport = filteredDataWithDateRange
        
        // If there are selected rows, filter to only include selected rows
        if (selectedRows.size > 0) {
            dataToExport = filteredDataWithDateRange.filter(item => 
                selectedRows.has(item.id)
            )
        }
        
        const success = exportToExcel(dataToExport, visibleColumns, selectedRows)
        if (success) {
            toast.success("Excel file exported successfully!")
        } else {
            toast.error("Failed to export Excel file")
        }
    }, [filteredDataWithDateRange, visibleColumns, selectedRows])

    const handleExportJSON = useCallback(() => {
        // Get the data to export - ONLY the filtered data (with date range applied)
        let dataToExport = filteredDataWithDateRange
        
        // If there are selected rows, filter to only include selected rows
        if (selectedRows.size > 0) {
            dataToExport = filteredDataWithDateRange.filter(item => 
                selectedRows.has(item.id)
            )
        }
        
        const success = exportToJSON(dataToExport, visibleColumns, selectedRows)
        if (success) {
            toast.success("JSON exported successfully!")
        } else {
            toast.error("Failed to export JSON")
        }
    }, [filteredDataWithDateRange, visibleColumns, selectedRows])

    const handleMapSirs = useCallback(() => {
        console.log('Map SIRs clicked')
        setShowMapSirsDialog(true)
    }, [])

    const handleMapSirsSubmit = useCallback((releaseVersion: string, iteration: string, sirs: string) => {
        console.log('Placeholder - will implement later:', { releaseVersion, iteration, sirs })
        setShowMapSirsDialog(false)
    }, [])

    // Callback to handle row selection from DataTable
    const handleRowSelectionChange = useCallback((selectedIds: Set<number>) => {
        setSelectedRows(selectedIds)
    }, [])

    // Handle date range change from DataTable
    const handleDateRangeChange = useCallback((range: string) => {
        setDateRange(range)
    }, [])

    // CRUD operations - UPDATED to use id
    const handleAddSIR = useCallback((sirData: any) => {
        // Generate new id
        const newId = allData.length > 0 ? Math.max(...allData.map(item => item.id)) + 1 : 1
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
        }
        const newData = [...allData, newItem]
        setAllData(newData)
    }, [allData])

    const handleEditSIR = useCallback((sirData: any) => {
        const updatedData = allData.map(item =>
            item.id === sirData.id ? {
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
            } : item
        )
        setAllData(updatedData)
    }, [allData])

    const handleDeleteSIR = useCallback((id: number) => {
        const updatedData = allData.filter(item => item.id !== id)
        setAllData(updatedData)
        // Remove from selected rows if it was selected
        const newSelectedRows = new Set(selectedRows)
        newSelectedRows.delete(id)
        setSelectedRows(newSelectedRows)
    }, [allData, selectedRows])

    const handleDeleteRows = useCallback((ids: Set<number>) => {
        const updatedData = allData.filter(item => !ids.has(item.id))
        setAllData(updatedData)
        setSelectedRows(new Set())
    }, [allData])

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
        }))
    }, [filteredDataWithDateRange])

    // Check if we have data to show - UPDATED LOGIC
    const hasReleaseAndIteration = selectedRelease && selectedIteration;
    const hasDataAfterReleaseIterationFilter = hasReleaseAndIteration && filteredData.length > 0; // Use filteredData (before date range)
    const hasSearch = !!globalFilter;
    const hasDateRange = !!dateRange;
    const noDataAndNoSearch = hasReleaseAndIteration && filteredData.length === 0 && !hasSearch && !hasDateRange;

    return (
        <div className="min-h-screen bg-gray-50">
            <MapSirsDialog
                open={showMapSirsDialog}
                onOpenChange={setShowMapSirsDialog}
                onMapSirs={handleMapSirsSubmit}
            />

            <SirReleaseHeader
                selectedRowsCount={selectedRowsCount}
                totalFilteredCount={filteredDataWithDateRange.length}
                globalFilter={globalFilter}
            />

            <SirsReleaseFilters
                selectedRelease={selectedRelease}
                selectedIteration={selectedIteration}
                globalFilter={globalFilter}
                selectedRowsCount={selectedRowsCount}
                setSelectedRelease={setSelectedRelease}
                setSelectedIteration={setSelectedIteration}
                setGlobalFilter={setGlobalFilter}
                releaseVersions={releaseVersions}
                iterations={iterations}
                isDatatableView={activeView === 'datatable'}
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onMapSirs={handleMapSirs}
                columnVisibility={columnVisibility}
                toggleColumnVisibility={toggleColumnVisibility}
                resetColumnVisibility={resetColumnVisibility}
            />

            {/* Conditional Rendering based on data state - UPDATED */}
            {!selectedRelease || !selectedIteration ? (
                // Show when no release/iteration is selected
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    <div className="bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center">
                        <div className="flex justify-center mb-5 sm:mb-6 relative">
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full"></div>
                            <svg
                                className="w-25 h-25 sm:w-30 sm:h-30 text-gray-400 relative z-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                            No Month Selected
                        </h2>
                        <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                            <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                               Please select a month to display the releases overview and analytics
                            </p>
                        </div>
                    </div>
                </div>
            ) : noDataAndNoSearch ? (
                // Show when release/iteration has no data AND no search is active AND no date range is applied
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    <div className="bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center">
                        <div className="flex justify-center mb-5 sm:mb-6 relative">
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full"></div>
                            <svg
                                className="w-25 h-25 sm:w-30 sm:h-30 text-gray-400 relative z-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                            No SIRs Found
                        </h2>
                        <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                            <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                                No SIRs found for Release {selectedReleaseName} • Iteration {selectedIterationName}
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                Try selecting a different release or iteration.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Show tabs/datatable when:
                // 1. There IS data (before date range is applied), OR
                // 2. User is searching (even with 0 results), OR
                // 3. User has applied a date range (even if it filters out all data)
                <div className="flex flex-col">
                    {/* Tabs for switching between Overview and DataTable */}
                    <div className="px-4 sm:px-6 pt-1">
                        <div className="flex space-x-1 border-b border-gray-200">
                            <button
                                onClick={() => setActiveView('overview')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${activeView === 'overview'
                                    ? 'text-red-600 border-b-2 border-red-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveView('datatable')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${activeView === 'datatable'
                                    ? 'text-red-600 border-b-2 border-red-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Data Table
                            </button>
                        </div>
                    </div>

                    {/* Content based on active view */}
                    {activeView === 'overview' ? (
                        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                            {/* Updated heading */}
                            <h3 className="text-base font-medium text-gray-500 mb-8">
                                SIRs breakdown for release version {selectedReleaseName} iteration {selectedIterationName}
                                {globalFilter && ` • Matching "${globalFilter}"`}
                                {dateRange && ` • Date range: ${dateRange}`}
                            </h3>

                            {/* Cards section - Will handle empty state internally */}
                            <div className="mb-6">
                                <SirsStatCards sirReleaseData={filteredDataWithDateRange.map(item => ({
                                    ...item,
                                    sir_release_id: Number(item.sir_release_id)
                                }))} />
                            </div>

                            {/* Chart section - Will handle empty state internally */}
                            <SirReleasesChart
                                sirReleaseData={filteredDataWithDateRange.map(item => ({
                                    ...item,
                                    sir_release_id: Number(item.sir_release_id)
                                }))}
                                selectedReleaseName={selectedReleaseName}
                                selectedIterationName={selectedIterationName}
                            />
                        </div>
                    ) : (
                        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                            {/* DataTable section */}
                            <div className="mb-2">
                                <h3 className="text-base font-medium text-gray-500">
                                    SIRs Data Table for release version {selectedReleaseName} iteration {selectedIterationName}
                                    {dateRange && ` • Date range: ${dateRange}`}
                                </h3>
                            </div>

                            {/* Render the DataTable with filtered data - Will show "No results found" if empty */}
                            <SirReleaseDataTable
                                filteredData={formattedDataForDataTable}
                                onRowSelectionChange={handleRowSelectionChange}
                                visibleColumns={visibleColumns}
                                columnVisibility={columnVisibility}
                                toggleColumnVisibility={toggleColumnVisibility}
                                resetColumnVisibility={resetColumnVisibility}
                                onDateRangeChange={handleDateRangeChange}
                                onDeleteRows={handleDeleteRows}
                                onAddSIR={handleAddSIR}
                                onEditSIR={handleEditSIR}
                                onDeleteSIR={handleDeleteSIR}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}