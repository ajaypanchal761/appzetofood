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
  FileText,
  Search,
  Download,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Footer from "../components/Footer"
import scheduleIcon from "@/assets/restaurant icons/schedule.png"
import pendingIcon from "@/assets/restaurant icons/pending.png"
import acceptedIcon from "@/assets/restaurant icons/accepted.png"
import processingIcon from "@/assets/restaurant icons/processing.png"
import onTheWayIcon from "@/assets/restaurant icons/on-the-way.png"
import deliveredIcon from "@/assets/restaurant icons/delivered.png"
import canceledIcon from "@/assets/restaurant icons/canceled.png"
import failedIcon from "@/assets/restaurant icons/failed.png"
import refundedIcon from "@/assets/restaurant icons/refunded.png"

// Mock order data
const generateMockOrders = () => {
  const orders = []
  const customers = [
    "Jane Doe",
    "Brooklyn Simmons",
    "John Doe",
    "Jdjjdj Dhhdhd",
    "Munam ShahariEr Test",
    "Gihkkh Igjgjv",
    "Jvjggjjh Fjkhggh",
    "Test User",
  ]
  const paymentStatuses = ["Paid", "Unpaid"]

  for (let i = 0; i < 66; i++) {
    const totalItemAmount = Math.random() > 0.5 
      ? Math.floor(Math.random() * 3000) + 100 
      : (Math.random() * 2 + 0.5).toFixed(2) + "K"
    
    const isPaid = Math.random() > 0.3
    const paymentStatus = isPaid ? "Paid" : "Unpaid"
    
    orders.push({
      id: 100162 - i,
      orderId: `100${162 - i}`,
      restaurant: "Hungry Puppets",
      customerName: customers[Math.floor(Math.random() * customers.length)],
      totalItemAmount: typeof totalItemAmount === "string" 
        ? parseFloat(totalItemAmount.replace("K", "")) * 1000 
        : totalItemAmount,
      itemDiscount: Math.random() > 0.5 ? Math.floor(Math.random() * 200) : 0,
      couponDiscount: 0,
      referralDiscount: 0,
      discountedAmount: Math.random() > 0.5 ? Math.floor(Math.random() * 200) : 0,
      tax: Math.floor(Math.random() * 200) + 10,
      deliveryCharge: Math.floor(Math.random() * 700) + 30,
      serviceCharge: Math.random() > 0.3 ? 10 : 0,
      extraPackagingAmount: 0,
      paymentStatus,
    })
  }
  return orders
}

const mockOrders = generateMockOrders()

// Order status summary data
const orderStatusSummary = [
  { label: "Scheduled Orders", count: 1, icon: scheduleIcon },
  { label: "Pending Orders", count: 36, icon: pendingIcon },
  { label: "Accepted Orders", count: 1, icon: acceptedIcon },
  { label: "Processing Orders", count: 3, icon: processingIcon },
  { label: "Food On The Way", count: 1, icon: onTheWayIcon },
  { label: "Delivered", count: 25, icon: deliveredIcon },
  { label: "Canceled", count: 0, icon: canceledIcon },
  { label: "Payment Failed", count: 0, icon: failedIcon },
  { label: "Refunded", count: 0, icon: refundedIcon },
]

export default function OrderReport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const formatCurrency = (amount) => {
    if (typeof amount === "string") return amount
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  const formatCurrencyFull = (amount) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <FileText className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Report</h1>
      </div>

      {/* Search Data Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
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
        </CardContent>
      </Card>

      {/* Order Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orderStatusSummary.map((status) => (
          <Card key={status.label} className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={status.icon}
                    alt={status.label}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{status.count}</div>
                  <div className="text-sm text-gray-600">{status.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Orders Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Total Orders</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredOrders.length}
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

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Order Id</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Restaurant</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Customer Name</TableHead>
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
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">Tax</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Delivery Charge
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Service Charge
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Extra Packaging Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                        {order.orderId}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {order.restaurant}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(order.totalItemAmount)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            order.paymentStatus === "Paid"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.itemDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.couponDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.referralDiscount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.discountedAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.tax)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.deliveryCharge)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.serviceCharge)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.extraPackagingAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                  }`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
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

