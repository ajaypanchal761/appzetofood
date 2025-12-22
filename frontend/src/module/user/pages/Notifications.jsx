import { Link } from "react-router-dom"
import { ArrowLeft, Bell, CheckCircle2, Clock, Tag, Gift, AlertCircle } from "lucide-react"
import AnimatedPage from "../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock notification data
const notifications = [
  {
    id: 1,
    type: "order",
    title: "Order Confirmed",
    message: "Your order #12345 has been confirmed and is being prepared",
    time: "2 minutes ago",
    read: false,
    icon: CheckCircle2,
    iconColor: "text-green-600"
  },
  {
    id: 2,
    type: "offer",
    title: "Special Offer",
    message: "Get 50% off on your next order above ₹500",
    time: "1 hour ago",
    read: false,
    icon: Tag,
    iconColor: "text-red-600"
  },
  {
    id: 3,
    type: "promotion",
    title: "New Restaurant Added",
    message: "Check out the new Italian restaurant in your area",
    time: "3 hours ago",
    read: true,
    icon: Gift,
    iconColor: "text-blue-600"
  },
  {
    id: 4,
    type: "order",
    title: "Order Delivered",
    message: "Your order #12340 has been delivered successfully",
    time: "Yesterday",
    read: true,
    icon: CheckCircle2,
    iconColor: "text-green-600"
  },
  {
    id: 5,
    type: "alert",
    title: "Payment Failed",
    message: "Your payment for order #12338 failed. Please try again",
    time: "2 days ago",
    read: true,
    icon: AlertCircle,
    iconColor: "text-orange-600"
  },
  {
    id: 6,
    type: "offer",
    title: "Weekend Special",
    message: "Enjoy free delivery on all orders this weekend",
    time: "3 days ago",
    read: true,
    icon: Tag,
    iconColor: "text-red-600"
  }
]

export default function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AnimatedPage className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <Link to="/user">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 fill-red-600" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <Card
                key={notification.id}
                className={`relative cursor-pointer transition-all duration-200 py-1 hover:shadow-md ${
                  !notification.read ? "bg-red-50/50 border-red-200" : "bg-white border-gray-200"
                }`}
              >
                {/* Unread Dot - Top Right */}
                {!notification.read && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full" />
                )}
                
                <CardContent className="p-3">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                      notification.type === "order" ? "bg-green-100" :
                      notification.type === "offer" ? "bg-red-100" :
                      notification.type === "promotion" ? "bg-blue-100" :
                      "bg-orange-100"
                    }`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${notification.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-semibold mb-1 ${
                        !notification.read ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}

