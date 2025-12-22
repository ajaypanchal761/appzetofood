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
  Utensils,
  Search,
  Download,
  ChevronDown,
  Filter,
  Settings,
  FileText,
} from "lucide-react"
import Footer from "../components/Footer"

// Mock food report data
const mockFoodReports = []

export default function FoodReport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all-time")

  const filteredReports = mockFoodReports.filter((report) =>
    report.foodName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Utensils className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Food Report</h1>
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

      {/* Food Report Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {/* Table Header with Search and Export */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Food Report</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredReports.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Food Name"
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
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
                    <FileText className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Utensils className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">No Food Report Found</p>
              <p className="text-sm text-gray-500 text-center max-w-md">
                There are no food reports available at the moment. Reports will appear here once data is available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-sm font-semibold text-gray-700">Food Name</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Total Orders</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Total Quantity</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Total Amount</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">Average Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-900">{report.foodName}</TableCell>
                      <TableCell className="text-sm text-gray-700">{report.totalOrders}</TableCell>
                      <TableCell className="text-sm text-gray-700">{report.totalQuantity}</TableCell>
                      <TableCell className="text-sm text-gray-700">${report.totalAmount}</TableCell>
                      <TableCell className="text-sm text-gray-700">{report.averageRating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

