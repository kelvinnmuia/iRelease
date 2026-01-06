import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { ColumnConfig } from '../../components/monthly-overview/sirs-releases-column-visibility';
import { SirsReleasesTruncatedText } from "./sirs-releases-truncated-text";

// Define the SIR type based on your datatable interface
interface SirRelease {
  id: number;
  sir_release_id: string;
  sir_id: number | string;
  release_version: string;
  iteration: number | string;
  changed_date: string;
  bug_severity: string;
  priority: string;
  assigned_to: string;
  bug_status: string;
  resolution: string;
  component: string;
  op_sys: string;
  short_desc: string;
  cf_sirwith: string;
}

interface SirsReleasesTableProps {
  data: SirRelease[];
  visibleColumns: ColumnConfig[];
  selectedRows: Set<number>;
  onToggleRowSelection: (id: number) => void;
  onToggleSelectAll: () => void;
  onEditSIR: (sir: SirRelease) => void;
  onDeleteSIR: (sir: SirRelease) => void;
  onExportSingleSIR: (sir: SirRelease) => void;
}

// Status configurations (moved from datatable)
const bugSeverity: Record<string, { color: string; dot: string }> = {
  "Critical": { color: "text-gray-600", dot: "bg-yellow-400" },
  "Minor": { color: "text-gray-600", dot: "bg-gray-500" },
  "Major": { color: "text-gray-600", dot: "bg-slate-600" },
  "Blocker": { color: "text-gray-600", dot: "bg-red-500" },
}

const bugStatus: Record<string, { color: string; dot: string }> = {
  "Resolved": { color: "text-gray-600", dot: "bg-green-500" },
  "Verified": { color: "text-gray-600", dot: "bg-slate-600" },
  "Closed": { color: "text-gray-600", dot: "bg-gray-500" },
  "Open": { color: "text-gray-600", dot: "bg-blue-500" },
  "In Progress": { color: "text-gray-600", dot: "bg-yellow-500" },
}

const resolutionStatus: Record<string, { color: string; dot: string }> = {
  "Fixed": { color: "text-gray-600", dot: "bg-green-500" },
  "Verified": { color: "text-gray-600", dot: "bg-slate-600" },
  "Closed": { color: "text-gray-600", dot: "bg-gray-500" },
  "Unresolved": { color: "text-gray-600", dot: "bg-red-500" },
  "Working": { color: "text-gray-600", dot: "bg-yellow-500" },
}

const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  "P1": { color: "text-red-600", bgColor: "bg-red-50" },
  "P2": { color: "text-orange-600", bgColor: "bg-orange-50" },
  "P3": { color: "text-yellow-600", bgColor: "bg-yellow-50" },
  "P4": { color: "text-blue-600", bgColor: "bg-blue-50" },
}

// Helper functions
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

const formatBugSeverity = (severity: string) => {
  const formatted = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
  return formatted;
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
}

export const SirsReleasesTable = ({
  data,
  visibleColumns,
  selectedRows,
  onToggleRowSelection,
  onToggleSelectAll,
  onEditSIR,
  onDeleteSIR,
  onExportSingleSIR
}: SirsReleasesTableProps) => {
  const currentPageIds = new Set(data.map(item => item.id));
  const allCurrentPageSelected = data.length > 0 && data.every(item => selectedRows.has(item.id));
  const someCurrentPageSelected = data.length > 0 && 
    data.some(item => selectedRows.has(item.id)) && 
    !allCurrentPageSelected;

  const handleSelectAll = () => {
    onToggleSelectAll();
  };

  const renderCellContent = (column: ColumnConfig, row: SirRelease) => {
    const value = row[column.key as keyof SirRelease];
    const stringValue = String(value);

    // Special rendering for certain columns
    if (column.key === 'bug_severity') {
      const formattedSeverity = formatBugSeverity(stringValue);
      const severityConfig = bugSeverity[formattedSeverity] || { color: "text-gray-600", dot: "bg-gray-400" };
      return (
        <div className={`flex items-center gap-2 ${severityConfig.color}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${severityConfig.dot}`}></span>
          {formattedSeverity}
        </div>
      );
    }

    if (column.key === 'bug_status') {
      const formattedStatus = formatStatus(stringValue);
      const statusConfig = bugStatus[formattedStatus] || { color: "text-gray-600", dot: "bg-gray-400" };
      return (
        <div className={`flex items-center gap-2 ${statusConfig.color}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
          {formattedStatus}
        </div>
      );
    }

    if (column.key === 'resolution') {
      const formattedResolution = formatStatus(stringValue);
      const resolutionConfig = resolutionStatus[formattedResolution] || { color: "text-gray-600", dot: "bg-gray-400" };
      return (
        <div className={`flex items-center gap-2 ${resolutionConfig.color}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${resolutionConfig.dot}`}></span>
          {formattedResolution}
        </div>
      );
    }

    if (column.key === 'priority') {
      const config = priorityConfig[stringValue] || { color: "text-gray-600", bgColor: "bg-gray-100" };
      return (
        <Badge
          className={`${config.bgColor} ${config.color} border-0 font-medium`}
          variant="secondary"
        >
          {stringValue}
        </Badge>
      );
    }

    if (column.key === 'short_desc') {
      return <SirsReleasesTruncatedText text={stringValue} maxLength={40} />;
    }

    if (column.key === 'changed_date') {
      const date = parseDate(stringValue);
      return (
        <span className="text-gray-600">
          {date ? formatDate(date) : stringValue}
        </span>
      );
    }

    return <span className="text-gray-600">{stringValue}</span>;
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <Table className="text-sm">
        <TableHeader className="bg-white hover:bg-gray-50 transition-colors duration-150 sticky top-0">
          <TableRow className="border-b border-gray-200 h-12">
            <TableHead className="w-12 px-4 text-sm font-semibold text-gray-900 h-12">
              <input
                type="checkbox"
                checked={allCurrentPageSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someCurrentPageSelected;
                  }
                }}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-red-400 focus:ring-red-400"
              />
            </TableHead>
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                className={`px-4 text-sm font-semibold text-gray-900 h-12 ${col.width}`}
              >
                {col.label}
              </TableHead>
            ))}
            <TableHead className="w-12 px-4 text-sm font-semibold text-gray-900 h-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow
                key={row.id}
                className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12"
              >
                <TableCell className="px-4 h-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => onToggleRowSelection(row.id)}
                    className="rounded border-gray-300 text-red-400 focus:ring-red-400"
                  />
                </TableCell>
                {visibleColumns.map((col) => (
                  <TableCell key={col.key} className="px-4 h-12">
                    {renderCellContent(col, row)}
                  </TableCell>
                ))}
                <TableCell className="px-4 h-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-4 h-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEditSIR(row)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onExportSingleSIR(row)}
                      >
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() => onDeleteSIR(row)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 2} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};