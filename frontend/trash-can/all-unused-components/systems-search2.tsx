// components/systems-search.tsx
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";

interface SystemsSearchProps {
  value: string;
  onChange: (systemName: string) => void;
  validationError?: string;
  placeholder?: string;
  disabled?: boolean;
}

// Static mapping for system names to system IDs
// This will eventually be replaced with API data
export const systemMapping: Record<string, string> = {
  "iCMS": "SYS-TDF6N",
  "TLIP": "SYS-7H9K2",
  "eCustoms": "SYS-3M4P8",
  "WIMS": "SYS-1R5T9",
  "iBID": "SYS-6V2W3",
  "iSCAN": "SYS-8X5Y7",
  "iTax": "SYS-TDF67",
  "LMS": "SYS-7H9K6",
  "RTS": "SYS-3M4P7",
  "RECTS": "SYS-1R5T2",
  "CMSB": "SYS-6V2W4",
  "DFG": "SYS-8X5Y1"
};

const systemNameOptions = Object.keys(systemMapping);

export const SystemsSearch = ({
  value,
  onChange,
  validationError,
  placeholder = "Select system name",
  disabled = false
}: SystemsSearchProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSystems, setFilteredSystems] = useState(systemNameOptions);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter systems based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSystems(systemNameOptions);
    } else {
      const filtered = systemNameOptions.filter(system =>
        system.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSystems(filtered);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Handle system selection
  const handleSystemSelect = (systemName: string) => {
    onChange(systemName);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-2 w-full" ref={dropdownRef}>
      {/* Custom System Name Dropdown with Search */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:border-red-400 ${
            validationError ? 'border-red-500' : 'border-gray-300'
          } ${value ? 'text-gray-900' : 'text-gray-500'}`}
        >
          <span className="text-sm">{value || placeholder}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search systems..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 w-full text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {/* Scrollable List with Search Results */}
            <div className="max-h-60 overflow-y-auto">
              {filteredSystems.length > 0 ? (
                filteredSystems.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleSystemSelect(name)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-sm ${
                      value === name ? 'bg-red-50 text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  No systems found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {validationError && (
        <p className="text-red-500 text-xs mt-1">{validationError}</p>
      )}
    </div>
  );
};