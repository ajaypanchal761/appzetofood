import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Search,
  Download,
  ChevronDown,
  Settings,
  Filter,
} from "lucide-react"
import Footer from "../components/Footer"

// Mock expense data
const mockExpenses = [
  {
    id: 1,
    orderId: "100161",
    dateTime: "16 Jul 2025 08:21 am",
    expenseType: "Discount On Product",
    customerName: "Jane Doe",
    expenseAmount: 27.0,
  },
  {
    id: 2,
    orderId: "100156",
    dateTime: "21 Nov 2023 04:22 pm",
    expenseType: "Discount On Product",
    customerName: "John Doe",
    expenseAmount: 99.0,
  },
  {
    id: 3,
    orderId: "100155",
    dateTime: "21 Nov 2023 04:09 pm",
    expenseType: "Discount On Product",
    customerName: "John Doe",
    expenseAmount: 99.0,
  },
  {
    id: 4,
    orderId: "100154",
    dateTime: "21 Nov 2023 04:06 pm",
    expenseType: "Discount On Product",
    customerName: "John Doe",
    expenseAmount: 99.0,
  },
  {
    id: 5,
    orderId: "100113",
    dateTime: "01 Jun 2023 10:52 am",
    expenseType: "Discount On Product",
    customerName: "Purno Test",
    expenseAmount: 27.0,
  },
  {
    id: 6,
    orderId: "100095",
    dateTime: "07 Feb 2023 05:46 pm",
    expenseType: "Coupon Discount",
    customerName: "Munam ShahariEr",
    expenseAmount: 19.13,
  },
  {
    id: 7,
    orderId: "100094",
    dateTime: "07 Feb 2023 05:25 pm",
    expenseType: "Coupon Discount",
    customerName: "Jane Doe",
    expenseAmount: 35.7,
  },
  {
    id: 8,
    orderId: "100035",
    dateTime: "07 Feb 2023 05:08 pm",
    expenseType: "Discount On Product",
    customerName: "Sultan O Mahamud 1",
    customerPhone: "+8**********",
    expenseAmount: 83.7,
  },
]

export default function ExpenseReport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [filterExpenseType, setFilterExpenseType] = useState("all")

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesSearch = expense.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesExpenseType = filterExpenseType === "all" || 
      expense.expenseType.toLowerCase().includes(filterExpenseType.toLowerCase())
    
    return matchesSearch && matchesExpenseType
  })

  const handleExport = (format) => {
    const headers = ["SI", "Order ID", "Date & Time", "Expense Type", "Customer Name", "Expense Amount"]
    let csvContent = headers.join(",") + "\n"
    
    filteredExpenses.forEach((expense, index) => {
      const row = [
        index + 1,
        expense.orderId,
        expense.dateTime,
        expense.expenseType,
        expense.customerName,
        expense.expenseAmount.toFixed(2)
      ]
      csvContent += row.join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `expense-report-${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "pdf"}`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert(`Exporting as ${format.toUpperCase()}...`)
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Expense Report</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Here, you'll find the discounted order list that is considered as restaurant expenses.
          Such as restaurant discounts, coupon discounts, item discounts, etc.
        </p>
      </div>

      {/* Search Data Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Search Data</span>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="flex-1 h-10 bg-white border-gray-200 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="All Time" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-600 hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expense Lists Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Expense Lists</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredExpenses.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Order ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 h-10"
                />
              </div>

              {/* Export Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 px-4 border-gray-200 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                  <DropdownMenuItem
                    onClick={() => handleExport("csv")}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport("pdf")}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Expense Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Order Id</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Date & Time
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Expense Type
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Customer Name
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Expense Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`#order-${expense.orderId}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {expense.orderId}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{expense.dateTime}</TableCell>
                    <TableCell className="text-sm text-gray-700">{expense.expenseType}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">
                        <div>{expense.customerName}</div>
                        {expense.customerPhone && (
                          <div className="text-xs text-gray-500">{expense.customerPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 text-right">
                      $ {expense.expenseAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-md bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Filter Expenses
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Expense Type</Label>
              <Select value={filterExpenseType} onValueChange={setFilterExpenseType}>
                <SelectTrigger className="h-10 border-gray-300">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="discount">Discount On Product</SelectItem>
                  <SelectItem value="coupon">Coupon Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">From Date</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="h-10 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">To Date</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="h-10 border-gray-300"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilterExpenseType("all")
                  setFilterDateFrom("")
                  setFilterDateTo("")
                  setFilterOpen(false)
                }}
                className="border-gray-300"
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

