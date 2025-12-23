import { useState, useEffect, useRef, ChangeEvent } from "react"
import { ChevronDown, MoreVertical, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { allColumns, ColumnConfig } from '../sirs-releases-column-visibility';
import { SirsReleasesTruncatedText } from "./sirs-releases-truncated-text";

interface SirReleaseDataTableProps {
  filteredData?: Array<{
    id: number;  // id field
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

// Status configurations
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

const bugSeverityOptions = ["Critical", "Minor", "Major", "Blocker"]
const bugStatusOptions = ["Open", "In Progress", "Resolved", "Verified", "Closed"]
const resolutionOptions = ["Unresolved", "Working", "Fixed", "Verified", "Closed"]
const priorityOptions = ["P1", "P2", "P3", "P4"]
const componentOptions = ["MV", "MAN", "EXM", "API", "UI", "DB", "ALL"]
const osOptions = ["All", "Linux", "Windows", "MacOS"]

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
  const [editFormData, setEditFormData] = useState<any>({})
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState<any>({
    sir_release_id: "",
    sir_id: "",
    release_version: "",
    iteration: "",
    changed_date: "",
    bug_severity: "",
    priority: "",
    assigned_to: "",
    bug_status: "",
    resolution: "",
    component: "",
    op_sys: "",
    short_desc: "",
    cf_sirwith: ""
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
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

  // Initialize edit form when sirToEdit changes
  useEffect(() => {
    if (sirToEdit) {
      setEditFormData({ ...sirToEdit })
    }
  }, [sirToEdit])

  // Reset add form when dialog opens/closes
  useEffect(() => {
    if (addDialogOpen) {
      const newSirId = externalFilteredData.length > 0
        ? Math.max(...externalFilteredData.map(item => Number(item.sir_id)), 0) + 1
        : 1
      const newSirReleaseId = externalFilteredData.length > 0
        ? Math.max(...externalFilteredData.map(item => Number(item.sir_release_id)), 0) + 1
        : 1

      setAddFormData({
        sir_release_id: newSirReleaseId,
        sir_id: newSirId,
        release_version: "",
        iteration: "",
        changed_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        bug_severity: "",
        priority: "",
        assigned_to: "",
        bug_status: "",
        resolution: "",
        component: "",
        op_sys: "",
        short_desc: "",
        cf_sirwith: ""
      })
      setValidationErrors({})
    }
  }, [addDialogOpen, externalFilteredData])

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

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    handleEditFormChange(id, value)
  }

  const saveEdit = () => {
    if (sirToEdit && onEditSIR) {
      onEditSIR(editFormData);
      setEditDialogOpen(false)
      setSirToEdit(null)
      toast.success(`Successfully updated SIR ${editFormData.sir_id}`)
    }
  }

  const cancelEdit = () => {
    setEditDialogOpen(false)
    setSirToEdit(null)
    setEditFormData({})
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

  // Format bug severity for display
  const formatBugSeverity = (severity: string) => {
    const formatted = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
    return formatted;
  }

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
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

      {/* Table */}
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
                  onChange={toggleSelectAll}
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
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12"
                >
                  <TableCell className="px-4 h-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      className="rounded border-gray-300 text-red-400 focus:ring-red-400"
                    />
                  </TableCell>
                  {visibleColumns.map((col) => {
                    const value = row[col.key as keyof typeof row]
                    const stringValue = String(value)

                    // Special rendering for certain columns
                    if (col.key === 'bug_severity') {
                      const formattedSeverity = formatBugSeverity(stringValue)
                      const severityConfig = bugSeverity[formattedSeverity] || { color: "text-gray-600", dot: "bg-gray-400" }
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${severityConfig.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${severityConfig.dot}`}></span>
                            {formattedSeverity}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'bug_status') {
                      const formattedStatus = formatStatus(stringValue)
                      const statusConfig = bugStatus[formattedStatus] || { color: "text-gray-600", dot: "bg-gray-400" }
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                            {formattedStatus}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'resolution') {
                      const formattedResolution = formatStatus(stringValue)
                      const resolutionConfig = resolutionStatus[formattedResolution] || { color: "text-gray-600", dot: "bg-gray-400" }
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${resolutionConfig.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${resolutionConfig.dot}`}></span>
                            {formattedResolution}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'priority') {
                      const config = priorityConfig[stringValue] || { color: "text-gray-600", bgColor: "bg-gray-100" }
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <Badge
                            className={`${config.bgColor} ${config.color} border-0 font-medium`}
                            variant="secondary"
                          >
                            {stringValue}
                          </Badge>
                        </TableCell>
                      )
                    }

                    if (col.key === 'short_desc') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <SirsReleasesTruncatedText text={stringValue} maxLength={40} />
                        </TableCell>
                      )
                    }

                    if (col.key === 'changed_date') {
                      const date = parseDate(stringValue)
                      return (
                        <TableCell key={col.key} className="px-4 text-gray-600 h-12">
                          {date ? formatDate(date) : stringValue}
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell key={col.key} className="px-4 text-gray-600 h-12">
                        {stringValue}
                      </TableCell>
                    )
                  })}
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
                          onClick={() => openEditDialog(row)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => exportSingleSIR(row)}
                        >
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => openDeleteDialog(row)}
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
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit SIR
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update SIR {sirToEdit?.sir_id} details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* SIR Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="sir_release_id" className="text-sm font-medium text-gray-700">
                    SIR Release ID
                  </Label>
                  <div className="w-full">
                    <Input
                      id="sir_release_id"
                      value={editFormData.sir_release_id || ''}
                      disabled
                      className="w-full bg-gray-100 text-gray-600"
                      placeholder="SIR Release ID"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="sir_id" className="text-sm font-medium text-gray-700">
                    SIR ID
                  </Label>
                  <div className="w-full">
                    <Input
                      id="sir_id"
                      type="number"
                      value={editFormData.sir_id || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter SIR ID"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="release_version" className="text-sm font-medium text-gray-700">
                    Release Version
                  </Label>
                  <div className="w-full">
                    <Input
                      id="release_version"
                      value={editFormData.release_version || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter release version"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                    Iteration
                  </Label>
                  <div className="w-full">
                    <Input
                      id="iteration"
                      value={editFormData.iteration || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter iteration"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="bug_severity" className="text-sm font-medium text-gray-700">
                    Bug Severity
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.bug_severity || ''}
                      onValueChange={(value) => handleEditFormChange('bug_severity', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select bug severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {bugSeverityOptions.map((severity) => (
                          <SelectItem key={severity} value={severity.toLowerCase()}>
                            {severity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Priority
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.priority || ''}
                      onValueChange={(value) => handleEditFormChange('priority', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700">
                    Assigned To
                  </Label>
                  <div className="w-full">
                    <Input
                      id="assigned_to"
                      value={editFormData.assigned_to || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter assigned to email"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="bug_status" className="text-sm font-medium text-gray-700">
                    Bug Status
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.bug_status || ''}
                      onValueChange={(value) => handleEditFormChange('bug_status', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select bug status" />
                      </SelectTrigger>
                      <SelectContent>
                        {bugStatusOptions.map((status) => (
                          <SelectItem key={status} value={status.toUpperCase().replace(' ', '_')}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="resolution" className="text-sm font-medium text-gray-700">
                    Resolution
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.resolution || ''}
                      onValueChange={(value) => handleEditFormChange('resolution', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map((resolution) => (
                          <SelectItem key={resolution} value={resolution.toUpperCase()}>
                            {resolution}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="component" className="text-sm font-medium text-gray-700">
                    Component
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.component || ''}
                      onValueChange={(value) => handleEditFormChange('component', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select component" />
                      </SelectTrigger>
                      <SelectContent>
                        {componentOptions.map((component) => (
                          <SelectItem key={component} value={component}>
                            {component}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="op_sys" className="text-sm font-medium text-gray-700">
                    Operating System
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.op_sys || ''}
                      onValueChange={(value) => handleEditFormChange('op_sys', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select operating system" />
                      </SelectTrigger>
                      <SelectContent>
                        {osOptions.map((os) => (
                          <SelectItem key={os} value={os}>
                            {os}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="cf_sirwith" className="text-sm font-medium text-gray-700">
                    Cf Sir With
                  </Label>
                  <div className="w-full">
                    <Input
                      id="cf_sirwith"
                      value={editFormData.cf_sirwith || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter cf sir with"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="short_desc" className="text-sm font-medium text-gray-700">
                  Short Description
                </Label>
                <div className="w-full">
                  <Textarea
                    id="short_desc"
                    value={editFormData.short_desc || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                    placeholder="Enter short description"
                  />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-gray-700">
                  Changed Date
                </Label>
                <div className="w-full">
                  <Input
                    value={editFormData.changed_date || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleEditFormChange('changed_date', e.target.value)}
                    className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                    placeholder="YYYY-MM-DD HH:MM:SS"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
            <Button
              variant="outline"
              onClick={saveEdit}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 w-full"
            >
              Save Changes
            </Button>
            <Button
              onClick={cancelEdit}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 w-full"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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