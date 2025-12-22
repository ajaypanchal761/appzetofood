import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
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
  DollarSign,
  Search,
  Download,
  ChevronDown,
  Eye,
  Printer,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Footer from "../components/Footer"

// Status configuration matching sidebar counts
const statusConfig = {
  "all": { count: 67, title: "All Orders" },
  "pending": { count: 35, title: "Pending Orders" },
  "confirmed": { count: 2, title: "Confirmed Orders" },
  "accepted": { count: 1, title: "Accepted Orders" },
  "cooking": { count: 0, title: "Cooking Orders" },
  "ready-for-delivery": { count: 1, title: "Ready For Delivery" },
  "food-on-the-way": { count: 1, title: "Food On The Way" },
  "delivered": { count: 25, title: "Delivered Orders" },
  "dine-in": { count: 0, title: "Dine In Orders" },
  "refunded": { count: 0, title: "Refunded Orders" },
  "refund-requested": { count: 2, title: "Refund Requested" },
  "scheduled": { count: 1, title: "Scheduled Orders" },
  "payment-failed": { count: 0, title: "Payment Failed" },
  "canceled": { count: 4, title: "Canceled Orders" },
}

// Generate mock data for all orders based on status
const generateMockOrders = () => {
  const customers = [
    "Spencer Hastings",
    "Jane Doe",
    "John Doe",
    "Alice Smith",
    "Bob Johnson",
    "Charlie Brown",
    "Diana Prince",
    "Edward Norton",
    "Fiona Apple",
    "George Washington",
    "Henry Ford",
    "Isabella Swan",
    "Jack Sparrow",
    "Kate Winslet",
    "Liam Neeson",
  ]

  const allOrders = []
  let orderId = 100165

  // Generate orders for each status based on counts
  Object.entries(statusConfig).forEach(([status, config]) => {
    if (status === "all") return // Skip "all" as it's a combination

    const count = config.count
    const statusMap = {
      "pending": { label: "Pending", color: "bg-yellow-100 text-yellow-700", type: "Delivery" },
      "confirmed": { label: "Confirmed", color: "bg-blue-100 text-blue-700", type: "Take Away" },
      "accepted": { label: "Accepted", color: "bg-blue-100 text-blue-700", type: "Delivery" },
      "cooking": { label: "Cooking", color: "bg-orange-100 text-orange-700", type: "Take Away" },
      "ready-for-delivery": { label: "Ready For Delivery", color: "bg-blue-100 text-blue-700", type: "Delivery" },
      "food-on-the-way": { label: "Food On The Way", color: "bg-blue-100 text-blue-700", type: "Delivery" },
      "delivered": { label: "Delivered", color: "bg-green-100 text-green-700", type: "Delivery" },
      "dine-in": { label: "Dine In", color: "bg-purple-100 text-purple-700", type: "Dine In" },
      "refunded": { label: "Refunded", color: "bg-red-100 text-red-700", type: "Delivery" },
      "refund-requested": { label: "Refund Requested", color: "bg-red-100 text-red-700", type: "Delivery" },
      "scheduled": { label: "Scheduled", color: "bg-blue-100 text-blue-700", type: "Delivery" },
      "payment-failed": { label: "Payment Failed", color: "bg-gray-100 text-gray-700", type: "Delivery" },
      "canceled": { label: "Canceled", color: "bg-green-100 text-green-700", type: "Take Away" },
    }

    const statusInfo = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-700", type: "Delivery" }

    for (let i = 0; i < count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const isPaid = status === "delivered" || status === "canceled" ? Math.random() > 0.2 : Math.random() > 0.4
      const isPOS = Math.random() > 0.85
      const amount = (Math.random() * 2000 + 100).toFixed(2)
      
      // Generate random date within last 6 months
      const daysAgo = Math.floor(Math.random() * 180)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      const dateStr = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

      allOrders.push({
        id: orderId--,
        orderId: `${orderId + 1}${isPOS ? " (POS)" : ""}`,
        date: `${dateStr} ${timeStr}`,
        customer: customer,
        phone: `+8${"*".repeat(9)}`,
        amount: parseFloat(amount),
        isPaid,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        deliveryType: statusInfo.type,
        statusKey: status,
      })
    }
  })

  // Shuffle orders to mix them up
  return allOrders.sort(() => Math.random() - 0.5)
}

export default function Orders() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get("status") || "all"
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const rowsPerPage = 20

  const allOrders = useMemo(() => generateMockOrders(), [])

  // Filter orders based on status and search
  const filteredOrders = useMemo(() => {
    let filtered = allOrders

    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter((order) => order.statusKey === status)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [allOrders, status, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [status, searchQuery])

  const pageTitle = statusConfig[status]?.title || "All Orders"
  const totalCount = filteredOrders.length

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Ex : Search by Order Id"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 w-64 h-9 text-sm bg-white border-gray-200"
            />
          </div>

          {/* Export Button */}
          <Button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-9 px-4">
            <Download className="h-4 w-4 mr-2" />
            Export
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    SI
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    Order ID
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    Order Date
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    Customer Information
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    Total Amount
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    Order Status
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order, index) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-700">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="text-gray-900 font-medium">{order.id}</span>
                      {order.orderId.includes("(POS)") && (
                        <span className="text-primary-orange ml-1">(POS)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{order.date}</TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <div className="text-gray-900 font-medium">{order.customer}</div>
                        <div className="text-gray-500 text-xs">{order.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <div className="text-gray-900 font-semibold">
                          $ {order.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div
                          className={`text-xs font-medium ${
                            order.isPaid ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                        >
                          {order.status} {order.deliveryType}
                        </span>
                        <div className="text-gray-500 text-xs mt-1">{order.deliveryType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary-orange hover:bg-orange-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 ${
                          currentPage === page
                            ? "bg-primary-orange text-white hover:bg-primary-orange/90"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <Footer />
    </div>
  )
}
