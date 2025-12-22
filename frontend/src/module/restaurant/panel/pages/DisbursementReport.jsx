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
  Receipt,
  Search,
  Download,
  ChevronDown,
  Filter,
  Info,
  FileText,
} from "lucide-react"
import Footer from "../components/Footer"
import trx1Icon from "@/assets/restaurant icons/trx1.png"
import trx2Icon from "@/assets/restaurant icons/trx2.png"
import trx3Icon from "@/assets/restaurant icons/trx3.png"

// Mock disbursement data
const mockDisbursements = [
  {
    id: 1,
    disbursementId: "#1002",
    createdAt: "21 Nov 2023 04:33 pm",
    disburseAmount: 6012.78,
    paymentMethod: "6cash",
    status: "Pending",
  },
]

export default function DisbursementReport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all-time")

  const filteredDisbursements = mockDisbursements.filter((disbursement) =>
    disbursement.disbursementId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Receipt className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Disbursement Report</h1>
      </div>

      {/* Disbursement Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Disbursements Card */}
        <Card className="border-gray-200 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center overflow-hidden">
                <img
                  src={trx1Icon}
                  alt="Pending Disbursements"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              $ {formatCurrency(6012.78)}
            </div>
            <div className="text-sm text-gray-600">Pending Disbursements</div>
          </CardContent>
        </Card>

        {/* Completed Disbursements Card */}
        <Card className="border-gray-200 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden">
                <img
                  src={trx2Icon}
                  alt="Completed Disbursements"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">$ 0.00</div>
            <div className="text-sm text-gray-600">Completed Disbursements</div>
          </CardContent>
        </Card>

        {/* Canceled Disbursements Card */}
        <Card className="border-gray-200 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center overflow-hidden">
                <img
                  src={trx3Icon}
                  alt="Canceled Disbursements"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">$ 0.00</div>
            <div className="text-sm text-gray-600">Canceled Disbursements</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Data Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Search Data</span>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="flex-1 h-10 bg-white border-gray-200 [&>svg:last-child]:hidden">
                <div className="flex items-center gap-2 w-full">
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <SelectValue placeholder="All Payment Method" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Method</SelectItem>
                <SelectItem value="6cash">6cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 h-10 bg-white border-gray-200 [&>svg:last-child]:hidden">
                <div className="flex items-center gap-2 w-full">
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <SelectValue placeholder="All status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="flex-1 h-10 bg-white border-gray-200 [&>svg:last-child]:hidden">
                <div className="flex items-center gap-2 w-full">
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <SelectValue placeholder="All Time" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="previous-year">Previous Year</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Total Disbursements Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Total Disbursements</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredDisbursements.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by id"
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
                  <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Disbursements Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Id</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Created At</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Disburse Amount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Payment Method
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisbursements.map((disbursement, index) => (
                  <TableRow
                    key={disbursement.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {disbursement.disbursementId}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {disbursement.createdAt}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 text-right">
                      $ {formatCurrency(disbursement.disburseAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {disbursement.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          disbursement.status === "Pending"
                            ? "bg-blue-100 text-blue-700"
                            : disbursement.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {disbursement.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

