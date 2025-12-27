import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Minus, ArrowLeft, ChevronRight, Clock, MapPin, Phone, FileText, Utensils, Tag, Percent, Truck, Leaf, Share2, Crown, ChevronUp, ChevronDown, X, Check, Settings, CreditCard, Wallet, Building2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { useCart } from "../../context/CartContext"
import { useProfile } from "../../context/ProfileContext"
import { useOrders } from "../../context/OrdersContext"
import { orderAPI } from "@/lib/api"
import { initRazorpayPayment } from "@/lib/utils/razorpay"

// Payment method icons as SVG components
const GooglePayIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  </div>
)

const PhonePeIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center bg-[#5f259f]">
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l5-6v4h3l-5 6z"/>
    </svg>
  </div>
)

const UPIIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
    <span className="text-xs font-bold text-gray-600">UPI</span>
  </div>
)

const AmazonPayIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-900">
    <span className="text-xs font-bold text-orange-400">pay</span>
  </div>
)

const MobikwikIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center bg-blue-600">
    <span className="text-xs font-bold text-white">M</span>
  </div>
)

const PluxeeIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">pluxee</span>
  </div>
)

const CardIcon = () => (
  <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
    <CreditCard className="w-5 h-5 text-gray-600" />
  </div>
)

// Sample suggested items for "Complete your meal"
const suggestedItems = [
  { id: 101, name: "Dal Kachori", description: "Serves, 1 Piece", price: 22.86, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop&q=80", isVeg: true },
  { id: 102, name: "Rasgulla", description: "1 Piece", price: 19, image: "https://images.unsplash.com/photo-1666190094745-d71710fc02c2?w=400&h=400&fit=crop&q=80", isVeg: true },
  { id: 103, name: "Kaju Kachori", description: "1 Piece", price: 317, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop&q=80", isVeg: true },
  { id: 104, name: "Milk Cake", description: "250g", price: 150, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80", isVeg: true },
  { id: 105, name: "Gulab Jamun", description: "2 Pieces", price: 89, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop&q=80", isVeg: true },
  { id: 106, name: "Jalebi", description: "100g", price: 75, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop&q=80", isVeg: true },
]

// Available coupons
const availableCoupons = [
  { code: "GETOFF40ON249", discount: 40, minOrder: 249, description: "Save ₹40 on orders above ₹249" },
  { code: "FIRST50", discount: 50, minOrder: 199, description: "50% off up to ₹50 on first order" },
  { code: "FREEDEL", discount: 0, minOrder: 149, description: "Free delivery on orders above ₹149", freeDelivery: true },
]

export default function Cart() {
  const navigate = useNavigate()
  const { cart, updateQuantity, addToCart, getCartCount, clearCart } = useCart()
  const { getDefaultAddress, getDefaultPaymentMethod, addresses, paymentMethods, userProfile } = useProfile()
  const { createOrder } = useOrders()
  
  const [showCoupons, setShowCoupons] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponCode, setCouponCode] = useState("")
  const [deliveryFleet, setDeliveryFleet] = useState("standard")
  const [showFleetOptions, setShowFleetOptions] = useState(false)
  const [note, setNote] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [sendCutlery, setSendCutlery] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showBillDetails, setShowBillDetails] = useState(false)
  const [showDiscountBanner, setShowDiscountBanner] = useState(true)
  const [couponApplied, setCouponApplied] = useState(false)
  const [showPaymentSelection, setShowPaymentSelection] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPlacingOrder, setShowPlacingOrder] = useState(false)
  const [orderProgress, setOrderProgress] = useState(0)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState(null)
  
  const paymentOptionsRef = useRef(null)

  const cartCount = getCartCount()
  const defaultAddress = getDefaultAddress()
  const defaultPayment = getDefaultPaymentMethod()
  
  // Check if banner has been shown before (using sessionStorage for this session)
  useEffect(() => {
    if (cart.length > 0) {
      const hasSeenBanner = sessionStorage.getItem('cartDiscountBannerShown')
      if (!hasSeenBanner) {
        // Small delay to show banner after page loads
        const timer = setTimeout(() => {
          setShowDiscountBanner(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [cart.length])

  // Show payment selection modal only once if payment hasn't been selected before
  useEffect(() => {
    if (cart.length > 0 && !selectedPayment && !defaultPayment) {
      const hasSeenPaymentSelection = localStorage.getItem('cartPaymentSelectionShown')
      if (!hasSeenPaymentSelection) {
        // Small delay to show payment selection after page loads
        const timer = setTimeout(() => {
          setShowPaymentSelection(true)
          localStorage.setItem('cartPaymentSelectionShown', 'true')
        }, 800)
        return () => clearTimeout(timer)
      }
    }
  }, [cart.length, selectedPayment, defaultPayment])

  // Scroll to top when payment selection modal opens
  useEffect(() => {
    if (showPaymentSelection) {
      // Small delay to ensure the modal is rendered before scrolling
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        // Also scroll the payment options container to top
        if (paymentOptionsRef.current) {
          paymentOptionsRef.current.scrollTop = 0
        }
      })
    }
  }, [showPaymentSelection])

  // Lock body scroll and scroll to top when any full-screen modal opens
  useEffect(() => {
    if (showPlacingOrder || showOrderSuccess || showPaymentSelection) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${window.scrollY}px`
      
      // Scroll window to top
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.top = ''
    }
  }, [showPlacingOrder, showOrderSuccess, showPaymentSelection])

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity * 83, 0)
  const deliveryFee = subtotal > 149 && appliedCoupon?.freeDelivery ? 0 : 25
  const platformFee = 5
  const gstCharges = Math.round(subtotal * 0.05)
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal * 0.5) : 0
  const totalBeforeDiscount = subtotal + deliveryFee + platformFee + gstCharges
  const total = totalBeforeDiscount - discount
  const savings = discount + (subtotal > 500 ? 32 : 0)

  const handleApplyCoupon = (coupon) => {
    if (subtotal >= coupon.minOrder) {
      setAppliedCoupon(coupon)
      setCouponCode(coupon.code)
      setShowCoupons(false)
    }
  }

  const handleBannerApply = () => {
    // Trigger confetti animation
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      // Launch confetti from multiple positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    // Apply the coupon
    const coupon = { code: "GETOFF220ON599", discount: 220, minOrder: 599, description: "Save ₹220 on orders above ₹599" }
    if (subtotal >= coupon.minOrder) {
      setCouponApplied(true)
      // Show applied animation, then close banner
      setTimeout(() => {
        handleApplyCoupon(coupon)
        setShowDiscountBanner(false)
        setCouponApplied(false)
        sessionStorage.setItem('cartDiscountBannerShown', 'true')
      }, 2000)
    } else {
      // If order value is less, just close the banner
      setShowDiscountBanner(false)
      sessionStorage.setItem('cartDiscountBannerShown', 'true')
    }
  }

  const handleCloseBanner = () => {
    setShowDiscountBanner(false)
    sessionStorage.setItem('cartDiscountBannerShown', 'true')
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment)
    setShowPaymentSelection(false)
    // Mark payment selection as shown in localStorage
    localStorage.setItem('cartPaymentSelectionShown', 'true')
  }

  // Available payment methods
  const paymentOptions = {
    recommended: [
      { id: 'gpay', name: 'Google Pay UPI', type: 'UPI', icon: 'gpay', isRecommended: true },
      { id: 'phonepe', name: 'PhonePe UPI', type: 'UPI', icon: 'phonepe', isRecommended: true },
    ],
    cards: [
      { id: 'add_card', name: 'Add credit or debit cards', type: 'Card', icon: 'card', isAddNew: true },
      { id: 'pluxee', name: 'Add Pluxee', type: 'Card', icon: 'pluxee', isAddNew: true },
    ],
    upi: [
      { id: 'add_upi', name: 'Add new UPI ID', type: 'UPI', icon: 'upi', isAddNew: true },
    ],
    wallets: [
      { id: 'amazon_pay', name: 'Amazon Pay Balance', type: 'Wallet', icon: 'amazon' },
      { id: 'mobikwik', name: 'Mobikwik', type: 'Wallet', icon: 'mobikwik' },
    ],
    payLater: [
      { id: 'amazon_later', name: 'Amazon Pay Later', type: 'Pay Later', icon: 'amazon' },
    ]
  }

  const renderPaymentIcon = (iconType) => {
    switch(iconType) {
      case 'gpay': return <GooglePayIcon />
      case 'phonepe': return <PhonePeIcon />
      case 'card': return <CardIcon />
      case 'pluxee': return <PluxeeIcon />
      case 'upi': return <UPIIcon />
      case 'amazon': return <AmazonPayIcon />
      case 'mobikwik': return <MobikwikIcon />
      default: return <CardIcon />
    }
  }

  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      alert("Please add a delivery address")
      return
    }

    if (cart.length === 0) {
      alert("Your cart is empty")
      return
    }

    setIsPlacingOrder(true)

    try {
      // Create order in backend
      const orderResponse = await orderAPI.createOrder({
        items: cart.map(item => ({
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.description,
          isVeg: item.isVeg !== false
        })),
        address: defaultAddress,
        restaurantId: cart[0]?.restaurant?.toLowerCase().replace(/\s+/g, "-") || "unknown",
        restaurantName: cart[0]?.restaurant || "Unknown Restaurant",
        pricing: {
          subtotal,
          deliveryFee,
          tax: gstCharges,
          discount,
          total,
          couponCode: appliedCoupon?.code
        },
        deliveryFleet,
        note,
        sendCutlery,
        paymentMethod: "razorpay"
      })

      const { order, razorpay } = orderResponse.data.data

      if (!razorpay || !razorpay.orderId) {
        throw new Error("Failed to initialize payment")
      }

      // Get user info for Razorpay prefill
      const userInfo = userProfile || {}
      const userPhone = userInfo.phone || defaultAddress?.phone || ""
      const userEmail = userInfo.email || ""
      const userName = userInfo.name || ""

      // Initialize Razorpay payment
      await initRazorpayPayment({
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: "Appzeto Food",
        description: `Order ${order.orderId}`,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone.replace(/\D/g, "").slice(-10)
        },
        notes: {
          orderId: order.orderId,
          userId: userInfo.id || ""
        },
        handler: async (response) => {
          try {
            // Verify payment with backend
            const verifyResponse = await orderAPI.verifyPayment({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })

            if (verifyResponse.data.success) {
              // Payment successful
              setPlacedOrderId(order.orderId)
              setShowOrderSuccess(true)
              clearCart()
              setIsPlacingOrder(false)
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            alert(error?.response?.data?.message || "Payment verification failed. Please contact support.")
            setIsPlacingOrder(false)
          }
        },
        onError: (error) => {
          console.error("Razorpay error:", error)
          alert(error?.description || "Payment failed. Please try again.")
          setIsPlacingOrder(false)
        },
        onClose: () => {
          setIsPlacingOrder(false)
        }
      })
    } catch (error) {
      console.error("Order creation error:", error)
      alert(error?.response?.data?.message || "Failed to create order. Please try again.")
      setIsPlacingOrder(false)
    }
  }

  const handleGoToOrders = () => {
    setShowOrderSuccess(false)
    navigate(`/user/orders/${placedOrderId}?confirmed=true`)
  }

  // Empty cart state - but don't show if order success or placing order modal is active
  if (cart.length === 0 && !showOrderSuccess && !showPlacingOrder) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link onClick={() => navigate(-1)}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span className="font-semibold text-gray-800 dark:text-white">Cart</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Utensils className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Your cart is empty</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Add items from a restaurant to start a new order</p>
          <Link>
            <Button className="bg-primary-orange hover:opacity-90 text-white">Browse Restaurants</Button>
          </Link>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header - Sticky at top */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-800 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Link onClick={() => navigate(-1)}>
                <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Apna Sweets</p>
                <p className="text-sm md:text-base font-medium text-gray-800 dark:text-white truncate">
                  10-15 mins to <span className="font-semibold">Home</span>
                  <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs md:text-sm">{defaultAddress?.city || "Select address"}</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-32">
        {/* Savings Banner */}
        {savings > 0 && (
          <div className="bg-blue-100 dark:bg-blue-900/20 px-4 md:px-6 py-2 md:py-3 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm md:text-base font-medium text-blue-800 dark:text-blue-200">
                🎉 You saved ₹{savings} on this order
              </p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-6">
            {/* Left Column - Cart Items and Details */}
            <div className="lg:col-span-2 space-y-2 md:space-y-4">
              {/* Gold Offer Card */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Crown className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Get Gold for 3 months at ₹1</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Enjoy FREE delivery above ₹99 and extra offers with Gold</p>
                      <button className="text-xs md:text-sm text-amber-600 dark:text-amber-400 font-medium mt-0.5">Learn more →</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button size="sm" variant="outline" className="h-7 md:h-8 text-xs md:text-sm border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      ADD
                    </Button>
                    <p className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400 mt-0.5">₹1</p>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <div className="space-y-3 md:space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 md:gap-4">
                      {/* Veg/Non-veg indicator */}
                      <div className={`w-4 h-4 md:w-5 md:h-5 border-2 ${item.isVeg !== false ? 'border-green-600' : 'border-red-600'} flex items-center justify-center mt-1 flex-shrink-0`}>
                        <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${item.isVeg !== false ? 'bg-green-600' : 'bg-red-600'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 leading-tight">{item.name}</p>
                        <button className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5 mt-0.5">
                          Edit <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-red-600 dark:border-red-500 rounded">
                          <button 
                            className="px-2 md:px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          <span className="px-2 md:px-3 text-sm md:text-base font-semibold text-red-600 dark:text-red-400 min-w-[20px] md:min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            className="px-2 md:px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        </div>
                        
                        <p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 min-w-[50px] md:min-w-[70px] text-right">
                          ₹{(item.price * item.quantity * 83).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more items */}
                {cart.length > 0 && cart[0]?.restaurant ? (
                  <Link 
                    to={`/user/restaurants/${cart[0].restaurant.toLowerCase().replace(/\s+/g, "-")}`} 
                    className="flex items-center gap-2 mt-4 md:mt-6 text-red-600 dark:text-red-400"
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base font-medium">Add more items</span>
                  </Link>
                ) : (
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mt-4 md:mt-6 text-red-600 dark:text-red-400"
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-sm md:text-base font-medium">Add more items</span>
                  </button>
                )}
              </div>

              {/* Note & Cutlery */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl flex flex-col sm:flex-row gap-2 md:gap-3">
                <button 
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="flex-1 flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl text-sm md:text-base text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="truncate">{note || "Add a note for the restaurant"}</span>
                </button>
                <button 
                  onClick={() => setSendCutlery(!sendCutlery)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 border rounded-lg md:rounded-xl text-sm md:text-base ${sendCutlery ? 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300' : 'border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}
                >
                  <Utensils className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="whitespace-nowrap">{sendCutlery ? "Don't send cutlery" : "No cutlery"}</span>
                </button>
              </div>

              {/* Note Input */}
              {showNoteInput && (
                <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add cooking instructions, allergies, etc."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg md:rounded-xl p-3 md:p-4 text-sm md:text-base resize-none h-20 md:h-24 focus:outline-none focus:border-red-600 dark:focus:border-red-500 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              {/* Complete your meal section */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs md:text-base">🍽️</span>
                  </div>
                  <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Complete your meal with</span>
                </div>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 -mx-4 md:-mx-6 px-4 md:px-6 scrollbar-hide">
                  {suggestedItems.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-28 md:w-36">
                      <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-28 md:h-36 object-cover rounded-lg md:rounded-xl"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"
                          }}
                        />
                        <div className="absolute top-1 md:top-2 left-1 md:left-2">
                          <div className={`w-3.5 h-3.5 md:w-4 md:h-4 bg-white border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded`}>
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </div>
                        </div>
                        <button 
                          onClick={() => addToCart({ ...item, isVeg: item.isVeg })}
                          className="absolute bottom-1 md:bottom-2 right-1 md:right-2 w-6 h-6 md:w-7 md:h-7 bg-white border border-red-600 rounded flex items-center justify-center shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600" />
                        </button>
                      </div>
                      <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 mt-1.5 md:mt-2 line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                      <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 font-semibold mt-0.5">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg md:rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Tag className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-sm md:text-base font-medium text-red-700 dark:text-red-300">'{appliedCoupon.code}' applied</p>
                        <p className="text-xs md:text-sm text-red-600 dark:text-red-400">You saved ₹{discount}</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">Remove</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Percent className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">Save ₹40 with 'GETOFF40ON249'</p>
                          <button onClick={() => setShowCoupons(!showCoupons)} className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium">
                            View all coupons →
                          </button>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 md:h-8 text-xs md:text-sm border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleApplyCoupon(availableCoupons[0])}
                      >
                        APPLY
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Coupons List */}
                {showCoupons && !appliedCoupon && (
                  <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 border-t dark:border-gray-700 pt-3 md:pt-4">
                    {availableCoupons.map((coupon) => (
                      <div key={coupon.code} className="flex items-center justify-between py-2 md:py-3 border-b border-dashed dark:border-gray-700 last:border-0">
                        <div>
                          <p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200">{coupon.code}</p>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{coupon.description}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-6 md:h-7 text-xs md:text-sm border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleApplyCoupon(coupon)}
                          disabled={subtotal < coupon.minOrder}
                        >
                          {subtotal < coupon.minOrder ? `Min ₹${coupon.minOrder}` : 'APPLY'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Time */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <div className="flex items-center gap-3 md:gap-4">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">Delivery in <span className="font-semibold">10-15 mins</span></p>
                    <button className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Want this later? <span className="text-blue-600 dark:text-blue-400 font-medium">Schedule it</span></button>
                  </div>
                </div>
              </div>

              {/* Delivery Fleet Type */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <button 
                  onClick={() => setShowFleetOptions(!showFleetOptions)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <Truck className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm md:text-base text-gray-800 dark:text-gray-200">Choose delivery fleet type</span>
                  </div>
                  {showFleetOptions ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400" /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />}
                </button>
                
                {showFleetOptions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
                    <button
                      onClick={() => setDeliveryFleet("standard")}
                      className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 text-left transition-colors ${deliveryFleet === "standard" ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Standard Fleet</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                          <Truck className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Our standard food delivery experience</p>
                    </button>
                    <button
                      onClick={() => setDeliveryFleet("veg")}
                      className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 text-left transition-colors ${deliveryFleet === "veg" ? "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Special Veg-only Fleet</span>
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <Leaf className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Fleet delivering only from Pure Veg restaurants</p>
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <Link  className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                        Delivery at <span className="font-semibold">{defaultAddress?.isDefault ? "Home" : "Address"}</span>
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}` : "Add delivery address"}
                      </p>
                      <button className="text-xs md:text-sm text-gray-500 dark:text-gray-400 border-b border-dashed border-gray-400 dark:border-gray-600">Add instructions for delivery partner</button>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </Link>
              </div>

              {/* Contact */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <Link to="/user/profile" className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                      {userProfile?.name || "Your Name"}, <span className="font-medium">{userProfile?.phone || "+91-XXXXXXXXXX"}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </Link>
              </div>

              {/* Bill Details */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl">
                <button 
                  onClick={() => setShowBillDetails(!showBillDetails)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <span className="text-sm md:text-base text-gray-800 dark:text-gray-200">Total Bill</span>
                        <span className="text-sm md:text-base text-gray-400 dark:text-gray-500 line-through">₹{totalBeforeDiscount.toFixed(0)}</span>
                        <span className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">₹{total.toFixed(0)}</span>
                        {savings > 0 && (
                          <span className="text-xs md:text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 md:px-2 py-0.5 rounded font-medium">You saved ₹{savings}</span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Incl. taxes and charges</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </button>

                {showBillDetails && (
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-dashed dark:border-gray-700 space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Item Total</span>
                      <span className="text-gray-800 dark:text-gray-200">₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                      <span className={deliveryFee === 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                      <span className="text-gray-800 dark:text-gray-200">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">GST and Restaurant Charges</span>
                      <span className="text-gray-800 dark:text-gray-200">₹{gstCharges}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm md:text-base text-red-600 dark:text-red-400">
                        <span>Coupon Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm md:text-base font-semibold pt-2 md:pt-3 border-t dark:border-gray-700">
                      <span>To Pay</span>
                      <span>₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Issue Notice */}
              <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-3 md:py-4 border-t-4 border-gray-100 dark:border-gray-800 rounded-lg md:rounded-xl">
                <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">Appzeto Money</p>
                <p className="text-xs md:text-sm text-amber-600 dark:text-amber-400">Facing technical issues. Will be back shortly!</p>
              </div>
            </div>

            {/* Right Column - Order Summary (Desktop) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
                {/* Bill Summary Card */}
                <div className="bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-4 md:py-5 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 md:mb-4">Order Summary</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Item Total</span>
                      <span className="text-gray-800 dark:text-gray-200">₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                      <span className={deliveryFee === 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                      <span className="text-gray-800 dark:text-gray-200">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span className="text-gray-600 dark:text-gray-400">GST</span>
                      <span className="text-gray-800 dark:text-gray-200">₹{gstCharges}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm md:text-base text-red-600 dark:text-red-400">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base md:text-lg font-bold pt-3 md:pt-4 border-t dark:border-gray-700">
                      <span>Total</span>
                      <span className="text-green-600 dark:text-green-400">₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky - Payment & Place Order */}
      <div className="bg-white dark:bg-[#1a1a1a] border-t dark:border-gray-800 shadow-lg z-30 flex-shrink-0 fixed bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <button 
              onClick={() => setShowPaymentSelection(true)}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1 -m-1 transition-colors"
            >
            {selectedPayment ? (
              <div className="w-7 h-7 rounded flex items-center justify-center overflow-hidden">
                {selectedPayment.icon === 'gpay' ? (
                  <div className="w-7 h-7 bg-white rounded flex items-center justify-center border border-gray-200">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                ) : selectedPayment.icon === 'phonepe' ? (
                  <div className="w-7 h-7 bg-[#5f259f] rounded flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l5-6v4h3l-5 6z"/>
                    </svg>
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-gray-500" />
              </div>
            )}
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  PAY USING <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                </p>
                <p className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 text-start">
                  {"Razorpay"}
                </p>
              </div>
            </button>
            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white px-5 md:px-7 h-11 md:h-12 rounded-sm md:rounded-md text-sm md:text-base"
            >
              <div className="text-left mr-2 md:mr-3">
                <p className="text-xs md:text-sm opacity-90">₹{total.toFixed(0)}</p>
                <p className="text-xs opacity-75">TOTAL</p>
              </div>
              <span className="font-semibold text-sm md:text-base">
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </span>
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Selection Modal */}
      {showPaymentSelection && (
        <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => setShowPaymentSelection(false)}
          />
          
          {/* Payment Selection Sheet */}
          <div 
            className="absolute inset-0 bg-gray-50 animate-slideUpFull h-screen overflow-hidden"
            style={{ animation: 'slideUpFull 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
              <div className="flex items-center gap-3 px-4 py-3">
          <button 
            onClick={() => {
              setShowPaymentSelection(false)
              // Mark payment selection as shown when user closes it
              localStorage.setItem('cartPaymentSelectionShown', 'true')
            }}
            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
                <span className="font-semibold text-gray-800">Bill total: ₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Options */}
            <div ref={paymentOptionsRef} className="overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
              {/* Recommended Section */}
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2">RECOMMENDED</p>
                <div className="bg-white">
                  {paymentOptions.recommended.map((payment, index) => (
                    <button
                      key={payment.id}
                      onClick={() => handleSelectPayment(payment)}
                      className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                        index !== paymentOptions.recommended.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderPaymentIcon(payment.icon)}
                        <span className="text-sm font-medium text-gray-800">{payment.name}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Section */}
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2">CARDS</p>
                <div className="bg-white">
                  {paymentOptions.cards.map((payment, index) => (
                    <button
                      key={payment.id}
                      onClick={() => handleSelectPayment(payment)}
                      className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                        index !== paymentOptions.cards.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderPaymentIcon(payment.icon)}
                        <span className="text-sm font-medium text-gray-800">{payment.name}</span>
                      </div>
                      {payment.isAddNew ? (
                        <Plus className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI Section */}
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2">PAY BY ANY UPI APP</p>
                <div className="bg-white">
                  {paymentOptions.upi.map((payment) => (
                    <button
                      key={payment.id}
                      onClick={() => handleSelectPayment(payment)}
                      className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {renderPaymentIcon(payment.icon)}
                        <span className="text-sm font-medium text-gray-800">{payment.name}</span>
                      </div>
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallets Section */}
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2">WALLETS</p>
                <div className="bg-white">
                  {paymentOptions.wallets.map((payment, index) => (
                    <button
                      key={payment.id}
                      onClick={() => handleSelectPayment(payment)}
                      className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                        index !== paymentOptions.wallets.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderPaymentIcon(payment.icon)}
                        <span className="text-sm font-medium text-gray-800">{payment.name}</span>
                      </div>
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay Later Section */}
              <div className="pt-4 pb-8">
                <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2">PAY LATER</p>
                <div className="bg-white">
                  {paymentOptions.payLater.map((payment) => (
                    <button
                      key={payment.id}
                      onClick={() => handleSelectPayment(payment)}
                      className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {renderPaymentIcon(payment.icon)}
                        <span className="text-sm font-medium text-gray-800">{payment.name}</span>
                      </div>
                      <Plus className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discount Banner Modal */}
      <AnimatePresence>
        {showDiscountBanner && (
          <motion.div 
            className="fixed inset-0 z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseBanner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Banner Modal - Centered */}
            <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="relative w-full max-w-sm pointer-events-auto"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 dark:from-blue-900/30 dark:via-sky-900/30 dark:to-blue-800/30 rounded-3xl shadow-2xl overflow-hidden">
                  {/* Close button - Black circle with white X */}
                  <motion.button
                    onClick={handleCloseBanner}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black dark:bg-gray-800 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4 text-white" strokeWidth={3} />
                  </motion.button>

                  {/* Content */}
                  <div className="relative px-8 py-10">
                    {/* Applied State */}
                    <AnimatePresence mode="wait">
                      {couponApplied ? (
                        <motion.div 
                          className="space-y-6 text-center"
                          initial={{ scale: 0, opacity: 0, rotate: -180 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0, opacity: 0, rotate: 180 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                          }}
                        >
                          <motion.div 
                            className="relative inline-block"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          >
                            {/* Pulsing rings */}
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-green-400"
                              initial={{ scale: 0, opacity: 0.8 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-green-400"
                              initial={{ scale: 0, opacity: 0.6 }}
                              animate={{ scale: 2.5, opacity: 0 }}
                              transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }}
                            />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                              <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                              >
                                <Check className="h-12 w-12 text-white" strokeWidth={3} />
                              </motion.div>
                            </div>
                          </motion.div>
                          <motion.h3 
                            className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            Coupon Applied!
                          </motion.h3>
                          <motion.p 
                            className="text-xl text-emerald-600 dark:text-emerald-400 font-semibold"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            You saved ₹220 on this order
                          </motion.p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="space-y-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {/* Percentage Icon with Spotlight Effect */}
                          <div className="flex justify-center">
                            <motion.div 
                              className="relative"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.2
                              }}
                            >
                              {/* White radial lines (spotlight effect) */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                {[...Array(12)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute w-1 bg-white/40 rounded-full"
                                    style={{
                                      height: '80px',
                                      transformOrigin: 'center',
                                      transform: `rotate(${i * 30}deg) translateY(-40px)`
                                    }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + i * 0.02 }}
                                  />
                                ))}
                              </div>
                              {/* Large percentage icon */}
                              <motion.div 
                                className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center shadow-2xl"
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ duration: 0.6 }}
                              >
                                <Percent className="h-12 w-12 text-white" strokeWidth={2.5} />
                              </motion.div>
                            </motion.div>
                          </div>

                          {/* Exclusively For You Text */}
                          <motion.div 
                            className="text-center"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <Sparkles className="h-5 w-5 text-yellow-400" fill="currentColor" />
                              <span className="text-base font-bold text-gray-900 dark:text-gray-100">EXCLUSIVELY FOR YOU</span>
                              <Sparkles className="h-5 w-5 text-yellow-400" fill="currentColor" />
                            </div>
                          </motion.div>

                          {/* Offer Text */}
                          <motion.div 
                            className="text-center space-y-3"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                              Save <span className="text-blue-600 dark:text-blue-400">₹220</span> on this order
                            </h3>
                            <p className="text-base text-gray-600 dark:text-gray-300">
                              with coupon <span className="font-semibold text-gray-800 dark:text-gray-200">'GETOFF220ON599'</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Tap on 'APPLY' to avail this
                            </p>
                          </motion.div>

                          {/* Apply Button */}
                          <motion.button
                            onClick={handleBannerApply}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 text-lg flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <span>APPLY</span>
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placing Order Modal */}
      {showPlacingOrder && (
        <div className="fixed inset-0 z-[60] h-screen w-screen overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal Sheet */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ animation: 'slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="px-6 py-8">
              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Placing your order</h2>
              
              {/* Payment Info */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                  {selectedPayment?.icon === 'gpay' ? (
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  ) : selectedPayment?.icon === 'phonepe' ? (
                    <div className="w-10 h-10 bg-[#5f259f] rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l5-6v4h3l-5 6z"/>
                      </svg>
                    </div>
                  ) : (
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Pay ₹{total.toFixed(2)} on delivery (UPI/cash)
                  </p>
                </div>
              </div>
              
              {/* Delivery Address */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
                  <svg className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Delivering to Home</p>
                  <p className="text-sm text-gray-500">
                    {defaultAddress ? `${defaultAddress.city}, ${defaultAddress.street}` : "Address"}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative mb-6">
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-100 ease-linear"
                    style={{ 
                      width: `${orderProgress}%`,
                      boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
                    }}
                  />
                </div>
                {/* Animated shimmer effect */}
                <div 
                  className="absolute inset-0 h-2.5 rounded-full overflow-hidden pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 1.5s infinite',
                    width: `${orderProgress}%`
                  }}
                />
              </div>
              
              {/* Cancel Button */}
              <button 
                onClick={() => {
                  setShowPlacingOrder(false)
                  setIsPlacingOrder(false)
                }}
                className="w-full text-right"
              >
                <span className="text-green-600 font-semibold text-base hover:text-green-700 transition-colors">
                  CANCEL
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Celebration Page */}
      {showOrderSuccess && (
        <div 
          className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center h-screen w-screen overflow-hidden"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          {/* Confetti Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated confetti pieces */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                  animation: `confettiFall ${2 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Success Content */}
          <div className="relative z-10 flex flex-col items-center px-6">
            {/* Success Tick Circle */}
            <div 
              className="relative mb-8"
              style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both' }}
            >
              {/* Outer ring animation */}
              <div 
                className="absolute inset-0 w-32 h-32 rounded-full border-4 border-green-500"
                style={{ 
                  animation: 'ringPulse 1.5s ease-out infinite',
                  opacity: 0.3
                }}
              />
              {/* Main circle */}
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                <svg 
                  className="w-16 h-16 text-white"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'checkDraw 0.5s ease-out 0.5s both' }}
                >
                  <path d="M5 12l5 5L19 7" className="check-path" />
                </svg>
              </div>
              {/* Sparkles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    animation: `sparkle 0.6s ease-out ${0.3 + i * 0.1}s both`,
                    transform: `rotate(${i * 60}deg) translateY(-80px)`,
                  }}
                />
              ))}
            </div>

            {/* Location Info */}
            <div 
              className="text-center"
              style={{ animation: 'slideUp 0.5s ease-out 0.6s both' }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-5 h-5 text-red-500">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {defaultAddress?.city || "Your Location"}
                </h2>
              </div>
              <p className="text-gray-500 text-base">
                {defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}` : "Delivery Address"}
              </p>
            </div>

            {/* Order Placed Message */}
            <div 
              className="mt-12 text-center"
              style={{ animation: 'slideUp 0.5s ease-out 0.8s both' }}
            >
              <h3 className="text-3xl font-bold text-green-600 mb-2">Order Placed!</h3>
              <p className="text-gray-600">Your delicious food is on its way</p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGoToOrders}
              className="mt-10 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-12 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
              style={{ animation: 'slideUp 0.5s ease-out 1s both' }}
            >
              Track Your Order
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInBackdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUpBannerSmooth {
          from {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slideUpBanner {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes shimmerBanner {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes scaleInBounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.4);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes checkMarkDraw {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes slideUpFull {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideUpModal {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes checkDraw {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }
        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes sparkle {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(0);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(1);
            opacity: 0;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-slideUpFull {
          animation: slideUpFull 0.3s ease-out;
        }
        .check-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
        }
      `}</style>
    </div>
  )
}
