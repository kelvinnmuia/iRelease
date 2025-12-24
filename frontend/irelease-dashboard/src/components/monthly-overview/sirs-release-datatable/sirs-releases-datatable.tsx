import { useState, useEffect, useRef, ChangeEvent } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { allColumns, ColumnConfig } from '../sirs-releases-column-visibility';
import { EditSirsReleaseDialog } from "./edit-sirs-release-dialog";
import { SirsReleasesTable } from "./sirs-releases-table"; // Import the new component

interface SirReleaseDataTableProps {
  filteredData?: Array<{
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
  }>;

  onRowSelectionChange?: (selectedIds: Set<number>) => void;
  visibleColumns?: ColumnConfig[];
  columnVisibility?: Record<string, boolean>;
  toggleColumnVisibility?: (columnKey: string) => void;
  resetColumnVisibility?: () => void;

  // Sync props
  onDateRangeChange?: (dateRange: string) => void;
  onDeleteRows?: (ids: Set<number>) => void;
  onAddSIR?: (sirData: any) => void;
  onEditSIR?: (sirData: any) => void;
  onDeleteSIR?: (id: number) => void;
}

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate().toString().padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year} ${hours}:${minutes}`
}

export function SirReleaseDataTable({
  filteredData: externalFilteredData = [],
  onRowSelectionChange,
  visibleColumns: propVisibleColumns,
  columnVisibility = {},
  toggleColumnVisibility = () => { },
  resetColumnVisibility = () => { },

  // Sync props
  onDateRangeChange,
  onDeleteRows,
  onAddSIR,
  onEditSIR,
  onDeleteSIR,
}: SirReleaseDataTableProps = {}) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sirToDelete, setSirToDelete] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [sirToEdit, setSirToEdit] = useState<any>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Notify parent when selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(selectedRows);
    }
  }, [selectedRows, onRowSelectionChange])

  // Notify parent when date range changes
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  }

  // Effect to handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Reset to first page when external filtered data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [externalFilteredData])

  // Get visible columns
  const visibleColumns = propVisibleColumns || allColumns.filter(col => columnVisibility[col.key])

  // Apply date range when both dates are selected
  const applyDateRange = () => {
    if (startDate && endDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)

      if (start && end) {
        const formattedStart = formatDate(start)
        const formattedEnd = formatDate(end)
        const newDateRange = `${formattedStart} - ${formattedEnd}`
        setDateRange(newDateRange)
        handleDateRangeChange(newDateRange)
      }
    }
    setShowDatePicker(false)
  }

  // Clear date range
  const clearDateRange = () => {
    setDateRange("")
    setStartDate("")
    setEndDate("")
    setShowDatePicker(false)
    setCurrentPage(1)
    handleDateRangeChange("")
  }

  // All data is already filtered by parent, so we just use externalFilteredData directly
  const sortedAndFilteredData = [...externalFilteredData]
  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage)

  // Get IDs of all items on the current page
  const currentPageIds = new Set(paginatedData.map(item => item.id))

  // Check if all items on current page are selected
  const allCurrentPageSelected = paginatedData.length > 0 &&
    paginatedData.every(item => selectedRows.has(item.id))
  // Check if some items on current page are selected (for indeterminate state)
  const someCurrentPageSelected = paginatedData.length > 0 &&
    paginatedData.some(item => selectedRows.has(item.id)) &&
    !allCurrentPageSelected

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedRows)

    if (allCurrentPageSelected) {
      currentPageIds.forEach(id => newSelected.delete(id))
    } else {
      currentPageIds.forEach(id => newSelected.add(id))
    }

    setSelectedRows(newSelected)
  }

  // Edit SIR functions
  const openEditDialog = (sir: any) => {
    setSirToEdit(sir)
    setEditDialogOpen(true)
  }

  // Bulk delete functions
  const openBulkDeleteDialog = () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one SIR to delete")
      return
    }
    setBulkDeleteDialogOpen(true)
  }

  const cancelBulkDelete = () => {
    setBulkDeleteDialogOpen(false)
  }

  const confirmBulkDelete = () => {
    if (onDeleteRows) {
      onDeleteRows(selectedRows);
      setSelectedRows(new Set())
      toast.success(`Successfully deleted ${selectedRows.size} SIR(s)`)
      setBulkDeleteDialogOpen(false)
      setCurrentPage(1)
    }
  }

  // Export single SIR to Excel
  const exportSingleSIR = (sir: any) => {
    const filteredSIR = visibleColumns.reduce((acc, col) => {
      acc[col.label] = sir[col.key as keyof typeof sir];
      return acc;
    }, {} as Record<string, any>);

    const worksheet = XLSX.utils.json_to_sheet([filteredSIR])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Details')
    const cols = visibleColumns.map(col => ({ wch: Math.max(col.label.length, 15) }))
    worksheet['!cols'] = cols
    XLSX.writeFile(workbook, `sir-${sir.sir_id}-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`SIR ${sir.sir_id} exported successfully!`)
  }

  // Delete SIR functions
  const openDeleteDialog = (sir: any) => {
    setSirToDelete(sir)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (sirToDelete && onDeleteSIR) {
      onDeleteSIR(sirToDelete.id)
      toast.success(`Successfully deleted SIR ${sirToDelete.sir_id}`)
      setDeleteDialogOpen(false)
      setSirToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setSirToDelete(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - Light Gray Background - SIMPLIFIED */}
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Right Section - Date Range and Delete Button */}
          <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
            <div className="flex gap-2 flex-1 md:flex-none">
              {/* Date Range */}
              <div className="relative flex-1 md:flex-none md:w-56 lg:w-64" ref={datePickerRef}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  <Input
                    placeholder="Date range"
                    value={dateRange}
                    readOnly
                    className="w-full pl-10 pr-4 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer focus:ring-2 focus:ring-offset-0 focus:outline-none text-sm min-w-0 truncate"
                    title={dateRange}
                  />
                </div>

                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-72">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={applyDateRange}
                          disabled={!startDate || !endDate}
                          className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
                          variant="outline"
                          size="sm"
                        >
                          Apply
                        </Button>
                        <Button
                          onClick={clearDateRange}
                          className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500"
                          size="sm"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:w-32"
                  onClick={openBulkDeleteDialog}
                >
                  - Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected rows info */}
        {selectedRows.size > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            {selectedRows.size} of {sortedAndFilteredData.length} row(s) selected
          </div>
        )}

        {/* Filter status */}
        {dateRange && (
          <div className="mt-2 text-sm text-gray-500">
            Showing {sortedAndFilteredData.length} SIR(s) within date range: {dateRange}
          </div>
        )}
      </div>

      {/* Rows Per Page Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 w-24 justify-between">
                <span>{itemsPerPage}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[100px]">
              <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                10
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemsPerPage(20)}>
                20
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                50
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setItemsPerPage(100)}>
                100
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-sm text-gray-600">
          {sortedAndFilteredData.length} record(s) found
        </div>
      </div>

      {/* Table - Now using the separated component */}
      <SirsReleasesTable
        data={paginatedData}
        visibleColumns={visibleColumns}
        selectedRows={selectedRows}
        onToggleRowSelection={toggleRowSelection}
        onToggleSelectAll={toggleSelectAll}
        onEditSIR={openEditDialog}
        onDeleteSIR={openDeleteDialog}
        onExportSingleSIR={exportSingleSIR}
      />

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Viewing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length}
          {dateRange && (
            <span className="ml-2">(filtered by date range)</span>
          )}
          <span className="ml-2">• {visibleColumns.length} columns visible</span>
        </div>

        {/* Enhanced Pagination */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Smart page number rendering */}
          {(() => {
            const pages: (number | string)[] = [];
            const maxVisiblePages = 5;
            const ellipsis = "...";

            if (totalPages <= maxVisiblePages) {
              // Show all pages if total pages is small
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Always show first page
              pages.push(1);

              if (currentPage <= 3) {
                // Near the beginning: 1, 2, 3, 4, ..., last
                for (let i = 2; i <= 4; i++) {
                  pages.push(i);
                }
                pages.push(ellipsis);
                pages.push(totalPages);
              } else if (currentPage >= totalPages - 2) {
                // Near the end: 1, ..., n-3, n-2, n-1, n
                pages.push(ellipsis);
                for (let i = totalPages - 3; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // In the middle: 1, ..., current-1, current, current+1, ..., last
                pages.push(ellipsis);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                  pages.push(i);
                }
                pages.push(ellipsis);
                pages.push(totalPages);
              }
            }

            return pages.map((page, index) => {
              if (page === ellipsis) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="min-w-9 h-9 flex items-center justify-center text-gray-500 px-2"
                  >
                    {ellipsis}
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-9 h-9 p-0 ${currentPage === page
                    ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    : "border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {page}
                </Button>
              );
            });
          })()}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-gray-300 hover:bg-gray-50 min-w-9 h-9 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit SIR Dialog */}
      <EditSirsReleaseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        sirToEdit={sirToEdit}
        onSave={(editedSIR) => {
          if (onEditSIR) {
            onEditSIR(editedSIR);
            setEditDialogOpen(false);
            setSirToEdit(null);
            toast.success(`Successfully updated SIR ${editedSIR.sir_id}`);
          }
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRows.size} selected SIR(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={cancelBulkDelete}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              No, Cancel
            </Button>
            <Button
              onClick={confirmBulkDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Yes, Delete {selectedRows.size} SIR(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete SIR {sirToDelete?.sir_id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              No, Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}