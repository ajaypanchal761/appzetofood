import { Link } from "react-router-dom"

import { Package, Clock, MapPin, ArrowRight, ArrowLeft } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import ScrollReveal from "../../components/ScrollReveal"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOrders } from "../../context/OrdersContext"

export default function Orders() {
  const { getAllOrders } = useOrders()
  const orders = getAllOrders()

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500"
      case "preparing":
        return "bg-primary-orange"
      case "outForDelivery":
        return "bg-orange-500"
      case "delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "outForDelivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (orders.length === 0) {
    return (
      <AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/user">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Orders</h1>
          </div>
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-base sm:text-lg mb-4">You haven't placed any orders yet</p>
              <Link to="/user">
                <Button className="bg-gradient-to-r bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base">
                  Start Ordering
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        <ScrollReveal>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/user">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-white">My Orders</h1>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {orders.map((order, index) => (
            <ScrollReveal key={order.id} delay={index * 0.1}>
              <Card className="dark:bg-[#1a1a1a] dark:border-gray-800 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                      <CardTitle className="text-base md:text-lg dark:text-white">Order {order.id}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white text-xs md:text-sm`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 flex-1 flex flex-col">
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <Clock className="h-4 w-4 md:h-5 md:w-5" />
                      <span>Placed on {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                      <span>{order.address?.city}, {order.address?.state}</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <p className="text-sm md:text-base font-semibold dark:text-gray-200">Items ({order.items.length}):</p>
                    <div className="space-y-1 md:space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                          <span>• {item.name} × {item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm md:text-base text-muted-foreground">
                          + {order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 pt-4 md:pt-6 border-t dark:border-gray-700 mt-auto">
                    <div>
                      <p className="text-sm md:text-base text-muted-foreground">Total</p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link to={`/user/orders/${order.id}`} className="flex-1 sm:flex-initial">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto flex items-center gap-1 text-xs md:text-sm">
                          Track Order
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/user/orders/${order.id}/invoice`} className="flex-1 sm:flex-initial">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                          Invoice
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </AnimatedPage>
  )
}
