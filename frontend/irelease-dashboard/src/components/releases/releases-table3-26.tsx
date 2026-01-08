import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Release, ColumnConfig } from "./types/releases";
import { statusConfig, deploymentStatusConfig } from "./constants/releases-constants";
import { TruncatedText } from "./truncated-text";

interface ReleasesTableProps {
  data: Release[];
  visibleColumns: ColumnConfig[];
  selectedRows: Set<number>;
  onToggleRowSelection: (id: number) => void;
  onToggleSelectAll: () => void;
  onEditRelease: (release: Release) => void;
  onDeleteRelease: (release: Release) => void;
  onExportSingleRelease: (release: Release) => void;
}

export const ReleasesTable = ({
  data,
  visibleColumns,
  selectedRows,
  onToggleRowSelection,
  onToggleSelectAll,
  onEditRelease,
  onDeleteRelease,
  onExportSingleRelease
}: ReleasesTableProps) => {
  const currentPageIds = new Set(data.map(item => item.id));
  const allCurrentPageSelected = data.length > 0 && data.every(item => selectedRows.has(item.id));
  const someCurrentPageSelected = data.length > 0 && 
    data.some(item => selectedRows.has(item.id)) && 
    !allCurrentPageSelected;

  const handleSelectAll = () => {
    onToggleSelectAll();
  };

  const renderCellContent = (column: ColumnConfig, row: Release) => {
    const value = row[column.key];

    if (column.key === 'testStatus') {
      const config = statusConfig[String(value)];
      return (
        <div className={`flex items-center gap-2 ${config?.color}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${config?.dot}`}></span>
          {String(value)}
        </div>
      );
    }

    if (column.key === 'deploymentStatus') {
      const config = deploymentStatusConfig[String(value)];
      return (
        <div className={`flex items-center gap-2 ${config?.color}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${config?.dot}`}></span>
          {String(value)}
        </div>
      );
    }

    if (['releaseDescription', 'functionalityDelivered', 'comments', 'outstandingIssues'].includes(column.key)) {
      const maxLength = ['comments', 'outstandingIssues'].includes(column.key) ? 25 : 30;
      return <TruncatedText text={String(value)} maxLength={maxLength} />;
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  return (
    // Create the scroll container HERE with overflow-auto
    <div className="flex-1 overflow-auto bg-white" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      {/* Now the Table component won't interfere with sticky positioning */}
      <Table className="text-sm">
        {/* Sticky headers will now work properly */}
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow className="border-b border-gray-200 h-12 bg-white hover:bg-gray-50 transition-colors duration-150">
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
            <TableHead className="w-12 px-4 text-sm font-semibold text-gray-900 h-12">
              Actions
            </TableHead>
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
                    <DropdownMenuContent align="end" className="w-48 z-50">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEditRelease(row)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onExportSingleRelease(row)}
                      >
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() => onDeleteRelease(row)}
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