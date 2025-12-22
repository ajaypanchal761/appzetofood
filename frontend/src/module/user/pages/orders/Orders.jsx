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
    <AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/user">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Orders</h1>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <ScrollReveal key={order.id} delay={index * 0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-green-600" />
                      <CardTitle>Order {order.id}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Placed on {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{order.address?.city}, {order.address?.state}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Items ({order.items.length}):</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>• {item.name} × {item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          + {order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/user/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          Track Order
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/user/orders/${order.id}/invoice`}>
                        <Button variant="outline" size="sm">
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
