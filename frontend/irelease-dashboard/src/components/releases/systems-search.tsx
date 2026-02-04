// components/systems-search.tsx
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { getAllSystems } from "@/db/ireleasedb";

interface SystemsSearchProps {
  value: string;
  onChange: (systemName: string) => void;
  validationError?: string;
  placeholder?: string;
  disabled?: boolean;
}

interface System {
  System_id: string;
  System_name: string;
}

// This will be populated from Dexie
let systemMapping: Record<string, string> = {};

export const SystemsSearch = ({
  value,
  onChange,
  validationError,
  placeholder = "Select system name",
  disabled = false
}: SystemsSearchProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemNames, setSystemNames] = useState<string[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load systems from Dexie on component mount
  useEffect(() => {
    const loadSystems = async () => {
      try {
        setLoading(true);
        const systemsData = await getAllSystems();
        
        // Create mapping and extract system names
        const mapping: Record<string, string> = {};
        const names: string[] = [];
        
        systemsData.forEach((system: System) => {
          if (system.System_name && system.System_id) {
            mapping[system.System_name] = system.System_id;
            names.push(system.System_name);
          }
        });
        
        systemMapping = mapping; // Update the exported mapping
        setSystemNames(names);
        setFilteredSystems(names);
        
      } catch (error) {
        console.error("Error loading systems from Dexie:", error);
        setSystemNames([]);
        setFilteredSystems([]);
      } finally {
        setLoading(false);
      }
    };

    loadSystems();
  }, []);

  // Filter systems based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSystems(systemNames);
    } else {
      const filtered = systemNames.filter(name =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSystems(filtered);
    }
  }, [searchQuery, systemNames]);

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
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:border-red-400 ${
            validationError ? 'border-red-500' : 'border-gray-300'
          } ${value ? 'text-gray-900' : 'text-gray-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              {loading ? (
                <div className="px-3 py-4 text-center text-gray-500 text-sm">
                  Loading systems...
                </div>
              ) : filteredSystems.length > 0 ? (
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
                  No systems found
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

// Export systemMapping for use in other components
export { systemMapping };