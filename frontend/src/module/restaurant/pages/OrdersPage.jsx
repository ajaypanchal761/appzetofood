import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import BottomNavbar from "../components/BottomNavbar"
import MenuOverlay from "../components/MenuOverlay"
import { 
  Home,
  ShoppingBag,
  Store,
  Wallet,
  Menu,
  CheckCircle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { getOrderStatus, normalizeStatus, matchesOrdersPageFilter, ORDER_STATUS } from "../utils/orderStatus"
import { getTransactionsByType, getOrderPaymentAmount } from "../utils/walletState"
import { formatCurrency, usdToInr } from "../utils/currency"

export default function OrdersPage() {
  const navigate = useNavigate()
  const [activeMainTab, setActiveMainTab] = useState("regular")
  // Always default to "history" filter to show only delivered and refunded orders (past orders)
  const [activeFilterTab, setActiveFilterTab] = useState("history")
  const [showMenu, setShowMenu] = useState(false)

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

  // Calculate summary cards from payment transactions
  const calculateSummaryCards = () => {
    const paymentTransactions = getTransactionsByType("payment")
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const thisWeek = new Date(today)
    thisWeek.setDate(today.getDate() - 7)
    
    const thisMonth = new Date(today)
    thisMonth.setMonth(today.getMonth() - 1)
    
    const parseDate = (dateString) => {
      // Parse date string like "01 Jun 2023" or "07 Feb 2023"
      try {
        const parts = dateString.split(' ')
        if (parts.length === 3) {
          const day = parseInt(parts[0])
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const month = monthNames.indexOf(parts[1])
          const year = parseInt(parts[2])
          return new Date(year, month, day)
        }
      } catch (e) {
        // If parsing fails, return old date
        return new Date(0)
      }
      return new Date(0)
    }
    
    let todayCount = 0
    let weekCount = 0
    let monthCount = 0
    
    paymentTransactions.forEach(transaction => {
      const transactionDate = parseDate(transaction.date)
      transactionDate.setHours(0, 0, 0, 0)
      
      if (transactionDate >= today) {
        todayCount++
      }
      if (transactionDate >= thisWeek) {
        weekCount++
      }
      if (transactionDate >= thisMonth) {
        monthCount++
      }
    })
    
    return [
      { label: "Today", count: todayCount },
      { label: "This Week", count: weekCount },
      { label: "This Month", count: monthCount }
    ]
  }
  
  const summaryCards = calculateSummaryCards()

  // Base orders data (static order information)
  const baseOrders = [
    {
      id: 100162,
      items: 2,
      timeAgo: "2 days ago",
      deliveryType: "Home Delivery",
      amount: 1400.86
    },
    {
      id: 100161,
      items: 1,
      timeAgo: "1 week ago",
      deliveryType: "Home Delivery",
      amount: 1543.86
    },
    {
      id: 100160,
      items: 3,
      timeAgo: "2 weeks ago",
      deliveryType: "Pickup",
      amount: 2399.99
    },
    {
      id: 100159,
      items: 1,
      timeAgo: "3 weeks ago",
      deliveryType: "Home Delivery",
      amount: 850.50
    },
    {
      id: 100158,
      items: 2,
      timeAgo: "1 month ago",
      deliveryType: "Home Delivery",
      amount: 1200.00
    },
    {
      id: 100157,
      items: 1,
      timeAgo: "2 months ago",
      deliveryType: "Pickup",
      amount: 650.25
    },
    {
      id: 100156,
      items: 4,
      timeAgo: "3 months ago",
      deliveryType: "Home Delivery",
      amount: 1850.75
    },
    {
      id: 100155,
      items: 1,
      timeAgo: "4 months ago",
      deliveryType: "Home Delivery",
      amount: 450.00
    },
    {
      id: 100154,
      items: 2,
      timeAgo: "5 months ago",
      deliveryType: "Pickup",
      amount: 950.50
    },
    {
      id: 100153,
      items: 1,
      timeAgo: "6 months ago",
      deliveryType: "Home Delivery",
      amount: 750.25
    }
  ]

  // Enrich orders with actual status and amount from localStorage/wallet
  const [orders, setOrders] = useState(() => {
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

  // Initialize test data and refresh orders when component mounts or when order status is updated
  useEffect(() => {
    // Set default statuses for test orders if not already set
    const defaultStatuses = {
      100162: "Delivered",    // Recent delivered order
      100161: "Delivered",    // Delivered order
      100160: "Refunded",     // Refunded order
      100159: "Delivered",    // Delivered order
      100158: "Refunded",     // Refunded order
      100157: "Delivered",    // Delivered order
      100156: "Delivered",    // Delivered order
      100155: "Refunded",     // Refunded order
      100154: "Delivered",    // Delivered order
      100153: "Delivered"     // Delivered order
    }

    // Only set if status doesn't exist (don't overwrite user changes)
    let dataInitialized = false
    Object.entries(defaultStatuses).forEach(([orderId, status]) => {
      const key = `order_status_${orderId}`
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, status)
        dataInitialized = true
      }
    })

    const refreshOrders = () => {
      setOrders(baseOrders.map(order => {
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

    // Refresh orders after initializing test data (or on mount)
    refreshOrders()

    // Listen for storage changes (when order status is updated in OrderDetails)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('order_status_')) {
        refreshOrders()
      }
    }

    // Listen for wallet state updates (when payments are added)
    const handleWalletUpdate = () => {
      refreshOrders()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('orderStatusUpdated', refreshOrders)
    window.addEventListener('walletStateUpdated', handleWalletUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('orderStatusUpdated', refreshOrders)
      window.removeEventListener('walletStateUpdated', handleWalletUpdate)
    }
  }, [])

  // Calculate filter tab counts dynamically from actual orders (after orders state is defined)
  // History page only shows history-related filters (no "All" tab)
  const filterTabs = [
    { 
      id: "history", 
      label: "History", 
      count: orders.filter(o => matchesOrdersPageFilter(o.status, "history")).length 
    },
    { 
      id: "delivered", 
      label: "Delivered", 
      count: orders.filter(o => matchesOrdersPageFilter(o.status, "delivered")).length 
    },
    { 
      id: "refunded", 
      label: "Refunded", 
      count: orders.filter(o => matchesOrdersPageFilter(o.status, "refunded")).length 
    }
  ]

  // Filter orders based on active filter tab
  const filteredOrders = orders.filter(order => {
    return matchesOrdersPageFilter(order.status, activeFilterTab)
  })

  // Get status badge color based on order status
  const getStatusBadgeColor = (status) => {
    const normalized = normalizeStatus(status)
    if (normalized === ORDER_STATUS.DELIVERED) {
      return "bg-green-100 text-green-700"
    } else if (normalized === ORDER_STATUS.REFUNDED) {
      return "bg-red-100 text-red-700"
    } else {
      return "bg-green-100 text-green-700" // Default green for other statuses
    }
  }

  return (
    <div className="min-h-screen bg-[#f6e9dc] overflow-x-hidden">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
          Order History
        </h1>

        {/* Main Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMainTab("regular")}
            className={`pb-3 px-2 text-sm md:text-base font-medium transition-colors relative ${
              activeMainTab === "regular"
                ? "text-[#ff8100]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Regular Order
            {activeMainTab === "regular" && (
              <motion.div
                layoutId="activeMainTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff8100]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMainTab("subscription")}
            className={`pb-3 px-2 text-sm md:text-base font-medium transition-colors relative ${
              activeMainTab === "subscription"
                ? "text-[#ff8100]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Subscription Order
            {activeMainTab === "subscription" && (
              <motion.div
                layoutId="activeMainTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff8100]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-white shadow-md border-0 overflow-hidden">
                <CardContent className="p-2 md:p-3 text-center flex flex-col justify-center min-h-[60px] md:min-h-[70px]">
                  <p className="text-gray-900 text-sm md:text-base font-bold mb-0.5 leading-tight">
                    {card.count}
                  </p>
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    {card.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex gap-3 min-w-max md:flex-wrap md:min-w-0 relative">
            {filterTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`relative z-10 flex-shrink-0 px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors ${
                  activeFilterTab === tab.id
                    ? "text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {activeFilterTab === tab.id && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-[#ff8100] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label} {tab.count}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 md:space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-base md:text-lg">No orders found in this category</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/restaurant/orders/${order.id}`)}
              >
                <CardContent className="p-3 md:p-5 py-0 gap-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-bold text-sm md:text-base mb-1 leading-tight">
                        Order # {order.id}
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm mb-1.5">
                        {order.items} Item{order.items > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 ${getStatusBadgeColor(order.status)} text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full`}>
                          <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {normalizeStatus(order.status)}
                        </span>
                        <span className="text-gray-500 text-[10px] md:text-xs">
                          {order.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100 pb-3 md:pb-0">
                    <span className="text-blue-600 text-xs md:text-sm font-medium">
                      {order.deliveryType}
                    </span>
                    <div className="text-right">
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

      {/* Bottom Navigation Bar - Mobile Only */}
      <BottomNavbar onMenuClick={() => setShowMenu(true)} />
      
      {/* Menu Overlay */}
      <MenuOverlay showMenu={showMenu} setShowMenu={setShowMenu} />
    </div>
  )
}

