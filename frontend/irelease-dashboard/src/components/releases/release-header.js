import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ReleasesHeader = ({ selectedRowsCount, totalFilteredCount, globalFilter, dateRange }) => {
    return (_jsxs("div", { className: "bg-gray-50 p-6", children: [_jsx("div", { className: "items-start", children: _jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "All Releases" }) }), selectedRowsCount > 0 && (_jsxs("div", { className: "mt-4 text-sm text-gray-600", children: [selectedRowsCount, " of ", totalFilteredCount, " row(s) selected"] })), (globalFilter || dateRange) && (_jsxs("div", { className: "mt-2 text-sm text-gray-500", children: ["Showing ", totalFilteredCount, " releases", globalFilter && ` matching "${globalFilter}"`, dateRange && ` within date range: ${dateRange}`] }))] }));
};
