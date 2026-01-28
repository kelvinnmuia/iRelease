import React, { useState, useEffect, useMemo } from 'react'
import { toast } from "sonner"
import { SearchableDropdown } from './searchable-dropdown'
import { MonthlyOverviewAnalytics } from './monthly-overview-analytics'
import { transformMoReleasesData } from './monthly-overview-datatable/utils/mo-data-transform'
import { getAllReleases, initializeReleasesDatabase } from "@/db/ireleasedb"

export function MonthlyOverview() {
    // State for filters - load from localStorage if available
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        return localStorage.getItem('moSelectedMonth') || ''
    })
    const [selectedYear, setSelectedYear] = useState<string>(() => {
        return localStorage.getItem('moSelectedYear') || ''
    })

    // State for tracking actual month/year names
    const [selectedMonthName, setSelectedMonthName] = useState<string>('')
    const [selectedYearName, setSelectedYearName] = useState<string>('')

    // State for data loading
    const [loading, setLoading] = useState(true)
    const [transformedData, setTransformedData] = useState<any[]>([])

    // Load data from Dexie on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                await initializeReleasesDatabase()
                const releases = await getAllReleases()
                const transformed = transformMoReleasesData(releases)
                setTransformedData(transformed)
            } catch (err) {
                console.error("Error loading data:", err)
                toast.error("Failed to load releases data")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Helper function to extract year from ISO date string
    const extractYearFromISODate = (isoDateString: string): string | null => {
        if (!isoDateString) return null;
        
        try {
            const date = new Date(isoDateString);
            if (isNaN(date.getTime())) return null;
            
            return date.getFullYear().toString();
        } catch (error) {
            console.error('Error parsing date:', isoDateString, error);
            return null;
        }
    }

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
        // Extract unique years from the data
        const yearsFromData = new Set<string>();
        
        transformedData.forEach(record => {
            // Try multiple date fields to find a valid year
            const dateFields = [
                record.deliveredDate,
                record.testStartDate,
                record.testDeployDate,
                record.testEndDate,
                record.prodDeployDate,
                record.tdNoticeDate
            ];
            
            for (const dateField of dateFields) {
                if (dateField) {
                    const year = extractYearFromISODate(dateField);
                    if (year) {
                        yearsFromData.add(year);
                        break; // Found a valid year for this record
                    }
                }
            }
        });
        
        // Convert to array and sort descending
        const yearsArray = Array.from(yearsFromData)
            .map(year => ({ id: year, name: year }))
            .sort((a, b) => parseInt(b.id) - parseInt(a.id));
        
        // If no years found in data, provide default years
        if (yearsArray.length === 0) {
            const currentYear = new Date().getFullYear();
            for (let year = 2020; year <= currentYear + 1; year++) {
                yearsArray.push({ id: year.toString(), name: year.toString() });
            }
        }
        
        return yearsArray;
    }, [transformedData])

    // Filter data based on selected month/year
    const filteredData = useMemo(() => {
        if (!selectedMonthName || !selectedYearName) return [];
        
        return transformedData.filter(record => {
            const recordMonth = record.month;
            
            // Extract year from ISO date - check multiple date fields
            const dateFields = [
                record.deliveredDate,
                record.testStartDate,
                record.testDeployDate,
                record.testEndDate,
                record.prodDeployDate,
                record.tdNoticeDate
            ];
            
            let recordYear: string | null = null;
            
            // Find the first valid date field with a year
            for (const dateField of dateFields) {
                if (dateField) {
                    const year = extractYearFromISODate(dateField);
                    if (year) {
                        recordYear = year;
                        break;
                    }
                }
            }
            
            // If no year found, skip this record
            if (!recordYear) return false;
            
            // Compare month and year
            return recordMonth === selectedMonthName && 
                   recordYear === selectedYearName;
        });
    }, [transformedData, selectedMonthName, selectedYearName]);

    // Check if selected month/year has data
    const hasData = useMemo(() => {
        return filteredData.length > 0;
    }, [filteredData]);

    // Update localStorage when selections change
    useEffect(() => {
        if (selectedMonth) {
            localStorage.setItem('moSelectedMonth', selectedMonth);
        } else {
            localStorage.removeItem('moSelectedMonth');
        }
    }, [selectedMonth]);

    useEffect(() => {
        if (selectedYear) {
            localStorage.setItem('moSelectedYear', selectedYear);
        } else {
            localStorage.removeItem('moSelectedYear');
        }
    }, [selectedYear]);

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

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading monthly overview data...</p>
                </div>
            </div>
        );
    }

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
                        localStorage.removeItem('moSelectedMonth');
                        localStorage.removeItem('moSelectedYear');
                    }}
                />
            ) : (
                // Show MonthlyOverviewAnalytics component when data is available
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6">
                    {/* Pass filtered data and month/year info */}
                    <MonthlyOverviewAnalytics 
                        filteredData={filteredData}
                        month={selectedMonthName}
                        year={selectedYearName}
                    />
                </div>
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
                        There are no releases or analytics for this month and year combination.
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