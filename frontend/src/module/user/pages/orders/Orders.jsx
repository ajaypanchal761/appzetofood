import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Search, MoreVertical, ChevronRight, Star, RotateCcw, AlertCircle, Loader2 } from "lucide-react"
import { orderAPI, api, API_ENDPOINTS } from "@/lib/api"
import { toast } from "sonner"

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingModal, setRatingModal] = useState({ open: false, order: null })
  const [activeMenuOrderId, setActiveMenuOrderId] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [submittingRating, setSubmittingRating] = useState(false)

  // Get order status text
  const getOrderStatus = (order) => {
    const status = order.status
    if (status === 'delivered' || status === 'completed') return 'delivered'
    if (status === 'out_for_delivery' || status === 'outForDelivery') return 'outForDelivery'
    if (status === 'ready') return 'preparing'
    if (status === 'preparing') return 'preparing'
    if (status === 'confirmed') return 'confirmed'
    return status || 'confirmed'
  }

  // Fetch orders from backend API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        
        const response = await orderAPI.getOrders({
          limit: 100, // Get all orders
          page: 1
        })
        
        // Check multiple possible response structures
        let ordersData = []
        
        if (response?.data?.success && response?.data?.data?.orders) {
          ordersData = response.data.data.orders || []
        } else if (response?.data?.orders) {
          ordersData = response.data.orders || []
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data || []
        } else {
          setOrders([])
          return
        }
        
        if (ordersData.length > 0) {
          // Transform API orders to match UI structure
          const transformedOrders = ordersData.map(order => {
            const createdAt = order.createdAt ? new Date(order.createdAt) : new Date()
            
            // Check if cancelled by restaurant
            const isCancelled = order.status === 'cancelled'
            const cancellationReason = order.cancellationReason || ''
            const isRestaurantCancelled = isCancelled && (
              /rejected by restaurant|restaurant rejected|restaurant cancelled|restaurant is too busy|item not available|outside delivery area|kitchen closing|technical issue/i.test(cancellationReason)
            )

            return {
              id: order.orderId || order._id?.toString() || `ORD-${order._id}`,
              mongoId: order._id,
              status: isRestaurantCancelled ? 'restaurant_cancelled' : getOrderStatus(order),
              createdAt: createdAt.toISOString(),
              address: order.address || {},
              items: order.items || [],
              total: order.pricing?.total || order.total || 0,
              subtotal: order.pricing?.subtotal || 0,
              deliveryFee: order.pricing?.deliveryFee || 0,
              tax: order.pricing?.tax || 0,
              payment: order.payment || {},
              restaurant: order.restaurantId?.name || order.restaurantName || 'Restaurant',
              restaurantId: order.restaurantId?._id || order.restaurantId,
              restaurantImage: order.restaurantId?.profileImage?.url || order.restaurantId?.profileImage || null,
              restaurantLocation: order.restaurantId?.location?.area || order.restaurantId?.location?.city || order.address?.city || '',
              rating: order.rating || null,
              tracking: order.tracking || {},
              cancellationReason: cancellationReason,
              isRestaurantCancelled: isRestaurantCancelled
            }
          })
          
          // Sort by date (newest first)
          transformedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setOrders(transformedOrders)
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error('Error fetching user orders:', error)
        let errorMessage = 'Failed to load orders'
        if (error?.response?.status === 401) {
          errorMessage = 'Please login to view your orders'
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        toast.error(errorMessage)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    
    return `${day} ${month}, ${displayHours}:${minutes}${ampm}`
  }

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    const restaurantMatch = order.restaurant?.toLowerCase().includes(query)
    const itemsMatch = order.items.some(item => 
      (item.name || item.foodName || '').toLowerCase().includes(query)
    )
    
    return restaurantMatch || itemsMatch
  })

  // Handle reorder
  const handleReorder = (order) => {
    // Navigate to restaurant page or cart
    if (order.restaurantId) {
      navigate(`/user/restaurants/${order.restaurantId}`)
    } else {
      toast.info('Restaurant information not available')
    }
  }

  // Three-dots menu handlers
  const toggleMenuForOrder = (orderId) => {
    setActiveMenuOrderId((current) => (current === orderId ? null : orderId))
  }

  const handleShareRestaurant = async (order) => {
    const location =
      order.restaurantLocation ||
      `${order.address?.city || ""}, ${order.address?.state || ""}`.trim()

    const shareText = `Check out ${order.restaurant} on Appzeto Food.
Location: ${location || "Location not available"}
Order again from this restaurant in the Appzeto app.`

    try {
      if (navigator.share) {
        await navigator.share({
          title: order.restaurant,
          text: shareText,
        })
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText)
        toast.success("Restaurant details copied to clipboard")
      } else {
        toast.info("Sharing is not supported on this device")
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Error sharing restaurant:", error)
        toast.error("Failed to share restaurant")
      }
    } finally {
      setActiveMenuOrderId(null)
    }
  }

  const handleViewOrderDetails = (order) => {
    setActiveMenuOrderId(null)
    navigate(`/user/orders/${order.id}/details`)
  }

  // Open rating modal for an order
  const handleOpenRating = (order) => {
    setRatingModal({ open: true, order })
    setSelectedRating(order.rating || null)
    setFeedbackText("")
  }

  const handleCloseRating = () => {
    setRatingModal({ open: false, order: null })
    setSelectedRating(null)
    setFeedbackText("")
  }

  // Submit rating & feedback to backend
  const handleSubmitRating = async () => {
    if (!ratingModal.order || selectedRating === null) {
      toast.error("Please select a rating first")
      return
    }

    try {
      setSubmittingRating(true)

      const order = ratingModal.order

      await api.post(API_ENDPOINTS.ADMIN.FEEDBACK_EXPERIENCE_CREATE, {
        rating: selectedRating,
        module: "user",
        restaurantId: order.restaurantId || null,
        metadata: {
          orderId: order.id,
          orderMongoId: order.mongoId,
          orderTotal: order.total,
          restaurantName: order.restaurant,
          comment: feedbackText || undefined,
        },
      })

      // Update local state so UI shows "You rated"
      setOrders(prev =>
        prev.map(o =>
          o.id === order.id ? { ...o, rating: selectedRating } : o
        )
      )

      toast.success("Thanks for rating your order!")
      handleCloseRating()
    } catch (error) {
      console.error("Error submitting order rating:", error)
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit rating. Please try again."
      )
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
          <Link to="/user">
            <ArrowLeft className="w-6 h-6 text-gray-700 cursor-pointer" />
          </Link>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">Your Orders</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
          <Link to="/user">
            <ArrowLeft className="w-6 h-6 text-gray-700 cursor-pointer" />
          </Link>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">Your Orders</h1>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-gray-600">You haven't placed any orders yet</p>
          <Link to="/user">
            <button className="mt-4 text-red-500 font-medium">Start Ordering</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <Link to="/user">
          <ArrowLeft className="w-6 h-6 text-gray-700 cursor-pointer" />
        </Link>
        <h1 className="ml-4 text-xl font-semibold text-gray-800">Your Orders</h1>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white mt-1">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Search className="w-5 h-5 text-red-500" />
          <input 
            type="text" 
            placeholder="Search by restaurant or dish" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-3 outline-none text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 py-2 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-600">No orders found matching your search</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const paymentFailed = order.payment?.status === 'failed' || order.payment?.status === 'pending'
            const isDelivered = order.status === 'delivered'
            const isRestaurantCancelled = order.isRestaurantCancelled || order.status === 'restaurant_cancelled'
            const isCancelled = order.status === 'cancelled' || order.status === 'restaurant_cancelled'
            // Prefer food image from first item; fallback to restaurant image, then generic food photo
            const firstItemImage = order.items?.[0]?.image
            const restaurantImage = firstItemImage 
              || order.restaurantImage 
              || "https://images.unsplash.com/photo-1604908176997-125188eb3c52?auto=format&fit=crop&w=200&q=80"
            const location = order.restaurantLocation || `${order.address?.city || ''}, ${order.address?.state || ''}`.trim() || 'Location not available'

            return (
              <div key={order.id} className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Card Header: Restaurant Info */}
                <div className="flex items-start justify-between p-4 pb-2">
                  <div className="flex gap-3">
                    {/* Restaurant Image */}
                    <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={restaurantImage} 
                        alt={order.restaurant} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=100&q=80"
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-lg leading-tight">{order.restaurant}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{location}</p>
                      {order.restaurantId && (
                        <Link to={`/user/restaurants/${order.restaurantId}`}>
                          <button className="text-xs text-red-500 font-medium flex items-center mt-1">
                            View menu <span className="ml-0.5">▸</span>
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => toggleMenuForOrder(order.id)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Three-dots dropdown menu */}
                {activeMenuOrderId === order.id && (
                  <div className="absolute right-3 top-10 z-20 w-40 rounded-xl bg-white shadow-lg border border-gray-100 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleShareRestaurant(order)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-800"
                    >
                      Share restaurant
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewOrderDetails(order)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-800"
                    >
                      Order details
                    </button>
                  </div>
                )}

                {/* Separator */}
                <div className="border-t border-dashed border-gray-200 mx-4 my-1"></div>

                {/* Items List */}
                <div className="px-4 py-2">
                  {order.items.map((item, idx) => {
                    const isVeg = item.isVeg !== undefined ? item.isVeg : (item.category === 'veg' || item.type === 'veg')
                    return (
                      <div key={item._id || item.id || idx} className="flex items-center gap-2 mt-1">
                        {/* Veg/Non-Veg Icon */}
                        <div className={`w-4 h-4 border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[2px] flex-shrink-0`}>
                          <div className={`w-full h-full rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {item.quantity || 1} x {item.name || item.foodName || 'Item'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Date and Price */}
                <div className="px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Order placed on {formatDate(order.createdAt)}</p>
                    {isDelivered && !paymentFailed && (
                      <p className="text-xs font-medium text-gray-500 mt-1">Delivered</p>
                    )}
                    {isRestaurantCancelled && (
                      <p className="text-xs font-medium text-red-500 mt-1">Restaurant Cancelled</p>
                    )}
                    {isCancelled && !isRestaurantCancelled && (
                      <p className="text-xs font-medium text-gray-500 mt-1">Cancelled</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-800">₹{order.total.toFixed(2)}</span>
                    <Link to={`/user/orders/${order.id}`}>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-1 cursor-pointer" />
                    </Link>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-100 mx-4"></div>

                {/* Card Footer: Actions */}
                <div className="px-4 py-3 flex items-center justify-between">
                  {/* Left Side: Rating or Error */}
                  {isRestaurantCancelled ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-100 p-1 rounded-full">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-xs font-semibold text-red-500">Restaurant Cancelled</span>
                      </div>
                      <p className="text-xs text-gray-600 ml-7">Refund will be processed in 24-48 hours</p>
                    </div>
                  ) : paymentFailed ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 p-1 rounded-full">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-xs font-semibold text-red-500">Payment failed</span>
                    </div>
                  ) : isDelivered && order.rating ? (
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-800">You rated</span>
                        <div className="flex bg-yellow-400 text-white px-1 rounded text-[10px] items-center gap-0.5 h-4">
                          {order.rating}<Star className="w-2 h-2 fill-current" />
                        </div>
                      </div>
                    </div>
                  ) : isDelivered ? (
                    <div>
                      <p className="text-xs text-gray-500">Order delivered</p>
                      <button
                        type="button"
                        onClick={() => handleOpenRating(order)}
                        className="text-xs text-red-500 font-medium mt-0.5 flex items-center"
                      >
                        Rate order <span className="ml-0.5">▸</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500">{order.status === 'preparing' ? 'Preparing' : order.status === 'outForDelivery' ? 'Out for delivery' : 'Order confirmed'}</p>
                    </div>
                  )}

                  {/* Right Side: Reorder Button */}
                  {isDelivered && !paymentFailed && (
                    <button 
                      onClick={() => handleReorder(order)}
                      className="bg-[#E23744] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Branding */}
      <div className="flex justify-center mt-8 mb-4">
        <h1 className="text-4xl font-black text-gray-200 tracking-tighter italic">appzeto</h1>
      </div>

      {/* Rating & Feedback Modal */}
      {ratingModal.open && ratingModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Rate your order
              </h2>
              <button
                type="button"
                onClick={handleCloseRating}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              {ratingModal.order.restaurant} • Order #{ratingModal.order.id}
            </p>

            {/* Star rating (1–5) */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">
                How was your overall experience?
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => {
                  const isActive = (selectedRating || 0) >= num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedRating(num)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isActive
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-red-500">Very Bad</span>
                <span className="text-[10px] text-green-600">Excellent</span>
              </div>
            </div>

            {/* Feedback textarea */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">
                Tell us more (optional)
              </p>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                placeholder="What did you like or dislike about this order?"
              />
            </div>

            <button
              type="button"
              disabled={submittingRating}
              onClick={handleSubmitRating}
              className="w-full rounded-lg bg-[#E23744] text-white text-sm font-semibold py-2.5 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submittingRating ? "Submitting..." : "Submit rating"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
