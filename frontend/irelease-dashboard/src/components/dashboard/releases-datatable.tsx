"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { MoreVertical, Download, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"

const jobsData = [
  {
    id: 1,
    date: "15 May 2024",
    title: "Senior Developer",
    department: "Engineering",
    applicants: 45,
    status: "Active",
    salary: "$80K - $120K",
    type: "Full-time",
  },
  {
    id: 2,
    date: "12 May 2024",
    title: "Product Manager",
    department: "Product",
    applicants: 28,
    status: "Active",
    salary: "$90K - $130K",
    type: "Full-time",
  },
  {
    id: 3,
    date: "10 May 2024",
    title: "UX Designer",
    department: "Design",
    applicants: 32,
    status: "Closed",
    salary: "$70K - $100K",
    type: "Full-time",
  },
  {
    id: 4,
    date: "08 May 2024",
    title: "Marketing Specialist",
    department: "Marketing",
    applicants: 15,
    status: "Active",
    salary: "$50K - $75K",
    type: "Contract",
  },
  {
    id: 5,
    date: "05 May 2024",
    title: "HR Coordinator",
    department: "Human Resources",
    applicants: 22,
    status: "Pending",
    salary: "$45K - $65K",
    type: "Full-time",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800"
    case "Closed":
      return "bg-red-100 text-red-800"
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function JobsDatatable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(jobsData.map((job) => job.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const totalPages = Math.ceil(jobsData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedJobs = jobsData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">Jobs</CardTitle>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Manage job postings</p>
          </div>
          <Button className="w-full md:w-auto bg-green-500 hover:bg-green-600">Add New Job</Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
          <div className="flex-1">
            <Input placeholder="Search jobs..." className="text-xs md:text-sm" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs md:text-sm gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs md:text-sm gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-2 md:p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === jobsData.length && jobsData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-2 md:p-4 text-left font-medium">Date</th>
                <th className="p-2 md:p-4 text-left font-medium hidden sm:table-cell">Title</th>
                <th className="p-2 md:p-4 text-left font-medium hidden md:table-cell">Department</th>
                <th className="p-2 md:p-4 text-left font-medium hidden lg:table-cell">Applicants</th>
                <th className="p-2 md:p-4 text-left font-medium">Status</th>
                <th className="p-2 md:p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 md:p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(job.id)}
                      onChange={() => handleSelectRow(job.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-2 md:p-4 text-gray-600">{job.date}</td>
                  <td className="p-2 md:p-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-gray-500 text-xs md:hidden">{job.department}</p>
                    </div>
                  </td>
                  <td className="p-2 md:p-4 text-gray-600 hidden md:table-cell">{job.department}</td>
                  <td className="p-2 md:p-4 text-gray-600 hidden lg:table-cell">{job.applicants}</td>
                  <td className="p-2 md:p-4">
                    <Badge className={`text-xs ${getStatusColor(job.status)}`}>{job.status}</Badge>
                  </td>
                  <td className="p-2 md:p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs md:text-sm">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Applicants</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Close Job</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <p className="text-xs md:text-sm text-gray-600">
            Viewing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, jobsData.length)} of {jobsData.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center gap-1 text-xs md:text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
