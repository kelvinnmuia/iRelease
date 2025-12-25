import { useState, ChangeEvent, useEffect, useCallback } from "react";
import { Columns3, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the SIR Releases columns
export const allColumns = [
  { key: "sir_release_id", label: "Sir_Rel_Id", width: "w-32" },
  { key: "sir_id", label: "Sir_Id", width: "w-42" },
  { key: "release_version", label: "Release Version", width: "w-32" },
  { key: "iteration", label: "Iteration", width: "w-28" },
  { key: "changed_date", label: "Changed Date", width: "w-48" },
  { key: "bug_severity", label: "Bug Severity", width: "w-48" },
  { key: "priority", label: "Priority", width: "w-32" },
  { key: "assigned_to", label: "Assigned To", width: "w-32" },
  { key: "bug_status", label: "Bug Status", width: "w-32" },
  { key: "resolution", label: "Resolution", width: "w-32" },
  { key: "component", label: "Component", width: "w-32" },
  { key: "op_sys", label: "Op Sys", width: "w-32" },
  { key: "short_desc", label: "Short Description", width: "w-48" },
  { key: "cf_sirwith", label: "Cf Sir With", width: "w-32" },
] as const;

export type ColumnKey = typeof allColumns[number]['key'];
export type ColumnConfig = typeof allColumns[number];

// Storage key for column visibility
export const COLUMN_VISIBILITY_KEY = 'sir-releases-column-visibility';

// Utility functions for localStorage
export const loadColumnVisibility = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const validatedVisibility: Record<string, boolean> = {};
      allColumns.forEach(col => {
        validatedVisibility[col.key] = parsed[col.key] !== undefined ? parsed[col.key] : true;
      });
      return validatedVisibility;
    }
  } catch (error) {
    console.warn('Failed to load column visibility from localStorage:', error);
  }
  // Default: all columns visible
  return allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
};

export const saveColumnVisibility = (visibility: Record<string, boolean>) => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.warn('Failed to save column visibility to localStorage:', error);
  }
};

export const getVisibleColumns = (visibility: Record<string, boolean>): ColumnConfig[] => {
  return allColumns.filter(col => visibility[col.key]);
};

// Hook for managing column visibility
export const useColumnVisibility = () => {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => 
    loadColumnVisibility()
  );

  // Save to localStorage when columnVisibility changes
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  }, []);

  const resetColumnVisibility = useCallback(() => {
    const defaultVisibility = allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
    setColumnVisibility(defaultVisibility);
  }, []);

  const visibleColumns = getVisibleColumns(columnVisibility);

  return {
    columnVisibility,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility,
    visibleColumns,
    allColumns,
  };
};

// Props interface
interface SirsReleasesColumnVisibilityProps {
  columnVisibility: Record<string, boolean>;
  toggleColumnVisibility: (columnKey: string) => void;
  resetColumnVisibility: () => void;
  areFiltersSelected?: boolean;
}

// Main component
export const SirsReleasesColumnVisibility = ({
  columnVisibility,
  toggleColumnVisibility,
  resetColumnVisibility,
  areFiltersSelected = true
}: SirsReleasesColumnVisibilityProps) => {
  const [columnSearchQuery, setColumnSearchQuery] = useState("");

  // Filter columns based on search query
  const filteredColumns = allColumns.filter(col =>
    !columnSearchQuery ||
    col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px]"
          disabled={!areFiltersSelected}
        >
          <Columns3 className="w-4 h-4" />
          <span>Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-60 max-h-[350px] overflow-hidden flex flex-col"
      >
        {/* Search input */}
        <div className="relative p-2 border-b">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <div className="w-full">
            <Input
              placeholder="Search columns..."
              value={columnSearchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setColumnSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
            />
          </div>
        </div>

        {/* Scrollable column list */}
        <div className="overflow-y-auto flex-1 max-h-[300px]">
          <div className="p-1">
            {filteredColumns.length > 0 ? (
              filteredColumns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={columnVisibility[col.key]}
                  onCheckedChange={() => toggleColumnVisibility(col.key)}
                  onSelect={(e: Event) => e.preventDefault()}
                  className="px-7 py-2.5 text-sm flex items-center gap-3 min-h-6 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1 ml-1">{col.label}</div>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No columns found
              </div>
            )}
          </div>
        </div>

        {/* Reset button */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={resetColumnVisibility}
          className="px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset Columns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Export everything needed by other components
export default SirsReleasesColumnVisibility;