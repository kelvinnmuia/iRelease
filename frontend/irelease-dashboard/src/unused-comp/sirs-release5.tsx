import React, { useState, useEffect } from 'react'
import { SirsReleaseFilters } from '../components/sirs-per-release/sir-release-filters'
import { SirReleaseHeader } from '../components/comps-notused/sir-release-header'
import { MapSirsDialog } from '../components/sirs-per-release/map-sirs-dialog'
import sirReleaseData from '../components/sirs-per-release/sir-release-data.json' // Import the JSON

// Define TypeScript interface for the data
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
    
    // State for selection and counts
    const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0)
    const [totalFilteredCount, setTotalFilteredCount] = useState<number>(0)
    const [filteredData, setFilteredData] = useState<SirReleaseData[]>([])
    const [allData, setAllData] = useState<SirReleaseData[]>([])

    // Add this ONE line - state to control dialog visibility
    const [showMapSirsDialog, setShowMapSirsDialog] = useState<boolean>(false)

    // Load data from JSON on component mount
    useEffect(() => {
        // In production, you would fetch from API
        // For now, use the imported JSON data
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

    // Filter data based on selected release and iteration
    useEffect(() => {
        let filtered = allData
        
        // Filter by release version
        if (selectedRelease) {
            filtered = filtered.filter(item => item.release_version === selectedRelease)
        }
        
        // Filter by iteration
        if (selectedIteration) {
            filtered = filtered.filter(item => item.iteration.toString() === selectedIteration)
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
    }, [selectedRelease, selectedIteration, globalFilter, allData])

    // Update counts whenever filters change
    const updateCounts = () => {
        // Counts are already updated in the useEffect above
        // This function is kept for compatibility with existing code
        console.log(`Filtered count: ${filteredData.length}`)
    }

    // Placeholder callback functions
    const handleExportCSV = () => {
        console.log('Export to CSV clicked');
        // Implement export logic using filteredData
    }

    const handleExportExcel = () => {
        console.log('Export to Excel clicked');
        // Implement export logic
    }

    const handleExportJSON = () => {
        console.log('Export to JSON clicked');
        // Implement export logic
    }

    const handleToggleColumns = () => {
        console.log('Toggle columns clicked');
        // Implement column toggle logic
    }

    const handleResetColumns = () => {
        console.log('Reset columns clicked');
        // Implement reset columns logic
    }

    // Update this ONE function - just add setShowMapSirsDialog(true)
    const handleMapSirs = () => {
        console.log('Map SIRs clicked');
        setShowMapSirsDialog(true); // This opens the dialog
    }

    // Add this placeholder function - you'll implement it later
    const handleMapSirsSubmit = (releaseVersion: string, iteration: string, sirs: string) => {
        console.log('Placeholder - will implement later:', { releaseVersion, iteration, sirs });
        // For now, just close the dialog
        setShowMapSirsDialog(false);
    }

    // Handle filter changes to update counts
    React.useEffect(() => {
        updateCounts();
    }, [globalFilter, selectedRelease, selectedIteration]);

    // Check if we have data to show
    const hasDataToShow = selectedRelease && selectedIteration && filteredData.length > 0
    const hasFiltersButNoData = selectedRelease && selectedIteration && filteredData.length === 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Add this ONE component - the Map SIRs Dialog */}
            <MapSirsDialog
                open={showMapSirsDialog}
                onOpenChange={setShowMapSirsDialog}
                onMapSirs={handleMapSirsSubmit}
            />

            {/* Imported Header Component */}
            <SirReleaseHeader
                globalFilter={globalFilter}
                selectedRelease={selectedRelease}
                selectedIteration={selectedIteration}
            />

            {/* Imported Filters Component */}
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
                // Empty State - No filters selected
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
                // No data for selected filters
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
                                No SIRs found for Release {selectedRelease} • Iteration {selectedIteration}
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                Try selecting a different release or iteration.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Data is available - show the analysis components
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    {/* Data summary header */}
                    <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Release {selectedRelease} • Iteration {selectedIteration}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Showing {filteredData.length} SIRs • Last updated: Today
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{filteredData.length}</div>
                                    <div className="text-xs text-gray-500">Total SIRs</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add your analysis components here */}
                    {/* 1. SirsStatCards component */}
                    {/* <SirsStatCards sirReleaseData={filteredData} /> */}
                    
                    {/* 2. SirsChart component */}
                    {/* <SirsChart sirReleaseData={filteredData} /> */}
                    
                    {/* 3. SirsDataTable component */}
                    {/* <SirsDataTable sirReleaseData={filteredData} /> */}

                    {/* For now, show a preview of the data */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">SIR Preview (First 3 items)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SIR ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.slice(0, 3).map((item) => (
                                        <tr key={item["sir-release-id"]}>
                                            <td className="px-4 py-3 text-sm font-medium">{item["sir-id"]}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    item.bug_severity === "blocker" ? "bg-red-100 text-red-800" :
                                                    item.bug_severity === "critical" ? "bg-orange-100 text-orange-800" :
                                                    item.bug_severity === "major" ? "bg-amber-100 text-amber-800" :
                                                    "bg-blue-100 text-blue-800"
                                                }`}>
                                                    {item.bug_severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{item.component}</td>
                                            <td className="px-4 py-3 text-sm truncate max-w-xs">{item.short_desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredData.length > 3 && (
                            <div className="p-4 border-t text-center text-sm text-gray-500">
                                Showing 3 of {filteredData.length} SIRs. Add analysis components to view full details.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}