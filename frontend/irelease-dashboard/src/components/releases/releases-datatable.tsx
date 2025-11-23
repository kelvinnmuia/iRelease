import { useState, useEffect, useRef, ChangeEvent } from "react"
import { ChevronDown, Download, MoreVertical, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, Columns3, RefreshCcw, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const allColumns = [
  { key: "releaseId", label: "Release ID", width: "w-32" },
  { key: "systemName", label: "System Name", width: "w-40" },
  { key: "systemId", label: "System ID", width: "w-28" },
  { key: "releaseVersion", label: "Release Version", width: "w-32" },
  { key: "iteration", label: "Iteration", width: "w-28" },
  { key: "releaseDescription", label: "Release Description", width: "w-48" },
  { key: "functionalityDelivered", label: "Functionality Delivered", width: "w-48" },
  { key: "deliveredDate", label: "Date Delivered", width: "w-32" },
  { key: "tdNoticeDate", label: "TD Notice Date", width: "w-32" },
  { key: "testDeployDate", label: "Test Deploy Date", width: "w-32" },
  { key: "testStartDate", label: "Test Start Date", width: "w-32" },
  { key: "testEndDate", label: "Test End Date", width: "w-32" },
  { key: "prodDeployDate", label: "Prod Deploy Date", width: "w-32" },
  { key: "testStatus", label: "Test Status", width: "w-28" },
  { key: "deploymentStatus", label: "Deployment Status", width: "w-32" },
  { key: "outstandingIssues", label: "Outstanding Issues", width: "w-48" },
  { key: "comments", label: "Comments", width: "w-48" },
  { key: "releaseType", label: "Release Type", width: "w-28" },
  { key: "month", label: "Month", width: "w-28" },
  { key: "financialYear", label: "Financial Year", width: "w-32" },
]

const staticData = [
  {
    id: 1,
    releaseId: "REL-2024-001",
    systemName: "Core Banking System",
    systemId: "CBS-001",
    releaseVersion: "3.9.282.1",
    iteration: "1",
    releaseDescription: "iCMS release_ver_WSO2_PREPROD_PATCH_2.133_Integration_20241122_SCT_ECITIZEN DSL No#1290",
    functionalityDelivered: "Advanced analytics dashboard, Real-time reporting, Enhanced security protocols",
    deliveredDate: "12 Dec 2024",
    tdNoticeDate: "5 Dec 2024",
    testDeployDate: "8 Dec 2024",
    testStartDate: "9 Dec 2024",
    testEndDate: "11 Dec 2024",
    prodDeployDate: "13 Dec 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Production",
    outstandingIssues: "1. UI alignment issues in dashboard\n2. Performance degradation under high load\n3. Pending security review for new authentication module",
    comments: "Minor UI issues to be fixed in next patch",
    releaseType: "Major",
    month: "December",
    financialYear: "FY2024",
  },
  {
    id: 2,
    releaseId: "REL-2024-002",
    systemName: "Payment Gateway",
    systemId: "PGW-002",
    releaseVersion: "v1.3.0",
    iteration: "Sprint 25",
    releaseDescription: "Security patch and performance improvements focusing on transaction processing",
    functionalityDelivered: "Enhanced encryption, Faster transaction processing, Updated compliance",
    deliveredDate: "10 Dec 2024",
    tdNoticeDate: "3 Dec 2024",
    testDeployDate: "5 Dec 2024",
    testStartDate: "6 Dec 2024",
    testEndDate: "9 Dec 2024",
    prodDeployDate: "11 Dec 2024",
    testStatus: "Active",
    deploymentStatus: "Deployed to QA",
    outstandingIssues: "All test cases passed successfully, no outstanding issues identified during testing phase.",
    comments: "All test cases passed successfully",
    releaseType: "Patch",
    month: "December",
    financialYear: "FY2024",
  },
  {
    id: 3,
    releaseId: "REL-2024-003",
    systemName: "Mobile Banking App",
    systemId: "MBA-003",
    releaseVersion: "v3.2.0",
    iteration: "Sprint 26",
    releaseDescription: "New biometric authentication and UI refresh with enhanced user experience",
    functionalityDelivered: "Face ID login, Dark mode, Enhanced navigation, Voice commands",
    deliveredDate: "25 Nov 2024",
    tdNoticeDate: "18 Nov 2024",
    testDeployDate: "20 Nov 2024",
    testStartDate: "21 Nov 2024",
    testEndDate: "24 Nov 2024",
    prodDeployDate: "26 Nov 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Pre-Prod",
    outstandingIssues: "1. Biometric authentication failing on older devices\n2. Dark mode causing contrast issues in transaction history\n3. Voice command accuracy below target threshold\n4. Memory leaks detected during extended usage\n5. Compatibility issues with iOS 15 and below",
    comments: "Performance testing ongoing with some compatibility issues",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 4,
    releaseId: "REL-2024-004",
    systemName: "CRM System",
    systemId: "CRM-004",
    releaseVersion: "v4.1.2",
    iteration: "Sprint 27",
    releaseDescription: "Customer segmentation and communication enhancements for better targeting",
    functionalityDelivered: "Advanced segmentation, Bulk messaging, Improved analytics",
    deliveredDate: "25 Nov 2024",
    tdNoticeDate: "18 Nov 2024",
    testDeployDate: "20 Nov 2024",
    testStartDate: "21 Nov 2024",
    testEndDate: "24 Nov 2024",
    prodDeployDate: "26 Nov 2024",
    testStatus: "Closed",
    deploymentStatus: "Rolled Back",
    outstandingIssues: "Critical bug in segmentation algorithm causing incorrect customer grouping. Rollback initiated to maintain data integrity.",
    comments: "Critical bug found in production, rolled back to previous version",
    releaseType: "Minor",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 5,
    releaseId: "REL-2024-005",
    systemName: "Loan Management",
    systemId: "LMS-005",
    releaseVersion: "v2.0.0",
    iteration: "Sprint 28",
    releaseDescription: "Complete system overhaul with new risk assessment engine and automated approvals",
    functionalityDelivered: "New risk engine, Automated approvals, Enhanced reporting",
    deliveredDate: "18 Nov 2024",
    tdNoticeDate: "11 Nov 2024",
    testDeployDate: "13 Nov 2024",
    testStartDate: "14 Nov 2024",
    testEndDate: "17 Nov 2024",
    prodDeployDate: "19 Nov 2024",
    testStatus: "Pending",
    deploymentStatus: "Deployed to Post-Prod",
    outstandingIssues: "1. Risk assessment algorithm producing inconsistent results for small business loans\n2. Automated approval system requiring manual override in 15% of cases\n3. Reporting module missing critical financial metrics\n4. Integration issues with legacy credit scoring system\n5. Performance degradation when processing bulk loan applications\n6. Data migration incomplete for historical loan records\n7. Regulatory compliance documentation pending review\n8. User training materials not yet finalized",
    comments: "Awaiting regulatory approval before production deployment",
    releaseType: "Major",
    month: "November",
    financialYear: "FY2024",
  },
  {
    id: 6,
    releaseId: "REL-2024-006",
    systemName: "HR Management",
    systemId: "HRM-006",
    releaseVersion: "v1.5.0",
    iteration: "Sprint 29",
    releaseDescription: "Employee self-service portal and performance management enhancements",
    functionalityDelivered: "Self-service portal, Performance tracking, Leave management",
    deliveredDate: "14 Nov 2024",
    tdNoticeDate: "7 Nov 2024",
    testDeployDate: "9 Nov 2024",
    testStartDate: "10 Nov 2024",
    testEndDate: "13 Nov 2024",
    prodDeployDate: "15 Nov 2024",
    testStatus: "Deleted",
    deploymentStatus: "Not Deployed",
    outstandingIssues: "Project cancelled due to budget constraints. All development work halted and resources reallocated to higher priority initiatives.",
    comments: "Project cancelled due to budget constraints",
    releaseType: "Minor",
    month: "November",
    financialYear: "FY2024",
  },
]

const statusConfig: Record<string, { color: string; dot: string }> = {
  "Pending": { color: "text-gray-600", dot: "bg-yellow-400" },
  "Active": { color: "text-gray-600", dot: "bg-green-500" },
  "Closed": { color: "text-gray-600", dot: "bg-slate-500" },
  "Deleted": { color: "text-gray-600", dot: "bg-red-500" },
  "Passed": { color: "text-gray-600", dot: "bg-green-500" },
}

const deploymentStatusConfig: Record<string, { color: string; dot: string }> = {
  "Deployed to QA": { color: "text-gray-600", dot: "bg-blue-500" },
  "Deployed to Pre-Prod": { color: "text-gray-600", dot: "bg-purple-500" },
  "Deployed to Production": { color: "text-gray-600", dot: "bg-green-500" },
  "Deployed to Post-Prod": { color: "text-gray-600", dot: "bg-teal-500" },
  "Rolled Back": { color: "text-gray-600", dot: "bg-red-500" },
  "Not Deployed": { color: "text-gray-600", dot: "bg-gray-400" },
  "Deployment Failed": { color: "text-gray-600", dot: "bg-orange-500" },
  "Scheduled for Deployment": { color: "text-gray-600", dot: "bg-yellow-400" },
}

const testStatusOptions = ["Pending", "Active", "Closed", "Deleted", "Passed"]
const deploymentStatusOptions = [
  "Deployed to QA",
  "Deployed to Pre-Prod",
  "Deployed to Production",
  "Deployed to Post-Prod",
  "Rolled Back",
  "Not Deployed",
  "Deployment Failed",
  "Scheduled for Deployment"
]
const releaseTypeOptions = ["Major", "Minor", "Patch", "Hotfix"]
const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
const financialYearOptions = ["FY2023", "FY2024", "FY2025", "FY2026"]

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

  // Handle "DD MMM YYYY" format (e.g., "12 Dec 2024")
  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  }

  const parts = dateStr.split(' ')
  if (parts.length === 3) {
    const day = parseInt(parts[0])
    const month = months[parts[1]]
    const year = parseInt(parts[2])

    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day)
    }
  }

  // Fallback to Date constructor
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// Helper function to format date as "DD MMM YYYY"
const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Helper function to get the latest date from all date fields
const getLatestDate = (item: any): Date | null => {
  const dateFields = [
    'deliveredDate', 'tdNoticeDate', 'testDeployDate',
    'testStartDate', 'testEndDate', 'prodDeployDate'
  ]

  const dates = dateFields
    .map(field => parseDate(item[field]))
    .filter(date => date !== null) as Date[]

  if (dates.length === 0) return null

  return new Date(Math.max(...dates.map(d => d.getTime())))
}

// Helper function to get the earliest date from all date fields
const getEarliestDate = (item: any): Date | null => {
  const dateFields = [
    'deliveredDate', 'tdNoticeDate', 'testDeployDate',
    'testStartDate', 'testEndDate', 'prodDeployDate'
  ]

  const dates = dateFields
    .map(field => parseDate(item[field]))
    .filter(date => date !== null) as Date[]

  if (dates.length === 0) return null

  return new Date(Math.min(...dates.map(d => d.getTime())))
}

// Add this component before the ReleasesDataTable component
const DatePickerInput = ({
  value,
  onChange,
  placeholder = "Select date"
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [tempDate, setTempDate] = useState("") // Always start blank
  const pickerRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
        setTempDate("") // Reset temp date when closing
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleApply = () => {
    if (tempDate) {
      // Convert from "YYYY-MM-DD" to "DD MMM YYYY" format
      const parsedDate = parseDate(tempDate)
      if (parsedDate) {
        const formattedDate = formatDate(parsedDate)
        onChange(formattedDate)
      }
    }
    setShowPicker(false)
    setTempDate("") // Reset temp date after applying
  }

  const handleClear = () => {
    onChange('') // Clear the actual form value
    setShowPicker(false)
    setTempDate("") // Reset temp date
  }

  const handleDateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempDate(e.target.value)
  }

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          setShowPicker(!showPicker)
          setTempDate("") // Always reset to blank when opening
        }}
      >
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={value}
          readOnly
          className="w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer sm:pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none"
        />
      </div>

      {/* Date Picker Dropdown */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="w-full">
                <Input
                  type="date"
                  value={tempDate}
                  onChange={handleDateInputChange}
                  className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={!tempDate}
                className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50"
                variant="outline"
                size="sm"
              >
                Apply
              </Button>
              <Button
                onClick={handleClear}
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
  )
}

// Helper function to generate a new release ID
const generateReleaseId = (data: any[]) => {
  const currentYear = new Date().getFullYear()
  const existingIds = data.map(item => item.releaseId)
  let counter = 1

  while (true) {
    const newId = `REL-${currentYear}-${counter.toString().padStart(3, '0')}`
    if (!existingIds.includes(newId)) {
      return newId
    }
    counter++
  }
}

export function ReleasesDataTable() {
  const [data, setData] = useState(staticData)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [globalFilter, setGlobalFilter] = useState("")
  const [dateRange, setDateRange] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  )
  const [columnSearchQuery, setColumnSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [releaseToDelete, setReleaseToDelete] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [releaseToEdit, setReleaseToEdit] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState<any>({
    releaseVersion: "",
    systemName: "",
    systemId: "",
    iteration: "",
    releaseType: "",
    testStatus: "",
    deploymentStatus: "",
    deliveredDate: "",
    tdNoticeDate: "",
    testDeployDate: "",
    testStartDate: "",
    testEndDate: "",
    prodDeployDate: "",
    month: "",
    financialYear: "",
    releaseDescription: "",
    functionalityDelivered: "",
    outstandingIssues: "",
    comments: ""
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const itemsPerPage = 10

  // Ref for date picker to handle outside clicks
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

  // Initialize edit form when releaseToEdit changes
  useEffect(() => {
    if (releaseToEdit) {
      setEditFormData({ ...releaseToEdit })
    }
  }, [releaseToEdit])

  // Reset add form when dialog opens/closes
  useEffect(() => {
    if (addDialogOpen) {
      setAddFormData({
        releaseVersion: "",
        systemName: "",
        systemId: "",
        iteration: "",
        releaseType: "",
        testStatus: "",
        deploymentStatus: "",
        deliveredDate: "",
        tdNoticeDate: "",
        testDeployDate: "",
        testStartDate: "",
        testEndDate: "",
        prodDeployDate: "",
        month: "",
        financialYear: "",
        releaseDescription: "",
        functionalityDelivered: "",
        outstandingIssues: "",
        comments: ""
      })
      setValidationErrors({})
    }
  }, [addDialogOpen])

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
        setDateRange(`${formattedStart} - ${formattedEnd}`)
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

      // Check if any of the date fields fall within the range
      const dateFields = [
        'deliveredDate', 'tdNoticeDate', 'testDeployDate',
        'testStartDate', 'testEndDate', 'prodDeployDate'
      ]

      return dateFields.some(field => {
        const itemDate = parseDate(item[field as keyof typeof item] as string)
        return itemDate && itemDate >= startDate && itemDate <= endDate
      })
    })()

    return matchesGlobalSearch && matchesDateRange
  })

  // Apply sorting to filteredData - search across all dates
  const sortedAndFilteredData = [...filteredData].sort((a, b) => {
    if (!sortOrder) return 0

    let dateA: Date | null = null
    let dateB: Date | null = null

    if (sortOrder === "newest") {
      // For newest first, use the latest date from each item
      dateA = getLatestDate(a)
      dateB = getLatestDate(b)
    } else {
      // For oldest first, use the earliest date from each item
      dateA = getEarliestDate(a)
      dateB = getEarliestDate(b)
    }

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
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((item) => item.id)))
    }
  }

  const toggleColumnVisibility = (columnKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const resetColumnVisibility = () => {
    setColumnVisibility(allColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}))
    setColumnSearchQuery("")
  }

  // Edit release functions
  const openEditDialog = (release: any) => {
    setReleaseToEdit(release)
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
    if (releaseToEdit) {
      const updatedData = data.map(item =>
        item.id === releaseToEdit.id ? { ...editFormData } : item
      )
      setData(updatedData)
      setEditDialogOpen(false)
      setReleaseToEdit(null)
      toast.success(`Successfully updated release ${editFormData.releaseVersion}`)
    }
  }

  const cancelEdit = () => {
    setEditDialogOpen(false)
    setReleaseToEdit(null)
    setEditFormData({})
  }

  // Add new release functions
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
    if (!addFormData.releaseVersion?.trim()) {
      errors.releaseVersion = "Release Version is required"
    }
    if (!addFormData.systemName?.trim()) {
      errors.systemName = "System Name is required"
    }
    if (!addFormData.systemId?.trim()) {
      errors.systemId = "System ID is required"
    }
    if (!addFormData.iteration?.trim()) {
      errors.iteration = "Iteration is required"
    }
    if (!addFormData.releaseType?.trim()) {
      errors.releaseType = "Release Type is required"
    }
    if (!addFormData.financialYear?.trim()) {
      errors.financialYear = "Financial Year is required"
    }
    if (!addFormData.testStatus?.trim()) {
      errors.testStatus = "Test Status is required"
    }
    if (!addFormData.deploymentStatus?.trim()) {
      errors.deploymentStatus = "Deployment Status is required"
    }
    if (!addFormData.deliveredDate?.trim()) {
      errors.deliveredDate = "Date Delivered is required"
    }
    if (!addFormData.releaseDescription?.trim()) {
      errors.releaseDescription = "Release Description is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const saveNewRelease = () => {
    // Validate form before saving
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    // Generate new release ID
    const newReleaseId = generateReleaseId(data)

    // Create new release object
    const newRelease = {
      id: Math.max(...data.map(item => item.id)) + 1,
      releaseId: newReleaseId,
      ...addFormData
    }

    // Add to data
    const updatedData = [...data, newRelease]
    setData(updatedData)

    // Close dialog and show success message
    setAddDialogOpen(false)
    toast.success(`Successfully created new release ${newReleaseId}`)

    // Reset to first page to show the new release
    setCurrentPage(1)
  }

  const cancelAdd = () => {
    setAddDialogOpen(false)
    setAddFormData({
      releaseVersion: "",
      systemName: "",
      systemId: "",
      iteration: "",
      releaseType: "",
      testStatus: "",
      deploymentStatus: "",
      deliveredDate: "",
      tdNoticeDate: "",
      testDeployDate: "",
      testStartDate: "",
      testEndDate: "",
      prodDeployDate: "",
      month: "",
      financialYear: "",
      releaseDescription: "",
      functionalityDelivered: "",
      outstandingIssues: "",
      comments: ""
    })
    setValidationErrors({})
  }

  // Bulk delete functions
  const openBulkDeleteDialog = () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one release to delete")
      return
    }
    setBulkDeleteDialogOpen(true)
  }

  const cancelBulkDelete = () => {
    setBulkDeleteDialogOpen(false)
  }

  const confirmBulkDelete = () => {
    // Remove selected releases from data
    const updatedData = data.filter(item => !selectedRows.has(item.id))
    setData(updatedData)

    // Clear selection
    setSelectedRows(new Set())

    // Show success toast
    toast.success(`Successfully deleted ${selectedRows.size} release(s)`)

    // Close dialog
    setBulkDeleteDialogOpen(false)

    // Reset to first page
    setCurrentPage(1)
  }

  // Export functions
  const exportToCSV = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.id))
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
    link.setAttribute('download', `releases-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("CSV exported successfully!")
  }

  const exportToExcel = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.id))
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Releases')

    // Set column widths
    const cols = visibleColumns.map((col) => ({ wch: Math.max(col.label.length, 15) }))
    worksheet['!cols'] = cols

    XLSX.writeFile(workbook, `releases-export-${new Date().toISOString().split('T')[0]}.xlsx`)

    toast.success("Excel file exported successfully!")
  }

  const exportToJSON = () => {
    const dataToExport = selectedRows.size > 0
      ? sortedAndFilteredData.filter(item => selectedRows.has(item.id))
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
    link.setAttribute('download', `releases-export-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("JSON exported successfully!")
  }

  // Export single release to Excel
  const exportSingleRelease = (release: any) => {
    // Filter data to only include visible columns
    const filteredRelease = {
      'Release ID': release.releaseId,
      'System Name': release.systemName,
      'System ID': release.systemId,
      'Release Version': release.releaseVersion,
      'Iteration': release.iteration,
      'Release Description': release.releaseDescription,
      'Functionality Delivered': release.functionalityDelivered,
      'Date Delivered': release.deliveredDate,
      'TD Notice Date': release.tdNoticeDate,
      'Test Deploy Date': release.testDeployDate,
      'Test Start Date': release.testStartDate,
      'Test End Date': release.testEndDate,
      'Prod Deploy Date': release.prodDeployDate,
      'Test Status': release.testStatus,
      'Deployment Status': release.deploymentStatus,
      'Outstanding Issues': release.outstandingIssues,
      'Comments': release.comments,
      'Release Type': release.releaseType,
      'Month': release.month,
      'Financial Year': release.financialYear,
    }

    const worksheet = XLSX.utils.json_to_sheet([filteredRelease])
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Release Details')

    // Set column widths
    const cols = [
      { wch: 15 }, // Release ID
      { wch: 20 }, // System Name
      { wch: 12 }, // System ID
      { wch: 15 }, // Release Version
      { wch: 12 }, // Iteration
      { wch: 30 }, // Release Description
      { wch: 30 }, // Functionality Delivered
      { wch: 15 }, // Date Delivered
      { wch: 15 }, // TD Notice Date
      { wch: 15 }, // Test Deploy Date
      { wch: 15 }, // Test Start Date
      { wch: 15 }, // Test End Date
      { wch: 15 }, // Prod Deploy Date
      { wch: 15 }, // Test Status
      { wch: 20 }, // Deployment Status
      { wch: 18 }, // Outstanding Issues
      { wch: 25 }, // Comments
      { wch: 12 }, // Release Type
      { wch: 12 }, // Month
      { wch: 15 }, // Financial Year
    ]
    worksheet['!cols'] = cols
    XLSX.writeFile(workbook, `release-${release.releaseId}-${new Date().toISOString().split('T')[0]}.xlsx`)

    toast.success(`Release ${release.releaseId} exported successfully!`)
  }

  // Delete release functions
  const openDeleteDialog = (release: any) => {
    setReleaseToDelete(release)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (releaseToDelete) {
      // Remove the release from data
      const updatedData = data.filter(item => item.id !== releaseToDelete.id)
      setData(updatedData)

      // Show success toast
      toast.success(`Successfully deleted release ${releaseToDelete.releaseVersion}`)

      // Close dialog
      setDeleteDialogOpen(false)
      setReleaseToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setReleaseToDelete(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - Light Gray Background */}
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="items-start mb-7">
          <h1 className="text-2xl font-semibold text-gray-900">All Releases</h1>
        </div>

        {/* Controls - Light Gray Background */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 lg:gap-2">
          {/* First Row: Export, Show/Hide, Search - 3 elements */}
          <div className="flex flex-row gap-2 w-full lg:w-auto lg:flex-1 lg:justify-start">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="lg:-ml-5 gap-2 border-red-400 text-red-600 bg-white hover:bg-red-50 flex-1 lg:flex-none lg:min-w-[105px]">
                  <Download className="w-4 h-4" />
                  <span className="lg:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToJSON}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Show/Hide Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex-1 lg:flex-none lg:min-w-[200px]">
                  <Columns3 className="w-4 h-4" />
                  <span className="hidden sm:inline lg:inline">Show / Hide Columns</span>
                  <span className="sm:hidden">Columns</span>
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

            {/* Search Input */}
            <div className="relative flex-1 lg:flex-none lg:w-66">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              <div className="w-full">
                <Input
                  placeholder="Search releases..."
                  value={globalFilter}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setGlobalFilter(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                  className="w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 sm:pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Date Range and Ordering - 2 elements */}
          <div className="flex flex-row gap-2 w-full lg:w-auto lg:flex-1 lg:justify-center">
            {/* Date Range */}
            <div className="relative flex-1 lg:flex-none lg:w-64" ref={datePickerRef}>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <div className="w-full">
                  <Input
                    placeholder="Select date range"
                    value={dateRange}
                    readOnly
                    className="w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer sm:pr-4 focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none"
                  />
                </div>
              </div>

              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <div className="w-full">
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <div className="w-full">
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                        />
                      </div>
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

            {/* Ordering Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 flex-1 lg:flex-none lg:min-w-[130px] justify-center">
                  <span className="hidden sm:inline lg:inline">Ordering by</span>
                  <span className="sm:hidden">Order by</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[130px]">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  Date (Newest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  Date (Oldest)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Third Row: Add New and Delete - 2 elements */}
          <div className="flex flex-row gap-2 w-full lg:w-auto lg:flex-1 lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 lg:flex-none lg:min-w-[105px] rounded-lg"
              onClick={openAddDialog}
            >
              + Add New
            </Button>
            <Button
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600 flex-1 lg:flex-none lg:min-w-[105px] rounded-lg lg:-mr-5"
              onClick={openBulkDeleteDialog}
            >
              - Delete
            </Button>
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
            Showing {sortedAndFilteredData.length} releases
            {globalFilter && ` matching "${globalFilter}"`}
            {dateRange && ` within date range: ${dateRange}`}
          </div>
        )}
      </div>

      {/* Table - White Background */}
      <div className="flex-1 overflow-auto bg-white">
        <Table className="text-sm">
          <TableHeader className="bg-white hover:bg-gray-50 transition-colors duration-150">
            <TableRow className="border-b border-gray-200 h-12">
              <TableHead className="w-12 px-4 text-sm font-semibold text-gray-900 h-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
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

                    // Special rendering for certain columns
                    if (col.key === 'testStatus') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${statusConfig[String(value)]?.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${statusConfig[String(value)]?.dot}`}></span>
                            {String(value)}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'deploymentStatus') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <div className={`flex items-center gap-2 ${deploymentStatusConfig[String(value)]?.color}`}>
                            <span className={`inline-block w-2 h-2 rounded-full ${deploymentStatusConfig[String(value)]?.dot}`}></span>
                            {String(value)}
                          </div>
                        </TableCell>
                      )
                    }

                    if (col.key === 'releaseDescription' || col.key === 'functionalityDelivered' || col.key === 'comments' || col.key === 'outstandingIssues') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <TruncatedText text={String(value)} maxLength={col.key === 'comments' || col.key === 'outstandingIssues' ? 25 : 30} />
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell key={col.key} className="px-4 text-gray-600 h-12">
                        {String(value)}
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
                          onClick={() => exportSingleRelease(row)}
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

      {/* Footer - White Background */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          Viewing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length}
          {globalFilter && (
            <span className="ml-2">(filtered from {data.length} total records)</span>
          )}
          <span className="ml-2">• {visibleColumns.length} columns visible</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-gray-300 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-red-500 text-white hover:bg-red-600 border-red-500" : "border-gray-300 hover:bg-gray-50"}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="border-gray-300 hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add New Release Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Release
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new release with the details below. Fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* Release Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseVersion" className="text-sm font-medium text-gray-700">
                    Release Version <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="releaseVersion"
                      value={addFormData.releaseVersion || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.releaseVersion ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter release version"
                    />
                    {validationErrors.releaseVersion && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.releaseVersion}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                    System Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemName"
                      value={addFormData.systemName || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.systemName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter system name"
                    />
                    {validationErrors.systemName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.systemName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="systemId" className="text-sm font-medium text-gray-700">
                    System ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemId"
                      value={addFormData.systemId || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.systemId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter system ID"
                    />
                    {validationErrors.systemId && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.systemId}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="iteration" className="text-sm font-medium text-gray-700">
                    Iteration <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="iteration"
                      value={addFormData.iteration || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.iteration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter iteration"
                    />
                    {validationErrors.iteration && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.iteration}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseType" className="text-sm font-medium text-gray-700">
                    Release Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.releaseType || ''}
                      onValueChange={(value) => handleAddFormChange('releaseType', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.releaseType ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.releaseType && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.releaseType}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                    Financial Year <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Input
                      id="financialYear"
                      value={addFormData.financialYear || ''}
                      onChange={handleAddInputChange}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.financialYear ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter financial year (e.g., FY2024)"
                    />
                    {validationErrors.financialYear && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.financialYear}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="testStatus" className="text-sm font-medium text-gray-700">
                    Test Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.testStatus || ''}
                      onValueChange={(value) => handleAddFormChange('testStatus', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.testStatus ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <SelectValue placeholder="Select test status" />
                      </SelectTrigger>
                      <SelectContent>
                        {testStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.testStatus && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.testStatus}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="deploymentStatus" className="text-sm font-medium text-gray-700">
                    Deployment Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Select
                      value={addFormData.deploymentStatus || ''}
                      onValueChange={(value) => handleAddFormChange('deploymentStatus', value)}
                    >
                      <SelectTrigger className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 ${
                        validationErrors.deploymentStatus ? 'border-red-500' : 'border-gray-300'
                      }`}>
                        <SelectValue placeholder="Select deployment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {deploymentStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.deploymentStatus && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.deploymentStatus}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Date Delivered <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.deliveredDate || ''}
                      onChange={(value) => handleAddFormChange('deliveredDate', value)}
                      placeholder="Select delivery date"
                    />
                    {validationErrors.deliveredDate && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.deliveredDate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    TD Notice Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.tdNoticeDate || ''}
                      onChange={(value) => handleAddFormChange('tdNoticeDate', value)}
                      placeholder="Select TD notice date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.testDeployDate || ''}
                      onChange={(value) => handleAddFormChange('testDeployDate', value)}
                      placeholder="Select test deploy date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Start Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.testStartDate || ''}
                      onChange={(value) => handleAddFormChange('testStartDate', value)}
                      placeholder="Select test start date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test End Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.testEndDate || ''}
                      onChange={(value) => handleAddFormChange('testEndDate', value)}
                      placeholder="Select test end date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Prod Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={addFormData.prodDeployDate || ''}
                      onChange={(value) => handleAddFormChange('prodDeployDate', value)}
                      placeholder="Select production deploy date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="month" className="text-sm font-medium text-gray-700">
                  Month
                </Label>
                <div className="w-full">
                  <Select
                    value={addFormData.month || ''}
                    onValueChange={(value) => handleAddFormChange('month', value)}
                  >
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Full Width Text Areas */}
              <div className="space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseDescription" className="text-sm font-medium text-gray-700">
                    Release Description <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="releaseDescription"
                      value={addFormData.releaseDescription || ''}
                      onChange={handleAddInputChange}
                      rows={3}
                      className={`w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none break-words break-all ${
                        validationErrors.releaseDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter release description"
                    />
                    {validationErrors.releaseDescription && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.releaseDescription}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="functionalityDelivered" className="text-sm font-medium text-gray-700">
                    Functionality Delivered
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="functionalityDelivered"
                      value={addFormData.functionalityDelivered || ''}
                      onChange={handleAddInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter functionality delivered"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="outstandingIssues" className="text-sm font-medium text-gray-700">
                    Outstanding Issues
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="outstandingIssues"
                      value={addFormData.outstandingIssues || ''}
                      onChange={handleAddInputChange}
                      rows={4}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Describe outstanding issues, bugs, or pending tasks..."
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                    Comments
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="comments"
                      value={addFormData.comments || ''}
                      onChange={handleAddInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter comments"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t w-full">
            <Button
              variant="outline"
              onClick={saveNewRelease}
              className="flex-1 border-red-400 bg-white text-red-600 hover:bg-red-50 lg:mr-2"
            >
              Create Release
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

      {/* Edit Release Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-clip mx-auto p-4 sm:p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Release
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update release {releaseToEdit?.releaseVersion} details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 w-full">
            {/* Release Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseId" className="text-sm font-medium text-gray-700">
                    Release ID
                  </Label>
                  <div className="w-full">
                    <Input
                      id="releaseId"
                      value={editFormData.releaseId || ''}
                      disabled
                      className="w-full bg-gray-100 text-gray-600"
                      placeholder="Release ID"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseVersion" className="text-sm font-medium text-gray-700">
                    Release Version
                  </Label>
                  <div className="w-full">
                    <Input
                      id="releaseVersion"
                      value={editFormData.releaseVersion || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter release version"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                    System Name
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemName"
                      value={editFormData.systemName || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter system name"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="systemId" className="text-sm font-medium text-gray-700">
                    System ID
                  </Label>
                  <div className="w-full">
                    <Input
                      id="systemId"
                      value={editFormData.systemId || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter system ID"
                    />
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
                      value={editFormData.iteration || ''}
                      onChange={handleInputChange}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400"
                      placeholder="Enter iteration"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseType" className="text-sm font-medium text-gray-700">
                    Release Type
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.releaseType || ''}
                      onValueChange={(value) => handleEditFormChange('releaseType', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        {releaseTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="testStatus" className="text-sm font-medium text-gray-700">
                    Test Status
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.testStatus || ''}
                      onValueChange={(value) => handleEditFormChange('testStatus', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select test status" />
                      </SelectTrigger>
                      <SelectContent>
                        {testStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="deploymentStatus" className="text-sm font-medium text-gray-700">
                    Deployment Status
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.deploymentStatus || ''}
                      onValueChange={(value) => handleEditFormChange('deploymentStatus', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select deployment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {deploymentStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Date Delivered
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.deliveredDate || ''}
                      onChange={(value) => handleEditFormChange('deliveredDate', value)}
                      placeholder="Select delivery date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    TD Notice Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.tdNoticeDate || ''}
                      onChange={(value) => handleEditFormChange('tdNoticeDate', value)}
                      placeholder="Select TD notice date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.testDeployDate || ''}
                      onChange={(value) => handleEditFormChange('testDeployDate', value)}
                      placeholder="Select test deploy date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test Start Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.testStartDate || ''}
                      onChange={(value) => handleEditFormChange('testStartDate', value)}
                      placeholder="Select test start date"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Test End Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.testEndDate || ''}
                      onChange={(value) => handleEditFormChange('testEndDate', value)}
                      placeholder="Select test end date"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label className="text-sm font-medium text-gray-700">
                    Prod Deploy Date
                  </Label>
                  <div className="w-full">
                    <DatePickerInput
                      value={editFormData.prodDeployDate || ''}
                      onChange={(value) => handleEditFormChange('prodDeployDate', value)}
                      placeholder="Select production deploy date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="month" className="text-sm font-medium text-gray-700">
                    Month
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.month || ''}
                      onValueChange={(value) => handleEditFormChange('month', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="financialYear" className="text-sm font-medium text-gray-700">
                    Financial Year
                  </Label>
                  <div className="w-full">
                    <Select
                      value={editFormData.financialYear || ''}
                      onValueChange={(value) => handleEditFormChange('financialYear', value)}
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400">
                        <SelectValue placeholder="Select financial year" />
                      </SelectTrigger>
                      <SelectContent>
                        {financialYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Full Width Text Areas */}
              <div className="space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="releaseDescription" className="text-sm font-medium text-gray-700">
                    Release Description
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="releaseDescription"
                      value={editFormData.releaseDescription || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none break-words break-all"
                      placeholder="Enter release description"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="functionalityDelivered" className="text-sm font-medium text-gray-700">
                    Functionality Delivered
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="functionalityDelivered"
                      value={editFormData.functionalityDelivered || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter functionality delivered"
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="outstandingIssues" className="text-sm font-medium text-gray-700">
                    Outstanding Issues
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="outstandingIssues"
                      value={editFormData.outstandingIssues || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Describe outstanding issues, bugs, or pending tasks..."
                    />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                    Comments
                  </Label>
                  <div className="w-full">
                    <Textarea
                      id="comments"
                      value={editFormData.comments || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full focus:ring-2 focus:ring-red-400 focus:ring-offset-0 focus:outline-none focus:border-red-400 resize-none"
                      placeholder="Enter comments"
                    />
                  </div>
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
              Are you sure you want to delete {selectedRows.size} selected release(s)? This action cannot be undone.
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
              Yes, Delete {selectedRows.size} Release(s)
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
              Are you sure you want to delete release {releaseToDelete?.releaseVersion}? This action cannot be undone.
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