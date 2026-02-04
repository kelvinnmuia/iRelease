import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// components/systems-search.tsx
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { getAllSystems } from "@/db/ireleasedb";
// This will be populated from Dexie
let systemMapping = {};
export const SystemsSearch = ({ value, onChange, validationError, placeholder = "Select system name", disabled = false }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [systemNames, setSystemNames] = useState([]);
    const [filteredSystems, setFilteredSystems] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    // Load systems from Dexie on component mount
    useEffect(() => {
        const loadSystems = async () => {
            try {
                setLoading(true);
                const systemsData = await getAllSystems();
                // Create mapping and extract system names
                const mapping = {};
                const names = [];
                systemsData.forEach((system) => {
                    if (system.System_name && system.System_id) {
                        mapping[system.System_name] = system.System_id;
                        names.push(system.System_name);
                    }
                });
                systemMapping = mapping; // Update the exported mapping
                setSystemNames(names);
                setFilteredSystems(names);
            }
            catch (error) {
                console.error("Error loading systems from Dexie:", error);
                setSystemNames([]);
                setFilteredSystems([]);
            }
            finally {
                setLoading(false);
            }
        };
        loadSystems();
    }, []);
    // Filter systems based on search query
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredSystems(systemNames);
        }
        else {
            const filtered = systemNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredSystems(filtered);
        }
    }, [searchQuery, systemNames]);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setSearchQuery("");
            }
        };
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isDropdownOpen]);
    // Handle system selection
    const handleSystemSelect = (systemName) => {
        onChange(systemName);
        setIsDropdownOpen(false);
        setSearchQuery("");
    };
    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
        searchInputRef.current?.focus();
    };
    return (_jsxs("div", { className: "space-y-2 w-full", ref: dropdownRef, children: [_jsxs("div", { className: "relative", children: [_jsxs("button", { type: "button", onClick: () => !disabled && setIsDropdownOpen(!isDropdownOpen), disabled: disabled, className: `w-full flex items-center justify-between px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:border-red-400 ${validationError ? 'border-red-500' : 'border-gray-300'} ${value ? 'text-gray-900' : 'text-gray-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`, children: [_jsx("span", { className: "text-sm", children: value || placeholder }), _jsx(ChevronDown, { className: `h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}` })] }), isDropdownOpen && (_jsxs("div", { className: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg", children: [_jsx("div", { className: "p-2 border-b border-gray-200", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { ref: searchInputRef, type: "text", placeholder: "Search systems...", value: searchQuery, onChange: handleSearchChange, className: "pl-10 pr-10 w-full text-sm" }), searchQuery && (_jsx("button", { type: "button", onClick: clearSearch, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg", children: "\u00D7" }))] }) }), _jsx("div", { className: "max-h-60 overflow-y-auto", children: loading ? (_jsx("div", { className: "px-3 py-4 text-center text-gray-500 text-sm", children: "Loading systems..." })) : filteredSystems.length > 0 ? (filteredSystems.map((name) => (_jsx("button", { type: "button", onClick: () => handleSystemSelect(name), className: `w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-sm ${value === name ? 'bg-red-50 text-red-600' : 'text-gray-900'}`, children: name }, name)))) : (_jsx("div", { className: "px-3 py-4 text-center text-gray-500 text-sm", children: "No systems found" })) })] }))] }), validationError && (_jsx("p", { className: "text-red-500 text-xs mt-1", children: validationError }))] }));
};
// Export systemMapping for use in other components
export { systemMapping };
