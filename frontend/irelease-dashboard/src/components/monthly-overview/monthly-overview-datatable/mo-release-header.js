import { jsxs as _jsxs } from "react/jsx-runtime";
export const ReleasesHeader = ({ selectedRowsCount, totalFilteredCount, globalFilter, dateRange }) => {
    return (_jsxs("div", { className: "bg-gray-50 p-6", children: [selectedRowsCount > 0 && (_jsxs("div", { className: "-mt-2 mb-4 text-sm text-gray-600", children: [selectedRowsCount, " of ", totalFilteredCount, " row(s) selected"] })), (globalFilter || dateRange) && (_jsxs("div", { className: "-mt-2 mb-4 text-sm text-gray-500", children: ["Showing ", totalFilteredCount, " releases", globalFilter && ` matching "${globalFilter}"`, dateRange && ` within date range: ${dateRange}`] }))] }));
};
