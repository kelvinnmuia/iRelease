import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Columns3, Search, ChevronDown, Map, X } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

export interface SirsReleaseFiltersProps {
    // State values
    selectedRelease: string;
    selectedIteration: string;
    globalFilter: string;

    // State setters
    setSelectedRelease: (release: string) => void;
    setSelectedIteration: (iteration: string) => void;
    setGlobalFilter: (filter: string) => void;

    // Data
    releaseVersions: Array<{ id: string, name: string }>;
    iterations: Array<{ id: string, name: string }>;

    // Callbacks (placeholders for now)
    onExportCSV?: () => void;
    onExportExcel?: () => void;
    onExportJSON?: () => void;
    onToggleColumns?: () => void;
    onResetColumns?: () => void;
    onMapSirs?: () => void; // New callback for Map SIRs
}

// Searchable Dropdown Component
interface SearchableDropdownProps {
    items: Array<{ id: string, name: string }>;
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
}

const SearchableDropdown = ({
    items,
    selectedId,
    onSelect,
    placeholder = "Select",
    className = "",
    buttonClassName = ""
}: SearchableDropdownProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter items based on search term
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    // Get selected item name
    const selectedItem = items.find(item => item.id === selectedId);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

    const handleItemSelect = (id: string) => {
        onSelect(id);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClearSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchTerm("");
        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    };

    const handleClearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect("");
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleTriggerClick = () => {
        setIsOpen(!isOpen);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <Button
                size="sm"
                variant="outline"
                className={`flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full min-w-[160px] h-9 ${buttonClassName}`}
                onClick={handleTriggerClick}
                type="button"
            >
                <span className="truncate flex-1 text-left">
                    {selectedItem?.name || placeholder}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {selectedId && (
                        <X
                            className="w-3 h-3 text-gray-400 hover:text-gray-600"
                            onClick={handleClearSelection}
                        />
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </Button>

            {/* Custom Dropdown Content - Adjusted width to 190px and reduced height */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-[190px] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                    style={{ top: '100%' }}
                >
                    {/* Search Input */}
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search..."  // Changed from "Search releases..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-9 pr-8 h-8 text-sm border-gray-300 focus:border-red-400 focus:ring-red-400 focus:ring-1"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {searchTerm && (
                                <X
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    onClick={handleClearSearch}
                                />
                            )}
                        </div>
                    </div>

                    {/* Filtered Items List - Reduced max-height */}
                    <div className="max-h-48 overflow-y-auto">  {/* Changed from max-h-60 to max-h-48 */}
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemSelect(item.id)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${
                                        selectedId === item.id 
                                            ? "bg-red-50 text-red-600 font-medium" 
                                            : "text-gray-700"
                                    }`}
                                    type="button"
                                >
                                    <span className="truncate block">{item.name}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                No releases found
                            </div>
                        )}
                    </div>

                    {/* Show count if items are filtered */}
                    {searchTerm && filteredItems.length > 0 && (
                        <div className="px-3 py-2 border-t text-xs text-gray-500 bg-gray-50">
                            {filteredItems.length} of {items.length} releases
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const SirsReleaseFilters = ({
    selectedRelease,
    selectedIteration,
    globalFilter,
    setSelectedRelease,
    setSelectedIteration,
    setGlobalFilter,
    releaseVersions,
    iterations,
    onExportCSV = () => { },
    onExportExcel = () => { },
    onExportJSON = () => { },
    onToggleColumns = () => { },
    onResetColumns = () => { },
    onMapSirs = () => { } // New prop with default function
}: SirsReleaseFiltersProps) => {
    // Check if both release and iteration are selected
    const areFiltersSelected = selectedRelease && selectedIteration;
    
    return (
        <div className="bg-gray-50 pt-0 p-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                {/* Left Section - Export, Show/Hide, Search */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:max-w-2xl">
                    {/* Export and Show/Hide */}
                    <div className="flex gap-2 flex-1 md:flex-none">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 border-red-400 text-red-600 bg-white hover:bg-red-50 flex-1 md:flex-none md:w-auto min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!areFiltersSelected}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[130px]">
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onExportCSV : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Export to CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onExportExcel : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Export to Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onExportJSON : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Export to JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!areFiltersSelected}
                                >
                                    <Columns3 className="w-4 h-4" />
                                    <span>Columns</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[150px]">
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onToggleColumns : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Toggle Columns
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={areFiltersSelected ? onResetColumns : undefined}
                                    className={!areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    Reset Columns
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 min-w-0">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                            <Input
                                placeholder="Search SIRs..."
                                value={globalFilter}
                                onChange={(e) => {
                                    if (areFiltersSelected) {
                                        setGlobalFilter(e.target.value);
                                    }
                                }}
                                disabled={!areFiltersSelected}
                                className={`w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 focus:ring-2 focus:ring-offset-0 focus:outline-none ${
                                    !areFiltersSelected ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section - Release Version, Iteration, and Map SIRs Button */}
                <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
                    <div className="flex gap-2 flex-1 md:flex-none">
                        {/* Searchable Release Version Dropdown */}
                        <SearchableDropdown
                            items={releaseVersions}
                            selectedId={selectedRelease}
                            onSelect={setSelectedRelease}
                            placeholder="Release Version"
                            buttonClassName="w-full md:w-[180px] min-w-[180px]"
                        />

                        {/* Iteration Select - Keep original for now */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-between bg-white border-gray-300 hover:bg-gray-50 w-full md:w-[120px] min-w-[120px] h-9"
                                >
                                    <span className="truncate flex-1 text-left">
                                        {selectedIteration
                                            ? iterations.find(i => i.id === selectedIteration)?.name || "Iteration"
                                            : "Iteration"
                                        }
                                    </span>
                                    <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-[120px]">
                                {iterations.map((iteration) => (
                                    <DropdownMenuItem
                                        key={iteration.id}
                                        onClick={() => setSelectedIteration(iteration.id)}
                                        className={selectedIteration === iteration.id ? "bg-gray-100" : ""}
                                    >
                                        {iteration.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Map SIRs Button - NOT disabled */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onMapSirs}
                            className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 md:flex-none md:w-32 gap-2 h-9"
                        >
                            <Map className="w-4 h-4" />
                            <span>Map SIRs</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};