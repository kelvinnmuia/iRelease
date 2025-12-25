import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToCSV, exportToExcel, exportToJSON } from "./utils/sirs-release-export-utils"


interface SirsReleaseExportMenuProps {
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportJSON: () => void;
  selectedRowsCount: number;
  disabled?: boolean; // Add this
}

export const SirsReleaseExportMenu = ({
  onExportCSV,
  onExportExcel,
  onExportJSON,
  selectedRowsCount,
  disabled = false
}: SirsReleaseExportMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-red-400 text-red-600 bg-white hover:bg-red-50 flex-1 md:flex-none md:w-auto min-w-[100px]" disabled={disabled}>
          <>
            <Download className="w-4 h-4" />
            <span>Export</span>
          </>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        <DropdownMenuItem onClick={onExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onExportJSON}>
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};