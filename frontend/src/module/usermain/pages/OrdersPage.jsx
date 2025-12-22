import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  Home,
  Heart,
  ShoppingBag,
  Menu,
  ChefHat
} from "lucide-react"

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('usermain_orders')
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders)
        setOrders(parsedOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }
  }, [])

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <div className="min-h-screen bg-[#f6e9dc] pb-20 md:pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 rounded-b-3xl">
        <div className="px-4 py-2.5 md:py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-800" />
          </button>
          <h1 className="text-base md:text-lg font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">No orders yet</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-4">Your orders will appear here</p>
            <button
              onClick={() => navigate('/usermain')}
              className="text-[#ff8100] text-xs md:text-sm font-semibold"
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 md:py-4 space-y-2.5 md:space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-3 md:p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-0.5 md:mb-1 truncate">Order #{order.id}</h3>
                  <p className="text-[10px] md:text-xs text-gray-600 truncate">{order.restaurant || "Restaurant"}</p>
                </div>
                <div className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ml-2 flex-shrink-0 ${
                  order.status === "Delivered" 
                    ? "bg-green-100 text-green-700"
                    : order.status === "Preparing"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {order.status}
                </div>
              </div>

              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3">
                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                <span className="truncate">{formatDate(order.date)} at {order.time}</span>
              </div>

              <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-600">{order.items} items</p>
                  <p className="text-sm md:text-base font-bold text-gray-900">${order.total.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => navigate(`/usermain/orders/${order.id}`)}
                  className="text-[#ff8100] text-[10px] md:text-xs font-semibold ml-2 flex-shrink-0 hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2 px-4">
          <button 
            onClick={() => navigate('/usermain')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-[#ff8100] transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs text-gray-600 font-medium">Home</span>
          </button>
          <button 
            onClick={() => navigate('/usermain/wishlist')}
            className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-[#ff8100] transition-colors"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs text-gray-600 font-medium">Wishlist</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 -mt-8">
            <div className="bg-white rounded-full p-3 shadow-lg border-2 border-gray-200">
              <ChefHat className="w-6 h-6 text-gray-600" />
            </div>
          </button>
          <button 
            onClick={() => navigate('/usermain/orders')}
            className="flex flex-col items-center gap-1 p-2 text-[#ff8100]"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs text-[#ff8100] font-medium">Orders</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-600">
            <Menu className="w-6 h-6" />
            <span className="text-xs text-gray-600 font-medium">Menu</span>
          </button>
        </div>
      </div>
    </div>
  )
}

