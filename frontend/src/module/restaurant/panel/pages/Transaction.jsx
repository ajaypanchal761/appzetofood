import { useState, useMemo } from "react"
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
  PieChart,
  Search,
  Download,
  ChevronDown,
  Settings,
  Filter,
  Info,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react"
import Footer from "../components/Footer"
import trx1Icon from "@/assets/restaurant icons/trx1.png"
import trx2Icon from "@/assets/restaurant icons/trx2.png"
import trx3Icon from "@/assets/restaurant icons/trx3.png"

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    orderId: "100162",
    restaurant: "Hungry Puppets",
    customerName: "Jane Doe",
    totalItemAmount: 640.0,
    itemDiscount: 0.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: 0.0,
    vatTax: 64.0,
    deliveryCharge: 686.86,
    orderAmount: 1400.86,
    adminDiscount: 0.0,
    restaurantDiscount: 0.0,
    adminCommission: 64.0,
    serviceCharge: 10.0,
  },
  {
    id: 2,
    orderId: "100161",
    restaurant: "Hungry Puppets",
    customerName: "Jane Doe",
    totalItemAmount: 800.0,
    itemDiscount: 30.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: 30.0,
    vatTax: 77.0,
    deliveryCharge: 686.86,
    orderAmount: 1543.86,
    adminDiscount: 3.0,
    restaurantDiscount: 27.0,
    adminCommission: 77.0,
    serviceCharge: 10.0,
  },
  {
    id: 3,
    orderId: "100157",
    restaurant: "Hungry Puppets",
    customerName: "Brooklyn Simmons",
    totalItemAmount: 1720.0,
    itemDiscount: 0.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: 0.0,
    vatTax: 86.0,
    deliveryCharge: 583.99,
    orderAmount: 2399.99,
    adminDiscount: 0.0,
    restaurantDiscount: 0.0,
    adminCommission: 172.0,
    serviceCharge: 10.0,
  },
  {
    id: 4,
    orderId: "100156",
    restaurant: "Hungry Puppets",
    customerName: "John Doe",
    totalItemAmount: 700.0,
    itemDiscount: 110.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: 110.0,
    vatTax: 29.5,
    deliveryCharge: 687.14,
    orderAmount: 6316.64,
    adminDiscount: 11.0,
    restaurantDiscount: 99.0,
    adminCommission: 59.0,
    serviceCharge: 10.0,
  },
  {
    id: 5,
    orderId: "100155",
    restaurant: "Hungry Puppets",
    customerName: "John Doe",
    totalItemAmount: 710.0,
    itemDiscount: 110.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: 110.0,
    vatTax: 30.0,
    deliveryCharge: 687.14,
    orderAmount: 2827.14,
    adminDiscount: 11.0,
    restaurantDiscount: 99.0,
    adminCommission: 60.0,
    serviceCharge: 10.0,
  },
  {
    id: 6,
    orderId: "100154",
    restaurant: "Hungry Puppets",
    customerName: "John Doe",
    totalItemAmount: 710.0,
    itemDiscount: 110.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: 110.0,
    vatTax: 30.0,
    deliveryCharge: 687.14,
    orderAmount: 2827.14,
    adminDiscount: 11.0,
    restaurantDiscount: 99.0,
    adminCommission: 60.0,
    serviceCharge: 10.0,
  },
  // Add more mock data to reach 28 total
  ...Array.from({ length: 22 }, (_, i) => ({
    id: 7 + i,
    orderId: String(100080 - i),
    restaurant: "Hungry Puppets",
    customerName: i % 3 === 0 ? "Jane Doe" : i % 3 === 1 ? "Jane Cooper" : "John Doe",
    totalItemAmount: 800.0 + i * 10,
    itemDiscount: i % 2 === 0 ? 120.0 : 0.0,
    couponDiscount: 0.0,
    referralDiscount: 0.0,
    discountedAmount: i % 2 === 0 ? 100.0 : 0.0,
    vatTax: 35.0 + i,
    deliveryCharge: 334.45 + i * 10,
    orderAmount: 1334.45 + i * 100,
    adminDiscount: i % 2 === 0 ? 0.0 : 0.0,
    restaurantDiscount: i % 2 === 0 ? 0.0 : 0.0,
    adminCommission: 70.0 + i,
    serviceCharge: 0.0,
  })),
]

export default function Transaction() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 20

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((transaction) =>
      transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + rowsPerPage
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
          <PieChart className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Report</h1>
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

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Transaction Card */}
        <Card className="border-gray-200 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center overflow-hidden">
                <img
                  src={trx1Icon}
                  alt="Completed Transaction"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">$ 44.65K</div>
            <div className="text-sm text-gray-600">Completed Transaction</div>
          </CardContent>
        </Card>

        {/* On Hold Transaction Card */}
        <Card className="border-gray-200 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                <img
                  src={trx2Icon}
                  alt="On Hold Transaction"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">$ 39.47K</div>
            <div className="text-sm text-gray-600">On Hold Transaction</div>
          </CardContent>
        </Card>

        {/* Refunded Transaction Card */}
        <Card className="border-gray-200 shadow-sm relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center overflow-hidden">
                <img
                  src={trx3Icon}
                  alt="Refunded Transaction"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">$ 0.00</div>
            <div className="text-sm text-gray-600">Refunded Transaction</div>
          </CardContent>
        </Card>
      </div>

      {/* Order Transactions Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Order Transactions</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredTransactions.length}
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

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Order Id</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Restaurant</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Customer Name
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Total Item Amount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Item Discount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Coupon Discount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Referral Discount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Discounted Amount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Vat/Tax
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Delivery Charge
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Order Amount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Admin Discount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Restaurant Discount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Admin Commission
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Service Charge
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction, index) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`#order-${transaction.orderId}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {transaction.orderId}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {transaction.restaurant}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {transaction.customerName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.totalItemAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.itemDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.couponDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.referralDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.discountedAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.vatTax)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.deliveryCharge)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 text-right">
                      $ {formatCurrency(transaction.orderAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.adminDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.restaurantDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.adminCommission)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      $ {formatCurrency(transaction.serviceCharge)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  className={`h-9 w-9 ${
                    currentPage === page
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

