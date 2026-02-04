import { useState, ChangeEvent } from "react";
import { Columns3, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { allColumns } from "./constants/releases-constants";

interface ColumnVisibilityMenuProps {
  columnVisibility: Record<string, boolean>;
  toggleColumnVisibility: (columnKey: string) => void;
  resetColumnVisibility: () => void;
}

export const ColumnVisibilityMenu = ({
  columnVisibility,
  toggleColumnVisibility,
  resetColumnVisibility
}: ColumnVisibilityMenuProps) => {
  const [columnSearchQuery, setColumnSearchQuery] = useState("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 md:flex-none md:w-auto min-w-[140px]">
          <Columns3 className="w-4 h-4" />
          <span>Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-60 max-h-[350px] overflow-hidden flex flex-col"
      >
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
            {allColumns
              .filter(col =>
                !columnSearchQuery ||
                col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
              )
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={columnVisibility[col.key]}
                  onCheckedChange={() => toggleColumnVisibility(col.key)}
                  onSelect={(e: Event) => e.preventDefault()}
                  className="px-7 py-2.5 text-sm flex items-center gap-3 min-h-6"
                >
                  <div className="flex-1 ml-1">{col.label}</div>
                </DropdownMenuCheckboxItem>
              ))}

            {/* Show message when no columns match search */}
            {allColumns.filter(col =>
              !columnSearchQuery ||
              col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
            ).length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No columns found
                </div>
              )}
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={resetColumnVisibility}
          className="px-3 py-2.5 text-sm"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset Columns
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};