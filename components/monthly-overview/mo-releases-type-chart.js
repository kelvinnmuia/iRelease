import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#d11314", "#767276", "#0c0c0c"]; // Major, Medium, Minor
export function MoReleasesTypeChart({ releasesData }) {
    // Helper function to normalize release type
    const normalizeReleaseType = (type) => {
        if (!type)
            return null;
        const normalized = type.trim().toLowerCase();
        if (normalized.includes('major'))
            return 'major';
        if (normalized.includes('medium'))
            return 'medium';
        if (normalized.includes('minor'))
            return 'minor';
        return normalized; // Return as-is if not matching
    };
    // Count releases by type with better normalization
    const allReleases = releasesData || [];
    const typeCounts = {
        major: allReleases.filter(item => {
            const normalizedType = normalizeReleaseType(item.releaseType);
            return normalizedType === 'major';
        }).length,
        medium: allReleases.filter(item => {
            const normalizedType = normalizeReleaseType(item.releaseType);
            return normalizedType === 'medium';
        }).length,
        minor: allReleases.filter(item => {
            const normalizedType = normalizeReleaseType(item.releaseType);
            return normalizedType === 'minor';
        }).length,
    };
    // Get count of releases with unrecognized types
    const otherReleases = allReleases.filter(item => {
        const normalizedType = normalizeReleaseType(item.releaseType);
        return normalizedType && !['major', 'medium', 'minor'].includes(normalizedType);
    }).length;
    // Calculate total releases that we're displaying in the chart
    const totalDisplayedReleases = typeCounts.major + typeCounts.medium + typeCounts.minor;
    // Calculate actual total releases (including others if we want to show them)
    const totalAllReleases = allReleases.length;
    // Transform data for the chart with actual counts
    const chartData = [
        { name: "Major", value: typeCounts.major },
        { name: "Medium", value: typeCounts.medium },
        { name: "Minor", value: typeCounts.minor },
    ].filter(item => item.value > 0); // Only show types with data
    // Calculate percentages based on displayed releases, not all releases
    const dataWithPercentages = chartData.map(item => ({
        ...item,
        percentage: totalDisplayedReleases > 0 ? ((item.value / totalDisplayedReleases) * 100).toFixed(1) : "0.0"
    }));
    // Get screen width for responsive sizing
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 640;
    // Increased inner radius slightly for a more noticeable donut hole
    const innerRadius = isSmallScreen ? 25 : 40;
    const outerRadius = isSmallScreen ? 70 : 95;
    // Simple centered percentage labels
    const renderCenteredLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        // Position label in the middle of the segment (closer to outer edge)
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        // Only show label if segment is large enough
        if (percent < 0.05)
            return null; // Hide labels for very small segments
        return (_jsx("text", { x: x, y: y, fill: "white", textAnchor: "middle", dominantBaseline: "central", fontSize: 14, fontWeight: "bold", style: {
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                pointerEvents: 'none'
            }, children: `${(percent * 100).toFixed(0)}%` }));
    };
    return (_jsxs(Card, { className: "h-full", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { className: "text-lg lg:text-xl text-center", children: "Releases by Type" }), otherReleases > 0 && (_jsxs("p", { className: "text-xs text-gray-500 text-center mt-1", children: ["(", otherReleases, " releases with other types not shown)"] }))] }), _jsx(CardContent, { children: totalDisplayedReleases === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 text-center", children: [_jsx("div", { className: "text-gray-400 mb-2", children: _jsx("svg", { className: "w-16 h-16", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }) }), _jsx("p", { className: "text-gray-500 font-medium", children: "No releases data available" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "No Major, Medium, or Minor releases found" })] })) : (_jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", innerRadius: innerRadius, outerRadius: outerRadius, paddingAngle: 1, dataKey: "value", label: renderCenteredLabel, labelLine: false, isAnimationActive: true, animationBegin: 0, animationDuration: 1500, animationEasing: "ease-out", children: chartData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length], stroke: "#ffffff", strokeWidth: 2 }, `cell-${index}`))) }), _jsx(Tooltip, { content: ({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const { name, value } = payload[0];
                                                        const index = chartData.findIndex((item) => item.name === name);
                                                        const color = COLORS[index % COLORS.length];
                                                        const percentage = dataWithPercentages.find(item => item.name === name)?.percentage || "0.0";
                                                        return (_jsxs("div", { style: {
                                                                backgroundColor: "white",
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius: "6px",
                                                                fontSize: "0.875rem",
                                                                padding: "12px",
                                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                                minWidth: "150px",
                                                            }, children: [_jsx("div", { style: { color, fontWeight: 600, fontSize: "1rem", marginBottom: "4px" }, children: name }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "2px" }, children: [_jsx("span", { style: { color: "#6b7280" }, children: "Count:" }), _jsx("span", { style: { color: "#1f2937", fontWeight: 500 }, children: value })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { style: { color: "#6b7280" }, children: "Percentage:" }), _jsxs("span", { style: { color, fontWeight: 600, fontSize: "1.1rem" }, children: [percentage, "%"] })] })] }));
                                                    }
                                                    return null;
                                                } })] }) }), _jsxs("div", { className: "flex flex-col items-center mt-4", children: [_jsx("div", { className: "text-2xl md:text-3xl font-bold text-gray-900", children: totalDisplayedReleases }), _jsx("div", { className: "text-xs md:text-sm text-gray-500", children: "Total Releases (Major/Medium/Minor)" }), totalAllReleases !== totalDisplayedReleases && (_jsxs("div", { className: "text-xs text-gray-400 mt-1", children: ["of ", totalAllReleases, " total releases"] }))] })] }), _jsx("div", { className: "hidden md:block w-px bg-gray-200" }), _jsx("div", { className: "flex-1 space-y-3 self-center-safe", children: dataWithPercentages.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full flex-shrink-0", style: {
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                } }), _jsx("span", { className: "text-sm font-medium", style: {
                                                    color: COLORS[index % COLORS.length],
                                                }, children: item.name })] }), _jsxs("div", { className: "text-left flex-shrink-0 lg:mr-60", children: [_jsx("div", { className: "text-sm font-semibold text-gray-900", children: item.value }), _jsxs("div", { className: "text-xs text-gray-500", children: [item.percentage, "%"] })] })] }, item.name))) })] })) })] }));
}
