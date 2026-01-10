import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Lenis from "lenis"
import { getOrderStatus, normalizeStatus, matchesTabFilter, ORDER_STATUS } from "../utils/orderStatus"
import { getWalletState, calculateBalances, getOrderPaymentAmount } from "../utils/walletState"
import { getUnreadNotificationCount } from "../utils/notifications"
import { formatCurrency, usdToInr } from "../utils/currency"
import {
  Home,
  ShoppingBag,
  Store,
  Wallet,
  Menu,
  Wallet as WalletIcon,
  UtensilsCrossed,
  Megaphone,
  CheckCircle,
  ChevronDown,
  Bell,
  CheckSquare,
  ArrowLeft,
  User,
  Utensils,
  Settings,
  Monitor,
  Plus,
  Grid3x3,
  Tag,
  FileText,
  MessageSquare,
  Shield,
  Globe,
  MessageCircle,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import BottomNavbar from "../components/BottomNavbar"
import MenuOverlay from "../components/MenuOverlay"
import RestaurantNavbar from "../components/RestaurantNavbar"
import { restaurantAPI } from "@/lib/api"
import { AlertCircle, X } from "lucide-react"

export default function RestaurantHome() {
  const navigate = useNavigate()
  const [activeOrderTab, setActiveOrderTab] = useState("pending")
  const [showTimeFilter, setShowTimeFilter] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All")
  const [showMenu, setShowMenu] = useState(false)
  const timeFilterRef = useRef(null)
  const [walletState, setWalletState] = useState(() => getWalletState())
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(() => getUnreadNotificationCount())
  const [restaurantStatus, setRestaurantStatus] = useState({
    isActive: null,
    rejectionReason: null,
    onboarding: null,
    isLoading: true
  })


  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Fetch restaurant verification status
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const response = await restaurantAPI.getCurrentRestaurant()
        const restaurant = response?.data?.data?.restaurant || response?.data?.restaurant
        if (restaurant) {
          setRestaurantStatus({
            isActive: restaurant.isActive,
            rejectionReason: restaurant.rejectionReason || null,
            onboarding: restaurant.onboarding || null,
            isLoading: false
          })
        }
      } catch (error) {
        console.error("Error fetching restaurant status:", error)
        setRestaurantStatus(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchRestaurantStatus()

    // Listen for restaurant profile updates
    const handleProfileRefresh = () => {
      fetchRestaurantStatus()
    }

    window.addEventListener('restaurantProfileRefresh', handleProfileRefresh)

    return () => {
      window.removeEventListener('restaurantProfileRefresh', handleProfileRefresh)
    }
  }, [])

  // Refresh wallet state when it updates
  useEffect(() => {
    const refreshWalletState = () => {
      setWalletState(getWalletState())
      setUnreadNotificationCount(getUnreadNotificationCount())
    }

    refreshWalletState()

    // Listen for wallet state updates
    window.addEventListener('walletStateUpdated', refreshWalletState)

    return () => {
      window.removeEventListener('walletStateUpdated', refreshWalletState)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target)) {
        setShowTimeFilter(false)
      }
    }

    if (showTimeFilter) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [showTimeFilter])

  const timeFilterOptions = ["All", "Today", "This Week", "This Month"]

  // Base orders data (static order information)
  const baseOrders = [
    {
      id: 100160,
      items: 1,
      timeAgo: "7 months ago",
      deliveryType: "Home Delivery",
      amount: 1402.49
    },
    {
      id: 100147,
      items: 1,
      timeAgo: "7 months ago",
      deliveryType: "Home Delivery",
      amount: 1200.00
    },
    {
      id: 100148,
      items: 2,
      timeAgo: "5 months ago",
      deliveryType: "Home Delivery",
      amount: 850.50
    },
    {
      id: 100149,
      items: 3,
      timeAgo: "3 months ago",
      deliveryType: "Pickup",
      amount: 650.25
    },
    {
      id: 100150,
      items: 1,
      timeAgo: "2 months ago",
      deliveryType: "Home Delivery",
      amount: 450.00
    },
    {
      id: 100151,
      items: 2,
      timeAgo: "1 month ago",
      deliveryType: "Home Delivery",
      amount: 750.75
    },
    {
      id: 100152,
      items: 1,
      timeAgo: "2 weeks ago",
      deliveryType: "Home Delivery",
      amount: 350.50
    }
  ]

  // Enrich orders with actual status and amount from localStorage/wallet
  const [allOrders, setAllOrders] = useState(() => {
    return baseOrders.map(order => {
      const actualStatus = getOrderStatus(order.id)
      // Get payment amount from wallet if order is paid
      const paymentAmount = getOrderPaymentAmount(order.id)
      return {
        ...order,
        status: actualStatus,
        // Use payment amount if available, otherwise use base amount
        amount: paymentAmount !== null ? paymentAmount : order.amount
      }
    })
  })

  // Refresh orders when component mounts or when returning from order details
  useEffect(() => {
    const refreshOrders = () => {
      setAllOrders(baseOrders.map(order => {
        const actualStatus = getOrderStatus(order.id)
        // Get payment amount from wallet if order is paid
        const paymentAmount = getOrderPaymentAmount(order.id)
        return {
          ...order,
          status: actualStatus,
          // Use payment amount if available, otherwise use base amount
          amount: paymentAmount !== null ? paymentAmount : order.amount
        }
      }))
    }

    refreshOrders()

    // Listen for storage changes (when order status is updated in OrderDetails)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('order_status_')) {
        refreshOrders()
      }
    }

    // Listen for custom event (for same-tab updates)
    const handleOrderStatusUpdate = () => {
      refreshOrders()
    }

    // Refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshOrders()
      }
    }

    // Refresh when window gains focus (user returns to window)
    const handleFocus = () => {
      refreshOrders()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Filter orders based on active tab using actual status
  const filteredOrders = allOrders.filter(order => {
    return matchesTabFilter(order.status, activeOrderTab)
  })

  // Count orders per status using actual status
  const orderCounts = {
    pending: allOrders.filter(o => matchesTabFilter(o.status, "pending")).length,
    confirmed: allOrders.filter(o => matchesTabFilter(o.status, "confirmed")).length,
    cooking: allOrders.filter(o => matchesTabFilter(o.status, "cooking")).length,
    ready: allOrders.filter(o => matchesTabFilter(o.status, "ready")).length,
    onway: allOrders.filter(o => matchesTabFilter(o.status, "onway")).length
  }

  return (
    <div className="min-h-screen bg-[#f6e9dc] overflow-x-hidden">
      {/* Top Bar */}
      <RestaurantNavbar />
      {/* Main Content */}
      <div className="px-4 py-6 pb-24 md:pb-6">
        {/* Verification Status Banner - Show if onboarding is complete (all 4 steps) and restaurant is not active */}
        {!restaurantStatus.isLoading && 
         !restaurantStatus.isActive && 
         restaurantStatus.onboarding?.completedSteps === 4 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 rounded-xl p-4 md:p-5 border ${
              restaurantStatus.rejectionReason
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 rounded-full p-2 ${
                restaurantStatus.rejectionReason
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  restaurantStatus.rejectionReason
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                {restaurantStatus.rejectionReason ? (
                  <>
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      Verification Rejected
                    </h3>
                    <div className="bg-white border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-red-800 mb-2">
                        Reason for Rejection:
                      </p>
                      <div className="text-sm text-red-700 whitespace-pre-wrap">
                        {restaurantStatus.rejectionReason}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <Button
                        onClick={async () => {
                          try {
                            setRestaurantStatus(prev => ({ ...prev, isLoading: true }))
                            await restaurantAPI.reverify()
                            alert('Restaurant reverified successfully! Verification will be done in 24 hours.')
                            // Refresh restaurant status
                            const response = await restaurantAPI.getCurrentRestaurant()
                            const restaurant = response?.data?.data?.restaurant || response?.data?.restaurant
                            if (restaurant) {
                              setRestaurantStatus({
                                isActive: restaurant.isActive,
                                rejectionReason: restaurant.rejectionReason || null,
                                onboarding: restaurant.onboarding || null,
                                isLoading: false
                              })
                            }
                            // Trigger profile refresh event
                            window.dispatchEvent(new Event('restaurantProfileRefresh'))
                          } catch (error) {
                            // Don't log network/timeout errors (backend might be down)
                            if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNABORTED' && !error.message?.includes('timeout')) {
                              console.error("Error reverifying restaurant:", error)
                            }
                            
                            // Handle 401 Unauthorized errors (token expired/invalid)
                            if (error.response?.status === 401) {
                              const errorMessage = error.response?.data?.message || 'Your session has expired. Please login again.'
                              alert(errorMessage)
                              // The axios interceptor should handle redirecting to login
                              // But if it doesn't, we can manually redirect
                              if (!error.response?.data?.message?.includes('inactive')) {
                                // Only redirect if it's not an "inactive" error (which we handle differently)
                                setTimeout(() => {
                                  window.location.href = '/restaurant/login'
                                }, 1500)
                              }
                            } else {
                              // Other errors (400, 500, etc.)
                              const errorMessage = error.response?.data?.message || "Failed to reverify restaurant. Please try again."
                              alert(errorMessage)
                            }
                            setRestaurantStatus(prev => ({ ...prev, isLoading: false }))
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Reverify
                      </Button>
                      <p className="text-sm text-red-700 flex items-center">
                        Please correct the issues mentioned above and click "Reverify" to resubmit your application for review.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-yellow-900 mb-1">
                      Verification Pending - Done in 24 Hours
                    </h3>
                    <p className="text-sm text-yellow-800">
                      Your restaurant registration is under review. Admin will verify your details and activate your account within 24 hours. You'll be notified once approved.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {/* Business Analytics Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Business Analytics</h2>
            <div className="relative" ref={timeFilterRef}>
              <button 
                onClick={() => setShowTimeFilter(!showTimeFilter)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {selectedTimeFilter}
                <motion.div
                  animate={{ rotate: showTimeFilter ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showTimeFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-50 overflow-hidden"
                  >
                    {timeFilterOptions.map((option, index) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.06,
                          duration: 0.3
                        }}
                        onClick={() => {
                          setSelectedTimeFilter(option)
                          setShowTimeFilter(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          selectedTimeFilter === option
                            ? "bg-[#ff8100] text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white shadow-md border-0 h-full">
                <CardContent className="p-3 md:p-4 py-0 gap-0 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#ff8100] rounded-lg p-1.5 md:p-2">
                      <WalletIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm mb-1">Total Earning</p>
                  <p className="text-blue-600 text-lg md:text-xl font-bold">{formatCurrency(calculateBalances(walletState).totalEarning)}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-white shadow-md border-0 h-full">
                <CardContent className="p-3 md:p-4 py-0 gap-0 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-500 rounded-lg p-1.5 md:p-2">
                      <UtensilsCrossed className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm mb-1">Total Orders</p>
                  <p className="text-gray-900 text-lg md:text-xl font-bold">{allOrders.length}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Create Ads Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#fff4e6] rounded-xl p-4 md:p-5 mb-6 border border-orange-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="bg-[#ff8100] rounded-full p-3">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-semibold text-sm md:text-base mb-1">
                Want To Get Highlighted?
              </p>
              <p className="text-gray-600 text-xs md:text-sm">
                Create Ads to Reach More Customers.
              </p>
            </div>
            <Button 
              onClick={() => navigate("/restaurant/advertisements/new")}
              className="bg-[#ff8100] hover:bg-[#e67300] text-white font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
            >
              Create Ads
            </Button>
          </div>
        </motion.div>

        {/* Ongoing Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Ongoing Orders</h2>
            <button 
              onClick={() => navigate("/restaurant/orders/all")}
              className="text-[#ff8100] text-sm md:text-base font-medium hover:underline"
            >
              View All &gt;
            </button>
          </div>

          {/* Order Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 relative">
              <button
                onClick={() => setActiveOrderTab("pending")}
                className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors ${activeOrderTab === "pending"
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {activeOrderTab === "pending" && (
                  <motion.div
                    layoutId="activeOrderTab"
                    className="absolute inset-0 bg-[#ff8100] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Pending {orderCounts.pending}</span>
              </button>
              <button
                onClick={() => setActiveOrderTab("confirmed")}
                className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors ${activeOrderTab === "confirmed"
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {activeOrderTab === "confirmed" && (
                  <motion.div
                    layoutId="activeOrderTab"
                    className="absolute inset-0 bg-[#ff8100] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Confirmed {orderCounts.confirmed}</span>
              </button>
              <button
                onClick={() => setActiveOrderTab("cooking")}
                className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors ${activeOrderTab === "cooking"
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {activeOrderTab === "cooking" && (
                  <motion.div
                    layoutId="activeOrderTab"
                    className="absolute inset-0 bg-[#ff8100] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Cooking {orderCounts.cooking}</span>
              </button>
              <button
                onClick={() => setActiveOrderTab("ready")}
                className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors ${
                  activeOrderTab === "ready"
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {activeOrderTab === "ready" && (
                  <motion.div
                    layoutId="activeOrderTab"
                    className="absolute inset-0 bg-[#ff8100] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Ready for Handover {orderCounts.ready}</span>
              </button>
              <button
                onClick={() => setActiveOrderTab("onway")}
                className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors ${
                  activeOrderTab === "onway"
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {activeOrderTab === "onway" && (
                  <motion.div
                    layoutId="activeOrderTab"
                    className="absolute inset-0 bg-[#ff8100] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Food on the Way {orderCounts.onway}</span>
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="w-5 h-5 bg-[#ff8100] rounded border-2 border-[#ff8100] flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-sm md:text-base text-gray-700">Campaign Order</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="w-5 h-5 bg-[#ff8100] rounded border-2 border-[#ff8100] flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-sm md:text-base text-gray-700">Subscription Order</span>
            </label>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm md:text-base">No orders found in this category</p>
              </div>
            ) : (
              filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <Card
                  className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/restaurant/orders/${order.id}`)}
                >
                  <CardContent className="p-4 py-0 gap-0">
                    <div className="flex items-start justify-between pb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold text-sm md:text-base mb-1">
                          Order # {order.id} ({order.items} Item{order.items > 1 ? 's' : ''})
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm mb-2">
                          {order.timeAgo}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-blue-600 text-xs md:text-sm font-medium">
                            {order.deliveryType}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full ${
                            order.status === ORDER_STATUS.PENDING
                              ? 'bg-gray-100 text-gray-700'
                              : order.status === ORDER_STATUS.CONFIRMED
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === ORDER_STATUS.COOKING
                              ? 'bg-orange-100 text-orange-700'
                              : order.status === ORDER_STATUS.READY_TO_HANDOVER
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {normalizeStatus(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-gray-500 text-[10px] md:text-xs mb-0.5">Amount</p>
                        <p className="text-gray-900 font-bold text-sm md:text-base">
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <BottomNavbar onMenuClick={(e) => {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        setShowMenu(true)
      }} />

      {/* Menu Overlay */}
      <MenuOverlay showMenu={showMenu} setShowMenu={setShowMenu} />
    </div>
  )
}
