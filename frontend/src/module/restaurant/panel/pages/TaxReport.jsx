import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Calendar,
  FileText,
  ClipboardList,
  Coins,
  Eye,
  FolderX,
} from "lucide-react"
import Footer from "../components/Footer"
import trx3Icon from "@/assets/restaurant icons/trx3.png"

// Mock tax data (empty for now to show empty state)
const mockTaxes = []

export default function TaxReport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("11/27/2025 - 12/03/2025")

  const filteredTaxes = mockTaxes.filter((tax) =>
    tax.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">Tax Report</h1>
      </div>

      {/* Date Range Filter Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium">Date Range</span>
            <div className="relative flex-1 max-w-xs">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="pl-10 bg-white border-gray-200 h-10"
                placeholder="Select date range"
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-gray-200 hover:bg-gray-50"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Orders Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-amber-700" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Order Amount Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center">
                <Coins className="h-8 w-8 text-amber-700" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">$ 0.00</div>
                <div className="text-sm text-gray-600">Total Order Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Tax Amount Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center overflow-hidden">
                <img
                  src={trx3Icon}
                  alt="Total Tax Amount"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">$ 0.00</div>
                <div className="text-sm text-gray-600">Total Tax Amount</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Taxes Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">All Taxes</h2>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ex: 10010"
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

          {/* Taxes Table */}
          {filteredTaxes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Order Id</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Order Date</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700 text-right">
                      Order Amount
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Tax Type</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700 text-right">
                      Tax Amount
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTaxes.map((tax, index) => (
                    <TableRow
                      key={tax.id}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <TableCell className="text-sm text-gray-700 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                        {tax.orderId}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{tax.orderDate}</TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900 text-right">
                        $ {formatCurrency(tax.orderAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{tax.taxType}</TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900 text-right">
                        $ {formatCurrency(tax.taxAmount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FolderX className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">No Data Found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

