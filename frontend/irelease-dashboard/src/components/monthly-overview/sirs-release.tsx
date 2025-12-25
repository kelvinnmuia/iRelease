import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { SirsStatCards } from './sirs-stats-cards'
import { SirReleasesChart } from './sirs-releases-chart'
import { SirReleaseDataTable } from './sirs-release-datatable/sirs-releases-datatable'
import sirReleaseData from './sir-release-data.json'
import { SirReleaseData } from './sirs-release-datatable/types/sirs-releases-types'
import { useColumnVisibility } from './sirs-releases-column-visibility'
import { parseDate } from './sirs-release-datatable/utils/sirs-release-date-utils'
import { transformSirsReleaseData } from './sirs-release-datatable/utils/sirs-release-data-transform'

// Define the component props
interface SirsReleaseProps {
  // You can add props here if needed for filtering by month/year
  month?: string;
  year?: string;
}

export function SirsRelease({ month, year }: SirsReleaseProps) {
    // State for filters - simplified version
    const [globalFilter, setGlobalFilter] = useState<string>('')
    const [dateRange, setDateRange] = useState<string>('')

    // State for selection and counts in DataTable
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
    const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0)
    const [allData, setAllData] = useState<SirReleaseData[]>([])

    // Add state to control tab/view
    const [activeView, setActiveView] = useState<'overview' | 'datatable'>('overview')

    // Load data from JSON on component mount
    useEffect(() => {
        // Transform the data to include the id field
        const transformedData = transformSirsReleaseData(sirReleaseData)
        
        // If month and year props are provided, filter the data
        let filteredData = transformedData;
        
        if (month && year) {
            // You would implement month/year filtering logic here
            // based on the actual data structure
            // For now, we'll just pass all data
            filteredData = transformedData;
        }
        
        setAllData(filteredData)
    }, [month, year])

    // MEMOIZED: Filter data based on global search
    const filteredData = useMemo(() => {
        let filtered = allData

        // Apply global filter if provided
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

                return textMatch
            })
        }

        return filtered
    }, [globalFilter, allData])

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

    // Update selected rows count when selection changes
    useEffect(() => {
        setSelectedRowsCount(selectedRows.size)
    }, [selectedRows])

    // Get column visibility hook
    const {
        columnVisibility,
        toggleColumnVisibility,
        resetColumnVisibility,
        visibleColumns
    } = useColumnVisibility()

    // Callback to handle row selection from DataTable
    const handleRowSelectionChange = useCallback((selectedIds: Set<number>) => {
        setSelectedRows(selectedIds)
    }, [])

    // Handle date range change from DataTable
    const handleDateRangeChange = useCallback((range: string) => {
        setDateRange(range)
    }, [])

    // CRUD operations
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

    // MEMOIZED: Format the filtered data for the DataTable
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Removed: Unnecessary header showing selected month/year */}
            
            {/* Tabs for switching between Overview and DataTable */}
            <div className="px-2 sm:px-2 -mt-3">
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
                <div className="px-0.5 sm:px-0.5 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    {/* Heading - updated to remove month/year reference */}
                    <h3 className="text-base font-medium text-gray-500 mb-8">
                        Release Analytics Overview
                        {globalFilter && ` • Matching "${globalFilter}"`}
                        {dateRange && ` • Date range: ${dateRange}`}
                    </h3>

                    {/* Cards section */}
                    <div className="mb-6">
                        <SirsStatCards sirReleaseData={filteredDataWithDateRange.map(item => ({
                            ...item,
                            sir_release_id: Number(item.sir_release_id)
                        }))} />
                    </div>

                    {/* Chart section */}
                    <SirReleasesChart
                        sirReleaseData={filteredDataWithDateRange.map(item => ({
                            ...item,
                            sir_release_id: Number(item.sir_release_id)
                        }))}
                        selectedReleaseName="All Releases"
                        selectedIterationName="All Iterations"
                    />
                </div>
            ) : (
                <div className="px-0.5 sm:px-0.5 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    {/* DataTable section */}
                    <div className="mb-2">
                        <h3 className="text-base font-medium text-gray-500">
                            Release Data Table
                            {dateRange && ` • Date range: ${dateRange}`}
                        </h3>
                    </div>

                    {/* Render the DataTable with filtered data */}
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
    )
}