import React, { useState, useEffect, useMemo } from 'react'
import { toast } from "sonner"
import { SearchableDropdown } from './searchable-dropdown'

export function MonthlyOverview() {
    // State for filters
    const [selectedMonth, setSelectedMonth] = useState<string>('')
    const [selectedYear, setSelectedYear] = useState<string>('')

    // State for tracking actual month/year names
    const [selectedMonthName, setSelectedMonthName] = useState<string>('')
    const [selectedYearName, setSelectedYearName] = useState<string>('')

    // Mock data for months and years
    const months = useMemo(() => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return monthNames.map((name, index) => ({
            id: (index + 1).toString(),
            name: name
        }));
    }, [])

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearsArray = [];
        
        for (let year = 2020; year <= currentYear + 1; year++) {
            yearsArray.push({
                id: year.toString(),
                name: year.toString()
            });
        }
        
        return yearsArray.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }, [])

    // Check if selected month has data (November/December 2025 for demo)
    const hasData = useMemo(() => {
        if (!selectedMonth || !selectedYear) return false;
        
        // Mock data availability - November and December 2025 have data
        const monthsWithData = ['11', '12']; // November and December
        const yearWithData = '2025';
        
        return monthsWithData.includes(selectedMonth) && selectedYear === yearWithData;
    }, [selectedMonth, selectedYear]);

    // Update the actual names when IDs are selected
    useEffect(() => {
        if (selectedMonth) {
            const monthObj = months.find(m => m.id === selectedMonth)
            setSelectedMonthName(monthObj?.name || '')
        } else {
            setSelectedMonthName('')
        }
    }, [selectedMonth, months])

    useEffect(() => {
        if (selectedYear) {
            const yearObj = years.find(y => y.id === selectedYear)
            setSelectedYearName(yearObj?.name || '')
        } else {
            setSelectedYearName('')
        }
    }, [selectedYear, years])

    // Check if both month and year are selected
    const hasMonthAndYear = selectedMonth && selectedYear;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-gray-50 p-6">
                <div className="items-start">
                    <h1 className="text-2xl font-semibold text-gray-900">Monthly Overview</h1>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-gray-50 pt-0 px-6 pb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        {/* Placeholder for future features */}
                    </div>

                    {/* Right Section - Month and Year Filters */}
                    <div className="w-full md:w-auto">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <div className="mr-4">
                                <div className="w-full sm:w-[180px]">
                                    <SearchableDropdown
                                        items={months}
                                        selectedId={selectedMonth}
                                        onSelect={setSelectedMonth}
                                        placeholder="Select Month"
                                        buttonClassName="w-full"
                                        searchPlaceholder="Search month"
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-[180px]">
                                <SearchableDropdown
                                    items={years}
                                    selectedId={selectedYear}
                                    onSelect={setSelectedYear}
                                    placeholder="Select Year"
                                    buttonClassName="w-full"
                                    searchPlaceholder="Search years"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conditional Rendering based on selection state */}
            {!hasMonthAndYear ? (
                // Show when no month/year is selected
                <NoSelectionView />
            ) : !hasData ? (
                // Show when month and year are selected but no data
                <NoDataView 
                    selectedMonthName={selectedMonthName}
                    selectedYearName={selectedYearName}
                    onClearSelection={() => {
                        setSelectedMonth('');
                        setSelectedYear('');
                    }}
                />
            ) : (
                // Show when data is available
                <DataAvailableView 
                    selectedMonthName={selectedMonthName}
                    selectedYearName={selectedYearName}
                    onClearSelection={() => {
                        setSelectedMonth('');
                        setSelectedYear('');
                    }}
                />
            )}
        </div>
    )
}

// Component for when no selection is made
function NoSelectionView() {
    return (
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                    No Month Selected
                </h2>
                <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                    <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                        Please select a month and year to display the monthly overview and analytics
                    </p>
                </div>
            </div>
        </div>
    )
}

// Component for when no data is available
interface NoDataViewProps {
    selectedMonthName: string;
    selectedYearName: string;
    onClearSelection: () => void;
}

function NoDataView({ selectedMonthName, selectedYearName, onClearSelection }: NoDataViewProps) {
    return (
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-2">
                    No Data Available for {selectedMonthName} {selectedYearName}
                </h2>
                <div className="mt-2 sm:mt-2 max-w-lg sm:max-w-xl">
                    <p className="text-gray-600 mx-auto text-sm sm:text-base leading-relaxed">
                        There are no releases or analytics to display for this month.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onClearSelection}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                        >
                            Select Different Month and Year
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Component for when data is available
interface DataAvailableViewProps {
    selectedMonthName: string;
    selectedYearName: string;
    onClearSelection: () => void;
}

function DataAvailableView({ selectedMonthName, selectedYearName, onClearSelection }: DataAvailableViewProps) {
    return (
        <div className="px-4 sm:px-6 pt-0 pb-4 sm:pb-6">
            {/* Header with selected month/year and action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                        {selectedMonthName} {selectedYearName} Overview
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Monthly analytics and performance metrics
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={onClearSelection}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition-colors"
                    >
                        Change Month/Year
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Card 1: Total Releases */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Total Releases</h3>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">24</div>
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 font-medium">+12%</span>
                        <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                </div>

                {/* Card 2: Success Rate */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">96.4%</div>
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 font-medium">+2.3%</span>
                        <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                </div>

                {/* Card 3: Avg Deployment Time */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Avg Deployment Time</h3>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">18m 42s</div>
                    <div className="flex items-center text-sm">
                        <span className="text-red-600 font-medium">-3m 15s</span>
                        <span className="text-gray-500 ml-2">improvement</span>
                    </div>
                </div>

                {/* Card 4: Active Environments */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Active Environments</h3>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">8</div>
                    <div className="flex items-center text-sm">
                        <span className="text-gray-600 font-medium">No change</span>
                        <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Release Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Release Frequency Trend</h3>
                        <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Weekly</option>
                            <option>Daily</option>
                            <option>Monthly</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-gray-600">Chart component will be displayed here</p>
                            <p className="text-sm text-gray-500 mt-1">Line chart showing release trends over time</p>
                        </div>
                    </div>
                </div>

                {/* Deployment Success Rate */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Deployment Success Rate</h3>
                        <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                            Excellent
                        </span>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            <p className="text-gray-600">Pie/Donut chart component will be displayed here</p>
                            <p className="text-sm text-gray-500 mt-1">Showing success vs failure rates</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Release Details</h3>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition-colors">
                            Filter
                        </button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                            Add Release
                        </button>
                    </div>
                </div>
                
                {/* Table placeholder */}
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                            <div className="col-span-3">Release Name</div>
                            <div className="col-span-2">Environment</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Deployment Time</div>
                            <div className="col-span-3">Date</div>
                        </div>
                        
                        {/* Table body placeholder */}
                        <div className="min-h-[300px] flex items-center justify-center">
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <h4 className="text-lg font-medium text-gray-700 mb-2">Data Table Component</h4>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    This area will display the detailed release data table with sorting, filtering, and pagination capabilities.
                                </p>
                                <div className="mt-6 flex justify-center gap-3">
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">Column 1</div>
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">Column 2</div>
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">Column 3</div>
                                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">Column 4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                        Showing <span className="font-medium">1-10</span> of <span className="font-medium">24</span> releases
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            Previous
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            2
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            3
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Note about demo data */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-blue-800">
                            <strong>Demo Data:</strong> Currently showing placeholder components for November and December 2025. The actual KPI cards, charts, and data table components will be integrated here once developed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}