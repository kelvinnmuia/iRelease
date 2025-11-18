import { useState } from "react"
import { ChevronDown, Download, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const columns = [
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
  "Pending": { color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  "Active": { color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  "Closed": { color: "bg-slate-100 text-slate-800", dot: "bg-slate-500" },
  "Deleted": { color: "bg-red-100 text-red-800", dot: "bg-red-500" },
  "Passed": { color: "bg-green-100 text-green-800", dot: "bg-green-500" },
}

const deploymentStatusConfig: Record<string, { color: string; dot: string }> = {
  "Completed": { color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  "Scheduled": { color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  "On Hold": { color: "bg-red-100 text-red-800", dot: "bg-red-500" },
  "Cancelled": { color: "bg-slate-100 text-slate-800", dot: "bg-slate-500" },
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

export function ReleasesDataTable() {
  const [data] = useState(staticData)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header - Light Gray Background */}
      <div className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All Releases</h1>
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full px-6">+ Add New</Button>
        </div>

        {/* Controls - Light Gray Background */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">

            <Button variant="outline" size="sm" className="gap-2 border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50">
              <Download className="w-4 h-4" /> Export XLS
            </Button>
          </div>

          <div className="flex-1 flex gap-2 justify-end">
            {/* Doc Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-white border-gray-300 hover:bg-gray-50">
                  Doc type <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Sales Invoice</DropdownMenuItem>
                <DropdownMenuItem>Credit Invoice</DropdownMenuItem>
                <DropdownMenuItem>Debit Invoice</DropdownMenuItem>
                <DropdownMenuItem>Commercial Invoice</DropdownMenuItem>
                <DropdownMenuItem>Expense Report</DropdownMenuItem>
                <DropdownMenuItem>Recurring Invoice</DropdownMenuItem>
                <DropdownMenuItem>Free Expense Invoice</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ordering Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-white border-gray-300 hover:bg-gray-50">
                  Ordering by <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                <DropdownMenuItem>Release Version</DropdownMenuItem>
                <DropdownMenuItem>System Name</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range */}
            <Input 
              type="text" 
              placeholder="08/08/2016 - 9/21/2017" 
              className="w-48 h-9 border-gray-300 bg-white focus:border-yellow-400 focus:ring-yellow-400"
            />
          </div>
        </div>
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
                  className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                />
              </TableHead>
              {columns.map((col) => (
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
            {paginatedData.map((row) => (
              <TableRow 
                key={row.id} 
                className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 h-12"
              >
                <TableCell className="px-4 h-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.releaseId}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.systemName}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.systemId}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.releaseVersion}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.iteration}
                </TableCell>
                <TableCell className="px-4 h-12">
                  <TruncatedText text={row.releaseDescription} maxLength={25} />
                </TableCell>
                <TableCell className="px-4 h-12">
                  <TruncatedText text={row.functionalityDelivered} maxLength={25} />
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.deliveredDate}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.tdNoticeDate}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.testDeployDate}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.testStartDate}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.testEndDate}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.prodDeployDate}
                </TableCell>
                <TableCell className="px-4 h-12">
                  <Badge className={`${statusConfig[row.testStatus]?.color} rounded-full px-3 py-1 text-xs`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusConfig[row.testStatus]?.dot}`}></span>
                    {row.testStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 h-12">
                  <Badge className={`${deploymentStatusConfig[row.deploymentStatus]?.color} rounded-full px-3 py-1 text-xs`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${deploymentStatusConfig[row.deploymentStatus]?.dot}`}></span>
                    {row.deploymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 text-gray-600 text-center h-12">
                  {row.outstandingIssues}
                </TableCell>
                <TableCell className="px-4 h-12">
                  <TruncatedText text={row.comments} maxLength={20} />
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.releaseType}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.month}
                </TableCell>
                <TableCell className="px-4 text-gray-600 h-12">
                  {row.financialYear}
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer - White Background */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Viewing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, data.length)} of {data.length}
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
              className={currentPage === page ? "bg-yellow-400 text-black hover:bg-yellow-500 border-yellow-400" : "border-gray-300 hover:bg-gray-50"}
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