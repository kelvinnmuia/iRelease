import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface SearchInputProps {
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
    areFiltersSelected: boolean;
    placeholder?: string;
    className?: string;
}

export const SearchInput = ({
    globalFilter,
    setGlobalFilter,
    areFiltersSelected,
    placeholder = "Search SIRs...",
    className = ""
}: SearchInputProps) => {
    return (
        <div className={`relative max-w-md ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            <Input
                placeholder={placeholder}
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
    );
};