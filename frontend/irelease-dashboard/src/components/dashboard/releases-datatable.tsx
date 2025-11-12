import { useState } from "react"
import { ChevronDown, Download, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const columns = [
  "Date",
  "Doc Type",
  "Number",
  "Reference",
  "Final Amount",
  "Tax",
  "Status",
  "Currency",
  "Amount",
  "Description",
  "Category",
  "Vendor",
  "Department",
  "Project",
  "GL Code",
  "Cost Center",
  "Invoice Date",
  "Due Date",
  "Approved By",
  "Created Date",
  "Modified Date",
  "Notes",
  "Payment Terms",
  "PO Number",
  "Quantity",
  "Unit Price",
]

const generateMockData = (count: number) => {
  const docTypes = ["Credit invoice", "Debit invoice", "Expense report"]
  const statuses = ["Pending", "Active", "Closed", "Deleted"]
  const currencies = ["EUR", "USD", "GBP"]
  const categories = ["Travel", "Office", "Software", "Hardware", "Utilities"]
  const vendors = ["Vendor A", "Vendor B", "Vendor C", "Vendor D"]
  const departments = ["Finance", "IT", "HR", "Sales", "Marketing"]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    date: new Date(2019, 10 - Math.floor(i / 3), 25 - (i % 25)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    docType: docTypes[i % docTypes.length],
    number: `#${450 - i}`,
    reference: Math.random().toString(36).substring(7),
    finalAmount: (Math.random() * 10000).toFixed(2),
    tax: (Math.random() * 500).toFixed(2),
    status: statuses[i % statuses.length],
    currency: currencies[i % currencies.length],
    amount: (Math.random() * 5000).toFixed(2),
    description: `Transaction ${i + 1}`,
    category: categories[i % categories.length],
    vendor: vendors[i % vendors.length],
    department: departments[i % departments.length],
    project: `Project ${String.fromCharCode(65 + (i % 26))}`,
    glCode: `GL-${String(i + 1000).slice(-4)}`,
    costCenter: `CC-${String(i + 100).slice(-3)}`,
    invoiceDate: new Date(2019, 10, 1 + (i % 30)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    dueDate: new Date(2019, 11, 1 + (i % 30)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    approvedBy: `User ${i % 5}`,
    createdDate: new Date(2019, 9, 1 + (i % 30)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    modifiedDate: new Date(2019, 10, 15 + (i % 15)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    notes: `Note for transaction ${i + 1}`,
    paymentTerms: `Net ${30 + (i % 30)}`,
    poNumber: `PO-${String(1000 + i).slice(-4)}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    unitPrice: (Math.random() * 500).toFixed(2),
  }))
}

const statusConfig: Record<string, { color: string; dot: string }> = {
  Pending: { color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  Active: { color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  Closed: { color: "bg-slate-100 text-slate-800", dot: "bg-slate-500" },
  Deleted: { color: "bg-red-100 text-red-800", dot: "bg-red-500" },
}

export function DataTable() {
  const [data] = useState(generateMockData(26))
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
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">All Releases</h1>
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full">+ Add New</Button>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center mb-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-yellow-400 text-yellow-600 bg-transparent">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-yellow-400 text-yellow-600 bg-transparent">
              <Download className="w-4 h-4" /> Export XLS
            </Button>
          </div>

          <div className="flex-1 flex gap-2">
            {/* Doc Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                  Doc type <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Sales Invoice</DropdownMenuItem>
                <DropdownMenuItem>Credit invoice</DropdownMenuItem>
                <DropdownMenuItem>Debit invoice</DropdownMenuItem>
                <DropdownMenuItem>Commercial invoice</DropdownMenuItem>
                <DropdownMenuItem>Expense report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Status <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Pending</DropdownMenuItem>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Closed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ordering */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Ordering by <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                <DropdownMenuItem>Amount (High to Low)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range */}
            <Input type="text" placeholder="08/08/2016 - 9/21/2017" className="w-48 h-9" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table className="text-sm">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </TableHead>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap px-4 py-3 text-xs font-medium">
                  {col}
                </TableHead>
              ))}
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50 border-b">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                    className="rounded"
                  />
                </TableCell>
                <TableCell className="text-gray-700">{row.date}</TableCell>
                <TableCell className="font-medium">{row.docType}</TableCell>
                <TableCell className="text-gray-600">{row.number}</TableCell>
                <TableCell className="text-gray-600 font-mono">{row.reference}</TableCell>
                <TableCell className="font-medium">
                  {row.finalAmount} {row.currency}
                </TableCell>
                <TableCell className="text-gray-600">{row.tax}</TableCell>
                <TableCell>
                  <Badge className={`${statusConfig[row.status]?.color} rounded-full`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusConfig[row.status]?.dot}`}></span>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.currency}</TableCell>
                <TableCell className="text-gray-600">{row.amount}</TableCell>
                <TableCell className="text-gray-600">{row.description}</TableCell>
                <TableCell className="text-gray-600">{row.category}</TableCell>
                <TableCell className="text-gray-600">{row.vendor}</TableCell>
                <TableCell className="text-gray-600">{row.department}</TableCell>
                <TableCell className="text-gray-600">{row.project}</TableCell>
                <TableCell className="text-gray-600 font-mono">{row.glCode}</TableCell>
                <TableCell className="text-gray-600 font-mono">{row.costCenter}</TableCell>
                <TableCell className="text-gray-600">{row.invoiceDate}</TableCell>
                <TableCell className="text-gray-600">{row.dueDate}</TableCell>
                <TableCell className="text-gray-600">{row.approvedBy}</TableCell>
                <TableCell className="text-gray-600">{row.createdDate}</TableCell>
                <TableCell className="text-gray-600">{row.modifiedDate}</TableCell>
                <TableCell className="text-gray-600">{row.notes}</TableCell>
                <TableCell className="text-gray-600">{row.paymentTerms}</TableCell>
                <TableCell className="text-gray-600 font-mono">{row.poNumber}</TableCell>
                <TableCell className="text-gray-600">{row.quantity}</TableCell>
                <TableCell className="text-gray-600 font-mono text-right">${row.unitPrice}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
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
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-yellow-400 text-black" : ""}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
