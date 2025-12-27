import { useParams, Link, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Share2, 
  RefreshCw, 
  Phone, 
  ChevronRight, 
  MapPin, 
  Home as HomeIcon,
  MessageSquare,
  HelpCircle,
  X,
  Check,
  Shield,
  ChefHat,
  Receipt,
  CircleSlash
} from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useOrders } from "../../context/OrdersContext"
import { useProfile } from "../../context/ProfileContext"

// Animated checkmark component
const AnimatedCheckmark = ({ delay = 0 }) => (
  <motion.svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    initial="hidden"
    animate="visible"
    className="mx-auto"
  >
    <motion.circle
      cx="40"
      cy="40"
      r="36"
      fill="none"
      stroke="#22c55e"
      strokeWidth="4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    />
    <motion.path
      d="M24 40 L35 51 L56 30"
      fill="none"
      stroke="#22c55e"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: delay + 0.4, ease: "easeOut" }}
    />
  </motion.svg>
)

// Map placeholder component with animated route
const DeliveryMap = ({ isVisible }) => (
  <motion.div 
    className="relative h-64 bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {/* Stylized map background */}
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px'
    }} />
    
    {/* Roads */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256">
      {/* Main roads */}
      <path d="M0 128 L400 128" stroke="#e5e7eb" strokeWidth="12" fill="none" />
      <path d="M200 0 L200 256" stroke="#e5e7eb" strokeWidth="8" fill="none" />
      <path d="M0 64 L400 200" stroke="#e5e7eb" strokeWidth="6" fill="none" />
      
      {/* Animated delivery route */}
      <motion.path 
        d="M60 70 Q 120 90, 160 120 T 280 160 T 340 200"
        stroke="#166534"
        strokeWidth="3"
        strokeDasharray="8 4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
      />
    </svg>

    {/* Restaurant marker */}
    <motion.div 
      className="absolute flex items-center justify-center"
      style={{ left: '50px', top: '50px' }}
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
    >
      <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-700">
        <HomeIcon className="w-5 h-5 text-green-700" />
      </div>
    </motion.div>

    {/* Delivery location marker */}
    <motion.div 
      className="absolute flex flex-col items-center"
      style={{ right: '50px', bottom: '40px' }}
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
    >
      <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-green-700">
        <MapPin className="w-5 h-5 text-green-700" />
      </div>
    </motion.div>

    {/* Delivery partner marker (animated along route) */}
    <motion.div
      className="absolute z-10"
      initial={{ left: '60px', top: '70px' }}
      animate={{ 
        left: ['60px', '160px', '280px', '330px'],
        top: ['70px', '120px', '160px', '190px']
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div className="w-8 h-8 bg-green-700 rounded-full shadow-lg flex items-center justify-center">
        <span className="text-white text-xs">🛵</span>
      </div>
    </motion.div>

    {/* Expand button */}
    <motion.button 
      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </motion.button>

    {/* Current location button */}
    <motion.button 
      className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-6 h-6 rounded-full border-2 border-green-600 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-green-600" />
      </div>
    </motion.button>

    {/* Google attribution */}
    <div className="absolute bottom-3 left-3 text-xs text-gray-500 font-medium">
      Google
    </div>
  </motion.div>
)

// Promotional banner carousel
const PromoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const promos = [
    { 
      bank: "HDFC BANK", 
      offer: "10% cashback on all orders",
      subtext: "Extraordinary Rewards | Zero Joining Fee | T&C apply",
      color: "from-blue-50 to-indigo-50"
    },
    { 
      bank: "ICICI BANK", 
      offer: "15% instant discount",
      subtext: "Valid on orders above ₹299 | Use code ICICI15",
      color: "from-orange-50 to-red-50"
    },
    { 
      bank: "SBI CARD", 
      offer: "Flat ₹75 off",
      subtext: "On all orders | No minimum order value",
      color: "from-purple-50 to-pink-50"
    },
    { 
      bank: "AXIS BANK", 
      offer: "20% cashback up to ₹100",
      subtext: "Valid on first order | T&C apply",
      color: "from-teal-50 to-cyan-50"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div 
      className="bg-white rounded-xl p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r ${promos[currentSlide].color}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
                  {promos[currentSlide].bank}
                </span>
              </div>
              <p className="font-semibold text-gray-900">{promos[currentSlide].offer}</p>
              <p className="text-xs text-gray-600 mt-1">{promos[currentSlide].subtext}</p>
              <button className="text-green-700 font-medium text-sm mt-2 flex items-center gap-1">
                Apply now <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-3">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-green-600 w-4' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Tip selection component
const TipSection = () => {
  const [selectedTip, setSelectedTip] = useState(null)
  const [customTip, setCustomTip] = useState('')
  const tips = [20, 30, 50]

  return (
    <motion.div 
      className="bg-white rounded-xl p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <p className="text-gray-700 text-sm mb-3">
        Make their day by leaving a tip. 100% of the amount will go to them after delivery
      </p>
      <div className="flex gap-3">
        {tips.map((tip) => (
          <motion.button
            key={tip}
            onClick={() => {
              setSelectedTip(tip)
              setCustomTip('')
            }}
            className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
              selectedTip === tip 
                ? 'border-green-600 bg-green-50 text-green-700' 
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            ₹{tip}
          </motion.button>
        ))}
        <motion.button
          onClick={() => {
            setSelectedTip('other')
          }}
          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
            selectedTip === 'other' 
              ? 'border-green-600 bg-green-50 text-green-700' 
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Other
        </motion.button>
      </div>
      
      <AnimatePresence>
        {selectedTip === 'other' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <input
              type="number"
              placeholder="Enter custom amount"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className="mt-3 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Section item component
const SectionItem = ({ icon: Icon, title, subtitle, onClick, showArrow = true, rightContent }) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-dashed border-gray-200 last:border-0"
    whileTap={{ scale: 0.99 }}
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 truncate">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
    </div>
    {rightContent || (showArrow && <ChevronRight className="w-5 h-5 text-gray-400" />)}
  </motion.button>
)

export default function OrderTracking() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const confirmed = searchParams.get("confirmed") === "true"
  const { getOrderById } = useOrders()
  const { profile, getDefaultAddress } = useProfile()
  const order = getOrderById(orderId)
  
  const [showConfirmation, setShowConfirmation] = useState(confirmed)
  const [orderStatus, setOrderStatus] = useState('placed')
  const [estimatedTime, setEstimatedTime] = useState(29)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const defaultAddress = getDefaultAddress()

  // Simulate order status progression
  useEffect(() => {
    if (confirmed) {
      const timer1 = setTimeout(() => {
        setShowConfirmation(false)
        setOrderStatus('preparing')
      }, 3000)
      return () => clearTimeout(timer1)
    }
  }, [confirmed])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEstimatedTime((prev) => Math.max(0, prev - 1))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!order) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto text-center py-20">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Order Not Found</h1>
          <Link to="/user/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </AnimatedPage>
    )
  }

  const statusConfig = {
    placed: {
      title: "Order placed",
      subtitle: "Food preparation will begin shortly",
      color: "bg-green-700"
    },
    preparing: {
      title: "Preparing your order",
      subtitle: `Arriving in ${estimatedTime} mins`,
      color: "bg-green-700"
    },
    pickup: {
      title: "Order picked up",
      subtitle: `Arriving in ${estimatedTime} mins`,
      color: "bg-green-700"
    },
    delivered: {
      title: "Order delivered",
      subtitle: "Enjoy your meal!",
      color: "bg-green-600"
    }
  }

  const currentStatus = statusConfig[orderStatus]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a]">
      {/* Order Confirmed Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white dark:bg-[#1a1a1a] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center px-8"
            >
              <AnimatedCheckmark delay={0.3} />
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-2xl font-bold text-gray-900 mt-6"
              >
                Order Confirmed!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-gray-600 mt-2"
              >
                Your order has been placed successfully
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-8"
              >
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-3">Loading order details...</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Green Header */}
      <motion.div 
        className={`${currentStatus.color} text-white sticky top-0 z-40`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Navigation bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/user/orders">
            <motion.button 
              className="w-10 h-10 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          </Link>
          <h2 className="font-semibold text-lg">{order.restaurant}</h2>
          <motion.button 
            className="w-10 h-10 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Status section */}
        <div className="px-4 pb-4 text-center">
          <motion.h1 
            className="text-2xl font-bold mb-3"
            key={currentStatus.title}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currentStatus.title}
          </motion.h1>
          
          {/* Status pill */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm">{currentStatus.subtitle}</span>
            {orderStatus === 'preparing' && (
              <>
                <span className="w-1 h-1 rounded-full bg-white" />
                <span className="text-sm text-green-200">On time</span>
              </>
            )}
            <motion.button 
              onClick={handleRefresh}
              className="ml-1"
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Map Section */}
      <DeliveryMap isVisible={!showConfirmation} />

      {/* Scrollable Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6 pb-24 md:pb-32">
        {/* Payment Pending */}
        <motion.div 
          className="bg-white rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                Payment of ₹{order.total?.toFixed(0) || '0'} pending
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Pay now, or pay to the delivery partner using Cash/UPI
              </p>
            </div>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
              Pay now <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Promo Carousel */}
        <PromoCarousel />

        {/* Delivery Partner Assignment */}
        <motion.div 
          className="bg-white rounded-xl p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <p className="font-semibold text-gray-900">Assigning delivery partner shortly</p>
          </div>
        </motion.div>

        {/* Tip Section */}
        <TipSection />

        {/* Delivery Partner Safety */}
        <motion.button
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.99 }}
        >
          <Shield className="w-6 h-6 text-gray-600" />
          <span className="flex-1 text-left font-medium text-gray-900">
            Learn about delivery partner safety
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </motion.button>

        {/* Delivery Details Banner */}
        <motion.div
          className="bg-yellow-50 rounded-xl p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <p className="text-yellow-800 font-medium">
            All your delivery details in one place 👇
          </p>
        </motion.div>

        {/* Contact & Address Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SectionItem 
            icon={Phone}
            title={`${profile?.fullName || 'Customer'}, ${profile?.phone || '9XXXXXXXX'}`}
            subtitle="Delivery partner may call this number"
            rightContent={
              <span className="text-green-600 font-medium text-sm">Edit</span>
            }
          />
          <SectionItem 
            icon={HomeIcon}
            title="Delivery at Home"
            subtitle={defaultAddress ? 
              `${defaultAddress.street}, ${defaultAddress.city}` : 
              'Add delivery address'
            }
            rightContent={
              <span className="text-green-600 font-medium text-sm">Edit</span>
            }
          />
          <SectionItem 
            icon={MessageSquare}
            title="Add delivery instructions"
            subtitle=""
          />
        </motion.div>

        {/* Restaurant Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <div className="flex items-center gap-3 p-4 border-b border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center">
              <span className="text-2xl">🍔</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{order.restaurant}</p>
              <p className="text-sm text-gray-500">{order.address?.city || 'Local Area'}</p>
            </div>
            <motion.button 
              className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <Phone className="w-5 h-5 text-green-700" />
            </motion.button>
          </div>

          {/* Order Items */}
          <div className="p-4 border-b border-dashed border-gray-200">
            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Order #{order.id}</p>
                <div className="mt-2 space-y-1">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded border border-green-600 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-green-600" />
                      </span>
                      <span>{item.quantity} x {item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <SectionItem 
            icon={ChefHat}
            title="Add cooking requests"
            subtitle=""
          />
        </motion.div>

        {/* Help Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 p-4 border-b border-dashed border-gray-200">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Need help with your order?</p>
              <p className="text-sm text-gray-500">Get help & support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <SectionItem 
            icon={CircleSlash}
            title="Cancel order"
            subtitle=""
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <Link to={`/user/orders/${orderId}/invoice`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
              View Invoice
            </Button>
          </Link>
          <Link to="/user/orders" className="flex-1">
            <Button variant="outline" className="w-full border-gray-300">
              All Orders
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
