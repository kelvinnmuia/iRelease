import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseDate, formatDate, formatISODate } from "./utils/date-utils";
export const DatePickerInput = ({ value, onChange, placeholder = "Select date", disabled = false }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState("");
    const pickerRef = useRef(null);
    // Convert ISO date to display format
    const displayValue = formatISODate(value) || value;
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
                setTempDate("");
            }
        };
        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);
    const handleApply = () => {
        if (tempDate) {
            const parsedDate = parseDate(tempDate);
            if (parsedDate) {
                const formattedDate = formatDate(parsedDate);
                onChange(formattedDate);
            }
        }
        setShowPicker(false);
        setTempDate("");
    };
    const handleClear = () => {
        onChange('');
        setShowPicker(false);
        setTempDate("");
    };
    const handleDateInputChange = (e) => {
        setTempDate(e.target.value);
    };
    return (_jsxs("div", { className: "relative w-full", ref: pickerRef, children: [_jsxs("div", { className: "flex items-center cursor-pointer", onClick: () => {
                    setShowPicker(!showPicker);
                    setTempDate("");
                }, children: [_jsx(Calendar, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" }), _jsx(Input, { placeholder: placeholder, value: displayValue, readOnly: true, className: "w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer sm:pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none" })] }), showPicker && (_jsx("div", { className: "absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Select Date" }), _jsx("div", { className: "w-full", children: _jsx(Input, { type: "date", value: tempDate, onChange: handleDateInputChange, className: "w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400" }) })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx(Button, { onClick: handleApply, disabled: !tempDate, className: "flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50", variant: "outline", size: "sm", children: "Apply" }), _jsx(Button, { onClick: handleClear, className: "flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500", size: "sm", children: "Clear" })] })] }) }))] }));
};
