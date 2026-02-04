import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ireleaseDB, dexieEvents } from "@/db/ireleasedb";
const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314", "#7f151b", "#4f4c4f", "#050505", "#9a0d0e"];
export function SirsTypeChart() {
    const [selectedRelease, setSelectedRelease] = useState("");
    const [selectedIteration, setSelectedIteration] = useState("");
    const [releaseSearchTerm, setReleaseSearchTerm] = useState("");
    const [iterationSearchTerm, setIterationSearchTerm] = useState("");
    const [isReleaseOpen, setIsReleaseOpen] = useState(false);
    const [isIterationOpen, setIsIterationOpen] = useState(false);
    const [sirsData, setSirsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [releases, setReleases] = useState([]);
    const [iterations, setIterations] = useState([]);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [hasDataInDexie, setHasDataInDexie] = useState(null);
    const releaseSearchInputRef = useRef(null);
    const iterationSearchInputRef = useRef(null);
    const releaseContainerRef = useRef(null);
    const iterationContainerRef = useRef(null);
    // Check if Dexie has SIRs data
    const checkDexieHasData = useCallback(async () => {
        try {
            const count = await ireleaseDB.sirsReleases.count();
            setHasDataInDexie(count > 0);
            console.log(`📊 Dexie SIRs count: ${count}, hasData: ${count > 0}`);
            return count > 0;
        }
        catch (error) {
            console.error("Error checking Dexie data:", error);
            setHasDataInDexie(false);
            return false;
        }
    }, []);
    // Get the last record from Dexie and auto-select it (only when not already loaded)
    const getAndSetLastRecord = useCallback(async (forceRefresh = false) => {
        try {
            // Don't run if initial load is done and we're not forcing a refresh
            if (initialLoadDone && !forceRefresh)
                return;
            const hasData = await checkDexieHasData();
            if (!hasData) {
                setInitialLoadDone(true);
                return;
            }
            const allSirs = await ireleaseDB.sirsReleases.toArray();
            if (allSirs.length > 0) {
                const lastRecord = allSirs[allSirs.length - 1];
                if (lastRecord.Release_version && lastRecord.Iteration) {
                    console.log(`🎯 Auto-selecting last record: Release=${lastRecord.Release_version}, Iteration=${lastRecord.Iteration}`);
                    // Set release and iteration together
                    setSelectedRelease(lastRecord.Release_version);
                    setSelectedIteration(lastRecord.Iteration);
                }
            }
            setInitialLoadDone(true);
        }
        catch (error) {
            console.error("Error getting last record:", error);
            setInitialLoadDone(true);
        }
    }, [initialLoadDone, checkDexieHasData]);
    // Fetch available releases
    const fetchReleases = useCallback(async () => {
        try {
            const allSirs = await ireleaseDB.sirsReleases.toArray();
            const uniqueReleases = [...new Set(allSirs
                    .map(sir => sir.Release_version)
                    .filter(Boolean))].sort((a, b) => b.localeCompare(a));
            const releaseOptions = uniqueReleases.map(release => ({
                id: release,
                name: release
            }));
            setReleases(releaseOptions);
            console.log(`📊 Loaded ${releaseOptions.length} releases from Dexie`);
        }
        catch (error) {
            console.error("Error fetching releases:", error);
            setReleases([]);
        }
    }, []);
    // Fetch iterations for selected release - ASCENDING ORDER
    const fetchIterations = useCallback(async () => {
        if (!selectedRelease) {
            setIterations([]);
            return;
        }
        try {
            const allSirs = await ireleaseDB.sirsReleases
                .where('Release_version')
                .equals(selectedRelease)
                .toArray();
            const uniqueIterations = [...new Set(allSirs
                    .map(sir => sir.Iteration)
                    .filter(Boolean))].sort((a, b) => {
                // Sort numerically if both are numbers
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                // Otherwise sort as strings
                return a.localeCompare(b);
            });
            const iterationOptions = uniqueIterations.map(iteration => ({
                id: iteration,
                name: iteration
            }));
            setIterations(iterationOptions);
            console.log(`📊 Loaded ${iterationOptions.length} iterations for release ${selectedRelease}`);
        }
        catch (error) {
            console.error("Error fetching iterations:", error);
            setIterations([]);
        }
    }, [selectedRelease]);
    // Fetch SIRs data for selected release and iteration
    const fetchSirsData = useCallback(async () => {
        try {
            setLoading(true);
            if (!selectedRelease || !selectedIteration) {
                setSirsData([]);
                return;
            }
            console.log(`🔍 Looking for SIRs: Release="${selectedRelease}", Iteration="${selectedIteration}"`);
            const allSirs = await ireleaseDB.sirsReleases.toArray();
            // Manual filtering - exact match first
            let filteredSirs = allSirs.filter(sir => sir.Release_version === selectedRelease &&
                sir.Iteration === selectedIteration);
            // If empty, try case-insensitive matching
            if (filteredSirs.length === 0) {
                console.log('🔍 Trying case-insensitive matching...');
                filteredSirs = allSirs.filter(sir => sir.Release_version?.toLowerCase() === selectedRelease.toLowerCase() &&
                    sir.Iteration?.toLowerCase() === selectedIteration.toLowerCase());
            }
            console.log(`📊 Total found: ${filteredSirs.length} SIRs`);
            // Count SIRs by severity
            const severityCounts = {};
            filteredSirs.forEach((sir) => {
                const severity = sir.Bug_severity || sir.Priority || 'Unknown';
                severityCounts[severity] = (severityCounts[severity] || 0) + 1;
            });
            console.log('📈 Severity distribution:', severityCounts);
            // Convert to chart data
            const chartData = Object.entries(severityCounts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            console.log('📊 Chart data ready:', chartData);
            setSirsData(chartData);
        }
        catch (error) {
            console.error("❌ Error fetching SIRs data:", error);
            setSirsData([]);
        }
        finally {
            setLoading(false);
        }
    }, [selectedRelease, selectedIteration]);
    // Initial load: check data, get last record AND fetch releases
    useEffect(() => {
        const initializeData = async () => {
            await checkDexieHasData();
            await getAndSetLastRecord(); // No parameter = default false
            await fetchReleases();
        };
        initializeData();
    }, [checkDexieHasData, getAndSetLastRecord, fetchReleases]);
    // Fetch iterations when release changes (but only if user changed it)
    useEffect(() => {
        if (selectedRelease) {
            fetchIterations();
        }
        else {
            setIterations([]);
        }
    }, [selectedRelease, fetchIterations]);
    // Fetch SIRs data when selection changes
    useEffect(() => {
        if (selectedRelease && selectedIteration) {
            fetchSirsData();
        }
        else {
            setSirsData([]);
        }
    }, [selectedRelease, selectedIteration, fetchSirsData]);
    // Listen for data-updated events from Dexie (FIXED - will auto-select last record on data refresh)
    useEffect(() => {
        // Function to handle data updates
        const handleDataUpdated = () => {
            console.log('📢 SIRs chart received data-updated event, refreshing and auto-selecting last record...');
            // Refresh all data
            checkDexieHasData();
            fetchReleases();
            getAndSetLastRecord(true); // Pass true to force refresh even if initialLoadDone is true
            if (selectedRelease) {
                fetchIterations();
                if (selectedIteration) {
                    fetchSirsData();
                }
            }
        };
        // Subscribe to events
        dexieEvents.on('data-updated', handleDataUpdated);
        dexieEvents.on('sync-completed', handleDataUpdated);
        // Cleanup event listeners on unmount
        return () => {
            dexieEvents.off('data-updated', handleDataUpdated);
            dexieEvents.off('sync-completed', handleDataUpdated);
        };
    }, [checkDexieHasData, fetchReleases, getAndSetLastRecord, fetchIterations, fetchSirsData, selectedRelease, selectedIteration]);
    // Filter releases based on search term
    const filteredReleases = useMemo(() => {
        if (!releaseSearchTerm.trim())
            return releases;
        return releases.filter(release => release.name.toLowerCase().includes(releaseSearchTerm.toLowerCase()));
    }, [releases, releaseSearchTerm]);
    // Filter iterations based on search term
    const filteredIterations = useMemo(() => {
        if (!iterationSearchTerm.trim())
            return iterations;
        return iterations.filter(iteration => iteration.name.toLowerCase().includes(iterationSearchTerm.toLowerCase()));
    }, [iterations, iterationSearchTerm]);
    const totalSirs = sirsData.reduce((sum, item) => sum + item.value, 0);
    // Get selected release and iteration names
    const selectedReleaseItem = releases.find(item => item.id === selectedRelease);
    const selectedIterationItem = iterations.find(item => item.id === selectedIteration);
    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (releaseContainerRef.current && !releaseContainerRef.current.contains(event.target)) {
                setIsReleaseOpen(false);
                setReleaseSearchTerm("");
            }
            if (iterationContainerRef.current && !iterationContainerRef.current.contains(event.target)) {
                setIsIterationOpen(false);
                setIterationSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Focus search input when dropdown opens
    useEffect(() => {
        if (isReleaseOpen && releaseSearchInputRef.current) {
            setTimeout(() => {
                releaseSearchInputRef.current?.focus();
            }, 100);
            setReleaseSearchTerm("");
        }
    }, [isReleaseOpen]);
    useEffect(() => {
        if (isIterationOpen && iterationSearchInputRef.current) {
            setTimeout(() => {
                iterationSearchInputRef.current?.focus();
            }, 100);
            setIterationSearchTerm("");
        }
    }, [isIterationOpen]);
    const handleReleaseSelect = (releaseId) => {
        setSelectedRelease(releaseId);
        setSelectedIteration(""); // Clear iteration when release changes
        setIsReleaseOpen(false);
        setReleaseSearchTerm("");
    };
    const handleIterationSelect = (iterationId) => {
        setSelectedIteration(iterationId);
        setIsIterationOpen(false);
        setIterationSearchTerm("");
    };
    const handleClearReleaseSearch = (e) => {
        e.stopPropagation();
        setReleaseSearchTerm("");
        setTimeout(() => {
            releaseSearchInputRef.current?.focus();
        }, 0);
    };
    const handleClearIterationSearch = (e) => {
        e.stopPropagation();
        setIterationSearchTerm("");
        setTimeout(() => {
            iterationSearchInputRef.current?.focus();
        }, 0);
    };
    const handleClearReleaseSelection = (e) => {
        e.stopPropagation();
        setSelectedRelease("");
        setSelectedIteration("");
        setIsReleaseOpen(false);
        setReleaseSearchTerm("");
        setSirsData([]);
    };
    const handleClearIterationSelection = (e) => {
        e.stopPropagation();
        setSelectedIteration("");
        setIsIterationOpen(false);
        setIterationSearchTerm("");
        setSirsData([]);
    };
    const handleReleaseKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsReleaseOpen(false);
            setReleaseSearchTerm("");
        }
    };
    const handleIterationKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsIterationOpen(false);
            setIterationSearchTerm("");
        }
    };
    // Show loading while checking initial data
    if (hasDataInDexie === null) {
        return (_jsxs(Card, { className: "h-full", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-lg lg:text-xl text-center", children: "SIRs by Severity" }), _jsx(CardDescription, { className: "text-center mt-3", children: "Loading SIRs data..." })] }), _jsx(CardContent, { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Checking for SIRs data..." })] }) })] }));
    }
    // Show empty state if no data in Dexie
    if (hasDataInDexie === false) {
        return (_jsxs(Card, { className: "h-full", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-lg lg:text-xl text-center", children: "SIRs by Severity" }), _jsx(CardDescription, { className: "text-center mt-3", children: "SIRs Breakdown by Severity" })] }), _jsx(CardContent, { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "mb-2", children: _jsx("svg", { className: "w-12 h-12 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" }) }) }), _jsx("p", { className: "text-gray-500 font-medium", children: "No SIRs releases data available" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Fetch data using the 'Fetch Data' button" })] }) })] }));
    }
    return (_jsxs(Card, { className: "h-full", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx(CardTitle, { className: "text-lg lg:text-xl", children: "SIRs by Severity" }), _jsx(CardDescription, { className: "mt-2", children: selectedRelease && selectedIteration
                                    ? `SIRs for Release ${selectedRelease} • Iteration ${selectedIteration}`
                                    : "Select a release and iteration to view SIRs" })] }), _jsxs("div", { className: "flex justify-center gap-2", children: [_jsxs("div", { className: "relative", ref: releaseContainerRef, children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-[160px] h-9", onClick: () => setIsReleaseOpen(!isReleaseOpen), type: "button", children: [_jsx("span", { className: "truncate flex-1 text-left", children: selectedReleaseItem?.name || "Select Release" }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [selectedRelease && (_jsx(X, { className: "w-3 h-3 text-gray-400 hover:text-gray-600", onClick: handleClearReleaseSelection })), _jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${isReleaseOpen ? 'rotate-180' : ''}` })] })] }), isReleaseOpen && (_jsxs("div", { className: "absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden", style: { width: '190px', top: '100%', left: 0 }, children: [_jsx("div", { className: "p-3 border-b", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" }), _jsx(Input, { ref: releaseSearchInputRef, placeholder: "Search", value: releaseSearchTerm, onChange: (e) => setReleaseSearchTerm(e.target.value), onKeyDown: handleReleaseKeyDown, className: "w-full pl-9 pr-8 h-8 text-sm border-red-400 focus:border-red-500 focus:ring-red-500", onClick: (e) => e.stopPropagation() }), releaseSearchTerm && (_jsx(X, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer", onClick: handleClearReleaseSearch }))] }) }), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredReleases.length > 0 ? (filteredReleases.map((release) => (_jsx("button", { onClick: () => handleReleaseSelect(release.id), className: `w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${selectedRelease === release.id
                                                        ? "bg-red-50 text-red-600 font-medium"
                                                        : "text-gray-700"}`, type: "button", children: _jsx("span", { className: "truncate block", children: release.name }) }, release.id)))) : (_jsx("div", { className: "px-3 py-4 text-center text-sm text-gray-500", children: releases.length === 0 ? "No releases found" : "No matching releases" })) }), releaseSearchTerm && filteredReleases.length > 0 && (_jsxs("div", { className: "px-3 py-2 border-t text-xs text-gray-500 bg-gray-50", children: [filteredReleases.length, " of ", releases.length, " releases"] }))] }))] }), _jsxs("div", { className: "relative", ref: iterationContainerRef, children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-[160px] h-9", onClick: () => selectedRelease && setIsIterationOpen(!isIterationOpen), type: "button", disabled: !selectedRelease, children: [_jsx("span", { className: "truncate flex-1 text-left", children: selectedIterationItem?.name || "Select Iteration" }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [selectedIteration && (_jsx(X, { className: "w-3 h-3 text-gray-400 hover:text-gray-600", onClick: handleClearIterationSelection })), _jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${isIterationOpen ? 'rotate-180' : ''}` })] })] }), isIterationOpen && (_jsxs("div", { className: "absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden", style: { width: '190px', top: '100%', left: 0 }, children: [_jsx("div", { className: "p-3 border-b", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" }), _jsx(Input, { ref: iterationSearchInputRef, placeholder: "Search", value: iterationSearchTerm, onChange: (e) => setIterationSearchTerm(e.target.value), onKeyDown: handleIterationKeyDown, className: "w-full pl-9 pr-8 h-8 text-sm border-red-400 focus:border-red-500 focus:ring-red-500", onClick: (e) => e.stopPropagation() }), iterationSearchTerm && (_jsx(X, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer", onClick: handleClearIterationSearch }))] }) }), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredIterations.length > 0 ? (filteredIterations.map((iteration) => (_jsx("button", { onClick: () => handleIterationSelect(iteration.id), className: `w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${selectedIteration === iteration.id
                                                        ? "bg-red-50 text-red-600 font-medium"
                                                        : "text-gray-700"}`, type: "button", children: _jsx("span", { className: "truncate block", children: iteration.name }) }, iteration.id)))) : (_jsx("div", { className: "px-3 py-4 text-center text-sm text-gray-500", children: iterations.length === 0 ? "No iterations found" : "No matching iterations" })) }), iterationSearchTerm && filteredIterations.length > 0 && (_jsxs("div", { className: "px-3 py-2 border-t text-xs text-gray-500 bg-gray-50", children: [filteredIterations.length, " of ", iterations.length, " iterations"] }))] }))] })] })] }), _jsx(CardContent, { children: !selectedRelease || !selectedIteration ? (_jsx("div", { className: "flex flex-col items-center justify-center h-[200px]", children: _jsxs("div", { className: "text-center p-4", children: [_jsx("p", { className: "text-gray-500 font-medium", children: "Select a release and iteration to view SIRs" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Choose from the dropdowns above" })] }) })) : loading ? (_jsx("div", { className: "flex gap-4 animate-pulse", children: _jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx("div", { className: "w-full h-[200px] bg-gray-200 rounded" }), _jsxs("div", { className: "flex flex-col items-center mt-2", children: [_jsx("div", { className: "h-8 w-16 bg-gray-200 rounded mt-2" }), _jsx("div", { className: "h-4 w-20 bg-gray-200 rounded mt-1" })] })] }) })) : (_jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: sirsData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 80, paddingAngle: 2, dataKey: "value", label: false, children: sirsData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { content: ({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const { name, value } = payload[0];
                                                        const index = sirsData.findIndex((item) => item.name === name);
                                                        const color = COLORS[index % COLORS.length];
                                                        return (_jsxs("div", { style: {
                                                                backgroundColor: "white",
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius: "6px",
                                                                fontSize: "0.875rem",
                                                                padding: "8px 12px",
                                                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                                                minWidth: "130px",
                                                            }, children: [_jsx("div", { style: { color, fontWeight: 600 }, children: name }), _jsx("div", { style: { color: "#1f2937" }, children: value })] }));
                                                    }
                                                    return null;
                                                } })] }) }), _jsxs("div", { className: "flex flex-col items-center mt-2", children: [_jsx("div", { className: "text-2xl md:text-3xl font-bold text-gray-900", children: totalSirs }), _jsx("div", { className: "text-xs md:text-sm text-gray-500", children: "Total SIRs" })] })] }), _jsx("div", { className: "hidden md:block w-px bg-gray-200" }), _jsx("div", { className: "flex-1 space-y-3 self-center-safe", children: sirsData.length > 0 ? (sirsData.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full flex-shrink-0", style: { backgroundColor: COLORS[index % COLORS.length] } }), _jsx("span", { className: "text-sm font-medium", style: { color: COLORS[index % COLORS.length] }, children: item.name })] }), _jsx("span", { className: "text-sm font-semibold text-gray-900 ml-auto", children: item.value })] }, item.name)))) : (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "text-gray-400 mb-2", children: _jsx("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" }) }) }), _jsx("p", { className: "text-gray-500 font-medium", children: "No severity data available" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Fetch data using the 'Fetch Data' button" })] }) })) })] })) })] }));
}
