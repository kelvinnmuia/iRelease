import React, { useState } from 'react'
import { SirsReleaseFilters } from '../../components/sirs-per-release/sir-release-filters'
import { SirReleaseHeader } from '../comps-notused/sir-release-header'
import { MapSirsDialog } from '../../components/sirs-per-release/map-sirs-dialog' // Import the dialog

export function SirsRelease() {
    // State for filters
    const [selectedRelease, setSelectedRelease] = useState<string>('')
    const [selectedIteration, setSelectedIteration] = useState<string>('')
    const [globalFilter, setGlobalFilter] = useState<string>('')
    
    // State for selection and counts
    const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0)
    const [totalFilteredCount, setTotalFilteredCount] = useState<number>(0)

    // Add this ONE line - state to control dialog visibility
    const [showMapSirsDialog, setShowMapSirsDialog] = useState<boolean>(false)

    // Mock data for dropdowns (replace with actual API data)
    const releaseVersions = [
        { id: '1', name: '3.9.230.1' },
        { id: '2', name: '3.9.231.2' },
        { id: '3', name: '3.9.232.3' },
        { id: '4', name: '3.9.232.4' },
        { id: '5', name: '3.9.232.5' },
        { id: '6', name: '3.9.232.6' },
        { id: '7', name: '3.9.232.7' },
        { id: '8', name: '3.9.232.8' },
        { id: '9', name: '3.9.232.9' },
        { id: '10', name: '3.9.232.10' }
    ]

    const iterations = [
        { id: '1', name: '2' },
        { id: '2', name: '3' },
        { id: '3', name: '4' }
    ]

    // Mock data update function (replace with actual data fetching)
    const updateCounts = () => {
        // This would be replaced with actual data fetching logic
        // For now, we'll use mock counts
        const mockFilteredCount = globalFilter ? 15 : 25
        setTotalFilteredCount(mockFilteredCount)
    }

    // Placeholder callback functions
    const handleExportCSV = () => {
        console.log('Export to CSV clicked');
        // Implement export logic
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
                onMapSirs={handleMapSirs} // Already connected!
            />

            {/* Empty State - Centered with 40px spacing */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                {/* Slightly transparent white background */}
                <div className="bg-white/60 rounded-xl shadow-sm w-full min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-8 sm:p-10 md:p-12 text-center">
                    {/* Empty Folder Icon with bottom shadow - Enlarged 1.5x */}
                    <div className="flex justify-center mb-5 sm:mb-6 relative">
                        {/* Light gray shadow at the bottom of SVG - Enlarged */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1.5 sm:w-24 sm:h-2 bg-gray-300/70 blur-sm rounded-full"></div>
                        
                        {/* Empty Folder SVG - Enlarged 1.5x */}
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

                    {/* Title - Reduced spacing */}
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                        No SIRs Analysis Data
                    </h2>

                    {/* Description - Reduced spacing */}
                    <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                        <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                            Please select a release version and iteration to view its SIRs analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}