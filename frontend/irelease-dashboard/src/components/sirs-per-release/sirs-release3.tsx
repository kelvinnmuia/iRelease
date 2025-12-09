import React, { useState, useEffect } from 'react'
import { SirsReleaseFilters } from './sir-release-filters'
import { SirReleaseHeader } from './sir-release-header'
import { MapSirsDialog } from './map-sirs-dialog'
import { SirsStatCards } from './sirs-stats-cards'
import { SirReleasesChart } from './sirs-releases-chart'
import { SirReleaseDataTable } from './sirs-release-datatable/sirs-releases-datatable' // Import the DataTable
import sirReleaseData from './sir-release-data.json'

interface SirReleaseData {
    "sir-release-id": number;
    "sir-id": number;
    "release_version": string;
    "iteration": number;
    "changeddate": string;
    "bug_severity": string;
    "priority": string;
    "assigned_to": string;
    "bug_status": string;
    "resolution": string;
    "component": string;
    "op_sys": string;
    "short_desc": string;
    "cf_sirwith": string;
}

export function SirsRelease() {
    // State for filters
    const [selectedRelease, setSelectedRelease] = useState<string>('')
    const [selectedIteration, setSelectedIteration] = useState<string>('')
    const [globalFilter, setGlobalFilter] = useState<string>('')

    // Add these states to track the actual release/iteration names
    const [selectedReleaseName, setSelectedReleaseName] = useState<string>('')
    const [selectedIterationName, setSelectedIterationName] = useState<string>('')

    // State for selection and counts
    const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0)
    const [totalFilteredCount, setTotalFilteredCount] = useState<number>(0)
    const [filteredData, setFilteredData] = useState<SirReleaseData[]>([])
    const [allData, setAllData] = useState<SirReleaseData[]>([])

    // Add state to control dialog visibility
    const [showMapSirsDialog, setShowMapSirsDialog] = useState<boolean>(false)

    // Add state to control tab/view
    const [activeView, setActiveView] = useState<'overview' | 'datatable'>('overview')

    // Load data from JSON on component mount
    useEffect(() => {
        setAllData(sirReleaseData as SirReleaseData[])
    }, [])

    // Extract unique release versions and iterations from the JSON data
    const releaseVersions = React.useMemo(() => {
        const versions = [...new Set(allData.map(item => item.release_version))]
        return versions.map((version, index) => ({
            id: (index + 1).toString(),
            name: version
        }))
    }, [allData])

    const iterations = React.useMemo(() => {
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

    // Filter data based on selected release and iteration
    useEffect(() => {
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
            filtered = filtered.filter(item =>
                item["short_desc"].toLowerCase().includes(searchTerm) ||
                item["bug_severity"].toLowerCase().includes(searchTerm) ||
                item["component"].toLowerCase().includes(searchTerm) ||
                item["assigned_to"].toLowerCase().includes(searchTerm) ||
                item["bug_status"].toLowerCase().includes(searchTerm) ||
                item["sir-id"].toString().includes(searchTerm)
            )
        }

        setFilteredData(filtered)
        setTotalFilteredCount(filtered.length)
    }, [selectedReleaseName, selectedIterationName, globalFilter, allData])

    // Placeholder callback functions
    const handleExportCSV = () => {
        console.log('Export to CSV clicked');
    }

    const handleExportExcel = () => {
        console.log('Export to Excel clicked');
    }

    const handleExportJSON = () => {
        console.log('Export to JSON clicked');
    }

    const handleToggleColumns = () => {
        console.log('Toggle columns clicked');
    }

    const handleResetColumns = () => {
        console.log('Reset columns clicked');
    }

    const handleMapSirs = () => {
        console.log('Map SIRs clicked');
        setShowMapSirsDialog(true);
    }

    const handleMapSirsSubmit = (releaseVersion: string, iteration: string, sirs: string) => {
        console.log('Placeholder - will implement later:', { releaseVersion, iteration, sirs });
        setShowMapSirsDialog(false);
    }

    // Format the filtered data for the DataTable
    const getFormattedDataForDataTable = () => {
        return filteredData.map(item => ({
            id: item["sir-release-id"],
            sir_release_id: item["sir-release-id"],
            sir_id: item["sir-id"],
            release_version: item.release_version,
            iteration: item.iteration.toString(),
            changed_date: item.changeddate,
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
    }

    // Check if we have data to show
    const hasDataToShow = selectedRelease && selectedIteration && filteredData.length > 0
    const hasFiltersButNoData = selectedRelease && selectedIteration && filteredData.length === 0

    return (
        <div className="min-h-screen bg-gray-50">
            <MapSirsDialog
                open={showMapSirsDialog}
                onOpenChange={setShowMapSirsDialog}
                onMapSirs={handleMapSirsSubmit}
            />

            <SirReleaseHeader
                globalFilter={globalFilter}
                selectedRelease={selectedReleaseName}
                selectedIteration={selectedIterationName}
            />

            <SirsReleaseFilters
                selectedRelease={selectedRelease}
                selectedIteration={selectedIteration}
                globalFilter={globalFilter}
                setSelectedRelease={setSelectedRelease}
                setSelectedIteration={setSelectedIteration}
                setGlobalFilter={setGlobalFilter}
                releaseVersions={releaseVersions}
                iterations={iterations}
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                onExportJSON={handleExportJSON}
                onToggleColumns={handleToggleColumns}
                onResetColumns={handleResetColumns}
                onMapSirs={handleMapSirs}
            />

            {/* Conditional Rendering based on data state */}
            {!selectedRelease || !selectedIteration ? (
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
                            No SIRs Analysis Data
                        </h2>
                        <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                            <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                                Please select a release version and iteration to view its SIRs analysis.
                            </p>
                        </div>
                    </div>
                </div>
            ) : hasFiltersButNoData ? (
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
                <div className="flex flex-col">
                    {/* Tabs for switching between Overview and DataTable */}
                    <div className="px-4 sm:px-6 pt-4">
                        <div className="flex space-x-1 border-b border-gray-200">
                            <button
                                onClick={() => setActiveView('overview')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeView === 'overview'
                                        ? 'text-red-600 border-b-2 border-red-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveView('datatable')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeView === 'datatable'
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
                        <div className="px-4 sm:px-6 pt-4 sm:pt-3 pb-4 sm:pb-6">
                            {/* Updated heading */}
                            <h3 className="text-base font-medium text-gray-600 mb-8">
                                SIRs breakdown for release version {selectedReleaseName} iteration {selectedIterationName}
                            </h3>

                            {/* Cards section */}
                            <div className="mb-6">
                                <SirsStatCards sirReleaseData={filteredData} />
                            </div>

                            {/* Chart section */}
                            <SirReleasesChart
                                sirReleaseData={filteredData}
                                selectedReleaseName={selectedReleaseName}
                                selectedIterationName={selectedIterationName}
                            />
                        </div>
                    ) : (
                        <div className="px-4 sm:px-6 pt-4 sm:pt-3 pb-4 sm:pb-6">
                            {/* DataTable section */}
                            <div className="mb-4">
                                <h3 className="text-base font-medium text-gray-600">
                                    SIRs Data Table for release version {selectedReleaseName} iteration {selectedIterationName}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Showing {filteredData.length} SIR(s)
                                </p>
                            </div>
                            
                            {/* Render the DataTable with filtered data */}
                            <SirReleaseDataTable />
                            {/* Note: The DataTable has its own internal data, 
                                but you could pass filtered data as a prop if you want */}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}