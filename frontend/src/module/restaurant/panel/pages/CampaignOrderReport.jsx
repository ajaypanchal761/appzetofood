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
  Briefcase,
  Search,
  Download,
  ChevronDown,
  Filter,
  Settings,
  Eye,
  Printer,
  Info,
  RefreshCw,
  Truck,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  X,
  FileText,
} from "lucide-react"
import Footer from "../components/Footer"
import totalIcon from "@/assets/restaurant icons/total.png"
import onTheWayIcon from "@/assets/restaurant icons/on-the-way (1).png"
import failedIcon from "@/assets/restaurant icons/failed (1).png"
import refundedIcon from "@/assets/restaurant icons/refunded (1).png"
import deliveredIcon from "@/assets/restaurant icons/delivered (1).png"
import canceledIcon from "@/assets/restaurant icons/canceled (1).png"
import progressReportIcon from "@/assets/restaurant icons/progress-report.png"

// Mock campaign order data
const generateMockCampaignOrders = () => {
  const orders = []
  const customers = [
    "John Doe",
    "V H",
    "Vijay Vijay",
    "Chinna Chinna",
    "Qwa Qwa",
    "Dejan Đusić",
    "Pili 123",
    "Jane Doe",
  ]
  const orderStatuses = ["Delivered", "Canceled", "Pending"]
  const amountReceivedBy = ["Deliveryman", "Not Received Yet", "Restaurant"]
  const paymentMethods = ["Cash On Delivery"]

  for (let i = 0; i < 10; i++) {
    const totalItemAmount = Math.floor(Math.random() * 1000) + 100
    const isPaid = Math.random() > 0.3
    const paymentStatus = isPaid ? "Paid" : "Unpaid"
    const orderAmount = totalItemAmount + Math.floor(Math.random() * 2000) + 500
    const hasInvalidCustomer = i === 9 // Last order has invalid customer data

    orders.push({
      id: 100156 - i,
      orderId: `100${156 - i}`,
      restaurant: "Hungry Puppets",
      customerName: hasInvalidCustomer ? "Invalid Customer Data" : customers[Math.floor(Math.random() * customers.length)],
      totalItemAmount,
      itemDiscount: Math.floor(Math.random() * 150) + 50,
      couponDiscount: 0,
      discountedAmount: Math.floor(Math.random() * 150) + 50,
      tax: Math.floor(Math.random() * 50) + 10,
      deliveryCharge: Math.random() > 0.5 ? Math.floor(Math.random() * 700) + 30 : 0,
      orderAmount,
      amountReceivedBy: amountReceivedBy[Math.floor(Math.random() * amountReceivedBy.length)],
      paymentMethod: paymentMethods[0],
      orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      paymentStatus,
      hasInvalidCustomer,
    })
  }
  return orders
}

const mockCampaignOrders = generateMockCampaignOrders()

// Campaign order status summary data
const campaignOrderStatusSummary = [
  {
    label: "Total orders",
    count: 10,
    totalAmount: "16.05K",
    icon: totalIcon,
    bgColor: "bg-gray-50",
    textColor: "text-orange-600",
    iconBg: "bg-yellow-100",
    isLarge: true,
  },
  {
    label: "In progress orders",
    count: 0,
    icon: progressReportIcon,
    bgColor: "bg-cyan-50",
    textColor: "text-blue-600",
    iconBg: "bg-teal-100",
    topRightIcon: RefreshCw,
    topRightIconColor: "text-teal-600",
    infoIcon: true,
  },
  {
    label: "On the way",
    count: 0,
    icon: onTheWayIcon,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    iconBg: "bg-blue-100",
    topRightIcon: Truck,
    topRightIconColor: "text-yellow-600",
  },
  {
    label: "Delivered Orders",
    count: 5,
    icon: deliveredIcon,
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    iconBg: "bg-green-100",
    topRightIcon: CheckCircle,
    topRightIconColor: "text-green-600",
  },
  {
    label: "Failed orders",
    count: 0,
    icon: failedIcon,
    bgColor: "bg-yellow-50",
    textColor: "text-orange-700",
    iconBg: "bg-yellow-100",
    topRightIcon: AlertTriangle,
    topRightIconColor: "text-red-600",
  },
  {
    label: "Refunded orders",
    count: 0,
    icon: refundedIcon,
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    iconBg: "bg-orange-100",
    topRightIcon: DollarSign,
    topRightIconColor: "text-red-600",
  },
  {
    label: "Canceled orders",
    count: 2,
    icon: canceledIcon,
    bgColor: "bg-pink-50",
    textColor: "text-red-600",
    iconBg: "bg-pink-100",
    topRightIcon: X,
    topRightIconColor: "text-red-600",
  },
]

export default function CampaignOrderReport() {
  const [searchQuery, setSearchQuery] = useState("")
  const [campaignFilter, setCampaignFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all-time")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredOrders = useMemo(() => {
    return mockCampaignOrders.filter((order) =>
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700"
      case "Canceled":
        return "bg-red-100 text-red-700"
      case "Pending":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Briefcase className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Food Campaign Order Report</h1>
      </div>

      {/* Search Data Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Search Data</span>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="flex-1 h-10 bg-white border-gray-200 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="All Campaignes" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaignes</SelectItem>
                  <SelectItem value="campaign1">Campaign 1</SelectItem>
                  <SelectItem value="campaign2">Campaign 2</SelectItem>
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

      {/* Campaign Order Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {campaignOrderStatusSummary.map((status, index) => {
          const TopRightIcon = status.topRightIcon
          return (
            <Card
              key={status.label}
              className={`border-gray-200 shadow-sm relative overflow-hidden ${status.bgColor} ${status.isLarge ? 'md:col-span-2' : ''}`}
            >
              <CardContent className="p-4">
                {status.isLarge ? (
                  // Total Orders Card (Special Large Layout)
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 rounded-full ${status.iconBg} flex items-center justify-center overflow-hidden`}>
                        <img
                          src={status.icon}
                          alt={status.label}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                    </div>
                    <div className={`text-4xl font-bold ${status.textColor} mb-2 text-center`}>
                      {status.count}
                    </div>
                    <div className="text-sm text-gray-700 mb-1 text-center font-medium">{status.label}</div>
                    <div className="text-sm text-gray-700 text-center">
                      Total order amount: $ {status.totalAmount}
                    </div>
                  </div>
                ) : (
                  // Other Status Cards
                  <div className="relative">
                    {/* Top Right Icon */}
                    {TopRightIcon && (
                      <div className="absolute top-0 right-0">
                        <div className={`w-8 h-8 rounded-full ${status.iconBg} flex items-center justify-center`}>
                          <TopRightIcon className={`h-4 w-4 ${status.topRightIconColor}`} />
                        </div>
                      </div>
                    )}
                    
                    {/* Icon (if exists) */}
                    {status.icon && (
                      <div className="mb-3">
                        <div className={`w-10 h-10 rounded-full ${status.iconBg} flex items-center justify-center overflow-hidden`}>
                          <img
                            src={status.icon}
                            alt={status.label}
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Value */}
                    <div className={`text-3xl font-bold ${status.textColor} mb-2`}>
                      {status.count}
                    </div>
                    
                    {/* Label with Info Icon */}
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm text-gray-700 font-medium">{status.label}</div>
                      {status.infoIcon && (
                        <Info className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
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
                    Discounted Amount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">Tax</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Delivery Charge
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Order Amount
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Amount Received By
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Payment Method</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Order Status</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
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
                    <TableCell>
                      {order.hasInvalidCustomer ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                          Invalid Customer Data
                        </span>
                      ) : (
                        <span className="text-sm text-gray-700">{order.customerName}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-gray-900">
                          {formatCurrencyFull(order.totalItemAmount)}
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
                      {formatCurrencyFull(order.discountedAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.tax)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 text-right">
                      {formatCurrencyFull(order.deliveryCharge)}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(order.orderAmount)}
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
                    <TableCell className="text-sm text-gray-700">
                      {order.amountReceivedBy}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {order.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-600 hover:text-green-600 hover:bg-green-50"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
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

