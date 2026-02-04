import React, { useState } from 'react'
import { MoStatsCards } from './mo-stats-cards'
import { MoReleasesTypeChart } from './mo-releases-type-chart'
import { MoReleasesDataTable } from './monthly-overview-datatable/mo-releases-datatable'
import { Release } from './monthly-overview-datatable/types/mo-releases'

// Define the component props - UPDATED INTERFACE
interface MonthlyOverviewAnalyticsProps {
    filteredData: Release[];
    month?: string;
    year?: string;
}

export function MonthlyOverviewAnalytics({ filteredData, month, year }: MonthlyOverviewAnalyticsProps) {
    // Add state to control tab/view
    const [activeView, setActiveView] = useState<'overview' | 'datatable'>('overview')

    return (
        <div className="min-h-screen bg-gray-50">
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
                    {/* Heading - Show selected month/year */}
                    <h3 className="text-base font-medium text-gray-500 mb-8">
                        Monthly Releases Analytics for {month} {year}
                    </h3>

                    {/* Cards section */}
                    <div className="mb-6">
                        <MoStatsCards releasesData={filteredData} />
                    </div>

                    {/* Chart section */}
                    <MoReleasesTypeChart
                        releasesData={filteredData}
                    />
                </div>
            ) : (
                <div className="px-0.5 sm:px-0.5 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    {/* DataTable section */}
                    <div>
                        <h3 className="text-base font-medium text-gray-500 ml-6">
                            Monthly Releases Data Table for {month} {year}
                        </h3>
                    </div>

                    {/* Pass filtered data to the data table */}
                    <MoReleasesDataTable filteredData={filteredData} />
                </div>
            )}
        </div>
    )
}