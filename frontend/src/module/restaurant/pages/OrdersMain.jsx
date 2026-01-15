import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import { Printer, Volume2, VolumeX, ChevronDown, ChevronUp, Minus, Plus, X, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import BottomNavOrders from "../components/BottomNavOrders"
import RestaurantNavbar from "../components/RestaurantNavbar"
import notificationSound from "@/assets/audio/alert.mp3"
import { restaurantAPI } from "@/lib/api"
import { useRestaurantNotifications } from "../hooks/useRestaurantNotifications"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const STORAGE_KEY = "restaurant_online_status"

// Top filter tabs
const filterTabs = [
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "out-for-delivery", label: "Out for delivery" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
]

export default function OrdersMain() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState("preparing")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const contentRef = useRef(null)
  const filterBarRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)
  const mouseStartX = useRef(0)
  const mouseEndX = useRef(0)
  const isMouseDown = useRef(false)

  // New order popup states
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [prepTime, setPrepTime] = useState(11)
  const [countdown, setCountdown] = useState(240) // 4 minutes in seconds
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true)
  const [showRejectPopup, setShowRejectPopup] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const audioRef = useRef(null)
  const [restaurantStatus, setRestaurantStatus] = useState({
    isActive: null,
    rejectionReason: null,
    onboarding: null,
    isLoading: true
  })
  const [isReverifying, setIsReverifying] = useState(false)

  // Restaurant notifications hook for real-time orders
  const { newOrder, clearNewOrder, isConnected } = useRestaurantNotifications()

  const rejectReasons = [
    "Restaurant is too busy",
    "Item not available",
    "Outside delivery area",
    "Kitchen closing soon",
    "Technical issue",
    "Other reason"
  ]

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
        // Only log error if it's not a network/timeout error (backend might be down/slow)
        if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNABORTED' && !error.message?.includes('timeout')) {
          console.error("Error fetching restaurant status:", error)
        }
        // Set loading to false so UI doesn't stay in loading state
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

  // Handle reverify (resubmit for approval)
  const handleReverify = async () => {
    try {
      setIsReverifying(true)
      await restaurantAPI.reverify()
      
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
      
      alert('Restaurant reverified successfully! Verification will be done in 24 hours.')
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
    } finally {
      setIsReverifying(false)
    }
  }

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

  // Show new order popup when real order notification arrives
  useEffect(() => {
    if (newOrder) {
      console.log('📦 New order received in OrdersMain:', newOrder)
      setShowNewOrderPopup(true)
      setCountdown(240) // Reset countdown to 4 minutes
    }
  }, [newOrder])

  // Play audio when popup opens
  useEffect(() => {
    if (showNewOrderPopup && !isMuted) {
      if (audioRef.current) {
        audioRef.current.loop = true
        audioRef.current.play().catch(err => console.log("Audio play failed:", err))
      }
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [showNewOrderPopup, isMuted])

  // Countdown timer
  useEffect(() => {
    if (showNewOrderPopup && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showNewOrderPopup, countdown])

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle accept order
  const handleAcceptOrder = async () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    
    // Accept order via API if we have a real order
    if (newOrder?.orderMongoId || newOrder?.orderId) {
      try {
        const orderId = newOrder.orderMongoId || newOrder.orderId
        await restaurantAPI.acceptOrder(orderId, prepTime)
        console.log('✅ Order accepted:', orderId)
      } catch (error) {
        console.error('❌ Error accepting order:', error)
        alert('Failed to accept order. Please try again.')
        return
      }
    }
    
    setShowNewOrderPopup(false)
    clearNewOrder()
    setCountdown(240)
    setPrepTime(11)
  }

  // Handle reject order
  const handleRejectClick = () => {
    setShowRejectPopup(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectReason) return
    
    // Reject order via API if we have a real order
    if (newOrder?.orderMongoId || newOrder?.orderId) {
      try {
        const orderId = newOrder.orderMongoId || newOrder.orderId
        await restaurantAPI.rejectOrder(orderId, rejectReason)
        console.log('✅ Order rejected:', orderId)
      } catch (error) {
        console.error('❌ Error rejecting order:', error)
        alert('Failed to reject order. Please try again.')
        return
      }
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setShowRejectPopup(false)
    setShowNewOrderPopup(false)
    clearNewOrder()
    setRejectReason("")
    setCountdown(240)
    setPrepTime(11)
  }

  const handleRejectCancel = () => {
    setShowRejectPopup(false)
    setRejectReason("")
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err))
      }
    }
  }

  // Handle PDF download
  const handlePrint = async () => {
    if (!newOrder) {
      console.warn('No order data available for PDF generation')
      return
    }

    try {
      // Create new PDF document
      const doc = new jsPDF()
      
      // Set font
      doc.setFont('helvetica', 'bold')
      
      // Header
      doc.setFontSize(20)
      doc.text('Order Receipt', 105, 20, { align: 'center' })
      
      // Restaurant name
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.text(newOrder.restaurantName || 'Restaurant', 105, 30, { align: 'center' })
      
      // Order details
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Order ID: ${newOrder.orderId || 'N/A'}`, 20, 45)
      doc.setFont('helvetica', 'normal')
      
      const orderDate = newOrder.createdAt 
        ? new Date(newOrder.createdAt).toLocaleString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : new Date().toLocaleString('en-GB')
      
      doc.text(`Date: ${orderDate}`, 20, 52)
      
      // Customer address
      if (newOrder.customerAddress) {
        doc.setFont('helvetica', 'bold')
        doc.text('Delivery Address:', 20, 62)
        doc.setFont('helvetica', 'normal')
        const addressText = [
          newOrder.customerAddress.street,
          newOrder.customerAddress.city,
          newOrder.customerAddress.state
        ].filter(Boolean).join(', ') || 'Address not available'
        const addressLines = doc.splitTextToSize(addressText, 170)
        doc.text(addressLines, 20, 69)
      }
      
      // Items table
      let yPos = 85
      if (newOrder.items && newOrder.items.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.text('Items:', 20, yPos)
        yPos += 8
        
        // Prepare table data
        const tableData = newOrder.items.map(item => [
          item.name || 'Item',
          item.quantity || 1,
          `₹${(item.price || 0).toFixed(2)}`,
          `₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
        ])
        
        autoTable(doc, {
          startY: yPos,
          head: [['Item', 'Qty', 'Price', 'Total']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
          }
        })
        
        yPos = doc.lastAutoTable.finalY + 10
      }
      
      // Total
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(`Total: ₹${(newOrder.total || 0).toFixed(2)}`, 20, yPos)
      
      // Payment status
      yPos += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Payment Status: ${newOrder.status === 'confirmed' ? 'Paid' : 'Pending'}`, 20, yPos)
      
      // Estimated delivery time
      if (newOrder.estimatedDeliveryTime) {
        yPos += 8
        doc.text(`Estimated Delivery: ${newOrder.estimatedDeliveryTime} minutes`, 20, yPos)
      }
      
      // Notes
      if (newOrder.note) {
        yPos += 10
        doc.setFont('helvetica', 'bold')
        doc.text('Note:', 20, yPos)
        doc.setFont('helvetica', 'normal')
        const noteLines = doc.splitTextToSize(newOrder.note, 170)
        doc.text(noteLines, 20, yPos + 7)
      }
      
      // Send cutlery
      if (newOrder.sendCutlery) {
        yPos += 15
        doc.setFont('helvetica', 'normal')
        doc.text('✓ Send cutlery requested', 20, yPos)
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text(
        `Generated on ${new Date().toLocaleString('en-GB')}`,
        105,
        pageHeight - 10,
        { align: 'center' }
      )
      
      // Download PDF
      const fileName = `Order-${newOrder.orderId || 'Receipt'}-${Date.now()}.pdf`
      doc.save(fileName)
      
      console.log('✅ PDF generated successfully:', fileName)
    } catch (error) {
      console.error('❌ Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  // Handle swipe gestures with smooth animations
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchEndX.current = e.touches[0].clientX
    isSwiping.current = false
  }

  const handleTouchMove = (e) => {
    if (!isSwiping.current) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current)
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current)
      
      // Determine if this is a horizontal swipe
      if (deltaX > deltaY && deltaX > 10) {
        isSwiping.current = true
      }
    }
    
    if (isSwiping.current) {
      touchEndX.current = e.touches[0].clientX
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping.current) {
      touchStartX.current = 0
      touchEndX.current = 0
      return
    }

    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50
    const swipeVelocity = Math.abs(swipeDistance)

    if (swipeVelocity > minSwipeDistance && !isTransitioning) {
      const currentIndex = filterTabs.findIndex(tab => tab.id === activeFilter)
      let newIndex = currentIndex
      
      if (swipeDistance > 0 && currentIndex < filterTabs.length - 1) {
        // Swipe left - go to next filter (right side)
        newIndex = currentIndex + 1
      } else if (swipeDistance < 0 && currentIndex > 0) {
        // Swipe right - go to previous filter (left side)
        newIndex = currentIndex - 1
      }

      if (newIndex !== currentIndex) {
        setIsTransitioning(true)
        
        // Smooth transition with animation
        setTimeout(() => {
          setActiveFilter(filterTabs[newIndex].id)
          scrollToFilter(newIndex)
          
          // Reset transition state after animation
          setTimeout(() => {
            setIsTransitioning(false)
          }, 300)
        }, 50)
      }
    }
    
    // Reset touch positions
    touchStartX.current = 0
    touchEndX.current = 0
    touchStartY.current = 0
    isSwiping.current = false
  }

  // Scroll filter bar to show active button with smooth animation
  const scrollToFilter = (index) => {
    if (filterBarRef.current) {
      const buttons = filterBarRef.current.querySelectorAll('button')
      if (buttons[index]) {
        const button = buttons[index]
        const container = filterBarRef.current
        const buttonLeft = button.offsetLeft
        const buttonWidth = button.offsetWidth
        const containerWidth = container.offsetWidth
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }

  // Scroll to active filter on change with smooth animation
  useEffect(() => {
    const index = filterTabs.findIndex(tab => tab.id === activeFilter)
    if (index >= 0) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollToFilter(index)
      })
    }
  }, [activeFilter])


  const handleSelectOrder = (order) => {
    setSelectedOrder(order)
    setIsSheetOpen(true)
  }

  const renderContent = () => {
    switch (activeFilter) {
      case "preparing":
        return <PreparingOrders onSelectOrder={handleSelectOrder} />
      case "ready":
        return <ReadyOrders onSelectOrder={handleSelectOrder} />
      case "out-for-delivery":
        return <EmptyState message="Out for delivery orders will appear here" />
      case "scheduled":
        return <EmptyState message="Scheduled orders will appear here" />
      default:
        return <EmptyState />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Restaurant Navbar - Sticky at top */}
      <div className="sticky top-0 z-50 bg-white">
        <RestaurantNavbar showNotifications={false} />
      </div>

      {/* Top Filter Bar - Sticky below navbar */}
      <div className="sticky top-[50px] z-40 pb-2 bg-gray-100">
        <div 
          ref={filterBarRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide bg-transparent rounded-full px-3 py-2 mt-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {filterTabs.map((tab, index) => {
            const isActive = activeFilter === tab.id
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setActiveFilter(tab.id)
                    scrollToFilter(index)
                    setTimeout(() => setIsTransitioning(false), 300)
                  }
                }}
                className={`shrink-0 px-6 py-3.5 rounded-full font-medium text-sm whitespace-nowrap relative overflow-hidden ${
                  isActive
                    ? 'text-white'
                    : 'bg-white text-black'
                }`}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  opacity: isActive ? 1 : 0.7,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBackground"
                    className="absolute inset-0 bg-black rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 pb-24 content-scroll"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => {
          mouseStartX.current = e.clientX
          mouseEndX.current = e.clientX
          isMouseDown.current = true
          isSwiping.current = false
        }}
        onMouseMove={(e) => {
          if (isMouseDown.current) {
            if (!isSwiping.current) {
              const deltaX = Math.abs(e.clientX - mouseStartX.current)
              if (deltaX > 10) {
                isSwiping.current = true
              }
            }
            if (isSwiping.current) {
              mouseEndX.current = e.clientX
            }
          }
        }}
        onMouseUp={() => {
          if (isMouseDown.current && isSwiping.current) {
            const swipeDistance = mouseStartX.current - mouseEndX.current
            const minSwipeDistance = 50

            if (Math.abs(swipeDistance) > minSwipeDistance && !isTransitioning) {
              const currentIndex = filterTabs.findIndex(tab => tab.id === activeFilter)
              let newIndex = currentIndex
              
              if (swipeDistance > 0 && currentIndex < filterTabs.length - 1) {
                newIndex = currentIndex + 1
              } else if (swipeDistance < 0 && currentIndex > 0) {
                newIndex = currentIndex - 1
              }

              if (newIndex !== currentIndex) {
                setIsTransitioning(true)
                setTimeout(() => {
                  setActiveFilter(filterTabs[newIndex].id)
                  scrollToFilter(newIndex)
                  setTimeout(() => setIsTransitioning(false), 300)
                }, 50)
              }
            }
          }
          
          isMouseDown.current = false
          isSwiping.current = false
          mouseStartX.current = 0
          mouseEndX.current = 0
        }}
        onMouseLeave={() => {
          isMouseDown.current = false
          isSwiping.current = false
        }}
      >
        <style>{`
          .content-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .content-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Verification Pending Card - Show if onboarding is complete (all 4 steps) and restaurant is not active */}
        {!restaurantStatus.isLoading && 
         !restaurantStatus.isActive && 
         restaurantStatus.onboarding?.completedSteps === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`mt-4 mb-4 rounded-2xl shadow-sm px-6 py-4 ${
              restaurantStatus.rejectionReason
                ? 'bg-white border border-red-200'
                : 'bg-white border border-yellow-200'
            }`}
          >
            {restaurantStatus.rejectionReason ? (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 rounded-full p-2 bg-red-100">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-red-600 mb-2">Denied Verification</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-red-800 mb-2">Reason for Rejection:</p>
                      <div className="text-xs text-red-700 space-y-1">
                        {restaurantStatus.rejectionReason.split('\n').filter(line => line.trim()).length > 1 ? (
                          <ul className="space-y-1 list-disc list-inside">
                            {restaurantStatus.rejectionReason.split('\n').map((point, index) => (
                              point.trim() && (
                                <li key={index}>{point.trim()}</li>
                              )
                            ))}
                          </ul>
                        ) : (
                          <p className="text-red-700">{restaurantStatus.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Please correct the above issues and click "Reverify" to resubmit your request for approval.
                </p>
                <button
                  onClick={handleReverify}
                  disabled={isReverifying}
                  className="w-full px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isReverifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Reverify"
                  )}
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Verification Done in 24 Hours</h3>
                <p className="text-sm text-gray-600">Your account is under verification. You'll be notified once approved.</p>
              </>
            )}
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} src={notificationSound} />

      {/* New Order Popup */}
      <AnimatePresence>
        {showNewOrderPopup && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-[95%] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {newOrder?.orderId || '#Order'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {newOrder?.restaurantName || 'Restaurant'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Print"
                    >
                      <Printer className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-gray-700" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
                  {/* Customer info */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {newOrder?.items?.[0]?.name || 'New Order'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {newOrder?.createdAt 
                        ? new Date(newOrder.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </p>
                  </div>

                  {/* Details Accordion */}
                  <div className="mb-4">
                    <button
                      onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                      className="w-full flex items-center justify-between py-2 border-b border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-900">Details</span>
                        <span className="text-xs text-gray-500">
                          {newOrder?.items?.length || 0} item{newOrder?.items?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {isDetailsExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isDetailsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="py-3 space-y-3">
                            {newOrder?.items?.map((item, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.quantity} x {item.name}
                                    </p>
                                    <p className="text-xs text-gray-600 ml-2">
                                      ₹{item.price * item.quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )) || (
                              <p className="text-sm text-gray-500">No items</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Send cutlery */}
                  {newOrder?.sendCutlery && (
                    <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">Send cutlery</span>
                    </div>
                  )}

                  {/* Total bill */}
                  <div className="mb-4 flex items-center justify-between py-3 border-y border-gray-200">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-900">Total bill</span>
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      ₹{newOrder?.total || 0}
                    </span>
                  </div>

                  {/* Preparation time */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Preparation time</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPrepTime(Math.max(1, prepTime - 1))}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="text-base font-semibold text-gray-900 min-w-[60px] text-center">
                          {prepTime} mins
                        </span>
                        <button
                          onClick={() => setPrepTime(prepTime + 1)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accept and Reject buttons */}
                  <div className="space-y-3">
                    {/* Accept button with countdown */}
                    <div className="relative">
                      <button
                        onClick={handleAcceptOrder}
                        className="w-full bg-black text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors relative overflow-hidden"
                      >
                        {/* Loading background */}
                        <motion.div
                          className="absolute inset-0 bg-blue-600"
                          initial={{ width: "100%" }}
                          animate={{ width: `${(countdown / 240) * 100}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                        <span className="relative z-10">Accept ({formatTime(countdown)})</span>
                      </button>
                    </div>

                    {/* Reject button */}
                    <button
                      onClick={handleRejectClick}
                      className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors"
                    >
                      Reject Order
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline mx-auto block">
                    Need help with this order?
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Order Popup */}
      <AnimatePresence>
        {showRejectPopup && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleRejectCancel}
            >
              <motion.div
                className="w-[95%] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">
                    Reject Order {newOrder?.orderId || '#Order'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Please select a reason for rejecting this order</p>
                </div>

                {/* Content */}
                <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    {rejectReasons.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setRejectReason(reason)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          rejectReason === reason
                            ? "border-black bg-black/5"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            rejectReason === reason ? "text-black" : "text-gray-900"
                          }`}>
                            {reason}
                          </span>
                          {rejectReason === reason && (
                            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={handleRejectCancel}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason}
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors ${
                      rejectReason
                        ? "!bg-black !text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Sheet for Order Details */}
      <AnimatePresence>
        {isSheetOpen && selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSheetOpen(false)}
          >
            <motion.div
              className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-4 pb-6 shadow-lg"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center mb-3">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-black">
                    Order #{selectedOrder.orderId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {selectedOrder.type}
                    {selectedOrder.tableOrToken
                      ? ` • ${selectedOrder.tableOrToken}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${
                      selectedOrder.status === "Ready"
                        ? "border-green-500 text-green-600"
                        : "border-gray-800 text-gray-900"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedOrder.status === "Ready"
                          ? "bg-green-500"
                          : "bg-gray-800"
                      }`}
                    />
                    {selectedOrder.status}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {selectedOrder.timePlaced}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-3" />

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Items
                </p>
                <p className="text-xs text-gray-600">
                  {selectedOrder.itemsSummary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4">
                {/* Hide ETA for ready orders */}
                {selectedOrder.status !== 'ready' && selectedOrder.eta && (
                  <span>ETA: <span className="font-medium text-black">{selectedOrder.eta}</span></span>
                )}
                <span>Payment: <span className="font-medium text-black">Paid online</span></span>
              </div>

              <button
                className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium"
                onClick={() => setIsSheetOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Sticky */}
      <BottomNavOrders />
    </div>
  )
}

// Order Card Component
function OrderCard({
  orderId,
  mongoId,
  status,
  customerName,
  type,
  tableOrToken,
  timePlaced,
  eta,
  itemsSummary,
  photoUrl,
  photoAlt,
  deliveryPartnerId,
  onSelect,
  onResendRequest,
}) {
  const isReady = status === "Ready"
  const [isResending, setIsResending] = useState(false)
  // Show resend button for all preparing orders (assigned or not)
  // If assigned, it will resend to existing partner; if not, it will find nearest partner
  const showResendButton = status === 'preparing'

  const handleResendRequest = async (e) => {
    e.stopPropagation() // Prevent triggering order selection
    if (!mongoId || isResending) return

    try {
      setIsResending(true)
      await onResendRequest?.(mongoId, orderId)
    } catch (error) {
      console.error('Error resending delivery request:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl p-4 mb-3 border border-gray-200 hover:border-gray-400 transition-colors relative">
      <button
        type="button"
        onClick={() =>
          onSelect?.({
            orderId,
            status,
            customerName,
            type,
            tableOrToken,
            timePlaced,
            eta,
            itemsSummary,
          })
        }
        className="w-full text-left flex gap-3 items-stretch"
      >
      {/* Photo */}
      <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 my-auto">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={photoAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-2">
            <span className="text-[11px] font-medium text-gray-500 text-center leading-tight">
              {photoAlt}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-h-[80px]">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-black leading-tight">
              Order #{orderId}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {customerName}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${
                isReady
                  ? "border-green-500 text-green-600"
                  : "border-gray-800 text-gray-900"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isReady ? "bg-green-500" : "bg-gray-800"
                }`}
              />
              {status}
            </span>
            <span className="text-[11px] text-gray-500 text-right">
              {timePlaced}
            </span>
          </div>
        </div>

        {/* Middle row */}
        <div className="mt-2">
          <p className="text-xs text-gray-600 line-clamp-1">
            {itemsSummary}
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-gray-500">
              {type}
              {tableOrToken ? ` • ${tableOrToken}` : ""}
            </p>
            {/* Delivery Assignment Status - Only show for preparing orders */}
            {status === 'preparing' && (
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  deliveryPartnerId 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-orange-100 text-orange-700 border border-orange-300'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    deliveryPartnerId ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  {deliveryPartnerId ? 'Assigned' : 'Not Assigned'}
                </span>
              </div>
            )}
          </div>
          {/* Hide ETA for ready orders */}
          {status !== 'ready' && eta && (
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] text-gray-500">ETA</span>
              <span className="text-xs font-medium text-black">
                {eta}
              </span>
            </div>
          )}
        </div>
      </div>

      </button>

      {/* Resend Request Button - Show for all preparing orders */}
      {showResendButton && (
        <button
          type="button"
          onClick={handleResendRequest}
          disabled={isResending}
          className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-[10px] font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 z-10"
          title={deliveryPartnerId 
            ? "Resend delivery request to assigned delivery partner" 
            : "Send delivery request to nearest delivery partner"}
        >
          {isResending ? (
            <>
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {deliveryPartnerId ? 'Resend Request' : 'Send Request'}
            </>
          )}
        </button>
      )}
    </div>
  )
}

// Preparing Orders List
function PreparingOrders({ onSelectOrder }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const handleResendRequest = async (mongoId, orderId) => {
    try {
      // Call the markOrderPreparing API with resend flag to resend delivery assignment
      // Pass resend=true as query parameter to indicate this is a resend request
      const response = await restaurantAPI.markOrderPreparing(mongoId, { resend: true })
      
      if (response.data?.success) {
        // Show success message
        toast.success('Delivery request sent successfully!', {
          duration: 3000,
        })
        
        // Refresh orders immediately to get updated delivery partner status
        setTimeout(() => {
          // Trigger a manual refetch
          const fetchOrders = async () => {
            try {
              const response = await restaurantAPI.getOrders()
              if (response.data?.success && response.data.data?.orders) {
                const preparingOrders = response.data.data.orders.filter(
                  order => order.status === 'preparing'
                )
                const transformedOrders = preparingOrders.map(order => {
                  const initialETA = order.estimatedDeliveryTime || 30
                  const preparingTimestamp = order.tracking?.preparing?.timestamp 
                    ? new Date(order.tracking.preparing.timestamp)
                    : new Date(order.createdAt)
                  
                  return {
                    orderId: order.orderId || order._id,
                    mongoId: order._id,
                    status: order.status || 'preparing',
                    customerName: order.userId?.name || 'Customer',
                    type: order.deliveryFleet === 'standard' ? 'Home Delivery' : 'Express Delivery',
                    tableOrToken: null,
                    timePlaced: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    initialETA,
                    preparingTimestamp,
                    itemsSummary: order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'No items',
                    photoUrl: order.items?.[0]?.image || null,
                    photoAlt: order.items?.[0]?.name || 'Order',
                    deliveryPartnerId: order.deliveryPartnerId || null
                  }
                })
                setOrders(transformedOrders)
              }
            } catch (error) {
              console.error('Error refreshing orders:', error)
            }
          }
          fetchOrders()
        }, 500)
      } else {
        throw new Error(response.data?.message || 'Failed to resend request')
      }
    } catch (error) {
      console.error('Error resending delivery request:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend delivery request'
      toast.error(errorMessage, {
        duration: 4000,
      })
      throw error
    }
  }

  useEffect(() => {
    let isMounted = true
    let intervalId = null
    let countdownIntervalId = null

    const fetchOrders = async () => {
      try {
        // Fetch all orders and filter for 'preparing' status on frontend
        const response = await restaurantAPI.getOrders()
        
        if (!isMounted) return
        
        if (response.data?.success && response.data.data?.orders) {
          // Filter orders with 'preparing' status
          const preparingOrders = response.data.data.orders.filter(
            order => order.status === 'preparing'
          )
          
          const transformedOrders = preparingOrders.map(order => {
            const initialETA = order.estimatedDeliveryTime || 30 // in minutes
            const preparingTimestamp = order.tracking?.preparing?.timestamp 
              ? new Date(order.tracking.preparing.timestamp)
              : new Date(order.createdAt) // Fallback to createdAt if preparing timestamp not available
            
            return {
              orderId: order.orderId || order._id,
              mongoId: order._id,
              status: order.status || 'preparing',
              customerName: order.userId?.name || 'Customer',
              type: order.deliveryFleet === 'standard' ? 'Home Delivery' : 'Express Delivery',
              tableOrToken: null,
              timePlaced: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              initialETA, // Store initial ETA in minutes
              preparingTimestamp, // Store when order started preparing
              itemsSummary: order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'No items',
              photoUrl: order.items?.[0]?.image || null,
              photoAlt: order.items?.[0]?.name || 'Order',
              deliveryPartnerId: order.deliveryPartnerId || null // Track if delivery partner is assigned
            }
          })
          
          if (isMounted) {
            setOrders(transformedOrders)
            setLoading(false)
          }
        } else {
          if (isMounted) {
            setOrders([])
            setLoading(false)
          }
        }
      } catch (error) {
        if (!isMounted) return
        
        // Don't log network errors repeatedly - they're expected if backend is down
        if (error.code !== 'ERR_NETWORK' && error.response?.status !== 404) {
          console.error('Error fetching preparing orders:', error)
        }
        
        if (isMounted) {
          setOrders([])
          setLoading(false)
        }
      }
    }

    fetchOrders()
    
    // Refresh orders every 10 seconds
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchOrders()
      }
    }, 10000)

    // Update countdown every second
    countdownIntervalId = setInterval(() => {
      if (isMounted) {
        setCurrentTime(new Date())
      }
    }, 1000)
    
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId)
      }
    }
  }, []) // Empty dependency array is correct here - we want this to run once on mount

  if (loading) {
    return (
      <div className="pt-4 pb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-black">Preparing orders</h2>
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-black">
          Preparing orders
        </h2>
        <span className="text-xs text-gray-500">{orders.length} active</span>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No orders in preparation
        </div>
      ) : (
        <div>
          {orders.map((order) => {
            // Calculate remaining ETA (countdown)
            const elapsedMs = currentTime - order.preparingTimestamp
            const elapsedMinutes = Math.floor(elapsedMs / 60000)
            const remainingMinutes = Math.max(0, order.initialETA - elapsedMinutes)
            
            // Format ETA display
            let etaDisplay = ''
            if (remainingMinutes <= 0) {
              const remainingSeconds = Math.max(0, Math.floor((order.initialETA * 60) - (elapsedMs / 1000)))
              if (remainingSeconds > 0) {
                etaDisplay = `${remainingSeconds} secs`
              } else {
                etaDisplay = '0 mins'
              }
            } else {
              etaDisplay = `${remainingMinutes} mins`
            }

            return (
              <OrderCard
                key={order.orderId || order.mongoId}
                orderId={order.orderId}
                mongoId={order.mongoId}
                status={order.status}
                customerName={order.customerName}
                type={order.type}
                tableOrToken={order.tableOrToken}
                timePlaced={order.timePlaced}
                eta={etaDisplay}
                itemsSummary={order.itemsSummary}
                photoUrl={order.photoUrl}
                photoAlt={order.photoAlt}
                deliveryPartnerId={order.deliveryPartnerId}
                onSelect={onSelectOrder}
                onResendRequest={handleResendRequest}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// Ready Orders List
function ReadyOrders({ onSelectOrder }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let intervalId = null

    const fetchOrders = async () => {
      try {
        // Fetch all orders and filter for 'ready' status on frontend
        const response = await restaurantAPI.getOrders()
        
        if (!isMounted) return
        
        if (response.data?.success && response.data.data?.orders) {
          // Filter orders with 'ready' status
          const readyOrders = response.data.data.orders.filter(
            order => order.status === 'ready'
          )
          
          const transformedOrders = readyOrders.map(order => ({
            orderId: order.orderId || order._id,
            mongoId: order._id,
            status: order.status || 'ready',
            customerName: order.userId?.name || 'Customer',
            type: order.deliveryFleet === 'standard' ? 'Home Delivery' : 'Express Delivery',
            tableOrToken: null,
            timePlaced: new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            eta: null, // Don't show ETA for ready orders
            itemsSummary: order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'No items',
            photoUrl: order.items?.[0]?.image || null,
            photoAlt: order.items?.[0]?.name || 'Order'
          }))
          
          if (isMounted) {
            setOrders(transformedOrders)
            setLoading(false)
          }
        } else {
          if (isMounted) {
            setOrders([])
            setLoading(false)
          }
        }
      } catch (error) {
        if (!isMounted) return
        
        // Don't log network errors repeatedly - they're expected if backend is down
        if (error.code !== 'ERR_NETWORK' && error.response?.status !== 404) {
          console.error('Error fetching ready orders:', error)
        }
        
        if (isMounted) {
          setOrders([])
          setLoading(false)
        }
      }
    }

    fetchOrders()
    
    // Refresh every 10 seconds (reduced frequency to avoid spam if backend is down)
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchOrders()
      }
    }, 10000)
    
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, []) // Empty dependency array is correct here - we want this to run once on mount

  if (loading) {
    return (
      <div className="pt-4 pb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-black">Ready for pickup</h2>
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-black">
          Ready for pickup
        </h2>
        <span className="text-xs text-gray-500">{orders.length} active</span>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No orders ready for pickup
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard
              key={order.orderId || order.mongoId}
              {...order}
              onSelect={onSelectOrder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Empty State Component
function EmptyState({ message = "Temporarily closed" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      {/* Store Illustration */}
      <div className="mb-6">
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200" 
          className="text-gray-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Storefront */}
          <rect x="40" y="80" width="120" height="80" stroke="currentColor" strokeWidth="2" fill="white" />
          {/* Awning */}
          <path d="M30 80 L100 50 L170 80" stroke="currentColor" strokeWidth="2" fill="white" />
          {/* Doors */}
          <rect x="60" y="100" width="30" height="60" stroke="currentColor" strokeWidth="2" fill="white" />
          <rect x="110" y="100" width="30" height="60" stroke="currentColor" strokeWidth="2" fill="white" />
          {/* Laptop */}
          <rect x="70" y="140" width="40" height="25" stroke="currentColor" strokeWidth="1.5" fill="white" />
          <text x="85" y="155" fontSize="8" fill="currentColor" textAnchor="middle">CLOSED</text>
          {/* Sign */}
          <rect x="80" y="170" width="40" height="20" stroke="currentColor" strokeWidth="1.5" fill="white" />
        </svg>
      </div>
      
      {/* Message */}
      <h2 className="text-lg font-semibold text-gray-600 mb-4 text-center">
        {message}
      </h2>
      
      {/* View Status Button */}
      <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
        View status
      </button>
    </div>
  )
}
