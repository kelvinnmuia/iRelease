import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ireleaseDB, dexieEvents } from "@/db/ireleasedb";
// Process function (moved into file)
function processForReleaseType(releases, selectedYear) {
    if (!releases || releases.length === 0)
        return [];
    // Create months array
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    // Initialize data structure
    const monthlyData = months.map(month => ({
        month,
        Major: 0,
        Medium: 0,
        Minor: 0
    }));
    // Process each release
    releases.forEach(release => {
        try {
            // Try to extract month from various date fields
            const dateFields = [
                'Date_delivered_by_vendor',
                'Date_deployed_to_test',
                'Date_of_test_commencement',
                'Date_of_test_completion',
                'Notification_date_for_deployment_to_test',
                'Date_updated'
            ];
            let foundDate = null;
            for (const field of dateFields) {
                const dateStr = release[field];
                if (dateStr && typeof dateStr === 'string' && dateStr.trim()) {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        foundDate = date;
                        break;
                    }
                }
            }
            if (!foundDate)
                return;
            // Check if release is in selected year
            const releaseYear = foundDate.getFullYear().toString();
            if (releaseYear !== selectedYear)
                return;
            // Get month index (0-11)
            const monthIndex = foundDate.getMonth();
            // Get release type (case-insensitive)
            const releaseType = (release.Type_of_release || '').toLowerCase();
            // Categorize release type
            if (releaseType.includes('major')) {
                monthlyData[monthIndex].Major++;
            }
            else if (releaseType.includes('medium')) {
                monthlyData[monthIndex].Medium++;
            }
            else if (releaseType.includes('minor')) {
                monthlyData[monthIndex].Minor++;
            }
        }
        catch (error) {
            console.warn("Error processing release:", release.Release_id, error);
        }
    });
    return monthlyData;
}
export function ReleaseTypeChart() {
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchInputRef = useRef(null);
    const containerRef = useRef(null);
    // Fetch releases from Dexie
    const fetchReleases = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📥 Fetching releases from Dexie for chart...');
            const fetchedReleases = await ireleaseDB.releases.toArray();
            setReleases(fetchedReleases);
            console.log(`✅ Fetched ${fetchedReleases.length} releases from Dexie`);
        }
        catch (error) {
            console.error("Error fetching releases from Dexie:", error);
            setReleases([]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Initial fetch and event listener setup
    useEffect(() => {
        // Initial fetch on component mount
        fetchReleases();
        // Listen for data-updated events from Dexie
        const handleDataUpdated = () => {
            console.log('📢 Chart received data-updated event, refreshing...');
            fetchReleases();
        };
        // Subscribe to events
        dexieEvents.on('data-updated', handleDataUpdated);
        dexieEvents.on('sync-completed', handleDataUpdated);
        // Cleanup event listeners on unmount
        return () => {
            dexieEvents.off('data-updated', handleDataUpdated);
            dexieEvents.off('sync-completed', handleDataUpdated);
        };
    }, [fetchReleases]);
    // Generate years array from available release data
    const years = useMemo(() => {
        if (!releases || releases.length === 0) {
            const currentYear = new Date().getFullYear();
            return [
                { id: currentYear.toString(), name: currentYear.toString() },
                { id: (currentYear - 1).toString(), name: (currentYear - 1).toString() },
                { id: (currentYear - 2).toString(), name: (currentYear - 2).toString() }
            ];
        }
        // Extract unique years from releases
        const yearSet = new Set();
        releases.forEach((release) => {
            // Check multiple date fields for year extraction
            const dateFields = [
                'Date_delivered_by_vendor',
                'Date_deployed_to_test',
                'Date_of_test_commencement',
                'Date_of_test_completion',
                'Notification_date_for_deployment_to_test',
                'Date_updated'
            ];
            for (const field of dateFields) {
                const dateStr = release[field];
                if (dateStr && typeof dateStr === 'string') {
                    try {
                        // Extract year from ISO date string
                        const yearMatch = dateStr.match(/^(\d{4})-/);
                        if (yearMatch) {
                            const year = yearMatch[1];
                            yearSet.add(year);
                            break; // Found year, move to next release
                        }
                    }
                    catch (e) {
                        // Continue to next date field
                    }
                }
            }
        });
        // Always include current year and recent years
        const currentYear = new Date().getFullYear();
        yearSet.add(currentYear.toString());
        yearSet.add((currentYear - 1).toString());
        yearSet.add((currentYear - 2).toString());
        // Convert to array and sort descending
        const yearsArray = Array.from(yearSet)
            .map(year => ({ id: year, name: year }))
            .sort((a, b) => parseInt(b.id) - parseInt(a.id));
        console.log('📋 Available years from Dexie data:', yearsArray);
        return yearsArray;
    }, [releases]);
    // Filter years based on search term
    const filteredYears = useMemo(() => {
        if (!searchTerm.trim())
            return years;
        return years.filter(year => year.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [years, searchTerm]);
    // Get selected year name
    const selectedYearItem = years.find(item => item.id === selectedYear);
    // Process data for selected year whenever year or releases change
    useEffect(() => {
        if (releases.length > 0) {
            const processedData = processForReleaseType(releases, selectedYear);
            setChartData(processedData);
            // Debug: Check if we have data
            const hasAnyData = processedData.some(month => month.Major > 0 || month.Medium > 0 || month.Minor > 0);
            console.log(`📊 Data for ${selectedYear}:`, {
                processedDataLength: processedData.length,
                hasAnyData,
                totalReleases: releases.length
            });
        }
        else {
            setChartData([]);
        }
    }, [releases, selectedYear]);
    const hasData = useMemo(() => {
        return chartData.length > 0 && chartData.some(month => month.Major > 0 || month.Medium > 0 || month.Minor > 0);
    }, [chartData]);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            setSearchTerm(""); // Reset search when opening
        }
    }, [isOpen]);
    // Original screen resize functionality - PRESERVED
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const handleYearSelect = (yearId) => {
        setSelectedYear(yearId);
        setIsOpen(false);
        setSearchTerm("");
    };
    const handleClearSearch = (e) => {
        e.stopPropagation();
        setSearchTerm("");
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };
    const handleClearSelection = (e) => {
        e.stopPropagation();
        setSelectedYear(new Date().getFullYear().toString());
        setIsOpen(false);
        setSearchTerm("");
    };
    const handleTriggerClick = () => {
        setIsOpen(!isOpen);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        }
    };
    // Optional: Manual refresh button (can trigger re-fetch from Dexie)
    const handleManualRefresh = () => {
        fetchReleases();
    };
    // Loading state
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx(CardTitle, { className: "text-lg lg:text-xl", children: "Release Type by Month" }), _jsx("div", { className: "w-[160px] h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-[300px] bg-gray-100 dark:bg-gray-800 rounded animate-pulse" }) })] }));
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx(CardTitle, { className: "text-lg lg:text-xl", children: "Release Type by Month" }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "relative flex-shrink-0", ref: containerRef, children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-[160px] h-9", onClick: handleTriggerClick, type: "button", children: [_jsx("span", { className: "truncate flex-1 text-left", children: selectedYearItem?.name || "Select year" }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [selectedYear && selectedYear !== new Date().getFullYear().toString() && (_jsx(X, { className: "w-3 h-3 text-gray-400 hover:text-gray-600", onClick: handleClearSelection })), _jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}` })] })] }), isOpen && (_jsxs("div", { className: "absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden", style: {
                                            width: '190px',
                                            top: '100%',
                                            right: 0
                                        }, children: [_jsx("div", { className: "p-3 border-b", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" }), _jsx(Input, { ref: searchInputRef, placeholder: "Search", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), onKeyDown: handleKeyDown, className: "w-full pl-9 pr-8 h-8 text-sm border-gray-300 focus:border-red-400 focus:ring-red-400 focus:ring-1", onClick: (e) => e.stopPropagation() }), searchTerm && (_jsx(X, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer", onClick: handleClearSearch }))] }) }), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredYears.length > 0 ? (filteredYears.map((year) => (_jsx("button", { onClick: () => handleYearSelect(year.id), className: `w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${selectedYear === year.id
                                                        ? "bg-red-50 text-red-600 font-medium"
                                                        : "text-gray-700"}`, type: "button", children: _jsx("span", { className: "truncate block", children: year.name }) }, year.id)))) : (_jsx("div", { className: "px-3 py-4 text-center text-sm text-gray-500", children: "No years found" })) }), searchTerm && filteredYears.length > 0 && (_jsxs("div", { className: "px-3 py-2 border-t text-xs text-gray-500 bg-gray-50", children: [filteredYears.length, " of ", years.length, " years"] }))] }))] }) })] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: hasData ? (_jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }), _jsx(XAxis, { dataKey: "month", interval: 0, tick: { fill: "#6b7280", fontSize: isLargeScreen ? 13 : 11 }, angle: isLargeScreen ? 0 : -25, textAnchor: isLargeScreen ? "middle" : "end", height: isLargeScreen ? 30 : 50 }), _jsx(YAxis, { tick: { fill: "#6b7280", fontSize: 16 } }), _jsx(Tooltip, {}), _jsx(Legend, { layout: "horizontal", verticalAlign: "top", align: "center", iconType: "circle", wrapperStyle: {
                                    marginTop: isLargeScreen ? -30 : -10,
                                    paddingBottom: 16,
                                    fontSize: isLargeScreen ? 14 : 13,
                                } }), _jsx(Bar, { stackId: "a", dataKey: "Major", fill: "#d11314" }), _jsx(Bar, { stackId: "a", dataKey: "Medium", fill: "#767276" }), _jsx(Bar, { stackId: "a", dataKey: "Minor", fill: "#0c0c0c" })] })) : (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center p-4", children: [_jsx("div", { className: "text-gray-400 mb-2", children: _jsx("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" }) }) }), _jsx("p", { className: "text-gray-500 font-medium", children: releases.length === 0 ? "No data available" : `No data available for ${selectedYear}` }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: releases.length === 0
                                        ? "Fetch data using the 'Fetch Data' button"
                                        : "Select a different year to view release type analysis" }), releases.length > 0 && (_jsxs("div", { className: "mt-3 text-xs text-gray-500", children: [_jsxs("p", { children: ["Available years: ", years.map(y => y.name).join(", ")] }), _jsxs("p", { children: ["Total releases in Dexie: ", releases.length] })] }))] }) })) }) })] }));
}
