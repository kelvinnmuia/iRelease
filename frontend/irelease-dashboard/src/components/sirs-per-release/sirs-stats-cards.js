import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
// Helper function to calculate trend percentage
const calculateTrend = (currentCount, previousCount = 0) => {
    if (previousCount === 0)
        return { trend: "New", positive: true };
    const change = ((currentCount - previousCount) / previousCount) * 100;
    return {
        trend: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
        positive: change <= 0 // Positive means decreasing (good)
    };
};
export function SirsStatCards({ sirReleaseData }) {
    // Count SIRs by severity
    const counts = {
        total: sirReleaseData.length,
        blocker: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "blocker").length,
        critical: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "critical").length,
        major: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "major").length,
        minor: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "minor").length,
        normal: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "normal").length,
        enhancement: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "enhancement").length,
        spec: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "spec").length,
        setup: sirReleaseData.filter(item => item.bug_severity.toLowerCase() === "setup").length,
    };
    // Calculate trends
    // const totalTrend = calculateTrend(counts.total, Math.floor(counts.total * 0.9));
    const blockerTrend = calculateTrend(counts.blocker, 0);
    const criticalTrend = calculateTrend(counts.critical, 0);
    const majorTrend = calculateTrend(counts.major, 0);
    const minorTrend = calculateTrend(counts.minor, 0);
    const normalTrend = calculateTrend(counts.normal, 0);
    const enhancementTrend = calculateTrend(counts.enhancement, 0);
    const specTrend = calculateTrend(counts.spec, 0);
    const setupTrend = calculateTrend(counts.setup, 0);
    const sirsStats = [
        /*{
          label: "Total SIRs",
          value: counts.total.toString(),
          trend: totalTrend.trend,
          positive: totalTrend.positive,
          bgColor: "bg-gray-100 dark:bg-gray-800",
          colorClass: "text-gray-600 dark:text-gray-400"
        },*/
        {
            label: "Blocker SIRs",
            value: counts.blocker.toString(),
            trend: blockerTrend.trend,
            positive: blockerTrend.positive,
            bgColor: "bg-red-100 dark:bg-red-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Critical SIRs",
            value: counts.critical.toString(),
            trend: criticalTrend.trend,
            positive: criticalTrend.positive,
            bgColor: "bg-orange-100 dark:bg-orange-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Major SIRs",
            value: counts.major.toString(),
            trend: majorTrend.trend,
            positive: majorTrend.positive,
            bgColor: "bg-amber-100 dark:bg-amber-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Minor SIRs",
            value: counts.minor.toString(),
            trend: minorTrend.trend,
            positive: minorTrend.positive,
            bgColor: "bg-blue-100 dark:bg-blue-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Normal SIRs",
            value: counts.normal.toString(),
            trend: normalTrend.trend,
            positive: normalTrend.positive,
            bgColor: "bg-indigo-100 dark:bg-indigo-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Enhancement SIRs",
            value: counts.enhancement.toString(),
            trend: enhancementTrend.trend,
            positive: enhancementTrend.positive,
            bgColor: "bg-violet-100 dark:bg-violet-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Spec SIRs",
            value: counts.spec.toString(),
            trend: specTrend.trend,
            positive: specTrend.positive,
            bgColor: "bg-fuchsia-100 dark:bg-fuchsia-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
        {
            label: "Setup SIRs",
            value: counts.setup.toString(),
            trend: setupTrend.trend,
            positive: setupTrend.positive,
            bgColor: "bg-pink-100 dark:bg-pink-900",
            colorClass: "text-gray-600 dark:text-gray-400"
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4", children: sirsStats.map((stat) => {
            return (_jsx(Card, { className: "overflow-hidden hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4 md:p-5", children: [_jsx("div", { className: "mb-2", children: _jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400", children: stat.label }) }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsx("div", { children: _jsx("p", { className: `text-xl md:text-2xl lg:text-3xl font-bold ${stat.colorClass}`, children: stat.value }) }), _jsxs("div", { className: `${stat.bgColor} px-2 py-1 rounded text-xs font-medium flex items-center gap-1`, children: [stat.positive ? _jsx(TrendingUp, { className: "w-3 h-3" }) : _jsx(TrendingDown, { className: "w-3 h-3" }), stat.trend] })] })] }) }, stat.label));
        }) }));
}
