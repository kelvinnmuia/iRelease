import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useEffect, useState, useCallback } from "react";
import { ireleaseDB, dexieEvents } from "@/db/ireleasedb"; // Changed import
const COLORS = ["#ae1f26", "#767276", "#0c0c0c", "#d11314", "#5a5a5a", "#b6484f"];
// Process function (moved into file)
function processForSystem(releases) {
    if (!releases || releases.length === 0)
        return [];
    // Count releases by System_name
    const systemCounts = {};
    releases.forEach((release) => {
        const systemName = release.System_name || "Unknown System";
        systemCounts[systemName] = (systemCounts[systemName] || 0) + 1;
    });
    // Convert to array and sort by count (descending)
    const systemData = Object.entries(systemCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Keep top 6 systems
    console.log('📊 Processed system data:', systemData);
    return systemData;
}
export function ReleasesBySystemName() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    // Fetch releases from Dexie
    const fetchReleases = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📥 Fetching releases from Dexie for system chart...');
            const releases = await ireleaseDB.releases.toArray();
            const systemData = processForSystem(releases);
            setData(systemData);
            console.log(`✅ Processed ${systemData.length} systems from ${releases.length} releases`);
        }
        catch (error) {
            console.error("Error fetching releases from Dexie:", error);
            setData([]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        // Initial fetch on component mount
        fetchReleases();
        // Listen for data-updated events from Dexie
        const handleDataUpdated = () => {
            console.log('📢 System chart received data-updated event, refreshing...');
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
    const totalReleases = data.reduce((sum, item) => sum + item.value, 0);
    // Get screen width (no layout change — just used to adjust chart size)
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640;
    const innerRadius = isSmallScreen ? 35 : 50;
    const outerRadius = isSmallScreen ? 60 : 80;
    // Loading skeleton
    if (loading) {
        return (_jsxs(Card, { className: "h-full", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-lg lg:text-xl text-center", children: "Releases by System Name" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4 animate-pulse", children: [_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx("div", { className: "w-full h-[200px] bg-gray-200 dark:bg-gray-700 rounded" }), _jsxs("div", { className: "flex flex-col items-center mt-2", children: [_jsx("div", { className: "h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2" }), _jsx("div", { className: "h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1" })] })] }), _jsx("div", { className: "hidden md:block w-px bg-gray-200" }), _jsx("div", { className: "flex-1 space-y-3 self-center-safe", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" }), _jsx("div", { className: "h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" })] }), _jsx("div", { className: "h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" })] }, i))) })] }) })] }));
    }
    // No data state
    if (data.length === 0) {
        return (_jsxs(Card, { className: "h-full", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-lg lg:text-xl text-center", children: "Releases by System Name" }) }), _jsx(CardContent, { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "mb-2", children: _jsx("svg", { className: "w-12 h-12 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" }) }) }), _jsx("p", { className: "text-gray-500 font-medium", children: "No data available" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Fetch data using the 'Fetch Data' button" })] }) })] }));
    }
    return (_jsxs(Card, { className: "h-full", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-lg lg:text-xl text-center", children: "Releases by System Name" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", innerRadius: innerRadius, outerRadius: outerRadius, paddingAngle: 2, dataKey: "value", label: false, children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { content: ({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const { name, value } = payload[0];
                                                        const index = data.findIndex((item) => item.name === name);
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
                                                } })] }) }), _jsxs("div", { className: "flex flex-col items-center mt-2", children: [_jsx("div", { className: "text-2xl md:text-3xl font-bold text-gray-900", children: totalReleases }), _jsx("div", { className: "text-xs md:text-sm text-gray-500", children: "Total Releases" })] })] }), _jsx("div", { className: "hidden md:block w-px bg-gray-200" }), _jsx("div", { className: "flex-1 space-y-3 self-center-safe", children: data.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full flex-shrink-0", style: {
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                } }), _jsx("span", { className: "text-sm font-medium", style: {
                                                    color: COLORS[index % COLORS.length],
                                                }, children: item.name })] }), _jsx("span", { className: "text-sm font-semibold text-gray-900 ml-auto", children: item.value })] }, item.name))) })] }) })] }));
}
