import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export const DateRangePicker = ({ dateRange, startDate, endDate, showDatePicker, onShowDatePickerChange, onStartDateChange, onEndDateChange, onApply, onClear, datePickerRef }) => {
    const handleApply = () => {
        onApply(); // Call the apply function
        onShowDatePickerChange(false); // Close the picker
    };
    const handleClear = () => {
        onClear(); // Call the clear function
        onShowDatePickerChange(false); // Close the picker
    };
    return (_jsxs("div", { className: "relative flex-1 md:flex-none md:w-56 lg:w-64", ref: datePickerRef, children: [_jsxs("div", { className: "flex items-center cursor-pointer", onClick: () => onShowDatePickerChange(!showDatePicker), children: [_jsx(Calendar, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" }), _jsx(Input, { placeholder: "Date range", value: dateRange, readOnly: true, className: "w-full pl-10 pr-4 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer focus:ring-2 focus:ring-offset-0 focus:outline-none text-sm min-w-0 truncate", title: dateRange })] }), showDatePicker && (_jsx("div", { className: "absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-72", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }), _jsx(Input, { type: "date", value: startDate, onChange: (e) => onStartDateChange(e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date" }), _jsx(Input, { type: "date", value: endDate, onChange: (e) => onEndDateChange(e.target.value), className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx(Button, { onClick: handleApply, disabled: !startDate || !endDate, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50", variant: "outline", size: "sm", children: "Apply" }), _jsx(Button, { onClick: handleClear, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500", size: "sm", children: "Clear" })] })] }) }))] }));
};
