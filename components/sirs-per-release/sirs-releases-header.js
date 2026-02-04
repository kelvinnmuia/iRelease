import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SirReleaseHeader = ({ selectedRowsCount, totalFilteredCount, globalFilter }) => {
    return (_jsxs("div", { className: "bg-gray-50 p-6", children: [_jsx("div", { className: "items-start", children: _jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "SIRs Per Release" }) }), selectedRowsCount > 0 && (_jsxs("div", { className: "mt-4 text-sm text-gray-600", children: [selectedRowsCount, " of ", totalFilteredCount, " row(s) selected"] })), globalFilter && (_jsxs("div", { className: "mt-2 text-sm text-gray-500", children: ["Showing ", totalFilteredCount, " SIR(s) matching \"", globalFilter, "\""] }))] }));
};
