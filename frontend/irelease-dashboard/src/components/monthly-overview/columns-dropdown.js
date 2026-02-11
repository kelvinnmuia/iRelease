import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Columns3 } from "lucide-react";
export const ColumnsDropdown = ({ areFiltersSelected, onToggleColumns, onResetColumns, buttonClassName = "" }) => {
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "outline", size: "sm", className: `gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`, disabled: !areFiltersSelected, children: _jsxs(_Fragment, { children: [_jsx(Columns3, { className: "w-4 h-4" }), _jsx("span", { children: "Columns" })] }) }) }), _jsxs(DropdownMenuContent, { className: "min-w-[150px]", children: [_jsx(DropdownMenuItem, { onClick: areFiltersSelected ? onToggleColumns : undefined, className: !areFiltersSelected ? "opacity-50 cursor-not-allowed" : "", children: "Toggle Columns" }), _jsx(DropdownMenuItem, { onClick: areFiltersSelected ? onResetColumns : undefined, className: !areFiltersSelected ? "opacity-50 cursor-not-allowed" : "", children: "Reset Columns" })] })] }));
};
