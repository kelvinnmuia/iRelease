import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const SearchableDropdown = ({ items, selectedId, onSelect, placeholder = "Select", className = "", buttonClassName = "", searchPlaceholder = "Search..." }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const containerRef = useRef(null);
    // Filter items based on search term
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim())
            return items;
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm]);
    // Get selected item name
    const selectedItem = items.find(item => item.id === selectedId);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            setSearchTerm(""); // Reset search when opening
        }
    }, [isOpen]);
    const handleItemSelect = (id) => {
        onSelect(id);
        setIsOpen(false);
        setSearchTerm("");
    };
    const handleClearSearch = (e) => {
        e.stopPropagation();
        setSearchTerm("");
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };
    const handleClearSelection = (e) => {
        e.stopPropagation();
        onSelect("");
        setIsOpen(false);
        setSearchTerm("");
    };
    const handleTriggerClick = () => {
        setIsOpen(!isOpen);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        }
    };
    return (_jsxs("div", { className: `relative ${className}`, ref: containerRef, children: [_jsxs(Button, { size: "sm", variant: "outline", className: `flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full min-w-[160px] h-9 ${buttonClassName}`, onClick: handleTriggerClick, type: "button", children: [_jsx("span", { className: "truncate flex-1 text-left", children: selectedItem?.name || placeholder }), _jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [selectedId && (_jsx(X, { className: "w-3 h-3 text-gray-400 hover:text-gray-600", onClick: handleClearSelection })), _jsx(ChevronDown, { className: `w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}` })] })] }), isOpen && (_jsxs("div", { ref: dropdownRef, className: "absolute z-50 mt-1 w-[190px] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden", style: { top: '100%' }, children: [_jsx("div", { className: "p-3 border-b", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" }), _jsx(Input, { ref: searchInputRef, placeholder: searchPlaceholder, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), onKeyDown: handleKeyDown, className: "w-full pl-9 pr-8 h-8 text-sm border-gray-300 focus:border-red-400 focus:ring-red-400 focus:ring-1", onClick: (e) => e.stopPropagation() }), searchTerm && (_jsx(X, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer", onClick: handleClearSearch }))] }) }), _jsx("div", { className: "max-h-48 overflow-y-auto", children: filteredItems.length > 0 ? (filteredItems.map((item) => (_jsx("button", { onClick: () => handleItemSelect(item.id), className: `w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === item.id
                                ? "bg-red-50 text-red-600 font-medium"
                                : "text-gray-700"}`, type: "button", children: _jsx("span", { className: "truncate block", children: item.name }) }, item.id)))) : (_jsx("div", { className: "px-3 py-4 text-center text-sm text-gray-500", children: "No items found" })) }), searchTerm && filteredItems.length > 0 && (_jsxs("div", { className: "px-3 py-2 border-t text-xs text-gray-500 bg-gray-50", children: [filteredItems.length, " of ", items.length, " items"] }))] }))] }));
};
