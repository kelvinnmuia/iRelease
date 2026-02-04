import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Columns3, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { allColumns } from "./constants/mo-releases-constants";
export const ColumnVisibilityMenu = ({ columnVisibility, toggleColumnVisibility, resetColumnVisibility }) => {
    const [columnSearchQuery, setColumnSearchQuery] = useState("");
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px]", children: [_jsx(Columns3, { className: "w-4 h-4" }), _jsx("span", { children: "Columns" })] }) }), _jsxs(DropdownMenuContent, { align: "start", className: "w-60 max-h-[350px] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "relative p-2 border-b", children: [_jsx(Search, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" }), _jsx("div", { className: "w-full", children: _jsx(Input, { placeholder: "Search columns...", value: columnSearchQuery, onChange: (e) => setColumnSearchQuery(e.target.value), className: "w-full pl-8 pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400" }) })] }), _jsx("div", { className: "overflow-y-auto flex-1 max-h-[300px]", children: _jsxs("div", { className: "p-1", children: [allColumns
                                    .filter(col => !columnSearchQuery ||
                                    col.label.toLowerCase().includes(columnSearchQuery.toLowerCase()))
                                    .map((col) => (_jsx(DropdownMenuCheckboxItem, { checked: columnVisibility[col.key], onCheckedChange: () => toggleColumnVisibility(col.key), onSelect: (e) => e.preventDefault(), className: "px-7 py-2.5 text-sm flex items-center gap-3 min-h-6", children: _jsx("div", { className: "flex-1 ml-1", children: col.label }) }, col.key))), allColumns.filter(col => !columnSearchQuery ||
                                    col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())).length === 0 && (_jsx("div", { className: "px-3 py-2 text-sm text-gray-500 text-center", children: "No columns found" }))] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: resetColumnVisibility, className: "px-3 py-2.5 text-sm", children: [_jsx(RefreshCcw, { className: "mr-2 h-4 w-4" }), "Reset Columns"] })] })] }));
};
