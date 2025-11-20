import { useState } from "react"
import { ChevronDown, Download, MoreVertical, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, Columns3, RefreshCcw, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  { key: "outstandingIssues", label: "Outstanding Issues", width: "w-28" },
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
    deploymentStatus: "Completed",
    outstandingIssues: 2,
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
    deploymentStatus: "Completed",
    outstandingIssues: 0,
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
    deploymentStatus: "Scheduled",
    outstandingIssues: 5,
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
    deploymentStatus: "Completed",
    outstandingIssues: 0,
    comments: "Successfully deployed to production environment",
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
    deploymentStatus: "On Hold",
    outstandingIssues: 8,
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
    deploymentStatus: "Cancelled",
    outstandingIssues: 0,
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
  "Completed": { color: "text-gray-600", dot: "bg-green-500" },
  "Scheduled": { color: "text-gray-600", dot: "bg-yellow-400" },
  "On Hold": { color: "text-gray-600", dot: "bg-red-500" },
  "Cancelled": { color: "text-gray-600", dot: "bg-slate-500" },
}

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
        <TooltipContent side="top" className="max-w-md">
          <p className="text-sm">{text}</p>
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

export function ReleasesDataTable() {
  const [data] = useState(staticData)
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
  const itemsPerPage = 10

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
                  <Input
                    placeholder="Search columns..."
                    value={columnSearchQuery}
                    onChange={(e) => setColumnSearchQuery(e.target.value)}
                    className="pl-8 pr-4 w-full"
                  />
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
                          onSelect={(e) => e.preventDefault()}
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
              <Input
                placeholder="Search releases..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="w-full pl-9 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 sm:pr-4"
              />
            </div>
          </div>

          {/* Second Row: Date Range and Ordering - 2 elements */}
          <div className="flex flex-row gap-2 w-full lg:w-auto lg:flex-1 lg:justify-center">
            {/* Date Range */}
            <div className="relative flex-1 lg:flex-none lg:w-64">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <Input
                  placeholder="Select date range"
                  value={dateRange}
                  readOnly
                  className="w-full pl-10 h-9 border-gray-300 bg-white focus:border-red-400 focus:ring-red-400 cursor-pointer sm:pr-4"
                />
              </div>

              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-64">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full"
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
            <Button variant="outline" size="sm" className="border-red-400 bg-white text-red-600 hover:bg-red-50 flex-1 lg:flex-none lg:min-w-[105px] rounded-lg">
              + Add New
            </Button>
            <Button size="sm" className="bg-red-500 text-white hover:bg-red-600 flex-1 lg:flex-none lg:min-w-[105px] rounded-lg lg:-mr-5">
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

                    if (col.key === 'releaseDescription' || col.key === 'functionalityDelivered' || col.key === 'comments') {
                      return (
                        <TableCell key={col.key} className="px-4 h-12">
                          <TruncatedText text={String(value)} maxLength={col.key === 'comments' ? 20 : 25} />
                        </TableCell>
                      )
                    }

                    if (col.key === 'outstandingIssues') {
                      return (
                        <TableCell key={col.key} className="px-4 text-gray-600 text-center h-12">
                          {String(value)}
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
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Export</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600">Delete</DropdownMenuItem>
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
    </div>
  )
}