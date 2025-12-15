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
import { exportToCSV, exportToExcel, exportToJSON, exportSingleSirRelease } from "./utils/sirs-release-export-utils"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// Import JSON data
import sirReleaseData from "../sir-release-data.json"

// Define SIR Release columns
const allColumns = [
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
]


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

// Priority configuration
const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  "P1": { color: "text-red-600", bgColor: "bg-red-50" },
  "P2": { color: "text-orange-600", bgColor: "bg-orange-50" },
  "P3": { color: "text-yellow-600", bgColor: "bg-yellow-50" },
  "P4": { color: "text-blue-600", bgColor: "bg-blue-50" },
}

// Options for dropdowns
const bugSeverityOptions = ["Critical", "Minor", "Major", "Blocker"]
const bugStatusOptions = ["Open", "In Progress", "Resolved", "Verified", "Closed"]
const resolutionOptions = ["Unresolved", "Working", "Fixed", "Verified", "Closed"]
const priorityOptions = ["P1", "P2", "P3", "P4"]
const componentOptions = ["MV", "MAN", "EXM", "API", "UI", "DB", "ALL"]
const osOptions = ["All", "Linux", "Windows", "MacOS"]

// TruncatedText component with tooltip for full text
const TruncatedText = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text

  if (!shouldTruncate) {
    return <span className="text-gray-600">{displayText}</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-gray-600 cursor-default">
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-white text-gray-600 border border-gray-200 shadow-lg max-w-md p-3"
        >
          <p className="text-sm break-words whitespace-normal overflow-wrap-anywhere">
            {text}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Helper function to parse date strings
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null

  // Handle "YYYY-MM-DD HH:MM:SS" format
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// Helper function to format date as "DD MMM YYYY HH:MM"
const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate().toString().padStart(2, '0')
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day} ${month} ${year} ${hours}:${minutes}`
}

// Helper function to get the latest date for sorting
const getLatestDate = (item: any): Date | null => {
  return parseDate(item.changed_date)
}

// Helper function to get the earliest date for sorting
const getEarliestDate = (item: any): Date | null => {
  return parseDate(item.changed_date)
}

// localStorage keys (specific to SIR Releases)
const COLUMN_VISIBILITY_KEY = 'sir-releases-dashboard-column-visibility';
const DATE_RANGE_FILTER_KEY = 'sir-releases-dashboard-date-range-filter';
const DATE_RANGE_DETAILS_KEY = 'sir-releases-dashboard-date-range-details';
const ITEMS_PER_PAGE_KEY = 'sir-releases-dashboard-items-per-page';

// Load column visibility from localStorage
const loadColumnVisibility = (): Record<string, boolean> => {
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
  return allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
};

// Save column visibility to localStorage
const saveColumnVisibility = (visibility: Record<string, boolean>) => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.warn('Failed to save column visibility to localStorage:', error);
  }
};

// Load date range filter from localStorage
const loadDateRangeFilter = (): string => {
  try {
    const saved = localStorage.getItem(DATE_RANGE_FILTER_KEY);
    return saved || "";
  } catch (error) {
    console.warn('Failed to load date range filter from localStorage:', error);
    return "";
  }
};

// Save date range filter to localStorage
const saveDateRangeFilter = (dateRange: string) => {
  try {
    localStorage.setItem(DATE_RANGE_FILTER_KEY, dateRange);
  } catch (error) {
    console.warn('Failed to save date range filter to localStorage:', error);
  }
};

// Load date range details from localStorage
const loadDateRangeDetails = (): { startDate: string; endDate: string } => {
  try {
    const saved = localStorage.getItem(DATE_RANGE_DETAILS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn('Failed to load date range details from localStorage:', error);
  }
  return { startDate: "", endDate: "" };
};

// Save date range details to localStorage
const saveDateRangeDetails = (startDate: string, endDate: string) => {
  try {
    localStorage.setItem(DATE_RANGE_DETAILS_KEY, JSON.stringify({ startDate, endDate }));
  } catch (error) {
    console.warn('Failed to save date range details to localStorage:', error);
  }
};

// Clear date range details from localStorage
const clearDateRangeDetails = () => {
  try {
    localStorage.removeItem(DATE_RANGE_DETAILS_KEY);
  } catch (error) {
    console.warn('Failed to clear date range details from localStorage:', error);
  }
};

// Load items per page from localStorage
const loadItemsPerPage = (): number => {
  try {
    const saved = localStorage.getItem(ITEMS_PER_PAGE_KEY);
    return saved ? parseInt(saved) : 10;
  } catch (error) {
    console.warn('Failed to load items per page from localStorage:', error);
    return 10;
  }
};

// Save items per page to localStorage
const saveItemsPerPage = (itemsPerPage: number) => {
  try {
    localStorage.setItem(ITEMS_PER_PAGE_KEY, itemsPerPage.toString());
  } catch (error) {
    console.warn('Failed to save items per page to localStorage:', error);
  }
};

// Main component
export function SirReleaseDataTable() {
  const [data, setData] = useState(sirReleaseData)
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateRange, setDateRange] = useState(() => loadDateRangeFilter())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const details = loadDateRangeDetails();
    return details.startDate;
  });
  const [endDate, setEndDate] = useState(() => {
    const details = loadDateRangeDetails();
    return details.endDate;
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => loadColumnVisibility()
  )
  const [columnSearchQuery, setColumnSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | null>(null)
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
  const [itemsPerPage, setItemsPerPage] = useState(() => loadItemsPerPage())
  const datePickerRef = useRef<HTMLDivElement>(null)

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

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  // Save date range filter to localStorage whenever it changes
  useEffect(() => {
    saveDateRangeFilter(dateRange);
  }, [dateRange]);

  // Save date range details to localStorage whenever they change
  useEffect(() => {
    if (startDate || endDate) {
      saveDateRangeDetails(startDate, endDate);
    }
  }, [startDate, endDate]);

  // Save items per page to localStorage whenever it changes
  useEffect(() => {
    saveItemsPerPage(itemsPerPage);
  }, [itemsPerPage]);

  // Initialize edit form when sirToEdit changes
  useEffect(() => {
    if (sirToEdit) {
      setEditFormData({ ...sirToEdit })
    }
  }, [sirToEdit])

  // Reset add form when dialog opens/closes
  useEffect(() => {
    if (addDialogOpen) {
      const newSirId = Math.max(...data.map(item => Number(item.sir_id)), 0) + 1
      const newSirReleaseId = Math.max(...data.map(item => Number(item.sir_release_id)), 0) + 1
      
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
  }, [addDialogOpen, data])

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // Get visible columns
  const visibleColumns = allColumns.filter(col => columnVisibility[col.key])

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
    
    saveDateRangeFilter("")
    clearDateRangeDetails()
  }

  // Filter data based on global search and date range
  const filteredData = data.filter(item => {
    // Global text search
    const matchesGlobalSearch = !globalFilter ||
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(globalFilter.toLowerCase())
      )

    // Date range filter
    const matchesDateRange = !dateRange || (() => {
      const rangeParts = dateRange.split(' - ')
      if (rangeParts.length !== 2) return true

      const [startStr, endStr] = rangeParts
      const startDate = parseDate(startStr.trim())
      const endDate = parseDate(endStr.trim())

      if (!startDate || !endDate) return true

      const itemDate = parseDate(item.changed_date)
      return itemDate && itemDate >= startDate && itemDate <= endDate
    })()

    return matchesGlobalSearch && matchesDateRange
  })

  // Apply sorting to filteredData
  const sortedAndFilteredData = [...filteredData].sort((a, b) => {
    if (!sortOrder) return 0

    const dateA = getLatestDate(a)
    const dateB = getLatestDate(b)

    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1

    if (sortOrder === "newest") {
      return dateB.getTime() - dateA.getTime()
    } else {
      return dateA.getTime() - dateB.getTime()
    }
  })

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage)

  // Get IDs of all items on the current page
  const currentPageIds = new Set(paginatedData.map(item => item.sir_release_id))

  // Check if all items on current page are selected
  const allCurrentPageSelected = paginatedData.length > 0 && 
    paginatedData.every(item => selectedRows.has(item.sir_release_id))
  // Check if some items on current page are selected (for indeterminate state)
  const someCurrentPageSelected = paginatedData.length > 0 && 
    paginatedData.some(item => selectedRows.has(item.sir_release_id)) && 
    !allCurrentPageSelected

  const toggleRowSelection = (id: number | string) => {
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

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    }
    setColumnVisibility(newVisibility)
  }

  const resetColumnVisibility = () => {
    const defaultVisibility = allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    setColumnVisibility(defaultVisibility)
    setColumnSearchQuery("")
    toast.success("Column visibility reset to default")
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
    if (sirToEdit) {
      const updatedData = data.map(item =>
        item.sir_release_id === sirToEdit.id ? { ...editFormData } : item
      )
      setData(updatedData)
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

  // Add new SIR functions
  const openAddDialog = () => {
    setAddDialogOpen(true)
  }

  const handleAddFormChange = (field: string, value: any) => {
    setAddFormData((prev: any) => ({
      ...prev,
      [field]: value
    }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleAddInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    handleAddFormChange(id, value)
  }

  // Validation function
  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!addFormData.sir_id?.toString().trim()) {
      errors.sir_id = "SIR ID is required"
    }
    if (!addFormData.release_version?.trim()) {
      errors.release_version = "Release Version is required"
    }
    if (!addFormData.bug_severity?.trim()) {
      errors.bug_severity = "Bug Severity is required"
    }
    if (!addFormData.priority?.trim()) {
      errors.priority = "Priority is required"
    }
    if (!addFormData.bug_status?.trim()) {
      errors.bug_status = "Bug Status is required"
    }
    if (!addFormData.short_desc?.trim()) {
      errors.short_desc = "Short Description is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveNewSIR = () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    // Create new SIR object
    const newSIR = {
      sir_release_id: Math.max(...data.map(item => Number(item.sir_release_id)), 0) + 1,
      ...addFormData
    }

    // Add to data
    const updatedData = [...data, newSIR]
    setData(updatedData)

    // Close dialog and show success message
    setAddDialogOpen(false)
    toast.success(`Successfully created new SIR ${newSIR.sir_id}`)

    // Reset to first page to show the new SIR
    setCurrentPage(1)
  }

  const cancelAdd = () => {
    setAddDialogOpen(false)
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
    // Remove selected SIRs from data
    const updatedData = data.filter(item => !selectedRows.has(item.sir_release_id))
    setData(updatedData)

    // Clear selection
    setSelectedRows(new Set())

    // Show success toast
    toast.success(`Successfully deleted ${selectedRows.size} SIR(s)`)

    // Close dialog
    setBulkDeleteDialogOpen(false)

    // Reset to first page
    setCurrentPage(1)
  }

  // Export functions
  const exportToCSV = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.sir_release_id))
      : sortedAndFilteredData

    // Filter data to only include visible columns
    const filteredDataForExport = dataToExport.map(item => {
      const filteredItem: any = {}
      visibleColumns.forEach(col => {
        filteredItem[col.label] = item[col.key as keyof typeof item]
      })
      return filteredItem
    })

    const csv = Papa.unparse(filteredDataForExport, {
      header: true
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `sir-release-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("CSV exported successfully!")
  }

  const exportToExcel = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.sir_release_id))
      : sortedAndFilteredData

    // Filter data to only include visible columns
    const filteredDataForExport = dataToExport.map(item => {
      const filteredItem: any = {}
      visibleColumns.forEach(col => {
        filteredItem[col.label] = item[col.key as keyof typeof item]
      })
      return filteredItem
    })

    const worksheet = XLSX.utils.json_to_sheet(filteredDataForExport)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Releases')

    // Set column widths
    const cols = visibleColumns.map((col) => ({ wch: Math.max(col.label.length, 15) }))
    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `sir-release-export-${new Date().toISOString().split('T')[0]}.xlsx`)

    toast.success("Excel file exported successfully!")
  }

  const exportToJSON = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.sir_release_id))
      : sortedAndFilteredData

    // Filter data to only include visible columns
    const filteredDataForExport = dataToExport.map(item => {
      const filteredItem: any = {}
      visibleColumns.forEach(col => {
        filteredItem[col.label] = item[col.key as keyof typeof item]
      })
      return filteredItem
    })

    const json = JSON.stringify(filteredDataForExport, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `sir-release-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("JSON exported successfully!")
  }

  // Export single SIR to Excel
  const exportSingleSIR = (sir: any) => {
    // Filter data to only include visible columns
    const filteredSIR = visibleColumns.reduce((acc, col) => {
      acc[col.label] = sir[col.key as keyof typeof sir];
      return acc;
    }, {} as Record<string, any>);

    const worksheet = XLSX.utils.json_to_sheet([filteredSIR])
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'SIR Details')

    // Set column widths
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
    if (sirToDelete) {
      // Remove the SIR from data
      const updatedData = data.filter(item => item.sir_release_id !== sirToDelete.sir_release_id)
      setData(updatedData)

      // Show success toast
      toast.success(`Successfully deleted SIR ${sirToDelete.sir_release_id}`)
      // Close dialog
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
      {/* Header - Light Gray Background */}
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        {/* Enhanced Responsive Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Right Section - Date Range and Delete Button */}
          <div className="flex flex-col md:flex-row gap-3 xl:flex-1 xl:justify-end">
            <div className="flex gap-2 flex-1 md:flex-none">
              {/* Date Range - Increased width for better date display */}
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
            </div>

            {/* Delete Button */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:w-32 lg:-mr-6"
                onClick={openBulkDeleteDialog}
              >
                - Delete
              </Button>
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
        {(globalFilter || dateRange) && (
          <div className="mt-2 text-sm text-gray-500">
            Showing {sortedAndFilteredData.length} SIRs
            {globalFilter && ` matching "${globalFilter}"`}
            {dateRange && ` within date range: ${dateRange}`}
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
                  key={row.sir_release_id}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12"
                >
                  <TableCell className="px-4 h-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.sir_release_id)}
                      onChange={() => toggleRowSelection(row.sir_release_id)}
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
                          <TruncatedText text={stringValue} maxLength={40} />
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
          {globalFilter && (
            <span className="ml-2">(filtered from {data.length} total records)</span>
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
                  className={`min-w-9 h-9 p-0 ${
                    currentPage === page 
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

      {/* Add New SIR Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New SIR
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new SIR with the details below. Fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* SIR Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="sir_id" className="text-sm font-medium text-gray-700">
                    SIR ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="sir_id"
                      type="number"
                      value={addFormData.sir_id || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.sir_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter SIR ID"
                    />
                    {validationErrors.sir_id && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.sir_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="release_version" className="text-sm font-medium text-gray-700">
                    Release Version <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="release_version"
                      value={addFormData.release_version || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.release_version ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter release version"
                    />
                    {validationErrors.release_version && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.release_version}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                    Iteration
                  </Label>
                  <div className="w-full">
                    <Input
                      id="iteration"
                      value={addFormData.iteration || ''}
                      onChange={handleAddInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter iteration"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="bug_severity" className="text-sm font-medium text-gray-700">
                    Bug Severity <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.bug_severity || ''}
                      onValueChange={(value) => handleAddFormChange('bug_severity', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.bug_severity ? 'border-red-500' : 'border-gray-300'
                      }`}>
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
                    {validationErrors.bug_severity && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.bug_severity}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.priority || ''}
                      onValueChange={(value) => handleAddFormChange('priority', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.priority ? 'border-red-500' : 'border-gray-300'
                      }`}>
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
                    {validationErrors.priority && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.priority}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="bug_status" className="text-sm font-medium text-gray-700">
                    Bug Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.bug_status || ''}
                      onValueChange={(value) => handleAddFormChange('bug_status', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.bug_status ? 'border-red-500' : 'border-gray-300'
                      }`}>
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
                    {validationErrors.bug_status && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.bug_status}</p>
                    )}
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
                      value={addFormData.assigned_to || ''}
                      onChange={handleAddInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter assigned to email"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="resolution" className="text-sm font-medium text-gray-700">
                    Resolution
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.resolution || ''}
                      onValueChange={(value) => handleAddFormChange('resolution', value)}
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
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="component" className="text-sm font-medium text-gray-700">
                    Component
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.component || ''}
                      onValueChange={(value) => handleAddFormChange('component', value)}
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

                <div className="space-y-2 w-full">
                  <Label htmlFor="op_sys" className="text-sm font-medium text-gray-700">
                    Operating System
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.op_sys || ''}
                      onValueChange={(value) => handleAddFormChange('op_sys', value)}
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
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="short_desc" className="text-sm font-medium text-gray-700">
                  Short Description <span className="text-red-500">*</span>
                </Label>
                <div className="w-full">
                  <Textarea
                    id="short_desc"
                    value={addFormData.short_desc || ''}
                    onChange={handleAddInputChange}
                    rows={3}
                    className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none ${
                      validationErrors.short_desc ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter short description"
                  />
                  {validationErrors.short_desc && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.short_desc}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="cf_sirwith" className="text-sm font-medium text-gray-700">
                  Cf Sir With
                </Label>
                <div className="w-full">
                  <Input
                    id="cf_sirwith"
                    value={addFormData.cf_sirwith || ''}
                    onChange={handleAddInputChange}
                    className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                    placeholder="Enter cf sir with"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
            <Button
              variant="outline"
              onClick={saveNewSIR}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              Create SIR
            </Button>
            <Button
              onClick={cancelAdd}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 border-red-500 lg:ml-2"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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