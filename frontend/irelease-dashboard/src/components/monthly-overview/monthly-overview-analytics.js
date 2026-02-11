import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MoStatsCards } from './mo-stats-cards';
import { MoReleasesTypeChart } from './mo-releases-type-chart';
import { MoReleasesDataTable } from './monthly-overview-datatable/mo-releases-datatable';
export function MonthlyOverviewAnalytics({ filteredData, month, year }) {
    // Add state to control tab/view
    const [activeView, setActiveView] = useState('overview');
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "px-2 sm:px-2 -mt-3", children: _jsxs("div", { className: "flex space-x-1 border-b border-gray-200", children: [_jsx("button", { onClick: () => setActiveView('overview'), className: `px-4 py-2 text-sm font-medium transition-colors ${activeView === 'overview'
                                ? 'text-red-600 border-b-2 border-red-600'
                                : 'text-gray-500 hover:text-gray-700'}`, children: "Overview" }), _jsx("button", { onClick: () => setActiveView('datatable'), className: `px-4 py-2 text-sm font-medium transition-colors ${activeView === 'datatable'
                                ? 'text-red-600 border-b-2 border-red-600'
                                : 'text-gray-500 hover:text-gray-700'}`, children: "Data Table" })] }) }), activeView === 'overview' ? (_jsxs("div", { className: "px-0.5 sm:px-0.5 pt-4 sm:pt-6 pb-4 sm:pb-6", children: [_jsxs("h3", { className: "text-base font-medium text-gray-500 mb-8", children: ["Monthly Releases Analytics for ", month, " ", year] }), _jsx("div", { className: "mb-6", children: _jsx(MoStatsCards, { releasesData: filteredData }) }), _jsx(MoReleasesTypeChart, { releasesData: filteredData })] })) : (_jsxs("div", { className: "px-0.5 sm:px-0.5 pt-4 sm:pt-6 pb-4 sm:pb-6", children: [_jsx("div", { children: _jsxs("h3", { className: "text-base font-medium text-gray-500 ml-6", children: ["Monthly Releases Data Table for ", month, " ", year] }) }), _jsx(MoReleasesDataTable, { filteredData: filteredData })] }))] }));
}
