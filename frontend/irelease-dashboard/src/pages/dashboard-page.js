import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ReleaseTypeChart } from "@/components/dashboard/release-type-chart";
import { ReleasesBySystemName } from "@/components/dashboard/releases-by-system-name";
import { SirsTypeChart } from "@/components/dashboard/sirs-types-chart";
import { DeploymentStatus } from "@/components/dashboard/deployment-status";
export default function DashboardPage() {
    const [screenWidth, setScreenWidth] = useState(0);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
        setScreenWidth(window.innerWidth);
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Show loading state on server
    if (!isClient) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6", children: _jsxs("div", { className: "md:col-span-3 lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6", children: [_jsx(StatsCards, {}), _jsx("div", { children: "Loading dashboard layout..." })] }) }));
    }
    // Check if screen is exactly 1024px (with a small buffer for rounding)
    const is1024Screen = screenWidth >= 1020 && screenWidth <= 1030;
    if (is1024Screen) {
        // NEW LAYOUT for 1024px screens only - ALL CHARTS FULL WIDTH
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6", children: _jsxs("div", { className: "md:col-span-3 lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6", children: [_jsx(StatsCards, {}), _jsxs("div", { className: "grid grid-cols-1 gap-3 sm:gap-4 md:gap-6", children: [_jsx("div", { className: "col-span-1", children: _jsx(ReleaseTypeChart, {}) }), _jsx("div", { className: "col-span-1", children: _jsx(ReleasesBySystemName, {}) }), _jsx("div", { className: "col-span-1", children: _jsx(SirsTypeChart, {}) }), _jsx("div", { className: "col-span-1", children: _jsx(DeploymentStatus, {}) })] })] }) }));
    }
    // ORIGINAL LAYOUT for all other screen sizes (2-column grid)
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6", children: _jsxs("div", { className: "md:col-span-3 lg:col-span-3 space-y-3 sm:space-y-4 md:space-y-6", children: [_jsx(StatsCards, {}), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6", children: [_jsx(ReleaseTypeChart, {}), _jsx(ReleasesBySystemName, {}), _jsx(SirsTypeChart, {}), _jsx(DeploymentStatus, {})] })] }) }));
}
