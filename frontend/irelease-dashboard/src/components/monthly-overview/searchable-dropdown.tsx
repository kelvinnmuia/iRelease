import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SearchableDropdownProps {
    items: Array<{ id: string, name: string }>;
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    searchPlaceholder?: string;
}

export const SearchableDropdown = ({
    items,
    selectedId,
    onSelect,
    placeholder = "Select",
    className = "",
    buttonClassName = "",
    searchPlaceholder = "Search..."
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

            {/* Custom Dropdown Content */}
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
                                placeholder={searchPlaceholder}
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

                    {/* Filtered Items List */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemSelect(item.id)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === item.id
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
                                No items found
                            </div>
                        )}
                    </div>

                    {/* Show count if items are filtered */}
                    {searchTerm && filteredItems.length > 0 && (
                        <div className="px-3 py-2 border-t text-xs text-gray-500 bg-gray-50">
                            {filteredItems.length} of {items.length} items
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};