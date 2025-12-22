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
  Calendar,
  Search,
  Eye,
  ArrowUpDown,
  Info,
} from "lucide-react"
import Footer from "../components/Footer"

// Mock subscription orders data
const subscriptionOrders = [
  {
    id: 1,
    orderId: 100102,
    customer: "Hshsgs Gsvsgs",
    type: "Daily",
    status: "Expired",
    startDate: "2023-05-31",
    expireDate: "2023-06-07",
  },
  {
    id: 2,
    orderId: 100101,
    customer: "Fnhg Vjjh",
    type: "Daily",
    status: "Expired",
    startDate: "2023-05-31",
    expireDate: "2023-06-14",
  },
  {
    id: 3,
    orderId: 100100,
    customer: "Fnhg Vjjh",
    type: "Daily",
    status: "Expired",
    startDate: "2023-05-31",
    expireDate: "2023-06-14",
  },
  {
    id: 4,
    orderId: 100098,
    customer: "Fufh Cgchc",
    type: "Daily",
    status: "Expired",
    startDate: "2023-05-31",
    expireDate: "2023-06-14",
  },
  {
    id: 5,
    orderId: 100097,
    customer: "Fufh Cgchc",
    type: "Daily",
    status: "Expired",
    startDate: "2023-05-31",
    expireDate: "2023-06-14",
  },
]

export default function SubscriptionOrders() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredOrders = subscriptionOrders.filter((order) =>
    order.orderId.toString().includes(searchQuery)
  )

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">Subscribed Orders</h1>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {filteredOrders.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* See how it works link */}
          <a
            href="#"
            className="text-primary-orange hover:text-primary-orange/80 text-sm font-medium flex items-center gap-1"
          >
            See how it works
            <Info className="h-4 w-4" />
          </a>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by Order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 w-64 h-9 text-sm bg-white border-gray-200"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" />
          </div>
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
                      #
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Order Id
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Customer
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Type
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Start Date
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Expire Date
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm text-gray-700">{order.id}</TableCell>
                    <TableCell className="text-sm">
                      <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        {order.orderId}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{order.customer}</TableCell>
                    <TableCell className="text-sm text-gray-700">{order.type}</TableCell>
                    <TableCell className="text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{order.startDate}</TableCell>
                    <TableCell className="text-sm text-gray-700">{order.expireDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}
