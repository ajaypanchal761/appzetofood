import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import {
  Lightbulb,
  HelpCircle,
  Calendar,
  Clock,
  Lock,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  UtensilsCrossed,
  Wallet,
  TrendingUp,
  CheckCircle,
  Bell,
  MapPin,
  ChefHat,
  Phone,
  X,
  TargetIcon,
  Play,
  Pause,
  IndianRupee,
  Loader2,
} from "lucide-react"
import BottomPopup from "../components/BottomPopup"
import FeedNavbar from "../components/FeedNavbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGigStore } from "../store/gigStore"
import { useProgressStore } from "../store/progressStore"
import { formatTimeDisplay, calculateTotalHours } from "../utils/gigUtils"
import {
  fetchDeliveryWallet,
  calculatePeriodEarnings
} from "../utils/deliveryWalletState"
import { formatCurrency } from "../../restaurant/utils/currency"
import { getAllDeliveryOrders } from "../utils/deliveryOrderStatus"
import { getUnreadDeliveryNotificationCount } from "../utils/deliveryNotifications"
import { deliveryAPI } from "@/lib/api"
import referralBonusBg from "../../../assets/referralbonuscardbg.png"
import dropLocationBanner from "../../../assets/droplocationbanner.png"
import alertSound from "../../../assets/audio/alert.mp3"
import bikeLogo from "../../../assets/bikelogo.png"

// Ola Maps API Key removed

// Mock restaurants data
const mockRestaurants = [
  {
    id: 1,
    name: "Hotel Pankaj",
    address: "Opposite Midway, Behror Locality, Behror",
    lat: 28.2849,
    lng: 76.1209,
    distance: "3.56 km",
    timeAway: "4 mins",
    orders: 2,
    estimatedEarnings: 76.62, // Consistent payment amount
    pickupDistance: "3.56 km",
    dropDistance: "12.2 km",
    payment: "COD",
    amount: 76.62, // Payment amount (consistent with estimatedEarnings)
    items: 2,
    phone: "+911234567890",
    orderId: "ORD1234567890",
    customerName: "Rajesh Kumar",
    customerAddress: "401, 4th Floor, Pushparatna Solitare Building, Janjeerwala Square, New Palasia, Indore",
    customerPhone: "+919876543210",
    tripTime: "38 mins",
    tripDistance: "8.8 kms"
  },
  {
    id: 2,
    name: "Haldi",
    address: "B 2, Narnor-Alwar Rd, Indus Valley, Behror",
    lat: 28.2780,
    lng: 76.1150,
    distance: "4.2 km",
    timeAway: "4 mins",
    orders: 1,
    estimatedEarnings: 76.62,
    pickupDistance: "4.2 km",
    dropDistance: "8.5 km",
    payment: "COD",
    amount: 76.62,
    items: 3,
    phone: "+911234567891",
    orderId: "ORD1234567891",
    customerName: "Priya Sharma",
    customerAddress: "Flat 302, Green Valley Apartments, MG Road, Indore",
    customerPhone: "+919876543211",
    tripTime: "35 mins",
    tripDistance: "7.5 kms"
  },
  {
    id: 3,
    name: "Pandit Ji Samose Wale",
    address: "Near Govt. Senior Secondary School, Behror Locality, Behror",
    lat: 28.2870,
    lng: 76.1250,
    distance: "5.04 km",
    timeAway: "6 mins",
    orders: 1,
    estimatedEarnings: 76.62,
    pickupDistance: "5.04 km",
    dropDistance: "7.8 km",
    payment: "COD",
    amount: 76.62,
    items: 1,
    phone: "+911234567892",
    orderId: "ORD1234567892",
    customerName: "Amit Patel",
    customerAddress: "House No. 45, Sector 5, Vijay Nagar, Indore",
    customerPhone: "+919876543212",
    tripTime: "32 mins",
    tripDistance: "6.9 kms"
  }
]

export default function DeliveryHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const [animationKey, setAnimationKey] = useState(0)

  // Helper function to safely call preventDefault (handles passive event listeners)
  const safePreventDefault = (e) => {
    if (e && e.cancelable !== false && typeof e.preventDefault === 'function') {
      try {
        e.preventDefault()
      } catch (err) {
        // Silently ignore if preventDefault fails (passive listener)
        // This prevents console errors
      }
    }
  }
  const [walletState, setWalletState] = useState({
    totalBalance: 0,
    cashInHand: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
    transactions: [],
    joiningBonusClaimed: false
  })
  const [activeOrder, setActiveOrder] = useState(() => {
    const stored = localStorage.getItem('activeOrder')
    return stored ? JSON.parse(stored) : null
  })
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(() => getUnreadDeliveryNotificationCount())
  // Default location - Indore, India (based on image)
  const [riderLocation, setRiderLocation] = useState([22.7196, 75.8577]) // Indore coordinates
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false)
  const [bankDetailsFilled, setBankDetailsFilled] = useState(false)
  const [deliveryStatus, setDeliveryStatus] = useState(null) // Store delivery partner status
  const [rejectionReason, setRejectionReason] = useState(null) // Store rejection reason
  const [isReverifying, setIsReverifying] = useState(false) // Loading state for reverify
  
  // Map refs and state (Ola Maps removed)
  const mapContainerRef = useRef(null)
  const directionsMapContainerRef = useRef(null)
  const watchPositionIdRef = useRef(null) // Store watchPosition ID for cleanup
  const lastLocationRef = useRef(null) // Store last location for heading calculation
  const bikeMarkerRef = useRef(null) // Store bike marker instance
  const routePolylineRef = useRef(null) // Store route polyline instance
  const routeHistoryRef = useRef([]) // Store route history for traveled path
  const isOnlineRef = useRef(false) // Store online status for use in callbacks
  const [mapLoading, setMapLoading] = useState(false)
  const [directionsMapLoading, setDirectionsMapLoading] = useState(false)
  const isInitializingMapRef = useRef(false)

  // Seeded random number generator for consistent hotspots
  const createSeededRandom = (seed) => {
    let currentSeed = seed
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280
      return currentSeed / 233280
    }
  }

  // Generate irregular polygon from random nearby points (using seeded random)
  const createIrregularPolygon = (center, numPoints, spread, seedOffset) => {
    const [lat, lng] = center
    const vertices = []
    const seededRandom = createSeededRandom(seedOffset)
    
    // Generate random points around the center
    for (let i = 0; i < numPoints; i++) {
      // Seeded random angle
      const angle = seededRandom() * 2 * Math.PI
      // Seeded random distance (varying spread for irregularity)
      const distance = spread * (0.5 + seededRandom() * 0.5)
      
      const vertexLat = lat + distance * Math.cos(angle)
      const vertexLng = lng + distance * Math.sin(angle)
      vertices.push([vertexLat, vertexLng])
    }
    
    // Sort vertices by angle to create a proper polygon (prevents self-intersection)
    const centerLat = vertices.reduce((sum, v) => sum + v[0], 0) / vertices.length
    const centerLng = vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length
    
    vertices.sort((a, b) => {
      const angleA = Math.atan2(a[0] - centerLat, a[1] - centerLng)
      const angleB = Math.atan2(b[0] - centerLat, b[1] - centerLng)
      return angleA - angleB
    })
    
    return vertices
  }

  // Generate nearby hotspot locations with irregular shapes from 3-5 points
  // Using useState with lazy initializer to generate hotspots once and keep them fixed
  const [hotspots] = useState(() => {
    const [lat, lng] = riderLocation
    const hotspots = []
    const baseSpread = 0.004 // Base spread for points in degrees
    
    // Hotspot 1 - Northeast, 3 points
    hotspots.push({
      type: 'polygon',
      center: [lat + 0.008, lng + 0.006],
      vertices: createIrregularPolygon([lat + 0.008, lng + 0.006], 3, baseSpread * 1.2, 1000),
      opacity: 0.25
    })
    
    // Hotspot 2 - Northwest, 4 points
    hotspots.push({
      type: 'polygon',
      center: [lat + 0.005, lng - 0.007],
      vertices: createIrregularPolygon([lat + 0.005, lng - 0.007], 4, baseSpread * 1.0, 2000),
      opacity: 0.3
    })
    
    // Hotspot 3 - Southeast, 5 points
    hotspots.push({
      type: 'polygon',
      center: [lat - 0.006, lng + 0.009],
      vertices: createIrregularPolygon([lat - 0.006, lng + 0.009], 5, baseSpread * 0.9, 3000),
      opacity: 0.2
    })
    
    // Hotspot 4 - Southwest, 3 points
    hotspots.push({
      type: 'polygon',
      center: [lat - 0.004, lng - 0.005],
      vertices: createIrregularPolygon([lat - 0.004, lng - 0.005], 3, baseSpread * 1.1, 4000),
      opacity: 0.28
    })
    
    // Hotspot 5 - North, 4 points
    hotspots.push({
      type: 'polygon',
      center: [lat + 0.011, lng + 0.001],
      vertices: createIrregularPolygon([lat + 0.011, lng + 0.001], 4, baseSpread * 0.7, 5000),
      opacity: 0.22
    })
    
    // Hotspot 6 - East, 5 points
    hotspots.push({
      type: 'polygon',
      center: [lat + 0.002, lng + 0.012],
      vertices: createIrregularPolygon([lat + 0.002, lng + 0.012], 5, baseSpread * 1.1, 6000),
      opacity: 0.32
    })
    
    // Hotspot 7 - South, 3 points
    hotspots.push({
      type: 'polygon',
      center: [lat - 0.009, lng - 0.002],
      vertices: createIrregularPolygon([lat - 0.009, lng - 0.002], 3, baseSpread * 1.0, 7000),
      opacity: 0.26
    })
    
    // Hotspot 8 - West, 4 points
    hotspots.push({
      type: 'polygon',
      center: [lat - 0.001, lng - 0.010],
      vertices: createIrregularPolygon([lat - 0.001, lng - 0.010], 4, baseSpread * 0.85, 8000),
      opacity: 0.24
    })
    
    // Hotspot 9 - Northeast (further), 5 points
    hotspots.push({
      type: 'polygon',
      center: [lat + 0.006, lng + 0.008],
      vertices: createIrregularPolygon([lat + 0.006, lng + 0.008], 5, baseSpread * 0.6, 9000),
      opacity: 0.23
    })
    
    // Hotspot 10 - Southwest (further), 3 points
    hotspots.push({
      type: 'polygon',
      center: [lat - 0.007, lng - 0.008],
      vertices: createIrregularPolygon([lat - 0.007, lng - 0.008], 3, baseSpread * 0.9, 10000),
      opacity: 0.27
    })
    
    return hotspots
  })
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false)
  const [acceptButtonProgress, setAcceptButtonProgress] = useState(0)
  const [isAnimatingToComplete, setIsAnimatingToComplete] = useState(false)
  const [hasAutoShown, setHasAutoShown] = useState(false)
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(300)
  const countdownTimerRef = useRef(null)
  const [showRejectPopup, setShowRejectPopup] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const alertAudioRef = useRef(null)
  const newOrderAcceptButtonRef = useRef(null)
  const newOrderAcceptButtonSwipeStartX = useRef(0)
  const newOrderAcceptButtonSwipeStartY = useRef(0)
  const newOrderAcceptButtonIsSwiping = useRef(false)
  const [newOrderAcceptButtonProgress, setNewOrderAcceptButtonProgress] = useState(0)
  const [newOrderIsAnimatingToComplete, setNewOrderIsAnimatingToComplete] = useState(false)
  const newOrderPopupRef = useRef(null)
  const newOrderSwipeStartY = useRef(0)
  const newOrderIsSwiping = useRef(false)
  const [newOrderDragY, setNewOrderDragY] = useState(0)
  const [isDraggingNewOrderPopup, setIsDraggingNewOrderPopup] = useState(false)
  const [showDirectionsMap, setShowDirectionsMap] = useState(false)
  const [showreachedPickupPopup, setShowreachedPickupPopup] = useState(false)
  const [showOrderIdConfirmationPopup, setShowOrderIdConfirmationPopup] = useState(false)
  const [showReachedDropPopup, setShowReachedDropPopup] = useState(false)
  const [showOrderDeliveredAnimation, setShowOrderDeliveredAnimation] = useState(false)
  const [showCustomerReviewPopup, setShowCustomerReviewPopup] = useState(false)
  const [showPaymentPage, setShowPaymentPage] = useState(false)
  const [customerRating, setCustomerRating] = useState(0)
  const [customerReviewText, setCustomerReviewText] = useState("")
  const [routePolyline, setRoutePolyline] = useState([])
  const [showRoutePath, setShowRoutePath] = useState(true) // Toggle to show/hide route path
  const [reachedPickupButtonProgress, setreachedPickupButtonProgress] = useState(0)
  const [reachedPickupIsAnimatingToComplete, setreachedPickupIsAnimatingToComplete] = useState(false)
  const reachedPickupButtonRef = useRef(null)
  const reachedPickupSwipeStartX = useRef(0)
  const reachedPickupSwipeStartY = useRef(0)
  const reachedPickupIsSwiping = useRef(false)
  const [reachedDropButtonProgress, setReachedDropButtonProgress] = useState(0)
  const [reachedDropIsAnimatingToComplete, setReachedDropIsAnimatingToComplete] = useState(false)
  const reachedDropButtonRef = useRef(null)
  const reachedDropSwipeStartX = useRef(0)
  const reachedDropSwipeStartY = useRef(0)
  const reachedDropIsSwiping = useRef(false)
  const [orderIdConfirmButtonProgress, setOrderIdConfirmButtonProgress] = useState(0)
  const [orderIdConfirmIsAnimatingToComplete, setOrderIdConfirmIsAnimatingToComplete] = useState(false)
  const orderIdConfirmButtonRef = useRef(null)
  const orderIdConfirmSwipeStartX = useRef(0)
  const orderIdConfirmSwipeStartY = useRef(0)
  const orderIdConfirmIsSwiping = useRef(false)
  const [orderDeliveredButtonProgress, setOrderDeliveredButtonProgress] = useState(0)
  const [orderDeliveredIsAnimatingToComplete, setOrderDeliveredIsAnimatingToComplete] = useState(false)
  const orderDeliveredButtonRef = useRef(null)
  const orderDeliveredSwipeStartX = useRef(0)
  const orderDeliveredSwipeStartY = useRef(0)
  const orderDeliveredIsSwiping = useRef(false)
  const [earningsGuaranteeIsPlaying, setEarningsGuaranteeIsPlaying] = useState(true)
  const [earningsGuaranteeAudioTime, setEarningsGuaranteeAudioTime] = useState("00:00")
  const earningsGuaranteeAudioRef = useRef(null)
  const bottomSheetRef = useRef(null)
  const handleRef = useRef(null)
  const acceptButtonRef = useRef(null)
  const swipeStartY = useRef(0)
  const isSwiping = useRef(false)
  const acceptButtonSwipeStartX = useRef(0)
  const acceptButtonSwipeStartY = useRef(0)
  const acceptButtonIsSwiping = useRef(false)
  const autoShowTimerRef = useRef(null)

  const {
    bookedGigs,
    currentGig,
    goOnline,
    goOffline,
    getSelectedDropLocation
  } = useGigStore()

  // Use same localStorage key as FeedNavbar for online status
  const LS_KEY = "app:isOnline"
  
  // Initialize online status from localStorage (same as FeedNavbar)
  const [isOnline, setIsOnline] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      const value = raw ? JSON.parse(raw) === true : false
      isOnlineRef.current = value // Initialize ref
      return value
    } catch {
      isOnlineRef.current = false
      return false
    }
  })

  // Keep ref in sync with state
  useEffect(() => {
    isOnlineRef.current = isOnline
  }, [isOnline])

  // Sync online status with localStorage changes (from FeedNavbar or other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === LS_KEY && e.newValue != null) {
        const next = JSON.parse(e.newValue) === true
        console.log('[DeliveryHome] Storage event - online status changed:', next)
        setIsOnline(prev => {
          // Only update if different to avoid unnecessary re-renders
          if (prev !== next) {
            console.log('[DeliveryHome] Updating isOnline state:', prev, '->', next)
            return next
          }
          return prev
        })
      }
    }

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events (same-tab sync from FeedNavbar)
    const handleCustomStorageChange = () => {
      try {
        const raw = localStorage.getItem(LS_KEY)
        const next = raw ? JSON.parse(raw) === true : false
        console.log('[DeliveryHome] Custom event - online status changed:', next)
        setIsOnline(prev => {
          if (prev !== next) {
            console.log('[DeliveryHome] Updating isOnline state from custom event:', prev, '->', next)
            return next
          }
          return prev
        })
      } catch (error) {
        console.error('[DeliveryHome] Error reading online status:', error)
      }
    }
    
    window.addEventListener('onlineStatusChanged', handleCustomStorageChange)

    // Also poll localStorage periodically to catch any missed updates (fallback)
    const pollInterval = setInterval(() => {
      try {
        const raw = localStorage.getItem(LS_KEY)
        const next = raw ? JSON.parse(raw) === true : false
        setIsOnline(prev => {
          if (prev !== next) {
            console.log('[DeliveryHome] Polling detected change:', prev, '->', next)
            return next
          }
          return prev
        })
      } catch {}
    }, 1000) // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('onlineStatusChanged', handleCustomStorageChange)
      clearInterval(pollInterval)
    }
  }, [])

  // Calculate today's stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Get today's gig (prioritize active, then booked)
  const todayGig = bookedGigs.find(gig => gig.date === todayDateKey && gig.status === 'active') ||
    bookedGigs.find(gig => gig.date === todayDateKey && gig.status === 'booked')

  // Calculate login hours based on when gig started
  const calculateLoginHours = () => {
    if (!todayGig || todayGig.status !== 'active') return 0

    const now = new Date()
    let startTime = now

    // Use startedAt if available, otherwise use gig start time
    if (todayGig.startedAt) {
      startTime = new Date(todayGig.startedAt)
    } else if (todayGig.startTime) {
      const [hours, minutes] = todayGig.startTime.split(':').map(Number)
      startTime = new Date()
      startTime.setHours(hours, minutes, 0, 0)
      // If start time is in the future, use current time
      if (startTime > now) {
        startTime = now
      }
    }

    const diffMs = now - startTime
    const diffHours = diffMs / (1000 * 60 * 60)
    return Math.max(0, diffHours)
  }

  const loginHours = calculateLoginHours()
  const minimumHours = 2.67 // 2 hrs 40 mins = 2.67 hours
  const progressPercentage = Math.min((loginHours / minimumHours) * 100, 100)

  // Get today's progress from store
  const { getTodayProgress, getDateData, hasDateData, updateTodayProgress } = useProgressStore()
  const todayProgress = getTodayProgress()
  
  // Check if store has data for today
  const hasStoreDataForToday = hasDateData(today)
  const todayData = hasStoreDataForToday ? getDateData(today) : null

  // Calculate today's earnings (prefer store, then calculated; default to 0 so UI is not empty)
  const calculatedEarnings = calculatePeriodEarnings(walletState, 'today') || 0
  const todayEarnings = hasStoreDataForToday && todayData
    ? (todayData.earnings ?? calculatedEarnings)
    : calculatedEarnings

  // Calculate today's trips (prefer store, then calculated; default to 0)
  const allOrders = getAllDeliveryOrders()
  const calculatedTrips = allOrders.filter(order => {
    const orderId = order.orderId || order.id
    const orderDateKey = `delivery_order_date_${orderId}`
    const orderDateStr = localStorage.getItem(orderDateKey)
    if (!orderDateStr) return false
    const orderDate = new Date(orderDateStr)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  }).length
  const todayTrips = hasStoreDataForToday && todayData
    ? (todayData.trips ?? calculatedTrips)
    : calculatedTrips

  // Calculate today's gigs count
  const todayGigsCount = bookedGigs.filter(gig => gig.date === todayDateKey).length

  // Calculate weekly earnings from wallet transactions
  const weeklyEarnings = calculatePeriodEarnings(walletState, 'week') || 0

  // Calculate weekly orders count from transactions
  const calculateWeeklyOrders = () => {
    if (!walletState || !walletState.transactions || !Array.isArray(walletState.transactions)) {
      return 0
    }

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    return walletState.transactions.filter(t => {
      // Count payment transactions (completed orders)
      if (t.type !== 'payment' || t.status !== 'Completed') return false
      const transactionDate = t.date ? new Date(t.date) : (t.createdAt ? new Date(t.createdAt) : null)
      if (!transactionDate) return false
      return transactionDate >= startOfWeek && transactionDate <= now
    }).length
  }

  const weeklyOrders = calculateWeeklyOrders()

  // Earnings Guarantee - Calculate from real data (no default values)
  // Current values come from real wallet transactions
  // If no transactions, show 0 for everything (no defaults)
  const hasTransactions = walletState?.transactions && walletState.transactions.length > 0
  const earningsGuaranteeTarget = hasTransactions ? 180 : 0 // Only show target if there's data
  const earningsGuaranteeOrdersTarget = hasTransactions ? 4 : 0 // Only show target if there's data
  const earningsGuaranteeCurrentOrders = weeklyOrders
  const earningsGuaranteeCurrentEarnings = weeklyEarnings
  const ordersProgress = earningsGuaranteeOrdersTarget > 0 
    ? Math.min(earningsGuaranteeCurrentOrders / earningsGuaranteeOrdersTarget, 1) 
    : 0
  const earningsProgress = earningsGuaranteeTarget > 0 
    ? Math.min(earningsGuaranteeCurrentEarnings / earningsGuaranteeTarget, 1) 
    : 0

  // Get week end date for valid till
  const getWeekEndDate = () => {
    const now = new Date()
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() - now.getDay() + 6) // End of week (Saturday)
    const day = endOfWeek.getDate()
    const month = endOfWeek.toLocaleString('en-US', { month: 'short' })
    return `${day} ${month}`
  }

  const weekEndDate = getWeekEndDate()

  // Calculate total hours worked today (prefer store, then calculated; default to 0)
  const calculatedHours = bookedGigs
    .filter(gig => gig.date === todayDateKey)
    .reduce((total, gig) => total + (gig.totalHours || 0), 0)
  const todayHoursWorked = hasStoreDataForToday && todayData
    ? (todayData.timeOnOrders ?? calculatedHours)
    : calculatedHours

  // Track last updated values to prevent infinite loops
  const lastUpdatedRef = useRef({ earnings: null, trips: null, hours: null })

  // Update progress store with calculated values when data changes (with debounce)
  useEffect(() => {
    // Only update if values have actually changed
    if (
      calculatedEarnings !== undefined && 
      calculatedTrips !== undefined && 
      calculatedHours !== undefined &&
      (
        lastUpdatedRef.current.earnings !== calculatedEarnings ||
        lastUpdatedRef.current.trips !== calculatedTrips ||
        lastUpdatedRef.current.hours !== calculatedHours
      )
    ) {
      lastUpdatedRef.current = {
        earnings: calculatedEarnings,
        trips: calculatedTrips,
        hours: calculatedHours
      }
      
      updateTodayProgress({
        earnings: calculatedEarnings,
        trips: calculatedTrips,
        timeOnOrders: calculatedHours
      })
    }
  }, [calculatedEarnings, calculatedTrips, calculatedHours, updateTodayProgress])

  // Listen for progress data updates from other components
  useEffect(() => {
    const handleProgressUpdate = () => {
      // Force re-render to show updated progress
      setAnimationKey(prev => prev + 1)
    }
    
    window.addEventListener('progressDataUpdated', handleProgressUpdate)
    return () => {
      window.removeEventListener('progressDataUpdated', handleProgressUpdate)
    }
  }, []) // Empty dependency array - only set up listener once

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }


  // Listen for progress data updates
  useEffect(() => {
    const handleProgressUpdate = () => {
      // Force re-render to show updated progress
      setAnimationKey(prev => prev + 1)
    }

    window.addEventListener('progressDataUpdated', handleProgressUpdate)
    window.addEventListener('storage', handleProgressUpdate)

    return () => {
      window.removeEventListener('progressDataUpdated', handleProgressUpdate)
      window.removeEventListener('storage', handleProgressUpdate)
    }
  }, [])

  // Initialize Lenis
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
  }, [location.pathname, animationKey])

  // Play alert sound function - plays until countdown ends (30 seconds)
  const playAlertSound = async () => {
    try {
      // Use local alert.mp3 file from assets
      const audio = new Audio(alertSound)
      
      audio.volume = 1
      audio.loop = true // Loop the sound
      
      // Set up error handler
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e)
        console.error('Audio error details:', {
          code: audio.error?.code,
          message: audio.error?.message
        })
      })
      
      // Play the sound and wait for it to start
      try {
        await audio.play()
        console.log('✅ Alert sound started playing successfully')
        return audio
      } catch (playError) {
        // Autoplay was prevented or other error
        console.error('❌ Could not play alert sound:', playError)
        // Try to load the audio first
        audio.load()
        try {
          await audio.play()
          console.log('✅ Alert sound started playing after load()')
          return audio
        } catch (retryError) {
          console.error('❌ Could not play alert sound after retry:', retryError)
          return null
        }
      }
    } catch (error) {
      console.error('❌ Could not create audio:', error)
      return null
    }
  }

  // Auto-show bottom sheet after 5 seconds when online on delivery home
  useEffect(() => {
    // Only trigger on delivery home page
    const isOnDeliveryHome = location.pathname === '/delivery' || location.pathname === '/delivery/'
    
    console.log('[AutoShow] Effect triggered:', { 
      isOnline, 
      isOnDeliveryHome, 
      pathname: location.pathname,
      hasAutoShown,
      bookedGigs: bookedGigs.length 
    })
    
    // Clear any existing timer first
    if (autoShowTimerRef.current) {
      clearTimeout(autoShowTimerRef.current)
      autoShowTimerRef.current = null
    }
    
    // Reset auto-show state when going offline or leaving page
    if (!isOnline || !isOnDeliveryHome) {
      if (hasAutoShown) {
        setHasAutoShown(false)
      }
      return
    }
    
    // Start timer if: online, on delivery home, and hasn't auto-shown yet
    // Note: We show the bottom sheet even without booked gigs (it will show mock restaurants)
    if (isOnDeliveryHome && isOnline && !hasAutoShown) {
      console.log('[AutoShow] ✅ Starting 5-second timer...')
      
      // Set timer for 5 seconds
      autoShowTimerRef.current = setTimeout(async () => {
        console.log('[AutoShow] ⏰ Timer fired after 5 seconds!')
        
        // Double-check conditions before showing (user might have gone offline)
        const currentIsOnline = (() => {
          try {
            const raw = localStorage.getItem(LS_KEY)
            const result = raw ? JSON.parse(raw) === true : false
            console.log('[AutoShow] Current online status from localStorage:', result)
            return result
          } catch {
            return false
          }
        })()
        
        const stillOnDeliveryHome = location.pathname === '/delivery' || location.pathname === '/delivery/'
        
        console.log('[AutoShow] Final conditions check:', { 
          currentIsOnline, 
          stillOnDeliveryHome,
          pathname: location.pathname,
          mockRestaurants: mockRestaurants.length,
          selectedRestaurant: !!selectedRestaurant
        })
        
        if (currentIsOnline && stillOnDeliveryHome) {
          console.log('[AutoShow] 🎉 All conditions met! Showing bottom sheet...')
          
          // Show new order popup with first restaurant
          if (mockRestaurants.length > 0) {
            setSelectedRestaurant(mockRestaurants[0])
            setShowNewOrderPopup(true)
            setCountdownSeconds(300) // Reset countdown to 30 seconds
            
            // Audio will be played by the dedicated useEffect when showNewOrderPopup becomes true
            console.log('[AutoShow] 🍽️ Showing new order popup for:', mockRestaurants[0].name)
          }
          
          setHasAutoShown(true)
          console.log('[AutoShow] ✅ New order popup shown and marked as shown')
        } else {
          console.log('[AutoShow] ❌ Conditions not met, not showing')
        }
        
        autoShowTimerRef.current = null
      }, 5000)
      
      console.log('[AutoShow] ⏱️ Timer set for 5 seconds, ID:', autoShowTimerRef.current)
    } else {
      console.log('[AutoShow] ⏸️ Timer not started:', { 
        isOnDeliveryHome, 
        isOnline, 
        hasAutoShown 
      })
    }
    
    return () => {
      if (autoShowTimerRef.current) {
        console.log('[AutoShow] 🧹 Cleaning up timer')
        clearTimeout(autoShowTimerRef.current)
        autoShowTimerRef.current = null
      }
    }
  }, [isOnline, hasAutoShown, selectedRestaurant, location.pathname])

  // Countdown timer for new order popup
  useEffect(() => {
    if (showNewOrderPopup && countdownSeconds > 0) {
      countdownTimerRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            // Stop audio when countdown reaches 0
            if (alertAudioRef.current) {
              alertAudioRef.current.pause()
              alertAudioRef.current.currentTime = 0
              alertAudioRef.current = null
              console.log('[NewOrder] 🔇 Audio stopped (countdown ended)')
            }
            // Auto-close when countdown reaches 0
            setShowNewOrderPopup(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }

    return () => {
      // Only clear the timer, don't stop audio here
      // Audio will be stopped by the popup close useEffect
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
      }
    }
  }, [showNewOrderPopup, countdownSeconds])

  // Play audio when New Order popup appears
  useEffect(() => {
    if (showNewOrderPopup && selectedRestaurant) {
      // Stop any existing audio first
      if (alertAudioRef.current) {
        alertAudioRef.current.pause()
        alertAudioRef.current.currentTime = 0
        alertAudioRef.current = null
      }

      // Play alert sound when popup appears
      const playAudio = async () => {
        try {
          console.log('[NewOrder] 🎵 Attempting to play audio...')
          const audio = await playAlertSound()
          if (audio) {
            alertAudioRef.current = audio
            console.log('[NewOrder] 🔊 Audio started playing, looping:', audio.loop)
            
            // Verify audio is actually playing and ensure it loops
            audio.addEventListener('playing', () => {
              console.log('[NewOrder] ✅ Audio is now playing')
            })
            
            // Manually restart if loop doesn't work
            audio.addEventListener('ended', () => {
              console.log('[NewOrder] 🔄 Audio ended, restarting...')
              if (showNewOrderPopup && alertAudioRef.current === audio) {
                audio.currentTime = 0
                audio.play().catch(err => {
                  console.error('[NewOrder] ❌ Failed to restart audio:', err)
                })
              }
            })
            
            audio.addEventListener('error', (e) => {
              console.error('[NewOrder] ❌ Audio error:', e)
            })
            
            // Double-check loop is enabled
            if (!audio.loop) {
              audio.loop = true
              console.log('[NewOrder] 🔧 Loop was false, enabled it')
            }
          } else {
            console.log('[NewOrder] ⚠️ playAlertSound returned null')
          }
        } catch (error) {
          console.error('[NewOrder] ⚠️ Audio failed to play:', error)
        }
      }
      
      // Small delay to ensure popup is fully rendered
      const timeoutId = setTimeout(() => {
        playAudio()
      }, 100)
      
      return () => {
        clearTimeout(timeoutId)
      }
    } else {
      // Stop audio when popup closes
      if (alertAudioRef.current) {
        console.log('[NewOrder] 🔇 Stopping audio (popup closed)')
        alertAudioRef.current.pause()
        alertAudioRef.current.currentTime = 0
        alertAudioRef.current = null
      }
    }
  }, [showNewOrderPopup, selectedRestaurant])

  // Reset countdown when popup closes
  useEffect(() => {
    if (!showNewOrderPopup) {
      setCountdownSeconds(300)
    }
  }, [showNewOrderPopup])

  // Simulate audio playback for Earnings Guarantee
  useEffect(() => {
    if (earningsGuaranteeIsPlaying) {
      // Simulate audio time progression
      let time = 0
      const interval = setInterval(() => {
        time += 1
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        setEarningsGuaranteeAudioTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        
        // Stop after 10 seconds (simulating audio length)
        if (time >= 10) {
          setEarningsGuaranteeIsPlaying(false)
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [earningsGuaranteeIsPlaying])

  const toggleEarningsGuaranteeAudio = () => {
    setEarningsGuaranteeIsPlaying(!earningsGuaranteeIsPlaying)
  }

  // Reject reasons for order cancellation
  const rejectReasons = [
    "Too far from current location",
    "Vehicle issue",
    "Personal emergency",
    "Weather conditions",
    "Already have too many orders",
    "Other reason"
  ]

  // Handle reject order
  const handleRejectClick = () => {
    setShowRejectPopup(true)
  }

  const handleRejectConfirm = () => {    
    if (alertAudioRef.current) {
      alertAudioRef.current.pause()
      alertAudioRef.current.currentTime = 0
    }
    setShowRejectPopup(false)
    setShowNewOrderPopup(false)
    setRejectReason("")
    setCountdownSeconds(300)
    // Here you would typically send the rejection to your backend
    console.log("Order rejected with reason:", rejectReason)
  }

  const handleRejectCancel = () => {
    setShowRejectPopup(false)
    setRejectReason("")
  }

  // Reset popup state on page load/refresh - ensure no popup shows on refresh
  useEffect(() => {
    // Clear any popup state on mount
    setShowNewOrderPopup(false)
    setSelectedRestaurant(null)
    setHasAutoShown(false)
    setCountdownSeconds(300)
    
    // Clear any timers
    if (autoShowTimerRef.current) {
      clearTimeout(autoShowTimerRef.current)
      autoShowTimerRef.current = null
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    
    // Stop and cleanup audio
    if (alertAudioRef.current) {
      alertAudioRef.current.pause()
      alertAudioRef.current.currentTime = 0
      alertAudioRef.current = null
    }
  }, []) // Only run on mount

  // Get rider location - App open होते ही location fetch करें
  useEffect(() => {
    // Set default location immediately so map can render
    setRiderLocation(prev => prev || [22.7196, 75.8577])

    // Check if we have saved location in localStorage (for refresh handling)
    const savedLocation = localStorage.getItem('deliveryBoyLastLocation')
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation)
        if (parsed && Array.isArray(parsed) && parsed.length === 2) {
          setRiderLocation(parsed)
          lastLocationRef.current = parsed
          routeHistoryRef.current = [{
            lat: parsed[0],
            lng: parsed[1]
          }]
          console.log('📍 Restored location from localStorage:', parsed)
        }
      } catch (e) {
        console.warn('⚠️ Error parsing saved location:', e)
      }
    }

    if (navigator.geolocation) {
      // Get current position first - App open होते ही location लें
      console.log('📍 Fetching current location on app open...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Validate coordinates
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          
          // Validate coordinates are valid numbers
          if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
              isNaN(latitude) || isNaN(longitude) ||
              latitude < -90 || latitude > 90 || 
              longitude < -180 || longitude > 180) {
            console.warn("⚠️ Invalid coordinates received:", { latitude, longitude })
            // Use default location if invalid
            const defaultLocation = [22.7196, 75.8577]
            setRiderLocation(defaultLocation)
            lastLocationRef.current = defaultLocation
            return
          }
          
          const newLocation = [latitude, longitude] // [lat, lng] format
          let heading = position.coords.heading !== null && position.coords.heading !== undefined 
            ? position.coords.heading 
            : null
          
          // Calculate heading from previous location if GPS heading not available
          if (heading === null && lastLocationRef.current) {
            const [prevLat, prevLng] = lastLocationRef.current
            heading = calculateHeading(prevLat, prevLng, latitude, longitude)
          }
          
          // Initialize route history if empty
          if (routeHistoryRef.current.length === 0) {
            routeHistoryRef.current = [{
              lat: latitude,
              lng: longitude
            }]
          } else {
            // Add to route history
            routeHistoryRef.current.push({
              lat: latitude,
              lng: longitude
            })
            if (routeHistoryRef.current.length > 1000) {
              routeHistoryRef.current.shift()
            }
          }
          
          // Save location to localStorage (for refresh handling)
          localStorage.setItem('deliveryBoyLastLocation', JSON.stringify(newLocation))
          
          // Update bike marker if map is initialized and user is online
          if (window.deliveryMapInstance) {
            if (isOnlineRef.current) {
              // Online है तो bike icon show करें
              createOrUpdateBikeMarker(latitude, longitude, heading)
              updateRoutePolyline()
            }
            // Offline है तो marker hide रहेगा (blue dot नहीं दिखेगा)
          }
          
          setRiderLocation(newLocation)
          lastLocationRef.current = newLocation
          console.log("📍 Current location obtained on app open:", { 
            latitude, 
            longitude, 
            heading,
            accuracy: position.coords.accuracy,
            isOnline: isOnlineRef.current,
            timestamp: new Date().toISOString()
          })
        },
        (error) => {
          console.warn("⚠️ Error getting current location:", error)
          // Keep default location if geolocation fails
          const defaultLocation = [22.7196, 75.8577]
          setRiderLocation(defaultLocation)
          lastLocationRef.current = defaultLocation
          routeHistoryRef.current = [{
            lat: defaultLocation[0],
            lng: defaultLocation[1]
          }]
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )

      // Clear any existing watch
      if (watchPositionIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current)
        watchPositionIdRef.current = null
      }

      // Watch position updates for live tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Validate coordinates
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          
          // Validate coordinates are valid numbers
          if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
              isNaN(latitude) || isNaN(longitude) ||
              latitude < -90 || latitude > 90 || 
              longitude < -180 || longitude > 180) {
            console.warn("⚠️ Invalid coordinates received:", { latitude, longitude })
            return
          }
          
          const newLocation = [latitude, longitude] // [lat, lng] format
          let heading = position.coords.heading !== null && position.coords.heading !== undefined 
            ? position.coords.heading 
            : null
          
          // Calculate heading from previous location if GPS heading not available
          if (heading === null && lastLocationRef.current) {
            const [prevLat, prevLng] = lastLocationRef.current
            heading = calculateHeading(prevLat, prevLng, latitude, longitude)
          }
          
          // Update route history for traveled path
          if (lastLocationRef.current) {
            routeHistoryRef.current.push({
              lat: latitude,
              lng: longitude
            })
            // Keep only last 1000 points to avoid performance issues
            if (routeHistoryRef.current.length > 1000) {
              routeHistoryRef.current.shift()
            }
            // Update route polyline on map
            updateRoutePolyline()
          } else {
            // Initialize route history with first location
            routeHistoryRef.current = [{
              lat: latitude,
              lng: longitude
            }]
          }
          
          // Save location to localStorage (for refresh handling)
          localStorage.setItem('deliveryBoyLastLocation', JSON.stringify(newLocation))
          
          // Update bike marker with new location and heading (create if doesn't exist)
          // Only update if user is online (use ref to get latest value)
          if (window.deliveryMapInstance) {
            if (isOnlineRef.current) {
              // Online है तो bike icon show करें (blue dot नहीं)
              createOrUpdateBikeMarker(latitude, longitude, heading)
            } else {
              // Offline है तो marker hide करें
              if (bikeMarkerRef.current) {
                bikeMarkerRef.current.setMap(null)
              }
            }
          }
          
          setRiderLocation(newLocation)
          lastLocationRef.current = newLocation
          console.log("📍 Live location updated:", { 
            latitude, 
            longitude, 
            heading,
            accuracy: position.coords.accuracy,
            isOnline: isOnlineRef.current,
            timestamp: new Date().toISOString()
          })
        },
        (error) => {
          console.warn("⚠️ Error watching location:", error)
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 0, // Always use fresh location
          timeout: 10000
        }
      )

      watchPositionIdRef.current = watchId

      return () => {
        if (watchPositionIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchPositionIdRef.current)
          watchPositionIdRef.current = null
        }
      }
    } else {
      // Default location if geolocation not available
      setRiderLocation(prev => prev || [22.7196, 75.8577])
    }
  }, []) // Run only on mount - location tracking should always be active

  // Handle new order popup accept button swipe
  const handleNewOrderAcceptTouchStart = (e) => {
    newOrderAcceptButtonSwipeStartX.current = e.touches[0].clientX
    newOrderAcceptButtonSwipeStartY.current = e.touches[0].clientY
    newOrderAcceptButtonIsSwiping.current = false
    setNewOrderIsAnimatingToComplete(false)
    setNewOrderAcceptButtonProgress(0)
  }

  const handleNewOrderAcceptTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - newOrderAcceptButtonSwipeStartX.current
    const deltaY = e.touches[0].clientY - newOrderAcceptButtonSwipeStartY.current

    // Only handle horizontal swipes (swipe right)
    if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      newOrderAcceptButtonIsSwiping.current = true
      safePreventDefault(e)

      // Calculate max swipe distance
      const buttonWidth = newOrderAcceptButtonRef.current?.offsetWidth || 300
      const circleWidth = 56 // w-14 = 56px
      const padding = 16 // px-4 = 16px
      const maxSwipe = buttonWidth - circleWidth - (padding * 2)

      const progress = Math.min(Math.max(deltaX / maxSwipe, 0), 1)
      setNewOrderAcceptButtonProgress(progress)
    }
  }

  const handleNewOrderAcceptTouchEnd = (e) => {
    if (!newOrderAcceptButtonIsSwiping.current) {
      setNewOrderAcceptButtonProgress(0)
      return
    }

    const deltaX = e.changedTouches[0].clientX - newOrderAcceptButtonSwipeStartX.current
    const buttonWidth = newOrderAcceptButtonRef.current?.offsetWidth || 300
    const circleWidth = 56
    const padding = 16
    const maxSwipe = buttonWidth - circleWidth - (padding * 2)
    const threshold = maxSwipe * 0.7 // 70% of max swipe

    if (deltaX > threshold) {
      // Stop audio immediately when user accepts
      if (alertAudioRef.current) {
        alertAudioRef.current.pause()
        alertAudioRef.current.currentTime = 0
        alertAudioRef.current = null
        console.log('[NewOrder] 🔇 Audio stopped (order accepted)')
      }

      // Animate to completion
      setNewOrderIsAnimatingToComplete(true)
      setNewOrderAcceptButtonProgress(1)

      // Close popup with animation, then show map with directions
      setTimeout(() => {
        setShowNewOrderPopup(false)
        
        // Fetch route for directions
        if (selectedRestaurant && riderLocation) {
          const fetchRoute = async () => {
            try {
              const url = `https://router.project-osrm.org/route/v1/driving/${riderLocation[1]},${riderLocation[0]};${selectedRestaurant.lng},${selectedRestaurant.lat}?overview=full&geometries=geojson`
              const response = await fetch(url)
              const data = await response.json()
              
              if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const coordinates = data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]])
                setRoutePolyline(coordinates)
              } else {
                // Fallback: straight line
                setRoutePolyline([riderLocation, [selectedRestaurant.lat, selectedRestaurant.lng]])
              }
            } catch (error) {
              console.error('Error fetching route:', error)
              // Fallback: straight line
              setRoutePolyline([riderLocation, [selectedRestaurant.lat, selectedRestaurant.lng]])
            }
          }
          
          fetchRoute()
        }
        
        // Show map with directions
        setTimeout(() => {
          setShowDirectionsMap(true)
          
          // After 5 seconds, hide map and show Reached Pickup popup
          setTimeout(() => {
            setShowDirectionsMap(false)
            setShowreachedPickupPopup(true)
          }, 5000)
        }, 300) // Wait for popup close animation

        // Reset after animation
        setTimeout(() => {
          setNewOrderAcceptButtonProgress(0)
          setNewOrderIsAnimatingToComplete(false)
        }, 500)
      }, 200)
    } else {
      // Reset smoothly
      setNewOrderAcceptButtonProgress(0)
    }

    newOrderAcceptButtonSwipeStartX.current = 0
    newOrderAcceptButtonSwipeStartY.current = 0
    newOrderAcceptButtonIsSwiping.current = false
  }

  // Handle new order popup swipe down to close
  const handleNewOrderPopupTouchStart = (e) => {
    const target = e.target
    const rect = newOrderPopupRef.current?.getBoundingClientRect()
    if (!rect) return

    const touchY = e.touches[0].clientY
    const handleArea = rect.top + 100 // Top 100px is swipeable area

    if (touchY <= handleArea) {
      e.stopPropagation()
      newOrderSwipeStartY.current = touchY
      newOrderIsSwiping.current = true
      setIsDraggingNewOrderPopup(true)
    }
  }

  const handleNewOrderPopupTouchMove = (e) => {
    if (!newOrderIsSwiping.current) return

    const deltaY = e.touches[0].clientY - newOrderSwipeStartY.current

    if (deltaY > 0) {
      safePreventDefault(e)
      e.stopPropagation()
      setNewOrderDragY(deltaY)
    }
  }

  const handleNewOrderPopupTouchEnd = (e) => {
    if (!newOrderIsSwiping.current) {
      newOrderIsSwiping.current = false
      setIsDraggingNewOrderPopup(false)
      return
    }

    e.stopPropagation()

    const deltaY = e.changedTouches[0].clientY - newOrderSwipeStartY.current
    const threshold = 100

    if (deltaY > threshold) {
      setShowNewOrderPopup(false)
      setCountdownSeconds(300)
    } else {
      setNewOrderDragY(0)
    }

    newOrderIsSwiping.current = false
    setIsDraggingNewOrderPopup(false)
    newOrderSwipeStartY.current = 0
  }

  // Handle Reached Pickup button swipe
  const handlereachedPickupTouchStart = (e) => {
    reachedPickupSwipeStartX.current = e.touches[0].clientX
    reachedPickupSwipeStartY.current = e.touches[0].clientY
    reachedPickupIsSwiping.current = false
    setreachedPickupIsAnimatingToComplete(false)
    setreachedPickupButtonProgress(0)
  }

  const handlereachedPickupTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - reachedPickupSwipeStartX.current
    const deltaY = e.touches[0].clientY - reachedPickupSwipeStartY.current

    // Only handle horizontal swipes (swipe right)
    if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      reachedPickupIsSwiping.current = true
      safePreventDefault(e)

      // Calculate max swipe distance
      const buttonWidth = reachedPickupButtonRef.current?.offsetWidth || 300
      const circleWidth = 56 // w-14 = 56px
      const padding = 16 // px-4 = 16px
      const maxSwipe = buttonWidth - circleWidth - (padding * 2)

      const progress = Math.min(Math.max(deltaX / maxSwipe, 0), 1)
      setreachedPickupButtonProgress(progress)
    }
  }

  const handlereachedPickupTouchEnd = (e) => {
    if (!reachedPickupIsSwiping.current) {
      setreachedPickupButtonProgress(0)
      return
    }

    const deltaX = e.changedTouches[0].clientX - reachedPickupSwipeStartX.current
    const buttonWidth = reachedPickupButtonRef.current?.offsetWidth || 300
    const circleWidth = 56
    const padding = 16
    const maxSwipe = buttonWidth - circleWidth - (padding * 2)
    const threshold = maxSwipe * 0.7 // 70% of max swipe

    if (deltaX > threshold) {
      // Animate to completion
      setreachedPickupIsAnimatingToComplete(true)
      setreachedPickupButtonProgress(1)

      // Close popup after animation, then show order ID confirmation popup
      setTimeout(() => {
        setShowreachedPickupPopup(false)
        setShowOrderIdConfirmationPopup(true)
        // DO NOT show reached drop here - it will only show after order ID is confirmed
        
        // Reset after animation
        setTimeout(() => {
          setreachedPickupButtonProgress(0)
          setreachedPickupIsAnimatingToComplete(false)
        }, 500)
      }, 200)
    } else {
      // Reset smoothly
      setreachedPickupButtonProgress(0)
    }

    reachedPickupSwipeStartX.current = 0
    reachedPickupSwipeStartY.current = 0
    reachedPickupIsSwiping.current = false
  }

  // Handle Reached Drop button swipe
  const handleReachedDropTouchStart = (e) => {
    reachedDropSwipeStartX.current = e.touches[0].clientX
    reachedDropSwipeStartY.current = e.touches[0].clientY
    reachedDropIsSwiping.current = false
    setReachedDropIsAnimatingToComplete(false)
    setReachedDropButtonProgress(0)
  }

  const handleReachedDropTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - reachedDropSwipeStartX.current
    const deltaY = e.touches[0].clientY - reachedDropSwipeStartY.current

    // Only handle horizontal swipes (swipe right)
    if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      reachedDropIsSwiping.current = true
      safePreventDefault(e)

      // Calculate max swipe distance
      const buttonWidth = reachedDropButtonRef.current?.offsetWidth || 300
      const circleWidth = 56 // w-14 = 56px
      const padding = 16 // px-4 = 16px
      const maxSwipe = buttonWidth - circleWidth - (padding * 2)

      const progress = Math.min(Math.max(deltaX / maxSwipe, 0), 1)
      setReachedDropButtonProgress(progress)
    }
  }

  const handleReachedDropTouchEnd = (e) => {
    if (!reachedDropIsSwiping.current) {
      setReachedDropButtonProgress(0)
      return
    }

    const deltaX = e.changedTouches[0].clientX - reachedDropSwipeStartX.current
    const buttonWidth = reachedDropButtonRef.current?.offsetWidth || 300
    const circleWidth = 56
    const padding = 16
    const maxSwipe = buttonWidth - circleWidth - (padding * 2)
    const threshold = maxSwipe * 0.7 // 70% of max swipe

    if (deltaX > threshold) {
      // Animate to completion
      setReachedDropIsAnimatingToComplete(true)
      setReachedDropButtonProgress(1)

      // Close popup and show order delivered animation
      setTimeout(() => {
        setShowReachedDropPopup(false)
        setShowOrderDeliveredAnimation(true)
      }, 200)
    } else {
      // Reset smoothly
      setReachedDropButtonProgress(0)
    }

    reachedDropSwipeStartX.current = 0
    reachedDropSwipeStartY.current = 0
    reachedDropIsSwiping.current = false
  }

  // Handle Order ID Confirmation button swipe
  const handleOrderIdConfirmTouchStart = (e) => {
    orderIdConfirmSwipeStartX.current = e.touches[0].clientX
    orderIdConfirmSwipeStartY.current = e.touches[0].clientY
    orderIdConfirmIsSwiping.current = false
    setOrderIdConfirmIsAnimatingToComplete(false)
    setOrderIdConfirmButtonProgress(0)
  }

  const handleOrderIdConfirmTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - orderIdConfirmSwipeStartX.current
    const deltaY = e.touches[0].clientY - orderIdConfirmSwipeStartY.current

    // Only handle horizontal swipes (swipe right)
    if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      orderIdConfirmIsSwiping.current = true
      safePreventDefault(e)

      // Calculate max swipe distance
      const buttonWidth = orderIdConfirmButtonRef.current?.offsetWidth || 300
      const circleWidth = 56 // w-14 = 56px
      const padding = 16 // px-4 = 16px
      const maxSwipe = buttonWidth - circleWidth - (padding * 2)

      const progress = Math.min(Math.max(deltaX / maxSwipe, 0), 1)
      setOrderIdConfirmButtonProgress(progress)
    }
  }

  const handleOrderIdConfirmTouchEnd = (e) => {
    if (!orderIdConfirmIsSwiping.current) {
      setOrderIdConfirmButtonProgress(0)
      return
    }

    const deltaX = e.changedTouches[0].clientX - orderIdConfirmSwipeStartX.current
    const buttonWidth = orderIdConfirmButtonRef.current?.offsetWidth || 300
    const circleWidth = 56
    const padding = 16
    const maxSwipe = buttonWidth - circleWidth - (padding * 2)
    const threshold = maxSwipe * 0.7 // 70% of max swipe

    if (deltaX > threshold) {
      // Animate to completion
      setOrderIdConfirmIsAnimatingToComplete(true)
      setOrderIdConfirmButtonProgress(1)

      // Close popup after animation, then show directions map
      setTimeout(() => {
        setShowOrderIdConfirmationPopup(false)
        // Show map with directions for 5 seconds
        setShowDirectionsMap(true)
        
        // Fetch route for directions
        if (selectedRestaurant && riderLocation) {
          const fetchRoute = async () => {
            try {
              const url = `https://router.project-osrm.org/route/v1/driving/${riderLocation[1]},${riderLocation[0]};${selectedRestaurant.lng},${selectedRestaurant.lat}?overview=full&geometries=geojson`
              const response = await fetch(url)
              const data = await response.json()
              
              if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const coordinates = data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]])
                setRoutePolyline(coordinates)
              } else {
                // Fallback: straight line
                setRoutePolyline([riderLocation, [selectedRestaurant.lat, selectedRestaurant.lng]])
              }
            } catch (error) {
              console.error('Error fetching route:', error)
              // Fallback: straight line
              setRoutePolyline([riderLocation, [selectedRestaurant.lat, selectedRestaurant.lng]])
            }
          }
          
          fetchRoute()
        }
        
        // After 5 seconds, hide map and show reached drop popup
        setTimeout(() => {
          setShowDirectionsMap(false)
          setShowReachedDropPopup(true)
        }, 5000)
        
        // Reset after animation
        setTimeout(() => {
          setOrderIdConfirmButtonProgress(0)
          setOrderIdConfirmIsAnimatingToComplete(false)
        }, 500)
      }, 200)
    } else {
      // Reset smoothly
      setOrderIdConfirmButtonProgress(0)
    }

    orderIdConfirmSwipeStartX.current = 0
    orderIdConfirmSwipeStartY.current = 0
    orderIdConfirmIsSwiping.current = false
  }

  // Handle Order Delivered button swipe
  const handleOrderDeliveredTouchStart = (e) => {
    orderDeliveredSwipeStartX.current = e.touches[0].clientX
    orderDeliveredSwipeStartY.current = e.touches[0].clientY
    orderDeliveredIsSwiping.current = false
    setOrderDeliveredIsAnimatingToComplete(false)
    setOrderDeliveredButtonProgress(0)
  }

  const handleOrderDeliveredTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - orderDeliveredSwipeStartX.current
    const deltaY = e.touches[0].clientY - orderDeliveredSwipeStartY.current

    // Only handle horizontal swipes (swipe right)
    if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      orderDeliveredIsSwiping.current = true
      safePreventDefault(e)

      // Calculate max swipe distance
      const buttonWidth = orderDeliveredButtonRef.current?.offsetWidth || 300
      const circleWidth = 56 // w-14 = 56px
      const padding = 16 // px-4 = 16px
      const maxSwipe = buttonWidth - circleWidth - (padding * 2)

      const progress = Math.min(Math.max(deltaX / maxSwipe, 0), 1)
      setOrderDeliveredButtonProgress(progress)
    }
  }

  const handleOrderDeliveredTouchEnd = (e) => {
    if (!orderDeliveredIsSwiping.current) {
      setOrderDeliveredButtonProgress(0)
      return
    }

    const deltaX = e.changedTouches[0].clientX - orderDeliveredSwipeStartX.current
    const buttonWidth = orderDeliveredButtonRef.current?.offsetWidth || 300
    const circleWidth = 56
    const padding = 16
    const maxSwipe = buttonWidth - circleWidth - (padding * 2)
    const threshold = maxSwipe * 0.7 // 70% of max swipe

    if (deltaX > threshold) {
      // Animate to completion
      setOrderDeliveredIsAnimatingToComplete(true)
      setOrderDeliveredButtonProgress(1)

      // Close popup after animation and show customer review
      setTimeout(() => {
        setShowOrderDeliveredAnimation(false)
        setShowCustomerReviewPopup(true)
        
        // Reset after animation
        setTimeout(() => {
          setOrderDeliveredButtonProgress(0)
          setOrderDeliveredIsAnimatingToComplete(false)
        }, 500)
      }, 200)
    } else {
      // Reset smoothly
      setOrderDeliveredButtonProgress(0)
    }

    orderDeliveredSwipeStartX.current = 0
    orderDeliveredSwipeStartY.current = 0
    orderDeliveredIsSwiping.current = false
  }

  // Handle accept orders button swipe
  const handleAcceptOrdersTouchStart = (e) => {
    acceptButtonSwipeStartX.current = e.touches[0].clientX
    acceptButtonSwipeStartY.current = e.touches[0].clientY
    acceptButtonIsSwiping.current = false
    setIsAnimatingToComplete(false)
    setAcceptButtonProgress(0)
  }

  const handleAcceptOrdersTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - acceptButtonSwipeStartX.current
    const deltaY = e.touches[0].clientY - acceptButtonSwipeStartY.current

    // Only handle horizontal swipes (swipe right)
    if (Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      acceptButtonIsSwiping.current = true
      safePreventDefault(e)

      // Calculate max swipe distance
      const buttonWidth = acceptButtonRef.current?.offsetWidth || 300
      const circleWidth = 56 // w-14 = 56px
      const padding = 16 // px-4 = 16px
      const maxSwipe = buttonWidth - circleWidth - (padding * 2)

      const progress = Math.min(Math.max(deltaX / maxSwipe, 0), 1)
      setAcceptButtonProgress(progress)
    }
  }

  const handleAcceptOrdersTouchEnd = (e) => {
    if (!acceptButtonIsSwiping.current) {
      setAcceptButtonProgress(0)
      return
    }

    const deltaX = e.changedTouches[0].clientX - acceptButtonSwipeStartX.current
    const buttonWidth = acceptButtonRef.current?.offsetWidth || 300
    const circleWidth = 56
    const padding = 16
    const maxSwipe = buttonWidth - circleWidth - (padding * 2)
    const threshold = maxSwipe * 0.7 // 70% of max swipe

    if (deltaX > threshold) {
      // Animate to completion
      setIsAnimatingToComplete(true)
      setAcceptButtonProgress(1)

      // Navigate to pickup directions page after animation
      setTimeout(() => {
        navigate("/delivery/pickup-directions", {
          state: { restaurants: mockRestaurants },
          replace: false
        })

        // Reset after navigation
        setTimeout(() => {
          setAcceptButtonProgress(0)
          setIsAnimatingToComplete(false)
        }, 500)
      }, 200)
    } else {
      // Reset smoothly
      setAcceptButtonProgress(0)
    }

    acceptButtonSwipeStartX.current = 0
    acceptButtonSwipeStartY.current = 0
    acceptButtonIsSwiping.current = false
  }

  // Handle bottom sheet swipe
  const handleBottomSheetTouchStart = (e) => {
    const target = e.target
    const isHandle = handleRef.current?.contains(target)

    // Check if touch is in handle area or top 15% of bottom sheet
    const rect = bottomSheetRef.current?.getBoundingClientRect()
    if (!rect) return

    const touchY = e.touches[0].clientY
    const handleArea = rect.top + 60 // Top 60px is handle area

    // Allow swipe if touching handle or top area
    if (isHandle || touchY <= handleArea) {
      e.stopPropagation()
      swipeStartY.current = touchY
      isSwiping.current = true
    }
  }

  const handleBottomSheetTouchMove = (e) => {
    if (!isSwiping.current) return

    const deltaY = swipeStartY.current - e.touches[0].clientY

    if (Math.abs(deltaY) > 5) {
      e.stopPropagation()

      // Swipe up to expand
      if (deltaY > 0 && !bottomSheetExpanded && bottomSheetRef.current) {
        safePreventDefault(e)
        bottomSheetRef.current.style.transform = `translateY(${-deltaY}px)`
      }
      // Swipe down to collapse
      else if (deltaY < 0 && bottomSheetExpanded && bottomSheetRef.current) {
        safePreventDefault(e)
        bottomSheetRef.current.style.transform = `translateY(${-deltaY}px)`
      }
    }
  }

  const handleBottomSheetTouchEnd = (e) => {
    if (!isSwiping.current) {
      isSwiping.current = false
      return
    }

    e.stopPropagation()

    const deltaY = swipeStartY.current - e.changedTouches[0].clientY
    const threshold = 50

    if (bottomSheetRef.current) {
      if (deltaY > threshold && !bottomSheetExpanded) {
        setBottomSheetExpanded(true)
      } else if (deltaY < -threshold && bottomSheetExpanded) {
        setBottomSheetExpanded(false)
      }
      // Reset transform
      bottomSheetRef.current.style.transform = ''
    }

    isSwiping.current = false
    swipeStartY.current = 0
  }

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setAnimationKey(prev => prev + 1)
    }

    const handleActiveOrderUpdate = () => {
      const stored = localStorage.getItem('activeOrder')
      setActiveOrder(stored ? JSON.parse(stored) : null)
    }

    const handleNotificationUpdate = () => {
      setUnreadNotificationCount(getUnreadDeliveryNotificationCount())
    }

    window.addEventListener('deliveryHomeRefresh', handleRefresh)
    window.addEventListener('gigStateUpdated', handleRefresh)
    window.addEventListener('deliveryOrderStatusUpdated', handleRefresh)
    window.addEventListener('activeOrderUpdated', handleActiveOrderUpdate)
    window.addEventListener('storage', handleActiveOrderUpdate)
    window.addEventListener('deliveryNotificationsUpdated', handleNotificationUpdate)

    return () => {
      window.removeEventListener('deliveryHomeRefresh', handleRefresh)
      window.removeEventListener('gigStateUpdated', handleRefresh)
      window.removeEventListener('deliveryOrderStatusUpdated', handleRefresh)
      window.removeEventListener('activeOrderUpdated', handleActiveOrderUpdate)
      window.removeEventListener('storage', handleActiveOrderUpdate)
      window.removeEventListener('deliveryNotificationsUpdated', handleNotificationUpdate)
    }
  }, [])

  // Handle online toggle - check for booked gigs
  const handleToggleOnline = () => {
    if (isOnline) {
      goOffline()
    } else {
      // Check if there are any booked gigs
      // if (bookedGigs.length === 0) {
      //   // Show popup to book gigs
      //   setShowBookGigsPopup(true)
      //   return
      // }
      
      // // If gigs exist, proceed with going online
      // const success = goOnline()
      // if (!success) {
      //   // If goOnline fails (no gig), just set online status directly
      //   useGigStore.setState({ isOnline: true })
      //   localStorage.setItem('delivery_online_status', 'true')
      //   window.dispatchEvent(new CustomEvent('deliveryOnlineStatusChanged'))
      // }
      goOnline();
    }
  }

  // Carousel state
  const [currentCarouselSlide, setCurrentCarouselSlide] = useState(0)
  const carouselRef = useRef(null)
  const carouselStartX = useRef(0)
  const carouselIsSwiping = useRef(false)
  const carouselAutoRotateRef = useRef(null)

  // Map view toggle state - Hotspot or Select drop (both show map, just different views)
  const [mapViewMode, setMapViewMode] = useState("hotspot") // "hotspot" or "selectDrop"

  // Swipe bar state - controls whether map or home sections are visible
  const [showHomeSections, setShowHomeSections] = useState(false) // false = map view, true = home sections
  const [swipeBarPosition, setSwipeBarPosition] = useState(0) // 0 = bottom (map), 1 = top (home)
  const [isDraggingSwipeBar, setIsDraggingSwipeBar] = useState(false)
  const swipeBarRef = useRef(null)
  const swipeBarStartY = useRef(0)
  const isSwipingBar = useRef(false)
  const homeSectionsScrollRef = useRef(null)
  const isScrollingHomeSections = useRef(false)

  // Emergency help popup state
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false)

  // Help popup state
  const [showHelpPopup, setShowHelpPopup] = useState(false)

  // Book gigs popup state
  const [showBookGigsPopup, setShowBookGigsPopup] = useState(false)

  // Drop location selection popup state
  const [showDropLocationPopup, setShowDropLocationPopup] = useState(false)
  const [selectedDropLocation, setSelectedDropLocation] = useState(() => {
    return localStorage.getItem('selectedDropLocation') || null
  })

  // Help options - using paths from DeliveryRouter
  const helpOptions = [
    {
      id: "helpCenter",
      title: "Help center",
      subtitle: "Find answers to queries and raise ticket",
      icon: "helpCenter",
      path: "/delivery/help/center"
    },
    {
      id: "supportTickets",
      title: "Support tickets",
      subtitle: "Check status of tickets raised",
      icon: "ticket",
      path: "/delivery/help/tickets"
    },
    {
      id: "idCard",
      title: "Show ID card",
      subtitle: "See your Appzeto ID card",
      icon: "idCard",
      path: "/delivery/help/id-card"
    },
    {
      id: "changeLanguage",
      title: "Change language",
      subtitle: "Use app in your language of choice",
      icon: "language",
      path: "/delivery/help/language"
    }
  ]

  // Handle help option click - navigate to the correct route
  const handleHelpOptionClick = (option) => {
    if (option.path) {
      setShowHelpPopup(false)
      navigate(option.path)
    }
  }

  // Emergency options with phone numbers
  const emergencyOptions = [
    {
      id: "ambulance",
      title: "Call ambulance (10 mins)",
      subtitle: "For medical emergencies",
      phone: "108", // Indian emergency ambulance number
      icon: "ambulance"
    },
    {
      id: "accident",
      title: "Call accident helpline",
      subtitle: "Talk to our emergency team",
      phone: "1073", // Indian accident helpline
      icon: "siren"
    },
    {
      id: "police",
      title: "Call police",
      subtitle: "Report a crime",
      phone: "100", // Indian police emergency number
      icon: "police"
    },
    {
      id: "insurance",
      title: "Insurance card",
      subtitle: "View your insurance details",
      phone: null, // No phone call for insurance
      icon: "insurance"
    }
  ]

  // Handle emergency option click
  const handleEmergencyOptionClick = (option) => {
    if (option.phone) {
      window.location.href = `tel:${option.phone}`
    } else if (option.id === "insurance") {
      // Navigate to insurance page or show insurance details
      navigate("/delivery/insurance")
    }
    setShowEmergencyPopup(false)
  }

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      // Skip wallet fetch if status is pending
      if (deliveryStatus === 'pending') {
        setWalletState({
          totalBalance: 0,
          cashInHand: 0,
          totalWithdrawn: 0,
          totalEarned: 0,
          transactions: [],
          joiningBonusClaimed: false
        })
        return
      }

      try {
        const walletData = await fetchDeliveryWallet()
        setWalletState(walletData)
      } catch (error) {
        // Only log error if it's not a network error (backend might be down)
        if (error.code !== 'ERR_NETWORK') {
          console.error('Error fetching wallet data:', error)
        }
        // Keep empty state on error
        setWalletState({
          totalBalance: 0,
          cashInHand: 0,
          totalWithdrawn: 0,
          totalEarned: 0,
          transactions: [],
          joiningBonusClaimed: false
        })
      }
    }

    // Only fetch if status is known and not pending
    if (deliveryStatus !== null && deliveryStatus !== 'pending') {
      fetchWalletData()
    } else if (deliveryStatus === null) {
      // If status is not yet loaded, wait for it
      fetchWalletData()
    }
  }, [deliveryStatus])

  // Fetch bank details status and delivery partner status
  useEffect(() => {
    const checkBankDetails = async () => {
      try {
        const response = await deliveryAPI.getProfile()
        if (response?.data?.success && response?.data?.data?.profile) {
          const profile = response.data.data.profile
          const bankDetails = profile?.documents?.bankDetails
          
          // Store delivery partner status first
          if (profile?.status) {
            setDeliveryStatus(profile.status)
          }
          
          // Store rejection reason if status is blocked
          if (profile?.status === 'blocked' && profile?.rejectionReason) {
            setRejectionReason(profile.rejectionReason)
          } else {
            setRejectionReason(null)
          }
          
          // Only check bank details if status is approved/active
          // Pending users don't need bank details check
          if (profile?.status && profile.status !== 'pending') {
            // Check if all required bank details fields are filled
            const isFilled = !!(
              bankDetails?.accountHolderName?.trim() &&
              bankDetails?.accountNumber?.trim() &&
              bankDetails?.ifscCode?.trim() &&
              bankDetails?.bankName?.trim()
            )
            
            setBankDetailsFilled(isFilled)
          } else {
            // For pending status, don't show bank details banner
            setBankDetailsFilled(true) // Set to true to hide banner
          }
        }
      } catch (error) {
        // Only log error if it's not a network error (backend might be down)
        if (error.code !== 'ERR_NETWORK') {
          console.error("Error checking bank details:", error)
        }
        // Default to showing the banner if we can't check (only for approved users)
        // For network errors, assume pending status to show verification message
        if (error.code === 'ERR_NETWORK') {
          setDeliveryStatus('pending')
          setBankDetailsFilled(true) // Hide bank details banner
        } else {
          setBankDetailsFilled(false)
        }
      }
    }

    checkBankDetails()

    // Listen for profile updates
    const handleProfileRefresh = () => {
      checkBankDetails()
    }

    window.addEventListener('deliveryProfileRefresh', handleProfileRefresh)
    
    return () => {
      window.removeEventListener('deliveryProfileRefresh', handleProfileRefresh)
    }
  }, [])

  // Handle reverify (resubmit for approval)
  const handleReverify = async () => {
    try {
      setIsReverifying(true)
      await deliveryAPI.reverify()
      
      // Refresh profile to get updated status
      const response = await deliveryAPI.getProfile()
      if (response?.data?.success && response?.data?.data?.profile) {
        const profile = response.data.data.profile
        setDeliveryStatus(profile.status)
        setRejectionReason(null)
      }
      
      alert("Your request has been resubmitted for verification. Admin will review it soon.")
    } catch (err) {
      console.error("Error reverifying:", err)
      alert(err.response?.data?.message || "Failed to resubmit request. Please try again.")
    } finally {
      setIsReverifying(false)
    }
  }

  // Ola Maps SDK check removed

  // Initialize Google Map - Preserve map across navigation, re-attach when returning
  useEffect(() => {
    if (showHomeSections) {
      console.log('📍 Map view hidden (showHomeSections is true)');
      return;
    }

    if (!mapContainerRef.current) {
      console.log('📍 Map container ref not available yet');
      return;
    }

    // Store preserved state for re-initialization after navigation
    let preservedState = null;
    
    // If map instance exists, preserve state before re-initializing
    if (window.deliveryMapInstance) {
      const existingMap = window.deliveryMapInstance;
      const existingBikeMarker = bikeMarkerRef.current;
      const existingPolyline = routePolylineRef.current;
      
      console.log('📍 Map instance exists, preserving state for re-initialization...');
      
      // Check if map is already attached to current container
      try {
        const mapDiv = existingMap.getDiv();
        if (mapDiv && mapDiv === mapContainerRef.current) {
          console.log('📍 Map already attached to current container, skipping re-initialization');
          return; // Map is already properly attached, no need to re-initialize
        }
      } catch (error) {
        // Map div check failed, will re-initialize
        console.log('📍 Map container check failed, will re-initialize');
      }
      
      // Store map state safely
      try {
        preservedState = {
          center: existingMap.getCenter(),
          zoom: existingMap.getZoom(),
          bikeMarkerPosition: null,
          bikeMarkerHeading: null,
          hasPolyline: !!existingPolyline
        };
        
        // Store bike marker state
        if (existingBikeMarker) {
          const pos = existingBikeMarker.getPosition();
          if (pos) {
            preservedState.bikeMarkerPosition = { lat: pos.lat(), lng: pos.lng() };
            // Get heading from icon rotation if available
            const icon = existingBikeMarker.getIcon();
            if (icon && typeof icon === 'object' && icon.rotation !== undefined) {
              preservedState.bikeMarkerHeading = icon.rotation;
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error preserving map state:', error);
        preservedState = null;
      }
      
      // Remove markers from old map before clearing (safely)
      try {
        if (existingBikeMarker && typeof existingBikeMarker.setMap === 'function') {
          existingBikeMarker.setMap(null);
        }
        if (existingPolyline && typeof existingPolyline.setMap === 'function') {
          existingPolyline.setMap(null);
        }
      } catch (error) {
        console.warn('⚠️ Error removing markers from old map:', error);
      }
      
      // Clear old map instance reference (will be re-created below)
      // Markers preserved in refs, will be re-attached after map initialization
      window.deliveryMapInstance = null;
    }

    console.log('📍 Starting map initialization...');

    // Wait for Google Maps to load
    if (!window.google || !window.google.maps) {
      console.log('📍 Waiting for Google Maps API to load...');
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          console.log('✅ Google Maps API loaded, initializing map...');
          initializeGoogleMap();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error('❌ Google Maps API failed to load after 5 seconds');
          setMapLoading(false);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    initializeGoogleMap();

    function initializeGoogleMap() {
      try {
        if (!mapContainerRef.current) {
          console.error('❌ Map container ref is null');
          setMapLoading(false);
          return;
        }

        if (!window.google || !window.google.maps) {
          console.error('❌ Google Maps API not available');
          setMapLoading(false);
          return;
        }

        console.log('📍 Initializing Google Map with container:', mapContainerRef.current);
        setMapLoading(true);
        const initialCenter = riderLocation ? { lat: riderLocation[0], lng: riderLocation[1] } : { lat: 22.7196, lng: 75.8577 };
        
        console.log('📍 Map center:', initialCenter);
        
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          tilt: 45,
          heading: 0,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        // Store map instance
        window.deliveryMapInstance = map;
        console.log('✅ Map instance created and stored');

        // Restore preserved state if coming back from navigation
        if (preservedState) {
          if (preservedState.center && preservedState.zoom) {
            map.setCenter(preservedState.center);
            map.setZoom(preservedState.zoom);
            console.log('📍 Restored map center and zoom after navigation');
          }
          
          // Re-create bike marker if it existed before navigation
          if (preservedState.bikeMarkerPosition && isOnlineRef.current) {
            console.log('📍 Re-creating bike marker after navigation:', preservedState.bikeMarkerPosition);
            createOrUpdateBikeMarker(
              preservedState.bikeMarkerPosition.lat, 
              preservedState.bikeMarkerPosition.lng, 
              preservedState.bikeMarkerHeading
            );
          }
          
          // Re-attach route polyline if it existed
          if (preservedState.hasPolyline && routePolylineRef.current && routeHistoryRef.current.length >= 2) {
            routePolylineRef.current.setMap(map);
            console.log('✅ Route polyline re-attached after navigation');
          }
        } else {
          // Initialize route history with current location (first time initialization)
          if (riderLocation && riderLocation.length === 2) {
            routeHistoryRef.current = [{
              lat: riderLocation[0],
              lng: riderLocation[1]
            }];
            lastLocationRef.current = riderLocation;
            
            // Add bike marker if location available and user is online
            // Use ref to get latest online status
            if (isOnlineRef.current) {
              console.log('📍 Creating bike marker on map init - user is online');
              createOrUpdateBikeMarker(riderLocation[0], riderLocation[1], null);
            } else {
              console.log('📍 Skipping bike marker - user is offline');
            }
          }
        }

        map.addListener('tilesloaded', () => {
          setMapLoading(false);
          // Ensure bike marker is visible after tiles load (if online)
          if (isOnlineRef.current && riderLocation && riderLocation.length === 2) {
            setTimeout(() => {
              if (bikeMarkerRef.current && bikeMarkerRef.current.getMap() === null) {
                console.log('📍 Re-adding bike marker after tiles loaded');
                createOrUpdateBikeMarker(riderLocation[0], riderLocation[1], null);
              }
            }, 500);
          }
        });

        console.log('✅ Google Map initialized');
      } catch (error) {
        console.error('❌ Error initializing Google Map:', error);
        setMapLoading(false);
      }
    }

    // Cleanup function - DON'T clear map instance on navigation (preserve it for return)
    return () => {
      // Preserve map instance and markers for navigation
      // Map will be re-initialized when component mounts again
      console.log('📍 Component cleanup - preserving map instance for navigation');
      
      // Don't clear map instance - preserve it in window.deliveryMapInstance
      // Don't clear bike marker - preserve it in bikeMarkerRef
      // Only temporarily remove polyline from map (preserve reference)
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        // Don't set to null - preserve reference for re-attachment
      }
    }
  }, [showHomeSections]) // Only re-initialize when showHomeSections changes

  // Update bike marker when going online - ensure bike appears immediately
  useEffect(() => {
    console.log('🔄 Online status effect triggered:', { 
      isOnline, 
      showHomeSections, 
      hasMap: !!window.deliveryMapInstance,
      riderLocation 
    });

    if (showHomeSections || !window.deliveryMapInstance) {
      return;
    }

    if (!isOnline) {
      // Hide bike marker when offline (blue dot नहीं दिखेगा)
      if (bikeMarkerRef.current) {
        bikeMarkerRef.current.setMap(null);
        console.log('🚫 Bike marker hidden - user offline');
      }
      return;
    }

    // When going online, ensure bike marker is visible at current location IMMEDIATELY
    if (riderLocation && riderLocation.length === 2) {
      // Calculate heading if we have previous location
      let heading = null;
      if (lastLocationRef.current) {
        const [prevLat, prevLng] = lastLocationRef.current;
        heading = calculateHeading(prevLat, prevLng, riderLocation[0], riderLocation[1]);
      }

      console.log('✅ User went ONLINE - creating/updating bike marker immediately at:', riderLocation);

      // Create or update bike marker IMMEDIATELY (blue dot की जगह bike icon)
      createOrUpdateBikeMarker(riderLocation[0], riderLocation[1], heading);
      
      // Center map on bike location smoothly
      window.deliveryMapInstance.panTo({
        lat: riderLocation[0],
        lng: riderLocation[1]
      });

      // Initialize route history if empty
      if (routeHistoryRef.current.length === 0) {
        routeHistoryRef.current = [{
          lat: riderLocation[0],
          lng: riderLocation[1]
        }];
      }

      // Update route polyline
      updateRoutePolyline();

      console.log('✅ Bike marker created/updated when going online:', riderLocation);
    } else {
      // Try to get location from localStorage if current location not available
      const savedLocation = localStorage.getItem('deliveryBoyLastLocation')
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation)
          if (parsed && Array.isArray(parsed) && parsed.length === 2) {
            console.log('📍 Using saved location from localStorage:', parsed)
            createOrUpdateBikeMarker(parsed[0], parsed[1], null)
            window.deliveryMapInstance.panTo({
              lat: parsed[0],
              lng: parsed[1]
            })
          }
        } catch (e) {
          console.warn('⚠️ Error using saved location:', e)
        }
      } else {
        console.warn('⚠️ Cannot create bike marker - invalid rider location:', riderLocation);
      }
    }
  }, [isOnline, riderLocation, showHomeSections])

  // Safeguard: Ensure bike marker stays on map (prevent it from disappearing)
  useEffect(() => {
    if (!isOnline || showHomeSections || !window.deliveryMapInstance) return;

    // Check every 2 seconds if bike marker is still on map
    const checkInterval = setInterval(() => {
      if (isOnlineRef.current && riderLocation && riderLocation.length === 2) {
        if (bikeMarkerRef.current) {
          const markerMap = bikeMarkerRef.current.getMap();
          if (markerMap === null) {
            console.warn('⚠️ Bike marker lost map reference, re-adding...');
            createOrUpdateBikeMarker(riderLocation[0], riderLocation[1], null);
          }
        } else {
          // Marker doesn't exist, create it
          console.warn('⚠️ Bike marker missing, creating...');
          createOrUpdateBikeMarker(riderLocation[0], riderLocation[1], null);
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkInterval);
  }, [isOnline, riderLocation, showHomeSections])

  // Directions Map placeholder (Ola Maps removed)
  useEffect(() => {
    if (!showDirectionsMap || !selectedRestaurant) return
    setDirectionsMapLoading(false)
  }, [showDirectionsMap, selectedRestaurant])

  // Handle route polyline visibility
  useEffect(() => {
    if (routePolylineRef.current) {
      if (showRoutePath && routeHistoryRef.current.length >= 2) {
        routePolylineRef.current.setMap(window.deliveryMapInstance);
      } else {
        routePolylineRef.current.setMap(null);
      }
    }
  }, [showRoutePath])

  // Calculate heading from two coordinates (in degrees, 0-360)
  const calculateHeading = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
    
    let heading = Math.atan2(y, x) * 180 / Math.PI
    heading = (heading + 360) % 360 // Normalize to 0-360
    
    return heading
  }

  // Google Maps marker functions
  const createOrUpdateBikeMarker = (latitude, longitude, heading = null) => {
    if (!window.google || !window.google.maps || !window.deliveryMapInstance) {
      console.warn("⚠️ Google Maps not available");
      return;
    }

    const position = new window.google.maps.LatLng(latitude, longitude);
    const map = window.deliveryMapInstance;

    console.log('🚲 Creating/updating bike marker:', { 
      latitude, 
      longitude, 
      heading,
      markerExists: !!bikeMarkerRef.current,
      isOnline: isOnlineRef.current
    });

    if (!bikeMarkerRef.current) {
      // Create bike marker with custom icon
      const bikeIcon = {
        url: bikeLogo,
        scaledSize: new window.google.maps.Size(60, 60), // Larger size for better visibility
        anchor: new window.google.maps.Point(30, 30), // Center point
        rotation: heading || 0
      };

      bikeMarkerRef.current = new window.google.maps.Marker({
        position: position,
        map: map,
        icon: bikeIcon,
        optimized: false,
        animation: window.google.maps.Animation.DROP // Drop animation on first appearance
      });
      
      console.log('✅ Bike marker created successfully:', {
        position: bikeMarkerRef.current.getPosition()?.toString(),
        map: !!bikeMarkerRef.current.getMap()
      });
      
      // Remove animation after drop completes
      setTimeout(() => {
        if (bikeMarkerRef.current) {
          bikeMarkerRef.current.setAnimation(null);
        }
      }, 2000);
    } else {
      // ALWAYS ensure marker is on the map (prevent it from disappearing)
      if (bikeMarkerRef.current.getMap() === null) {
        bikeMarkerRef.current.setMap(map);
        console.log('✅ Bike marker re-added to map (was missing)');
      }
      
      // Smooth update position and rotation
      const currentPosition = bikeMarkerRef.current.getPosition();
      if (currentPosition) {
        // Update position first
        bikeMarkerRef.current.setPosition(position);
        // Then pan map smoothly
        map.panTo(position);
      } else {
        bikeMarkerRef.current.setPosition(position);
      }
      
      // Update icon with rotation
      const bikeIcon = {
        url: bikeLogo,
        scaledSize: new window.google.maps.Size(60, 60),
        anchor: new window.google.maps.Point(30, 30),
        rotation: heading !== null && heading !== undefined ? heading : 0
      };
      bikeMarkerRef.current.setIcon(bikeIcon);
      
      // Double-check marker is still on map after update
      if (bikeMarkerRef.current.getMap() === null) {
        console.warn('⚠️ Bike marker lost map reference, re-adding...');
        bikeMarkerRef.current.setMap(map);
      }
      
      console.log('✅ Bike marker updated:', { 
        latitude, 
        longitude, 
        heading,
        position: bikeMarkerRef.current.getPosition()?.toString(),
        map: !!bikeMarkerRef.current.getMap(),
        isOnMap: bikeMarkerRef.current.getMap() !== null
      });
    }
  }

  // Create or update route polyline (blue line showing traveled path)
  const updateRoutePolyline = () => {
    if (!window.google || !window.google.maps || !window.deliveryMapInstance) {
      return;
    }

    if (!showRoutePath) {
      // Hide polyline if showRoutePath is false
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
      }
      return;
    }

    const map = window.deliveryMapInstance;
    const routeHistory = routeHistoryRef.current;

    if (routeHistory.length < 2) {
      return; // Need at least 2 points to draw a line
    }

    // Convert route history to Google Maps LatLng array
    const path = routeHistory.map(point => ({
      lat: point.lat,
      lng: point.lng
    }));

    if (!routePolylineRef.current) {
      // Create new polyline
      routePolylineRef.current = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#4285F4', // Google Blue color
        strokeOpacity: 1.0,
        strokeWeight: 6, // Line thickness
        map: map
      });
    } else {
      // Update existing polyline path
      routePolylineRef.current.setPath(path);
      routePolylineRef.current.setMap(map); // Ensure it's visible
    }
  }

  const createOrUpdateBlueDotMarker = (latitude, longitude) => {
    if (!window.google || !window.google.maps || !window.deliveryMapInstance) {
      return;
    }

    const position = new window.google.maps.LatLng(latitude, longitude);
    const map = window.deliveryMapInstance;

    if (!userLocationMarkerRef.current) {
      userLocationMarkerRef.current = new window.google.maps.Marker({
        position: position,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });
    } else {
      userLocationMarkerRef.current.setPosition(position);
    }
  }


  // Bike marker update removed (Ola Maps removed)

  // Carousel slides data - filter based on bank details status
  const carouselSlides = useMemo(() => [
    {
      id: 1,
      title: "Work for 2 days",
      subtitle: "to get Appzeto bag",
      icon: "bag",
      buttonText: "Know more",
      bgColor: "bg-gray-700"
    },
    ...(bankDetailsFilled ? [] : [{
      id: 2,
      title: "Submit bank details",
      subtitle: "PAN & bank details required for payouts",
      icon: "bank",
      buttonText: "Submit",
      bgColor: "bg-yellow-400"
    }])
  ], [bankDetailsFilled])

  // Auto-rotate carousel
  useEffect(() => {
    // Reset to first slide if current slide is out of bounds
    setCurrentCarouselSlide((prev) => {
      if (prev >= carouselSlides.length) {
        return 0
      }
      return prev
    })
    
    carouselAutoRotateRef.current = setInterval(() => {
      setCurrentCarouselSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 3000)
    return () => {
      if (carouselAutoRotateRef.current) {
        clearInterval(carouselAutoRotateRef.current)
      }
    }
  }, [carouselSlides])

  // Reset auto-rotate timer after manual swipe
  const resetCarouselAutoRotate = useCallback(() => {
    if (carouselAutoRotateRef.current) {
      clearInterval(carouselAutoRotateRef.current)
    }
    carouselAutoRotateRef.current = setInterval(() => {
      setCurrentCarouselSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 3000)
  }, [carouselSlides.length])

  // Handle carousel swipe touch events
  const carouselStartY = useRef(0)

  const handleCarouselTouchStart = useCallback((e) => {
    carouselIsSwiping.current = true
    carouselStartX.current = e.touches[0].clientX
    carouselStartY.current = e.touches[0].clientY
  }, [])

  const handleCarouselTouchMove = useCallback((e) => {
    if (!carouselIsSwiping.current) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = Math.abs(currentX - carouselStartX.current)
    const deltaY = Math.abs(currentY - carouselStartY.current)

    // Only prevent default if horizontal swipe is dominant
    if (deltaX > deltaY && deltaX > 10) {
      safePreventDefault(e)
    }
  }, [])

  const handleCarouselTouchEnd = useCallback((e) => {
    if (!carouselIsSwiping.current) return

    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = carouselStartX.current - endX
    const deltaY = Math.abs(carouselStartY.current - endY)
    const threshold = 50 // Minimum swipe distance

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swiped left - go to next slide
        setCurrentCarouselSlide((prev) => (prev + 1) % carouselSlides.length)
      } else {
        // Swiped right - go to previous slide
        setCurrentCarouselSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
      }
      resetCarouselAutoRotate()
    }

    carouselIsSwiping.current = false
    carouselStartX.current = 0
    carouselStartY.current = 0
  }, [carouselSlides.length, resetCarouselAutoRotate])

  // Handle carousel mouse events for desktop
  const handleCarouselMouseDown = (e) => {
    carouselIsSwiping.current = true
    carouselStartX.current = e.clientX

    const handleMouseMove = (moveEvent) => {
      if (!carouselIsSwiping.current) return
      safePreventDefault(moveEvent)
    }

    const handleMouseUp = (upEvent) => {
      if (!carouselIsSwiping.current) {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        return
      }

      const endX = upEvent.clientX
      const deltaX = carouselStartX.current - endX
      const threshold = 50

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          // Swiped left - go to next slide
          setCurrentCarouselSlide((prev) => (prev + 1) % carouselSlides.length)
        } else {
          // Swiped right - go to previous slide
          setCurrentCarouselSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
        }
        resetCarouselAutoRotate()
      }

      carouselIsSwiping.current = false
      carouselStartX.current = 0
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Setup non-passive touch event listeners for carousel to allow preventDefault
  useEffect(() => {
    const carouselElement = carouselRef.current
    if (!carouselElement) return

    // Add event listeners with { passive: false } for touchmove to allow preventDefault
    carouselElement.addEventListener('touchstart', handleCarouselTouchStart, { passive: true })
    carouselElement.addEventListener('touchmove', handleCarouselTouchMove, { passive: false })
    carouselElement.addEventListener('touchend', handleCarouselTouchEnd, { passive: true })

    return () => {
      carouselElement.removeEventListener('touchstart', handleCarouselTouchStart)
      carouselElement.removeEventListener('touchmove', handleCarouselTouchMove)
      carouselElement.removeEventListener('touchend', handleCarouselTouchEnd)
    }
  }, [handleCarouselTouchStart, handleCarouselTouchMove, handleCarouselTouchEnd])

  // Handle swipe bar touch events
  const handleSwipeBarTouchStart = (e) => {
    // Check if touch is on a button or interactive element
    const target = e.target
    const isInteractive = target.closest('button') || target.closest('a') || target.closest('[role="button"]')
    
    // If touching an interactive element, don't start swipe
    if (isInteractive && !target.closest('[data-swipe-handle]')) {
      return
    }
    
    // Check if touch is on scrollable content area
    const isOnScrollableContent = target.closest('[ref="homeSectionsScrollRef"]') || 
                                  target.closest('.overflow-y-auto') ||
                                  (homeSectionsScrollRef.current && homeSectionsScrollRef.current.contains(target))
    
    // Check if we're scrolling vs dragging
    if (showHomeSections && homeSectionsScrollRef.current && isOnScrollableContent) {
      const scrollTop = homeSectionsScrollRef.current.scrollTop
      const scrollHeight = homeSectionsScrollRef.current.scrollHeight
      const clientHeight = homeSectionsScrollRef.current.clientHeight
      const isScrollable = scrollHeight > clientHeight
      
      // If content is scrollable and not at top/bottom, allow scrolling
      if (isScrollable && (scrollTop > 10 || scrollTop < (scrollHeight - clientHeight - 10))) {
        // User is scrolling, not dragging
        isScrollingHomeSections.current = true
        isSwipingBar.current = false
        return
      }
    }
    
    // Only start swipe if touch is on swipe handle or at top/bottom of scrollable area
    isSwipingBar.current = true
    swipeBarStartY.current = e.touches[0].clientY
    setIsDraggingSwipeBar(true)
    isScrollingHomeSections.current = false
  }

  const handleSwipeBarTouchMove = (e) => {
    if (!isSwipingBar.current) return
    
    const currentY = e.touches[0].clientY
    const deltaY = swipeBarStartY.current - currentY // Positive = swiping up, Negative = swiping down
    const windowHeight = window.innerHeight

    // Check if user is scrolling content vs dragging swipe bar
    if (showHomeSections && homeSectionsScrollRef.current) {
      const scrollTop = homeSectionsScrollRef.current.scrollTop
      const scrollHeight = homeSectionsScrollRef.current.scrollHeight
      const clientHeight = homeSectionsScrollRef.current.clientHeight
      const isScrollable = scrollHeight > clientHeight
      
      // If content is scrollable and user is trying to scroll
      if (isScrollable) {
        // Scrolling down (deltaY < 0) - allow scroll if not at top
        if (deltaY < 0 && scrollTop > 0) {
          isScrollingHomeSections.current = true
          isSwipingBar.current = false
          setIsDraggingSwipeBar(false)
          return // Allow native scroll
        }
        
        // Scrolling up (deltaY > 0) - allow scroll if not at bottom
        if (deltaY > 0 && scrollTop < (scrollHeight - clientHeight - 10)) {
          isScrollingHomeSections.current = true
          isSwipingBar.current = false
          setIsDraggingSwipeBar(false)
          return // Allow native scroll
        }
      }
    }

    // If user was scrolling, don't handle as swipe
    if (isScrollingHomeSections.current) {
      return
    }

    // Only prevent default if we're actually dragging swipe bar (not scrolling)
    // Only prevent if drag is significant enough
    if (Math.abs(deltaY) > 10) {
      safePreventDefault(e)
    }

    if (showHomeSections) {
      // Currently showing home sections - swiping down should go back to map
      // Calculate position from 1 (top) to 0 (bottom)
      const newPosition = Math.max(0, Math.min(1, 1 + (deltaY / windowHeight)))
      setSwipeBarPosition(newPosition)
    } else {
      // Currently showing map - swiping up should show home sections
      // Calculate position from 0 (bottom) to 1 (top)
      const newPosition = Math.max(0, Math.min(1, deltaY / windowHeight))
      setSwipeBarPosition(newPosition)
    }
  }

  const handleSwipeBarTouchEnd = (e) => {
    if (!isSwipingBar.current) return
    
    // If user was scrolling, don't handle as swipe
    if (isScrollingHomeSections.current) {
      isSwipingBar.current = false
      setIsDraggingSwipeBar(false)
      isScrollingHomeSections.current = false
      return
    }

    const windowHeight = window.innerHeight
    const threshold = 50 // Small threshold - just 50px to trigger
    const finalY = e.changedTouches[0].clientY
    const finalDeltaY = swipeBarStartY.current - finalY

    if (showHomeSections) {
      // If showing home sections and swiped down, go back to map
      if (finalDeltaY < -threshold || swipeBarPosition < 0.95) {
        setShowHomeSections(false)
        setSwipeBarPosition(0)
      } else {
        // Keep it open
        setSwipeBarPosition(1)
        setShowHomeSections(true)
      }
    } else {
      // If showing map and swiped up, show home sections
      if (finalDeltaY > threshold || swipeBarPosition > 0.05) {
        setSwipeBarPosition(1)
        setShowHomeSections(true)
      } else {
        setSwipeBarPosition(0)
        setShowHomeSections(false)
      }
    }

    isSwipingBar.current = false
    setIsDraggingSwipeBar(false)
    swipeBarStartY.current = 0
    isScrollingHomeSections.current = false
  }

  // Handle mouse events for desktop
  const handleSwipeBarMouseDown = (e) => {
    // Check if click is on a button or interactive element
    const target = e.target
    const isInteractive = target.closest('button') || target.closest('a') || target.closest('[role="button"]')
    
    // If clicking an interactive element, don't start swipe
    if (isInteractive && !target.closest('[data-swipe-handle]')) {
      return
    }
    
    isSwipingBar.current = true
    swipeBarStartY.current = e.clientY
    setIsDraggingSwipeBar(true)
  }

  const handleSwipeBarMouseMove = (e) => {
    if (!isSwipingBar.current) return

    const currentY = e.clientY
    const deltaY = swipeBarStartY.current - currentY
    const windowHeight = window.innerHeight

    // Prevent default to avoid text selection
    safePreventDefault(e)

    if (showHomeSections) {
      // Currently showing home sections - swiping down should go back to map
      // Calculate position from 1 (top) to 0 (bottom)
      const newPosition = Math.max(0, Math.min(1, 1 + (deltaY / windowHeight)))
      setSwipeBarPosition(newPosition)
    } else {
      // Currently showing map - swiping up should show home sections
      // Calculate position from 0 (bottom) to 1 (top)
      const newPosition = Math.max(0, Math.min(1, deltaY / windowHeight))
      setSwipeBarPosition(newPosition)
    }
  }

  const handleSwipeBarMouseUp = (e) => {
    if (!isSwipingBar.current) return

    const windowHeight = window.innerHeight
    const threshold = 50 // Small threshold - just 50px to trigger
    const finalY = e.clientY
    const finalDeltaY = swipeBarStartY.current - finalY

    if (showHomeSections) {
      // If showing home sections and swiped down, go back to map
      if (finalDeltaY < -threshold || swipeBarPosition < 0.95) {
        setShowHomeSections(false)
        setSwipeBarPosition(0)
      } else {
        // Keep it open
        setSwipeBarPosition(1)
        setShowHomeSections(true)
      }
    } else {
      // If showing map and swiped up, show home sections
      if (finalDeltaY > threshold || swipeBarPosition > 0.05) {
        setSwipeBarPosition(1)
        setShowHomeSections(true)
      } else {
        setSwipeBarPosition(0)
        setShowHomeSections(false)
      }
    }

    isSwipingBar.current = false
    setIsDraggingSwipeBar(false)
    swipeBarStartY.current = 0
  }

  // Handle chevron click to slide down swipe bar
  const handleChevronDownClick = () => {
    if (showHomeSections) {
      setShowHomeSections(false)
      setSwipeBarPosition(0)
      setIsDraggingSwipeBar(false)
    }
  }

  // Handle chevron click to slide up swipe bar
  const handleChevronUpClick = () => {
    if (!showHomeSections) {
      setShowHomeSections(true)
      setSwipeBarPosition(1)
      setIsDraggingSwipeBar(false)
    }
  }

  // Add global mouse event listeners
  useEffect(() => {
    if (isDraggingSwipeBar) {
      document.addEventListener('mousemove', handleSwipeBarMouseMove)
      document.addEventListener('mouseup', handleSwipeBarMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleSwipeBarMouseMove)
        document.removeEventListener('mouseup', handleSwipeBarMouseUp)
      }
    }
  }, [isDraggingSwipeBar, swipeBarPosition])

  // Get next available slot for booking
  const getNextAvailableSlot = () => {
    if (!todayGig) return null

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    // Find next slot after current gig ends
    if (todayGig.endTime && todayGig.endTime > currentTime) {
      const [hours, minutes] = todayGig.endTime.split(':').map(Number)
      const nextStartHour = hours
      const nextEndHour = hours + 1
      return {
        start: `${String(nextStartHour).padStart(2, '0')}:00`,
        end: `${String(nextEndHour).padStart(2, '0')}:00`
      }
    }
    return null
  }

  const nextSlot = getNextAvailableSlot()


  // Render normal feed view when offline or no gig booked
  return (
    <div className="min-h-screen bg-[#f6e9dc] overflow-x-hidden">
      {/* Top Navigation Bar */}
      <FeedNavbar
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        onEmergencyClick={() => setShowEmergencyPopup(true)}
        onHelpClick={() => setShowHelpPopup(true)}
      />

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden bg-gray-700 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleCarouselMouseDown}
      >
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentCarouselSlide * 100}%)` }}>
          {carouselSlides.map((slide) => (
            <div key={slide.id} className="min-w-full">
              <div className={`${slide.bgColor} px-4 py-3 flex items-center gap-3 min-h-[80px]`}>
                {/* Icon */}
                <div className="flex-shrink-0">
                  {slide.icon === "bag" ? (
                    <div className="relative">
                      {/* Delivery Bag Icon - Reduced size */}
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-lg relative">
                        {/* Bag shape */}
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      {/* Shadow */}
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-black/30 rounded-full blur-sm"></div>
                    </div>
                  ) : (
                    <div className="relative w-10 h-10">
                      {/* Bank/Rupee Icon - Reduced size */}
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center relative">
                        {/* Rupee symbol */}
                        <svg className="w-12 h-12 text-white absolute" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className={`${slide.bgColor === "bg-gray-700" ? "text-white" : "text-black"} text-sm font-semibold mb-0.5`}>
                    {slide.title}
                  </h3>
                  <p className={`${slide.bgColor === "bg-gray-700" ? "text-white/90" : "text-black/80"} text-xs`}>
                    {slide.subtitle}
                  </p>
                </div>

                {/* Button */}
                <button 
                  onClick={() => {
                    if (slide.id === 2) {
                      navigate("/delivery/profile/details")
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${slide.bgColor === "bg-gray-700"
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-yellow-300 text-black hover:bg-yellow-200"
                  }`}>
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCarouselSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentCarouselSlide
                  ? (currentCarouselSlide === 0 ? "w-6 bg-white" : "w-6 bg-black")
                  : (index === 0 ? "w-1.5 bg-white/50" : "w-1.5 bg-black/30")
                }`}
            />
          ))}
        </div>
      </div>

      {/* Map View Toggle Bar - Only visible when map is shown, transparent overlay on map */}
      {!showHomeSections && (
        <>
          {/* Segmented Control - Hotspot/Select drop - Centered */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[155px] left-1/2 -translate-x-1/2 z-40"
          >
            <div className="relative inline-flex rounded-full bg-white backdrop-blur-md shadow-lg border border-gray-200 overflow-hidden p-1">
              {/* Animated sliding background */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-full bg-black"
                initial={false}
                animate={{
                  left: mapViewMode === "hotspot" ? "4px" : "50%",
                  width: mapViewMode === "hotspot" ? "calc(50% - 4px)" : "calc(50% - 4px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />

              {/* Buttons */}
              <button
                onClick={() => setMapViewMode("hotspot")}
                className={`relative px-6 py-2.5 font-semibold text-sm transition-colors duration-200 whitespace-nowrap rounded-full z-10 ${mapViewMode === "hotspot"
                    ? "text-white"
                    : "text-black"
                  }`}
              >
                Hotspot
              </button>
              <button
                onClick={() => {
                  const selectedDropLocation = getSelectedDropLocation()
                  if (!selectedDropLocation) {
                    navigate("/delivery/select-drop-location")
                  } else {
                    setMapViewMode("selectDrop")
                  }
                }}
                className={`relative px-6 py-2.5 font-semibold text-sm transition-colors duration-200 whitespace-nowrap rounded-full z-10 ${mapViewMode === "selectDrop"
                    ? "text-white"
                    : "text-black"
                  }`}
              >
                Select drop
              </button>
            </div>
          </motion.div>

          {/* Hamburger Menu Button - Absolute Right */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[160px] right-4 z-40 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-300/50 flex items-center justify-center hover:bg-white/90 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Conditional Content Based on Swipe Bar Position */}
      {!showHomeSections ? (
        /* Map View - Shows map with Hotspot or Select drop mode */
        <div className="relative flex-1" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
          {/* Google Maps Container */}
          <div
            ref={mapContainerRef}
            style={{ 
              height: '100%', 
              width: '100%', 
              zIndex: 1, 
              minHeight: '400px',
              backgroundColor: '#e5e7eb' // Light gray background while loading
            }}
            className="z-0"
          />
          
          {/* Loading indicator */}
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="text-gray-600 font-medium">Loading map...</div>
                <div className="text-xs text-gray-500">Please wait</div>
              </div>
            </div>
          )}

          {/* Map Refresh Overlay - Professional Loading Indicator */}
          {isRefreshingLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-blue-500/5 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none"
            >
              {/* Loading indicator container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="relative"
              >
                {/* Outer pulsing ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.3, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1], // Smooth ease-in-out
                    type: "tween",
                    times: [0, 0.5, 1]
                  }}
                  className="absolute inset-0 w-20 h-20 bg-blue-500/20 rounded-full"
                />
                
                {/* Middle ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.2, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1], // Smooth ease-in-out
                    type: "tween",
                    delay: 0.3,
                    times: [0, 0.5, 1]
                  }}
                  className="absolute inset-0 w-16 h-16 bg-blue-500/30 rounded-full m-2"
                />
                
                {/* Inner spinner */}
                <div className="relative w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "linear",
                      type: "tween"
                    }}
                    className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Floating Action Button - My Location */}
          <motion.button
            onClick={() => {
              if (navigator.geolocation) {
                setIsRefreshingLocation(true)
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    // Validate coordinates
                    const latitude = position.coords.latitude
                    const longitude = position.coords.longitude
                    
                    // Validate coordinates are valid numbers
                    if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
                        isNaN(latitude) || isNaN(longitude) ||
                        latitude < -90 || latitude > 90 || 
                        longitude < -180 || longitude > 180) {
                      console.warn("⚠️ Invalid coordinates received:", { latitude, longitude })
                      setIsRefreshingLocation(false)
                      return
                    }
                    
                    const newLocation = [latitude, longitude] // [lat, lng] format
                    
                    // Calculate heading from previous location
                    let heading = null
                    if (lastLocationRef.current) {
                      const [prevLat, prevLng] = lastLocationRef.current
                      heading = calculateHeading(prevLat, prevLng, latitude, longitude)
                    }
                    
                    // Save location to localStorage (for refresh handling)
                    localStorage.setItem('deliveryBoyLastLocation', JSON.stringify(newLocation))
                    
                    // Update route history
                    if (lastLocationRef.current) {
                      routeHistoryRef.current.push({
                        lat: latitude,
                        lng: longitude
                      })
                      if (routeHistoryRef.current.length > 1000) {
                        routeHistoryRef.current.shift()
                      }
                    } else {
                      routeHistoryRef.current = [{
                        lat: latitude,
                        lng: longitude
                      }]
                    }
                    
                    // Update bike marker (only if online - blue dot नहीं, bike icon)
                    if (window.deliveryMapInstance) {
                      if (isOnlineRef.current) {
                        createOrUpdateBikeMarker(latitude, longitude, heading)
                        updateRoutePolyline()
                        
                        // Center map on location
                        window.deliveryMapInstance.panTo({
                          lat: latitude,
                          lng: longitude
                        })
                      } else {
                        // Offline है तो marker hide करें
                        if (bikeMarkerRef.current) {
                          bikeMarkerRef.current.setMap(null)
                        }
                      }
                    }
                    
                    setRiderLocation(newLocation)
                    lastLocationRef.current = newLocation
                    
                    console.log("📍 Location refreshed:", { 
                      latitude, 
                      longitude, 
                      heading,
                      accuracy: position.coords.accuracy,
                      isOnline: isOnlineRef.current
                    })
                    
                    // Stop refreshing animation after a short delay
                    setTimeout(() => {
                      setIsRefreshingLocation(false)
                    }, 800)
                  },
                  (error) => {
                    console.error('Error getting location:', error)
                    setIsRefreshingLocation(false)
                  },
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                )
              }
            }}
            className="absolute bottom-44 right-3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20 overflow-visible"
            whileTap={{ scale: 0.92 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              mass: 0.5
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Ripple effect */}
              {isRefreshingLocation && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-blue-500/20"
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ 
                    scale: [0.9, 1.6, 1.8],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.25, 0.46, 0.45, 0.94], // Smooth ease-out
                    times: [0, 0.5, 1]
                  }}
                />
              )}
              
              {/* Icon with smooth animations */}
              <motion.div
                className="relative z-10"
                animate={{
                  rotate: isRefreshingLocation ? 360 : 0,
                  scale: isRefreshingLocation ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  rotate: {
                    duration: 2,
                    repeat: isRefreshingLocation ? Infinity : 0,
                    ease: "linear", // Linear for smooth continuous rotation
                    type: "tween"
                  },
                  scale: {
                    duration: 1.5,
                    repeat: isRefreshingLocation ? Infinity : 0,
                    ease: [0.4, 0, 0.6, 1], // Smooth ease-in-out
                    type: "tween",
                    times: [0, 0.5, 1]
                  }
                }}
              >
                <MapPin 
                  className={`w-6 h-6 transition-colors duration-500 ease-in-out ${
                    isRefreshingLocation ? 'text-blue-600' : 'text-gray-700'
                  }`} 
                />
              </motion.div>
            </div>
          </motion.button>

          {/* Floating Banner - Status Message */}
          {mapViewMode === "hotspot" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-sm px-6 py-4 z-20 min-w-[96%] text-center"
            >
              {deliveryStatus === "pending" ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Verification Done in 24 Hours</h3>
                  <p className="text-sm text-gray-600">Your account is under verification. You'll be notified once approved.</p>
                </>
              ) : deliveryStatus === "blocked" ? (
                <>
                  <h3 className="text-lg font-bold text-red-600 mb-2">Denied Verification</h3>
                  {rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-left">
                      <p className="text-xs font-semibold text-red-800 mb-2">Reason for Rejection:</p>
                      <div className="text-xs text-red-700 space-y-1">
                        {rejectionReason.split('\n').filter(line => line.trim()).length > 1 ? (
                          <ul className="space-y-1 list-disc list-inside">
                            {rejectionReason.split('\n').map((point, index) => (
                              point.trim() && (
                                <li key={index}>{point.trim()}</li>
                              )
                            ))}
                          </ul>
                        ) : (
                          <p className="text-red-700">{rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 mb-3">
                    Please correct the above issues and click "Reverify" to resubmit your request for approval.
                  </p>
                  <button
                    onClick={handleReverify}
                    disabled={isReverifying}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
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
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No hotspots are available</h3>
                  <p className="text-sm text-gray-600">Please go online to see hotspots</p>
                </>
              )}
            </motion.div>
          )}

          {/* Bottom Swipeable Bar - Can be dragged up to show home sections */}
          {!showHomeSections && (
            <motion.div
              ref={swipeBarRef}
              initial={{ y: "100%" }}
              animate={{
                y: isDraggingSwipeBar
                  ? `${-swipeBarPosition * (window.innerHeight * 0.8)}px`
                  : 0
              }}
              transition={isDraggingSwipeBar ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300 }}
              onTouchStart={handleSwipeBarTouchStart}
              onTouchMove={handleSwipeBarTouchMove}
              onTouchEnd={handleSwipeBarTouchEnd}
              onMouseDown={handleSwipeBarMouseDown}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-10"
              style={{
                touchAction: 'pan-y'
              }}
            >
              {/* Swipe Handle */}
              <div
                className="flex flex-col items-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
              >
                <motion.div
                  className="flex flex-col items-center gap-1"
                  animate={{
                    y: isDraggingSwipeBar ? swipeBarPosition * 5 : 0,
                    opacity: isDraggingSwipeBar ? 0.7 : 1
                  }}
                  transition={{ duration: 0.1 }}
                >
                  <button
                    onClick={handleChevronUpClick}
                    className="flex items-center justify-center p-2 -m-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Slide up"
                  >
                    <ChevronUp className="!w-12 !h-8 scale-x-150 text-gray-400 -mt-2 font-bold" strokeWidth={3} />
                  </button>
                </motion.div>
              </div>

              {/* Content Area - Shows map info when down */}
              <div className="px-4 pb-6">
                {mapViewMode === "hotspot" ? (
                  <div className="flex flex-col items-center">
                    {/* <h3 className="text-lg font-bold text-gray-900 mb-2">No hotspots are available</h3>
                  <p className="text-sm text-gray-600 mb-4">Please go online to see hotspots</p> */}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {/* <h3 className="text-lg font-bold text-gray-900 mb-2">Select drop location</h3>
                  <p className="text-sm text-gray-600 mb-4">Choose a drop location on the map</p> */}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* Home Sections View - Full screen when swipe bar is dragged up */
        <motion.div
          ref={swipeBarRef}
          initial={{ y: "100%" }}
          animate={{
            y: isDraggingSwipeBar
              ? `${(1 - swipeBarPosition) * (window.innerHeight * 0.8)}px`
              : 0
          }}
          exit={{ y: "100%" }}
          transition={isDraggingSwipeBar ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300 }}
          onTouchStart={handleSwipeBarTouchStart}
          onTouchMove={handleSwipeBarTouchMove}
          onTouchEnd={handleSwipeBarTouchEnd}
          onMouseDown={handleSwipeBarMouseDown}
          className="relative flex-1 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', touchAction: 'pan-y' }}
        >
          {/* Swipe Handle at Top - Can be dragged down to go back to map */}
          <div
            className="flex flex-col items-center pt-4 pb-2 cursor-grab active:cursor-grabbing bg-white sticky top-0 z-10"
            style={{ touchAction: 'none' }}
          >
            <motion.div
              className="flex flex-col items-center gap-1"
              animate={{
                y: isDraggingSwipeBar ? -swipeBarPosition * 5 : 0,
                opacity: isDraggingSwipeBar ? 0.7 : 1
              }}
              transition={{ duration: 0.1 }}
            >
              <button
                onClick={handleChevronDownClick}
                className="flex items-center justify-center p-2 -m-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Slide down"
              >
                <ChevronDown
                  className="!w-12 !h-8 scale-x-150 text-gray-400 -mt-2 font-bold"
                  strokeWidth={3}
                />
              </button>
            </motion.div>
          </div>

          <div 
            ref={homeSectionsScrollRef}
            className="px-4 pt-4 pb-16 space-y-4 overflow-y-auto" 
            style={{ 
              height: 'calc(100vh - 250px)',
              touchAction: 'pan-y', // Allow vertical scrolling
              WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
            }}
          >
            {/* Referral Bonus Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate("/delivery/refer-and-earn")}
              className="w-full rounded-xl p-6 shadow-lg relative overflow-hidden min-h-[70px] cursor-pointer"
              style={{
                backgroundImage: `url(${referralBonusBg})`,
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="relative z-10">
                <div className="text-white text-3xl font-bold mb-1">₹6,000                 <span className="text-white/90 text-base font-medium mb-1">referral bonus</span>
                 </div>
                <div className="text-white/80 text-sm">Refer your friends now</div>
              </div>
            </motion.div>

            {/* Unlock Offer Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full rounded-xl p-6 shadow-lg bg-black text-white"
            >
              <div className="flex items-center text-center justify-center gap-2 mb-2">
                <div className="text-4xl font-bold text-center">₹100</div>
                <Lock className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/90 text-center text-sm mb-4">Complete 1 order to unlock ₹100</p>
              <div className="flex items-center text-center justify-center gap-2 text-white/70 text-xs mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-center">Valid till 10 December 2025</span>
              </div>
              <button
                onClick={() => {
                  if (isOnline) {
                    goOffline()
                  } else {
                    // Always show the popup when offline (same as navbar behavior)
                    setShowBookGigsPopup(true)
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <span>Go online</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            
            {/* Earnings Guarantee Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="w-full rounded-xl overflow-hidden shadow-lg bg-white"
            >
              {/* Header */}
              <div className="border-b  border-gray-100">
                <div className="flex p-2 px-3 items-center justify-between bg-black">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-1">Earnings Guarantee</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">Valid till {weekEndDate}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Live</span>
                      </div>
                    </div>
                  </div>
                  {/* Summary Box */}
                  <div className="bg-black text-white px-4 py-3 rounded-lg text-center min-w-[80px]">
                    <div className="text-2xl font-bold">₹{earningsGuaranteeTarget.toFixed(0)}</div>
                    <div className="text-xs text-white/80 mt-1">{earningsGuaranteeOrdersTarget} orders</div>
                  </div>
                </div>
              </div>

              {/* Progress Circles */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-around gap-6">
                  {/* Orders Progress Circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="8"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: ordersProgress }}
                          transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{earningsGuaranteeCurrentOrders} of {earningsGuaranteeOrdersTarget}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Orders</span>
                    </div>
                  </motion.div>

                  {/* Earnings Progress Circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#000000"
                          strokeWidth="8"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: earningsProgress }}
                          transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">₹{earningsGuaranteeCurrentEarnings.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <IndianRupee className="w-5 h-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">Earnings</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Today's Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="w-full rounded-xl overflow-hidden shadow-lg bg-white"
            >
              {/* Header */}
              <div className="bg-black px-4 py-3 flex items-center gap-3">
                <div className="relative">
                  <Calendar className="w-5 h-5 text-white" />
                  <CheckCircle className="w-3 h-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" fill="currentColor" />
                </div>
                <span className="text-white font-semibold">Today's progress</span>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Grid Layout - 2x2 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Top Left - Earnings */}
                  <button
                    onClick={() => navigate("/delivery/earnings")}
                    className="flex flex-col items-start gap-1 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(todayEarnings)}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>Earnings</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Top Right - Trips */}
                  <button
                    onClick={() => navigate("/delivery/trip-history")}
                    className="flex flex-col items-end gap-1 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-gray-900">
                      {todayTrips}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>Trips</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Bottom Left - Time on orders */}
                  <button
                    onClick={() => navigate("/delivery/time-on-orders")}
                    className="flex flex-col items-start gap-1 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-gray-900">
                      {`${formatHours(todayHoursWorked)} hrs`}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>Time on orders</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Bottom Right - Gigs History */}
                  <button
                    onClick={() => navigate("/delivery/gig")}
                    className="flex flex-col items-end gap-1 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-2xl font-bold text-gray-900">
                      {`${todayGigsCount} Gigs`}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>History</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Help Popup */}
      <BottomPopup
        isOpen={showHelpPopup}
        onClose={() => setShowHelpPopup(false)}
        title="How can we help?"
        showCloseButton={true}
        closeOnBackdropClick={true}
        maxHeight="70vh"
      >
        <div className="py-2">
          {helpOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleHelpOptionClick(option)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {/* Icon */}
              <div className="shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                {option.icon === "helpCenter" && (
                  <HelpCircle className="w-6 h-6 text-gray-700" />
                )}
                {option.icon === "ticket" && (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                )}
                {option.icon === "idCard" && (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                )}
                {option.icon === "language" && (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold text-gray-900 mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.subtitle}</p>
              </div>

              {/* Arrow Icon */}
              <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      </BottomPopup>

      {/* Emergency Help Popup */}
      <BottomPopup
        isOpen={showEmergencyPopup}
        onClose={() => setShowEmergencyPopup(false)}
        title="Emergency help"
        showCloseButton={true}
        closeOnBackdropClick={true}
        maxHeight="70vh"
      >
        <div className="py-2">
          {emergencyOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleEmergencyOptionClick(option)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {/* Icon */}
              <div className="shrink-0 w-14 h-14 rounded-lg flex items-center justify-center">
                {option.icon === "ambulance" && (
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 relative overflow-hidden">
                    {/* Ambulance vehicle */}
                    <div className="absolute inset-0 bg-blue-500"></div>
                    {/* Red and blue lights on roof */}
                    <div className="absolute top-1 left-2 w-2 h-3 bg-red-500 rounded-sm"></div>
                    <div className="absolute top-1 right-2 w-2 h-3 bg-blue-500 rounded-sm"></div>
                    {/* Star of Life emblem */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18l8 4v7.64l-8 4-8-4V8.18l8-4z" />
                        <path d="M12 8L6 11v6l6 3 6-3v-6l-6-3z" />
                      </svg>
                    </div>
                    {/* AMBULANCE text */}
                    <div className="absolute bottom-1 left-0 right-0 text-[6px] font-bold text-white text-center">AMBULANCE</div>
                  </div>
                )}
                {option.icon === "siren" && (
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200 relative">
                    {/* Red siren dome */}
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center relative">
                      {/* Yellow light rays */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-2 border-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                      {/* Phone icon inside */}
                      <Phone className="w-5 h-5 text-yellow-400 z-10" />
                    </div>
                  </div>
                )}
                {option.icon === "police" && (
                  <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                    {/* Police officer bust */}
                    <div className="relative">
                      {/* Head */}
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      {/* Cap */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-amber-700 rounded-t-lg"></div>
                      {/* Cap peak */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-amber-800"></div>
                      {/* Mustache */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 bg-gray-800 rounded-full"></div>
                    </div>
                  </div>
                )}
                {option.icon === "insurance" && (
                  <div className="w-14 h-14 bg-yellow-400 rounded-lg flex items-center justify-center shadow-sm border border-gray-200 relative">
                    {/* Card shape */}
                    <div className="w-12 h-8 bg-white rounded-sm relative">
                      {/* Red heart and cross on left */}
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <div className="w-0.5 h-3 bg-red-500"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 text-left">
                <h3 className="text-base font-semibold text-gray-900 mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.subtitle}</p>
              </div>

              {/* Arrow Icon */}
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </BottomPopup>

      {/* Book Gigs Popup */}
      <BottomPopup
        isOpen={showBookGigsPopup}
        onClose={() => setShowBookGigsPopup(false)}
        title="Book gigs to go online"
        showCloseButton={true}
        closeOnBackdropClick={true}
        maxHeight="auto"
      >
        <div className="py-4">
          {/* Gig Details Card */}
          <div className="mb-6 rounded-lg overflow-hidden shadow-sm border border-gray-200">
            {/* Header - Teal background */}
            <div className="bg-teal-100 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">g</span>
              </div>
              <span className="text-teal-700 font-semibold">Gig details</span>
            </div>
            
            {/* Body - White background */}
            <div className="bg-white px-4 py-4">
              <p className="text-gray-900 text-sm">Gig booking open in your zone</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-900 text-sm mb-6">
            Book your Gigs now to go online and start delivering orders
          </p>

          {/* Book Gigs Button */}
          <button
            onClick={() => {
              setShowBookGigsPopup(false)
              navigate("/delivery/gig")
            }}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-lg transition-colors"
          >
            Book gigs
          </button>
        </div>
      </BottomPopup>

      {/* New Order Popup with Countdown Timer - Custom Implementation */}
      <AnimatePresence>
        {showNewOrderPopup && selectedRestaurant && isOnline && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />

            {/* Popup */}
            <motion.div
              ref={newOrderPopupRef}
              initial={{ y: "100%" }}
              animate={{ 
                y: isDraggingNewOrderPopup ? newOrderDragY : 0,
                transition: isDraggingNewOrderPopup ? { duration: 0 } : { 
                  type: "spring", 
                  damping: 30, 
                  stiffness: 300 
                }
              }}
              exit={{ y: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 300 
              }}
              onTouchStart={handleNewOrderPopupTouchStart}
              onTouchMove={handleNewOrderPopupTouchMove}
              onTouchEnd={handleNewOrderPopupTouchEnd}
              className="fixed bottom-0 left-0 right-0 bg-transparent rounded-t-3xl z-[110] overflow-visible"
              style={{ touchAction: 'none' }}
            >
              {/* Swipe Handle */}
              <div className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-white/30 rounded-full" />
              </div>

              {/* Green Countdown Header */}
              <div className="relative scale-110 mb-0 bg-green-500 rounded-t-3xl overflow-visible">
                {/* Small countdown badge - positioned at center edge, half above popup */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20">
                  <div className="relative inline-flex items-center justify-center">
                    {/* Animated green border around badge - positioned behind badge, wider */}
                    <svg 
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        width: 'calc(100% + 10px)', 
                        height: 'calc(100% + 10px)',
                        zIndex: 35
                      }}
                      viewBox="0 0 200 60"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="newOrderCountdownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                          <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      
                      {/* Full white border path - rounded rectangle (background) */}
                      <path
                        d="M 30,5 L 170,5 A 25,25 0 0,1 195,30 L 195,30 A 25,25 0 0,1 170,55 L 30,55 A 25,25 0 0,1 5,30 L 5,30 A 25,25 0 0,1 30,5 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Animated green progress border - starts from top center, decreases clockwise */}
                      <motion.path
                        d="M 100,5 L 170,5 A 25,25 0 0,1 195,30 L 195,30 A 25,25 0 0,1 170,55 L 30,55 A 25,25 0 0,1 5,30 L 5,30 A 25,25 0 0,1 30,5 L 100,5"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="450"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{
                          strokeDashoffset: `${450 * (1 - countdownSeconds / 300)}`
                        }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                      
                      {/* White segment indicator at top center */}
                      <rect
                        x="95"
                        y="0"
                        width="10"
                        height="8"
                        fill="white"
                        rx="1"
                      />
                    </svg>
                    
                    {/* White pill-shaped badge - positioned above SVG */}
                    <div className="relative bg-white rounded-full px-6 py-2 shadow-lg" style={{ zIndex: 30 }}>
                      <div className="text-sm font-bold text-gray-900">
                        New order
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* White Content Card */}
              <div className="bg-white rounded-t-3xl">
                <div className="p-6">
                  {/* Estimated Earnings */}

                  <div className="mb-5">
                    <p className="text-gray-500 text-sm mb-1">Estimated earnings</p>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                      ₹{selectedRestaurant?.estimatedEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Pickup: {selectedRestaurant?.pickupDistance || '0 km'} | Drop: {selectedRestaurant?.dropDistance || '0 km'}
                    </p>
                  </div>

                  {/* Order ID */}
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs mb-1">Order ID</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedRestaurant?.orderId || 'ORD1234567890'}
                    </p>
                  </div>

                  {/* Pickup Details */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="mb-3">
                      <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                        Pick up
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {selectedRestaurant?.name || 'Restaurant'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {selectedRestaurant?.address || 'Address'}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedRestaurant?.timeAway || '0 mins'} away</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedRestaurant?.distance || '0 km'} away</span>
                    </div>
                  </div>

                  {/* Accept Order Button with Swipe */}
                  <div className="relative w-full">
                    <motion.div
                      ref={newOrderAcceptButtonRef}
                      className="relative w-full bg-green-600 rounded-full overflow-hidden shadow-xl"
                      onTouchStart={handleNewOrderAcceptTouchStart}
                      onTouchMove={handleNewOrderAcceptTouchMove}
                      onTouchEnd={handleNewOrderAcceptTouchEnd}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Swipe progress background */}
                      <motion.div
                        className="absolute inset-0 bg-green-500 rounded-full"
                        animate={{
                          width: `${newOrderAcceptButtonProgress * 100}%`
                        }}
                        transition={newOrderIsAnimatingToComplete ? {
                          type: "spring",
                          stiffness: 200,
                          damping: 25
                        } : { duration: 0 }}
                      />

                      {/* Button content container */}
                      <div className="relative flex items-center h-[64px] px-1">
                        {/* Left: Black circle with arrow */}
                        <motion.div
                          className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shrink-0 relative z-20 shadow-2xl"
                          animate={{
                            x: newOrderAcceptButtonProgress * (newOrderAcceptButtonRef.current ? (newOrderAcceptButtonRef.current.offsetWidth - 56 - 32) : 240)
                          }}
                          transition={newOrderIsAnimatingToComplete ? {
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          } : { duration: 0 }}
                        >
                          <ArrowRight className="w-5 h-5 text-white" />
                        </motion.div>

                        {/* Text - centered and stays visible */}
                        <div className="absolute inset-0 flex items-center justify-center left-16 right-4 pointer-events-none">
                          <motion.span
                            className="text-white font-semibold flex items-center justify-center text-center text-base select-none"
                            animate={{
                              opacity: newOrderAcceptButtonProgress > 0.5 ? Math.max(0.2, 1 - newOrderAcceptButtonProgress * 0.8) : 1,
                              x: newOrderAcceptButtonProgress > 0.5 ? newOrderAcceptButtonProgress * 15 : 0
                            }}
                            transition={newOrderIsAnimatingToComplete ? {
                              type: "spring",
                              stiffness: 200,
                              damping: 25
                            } : { duration: 0 }}
                          >
                            {newOrderAcceptButtonProgress > 0.5 ? 'Release to Accept' : 'Accept order'}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reject Button - Outside the popup, positioned below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="fixed top-4 right-4 z-[115]"
            >
              <button
                onClick={handleRejectConfirm}
                className="  bg-black border-2 border-white text-white text-bold px-5 p-2 rounded-full font-semibold text-sm hover:bg-red-50 transition-colors shadow-2xl"
              >
                Deny
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Order Popup */}
      <AnimatePresence>
        {showRejectPopup && (
          <>
            <motion.div
              className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleRejectCancel}
            >
              <motion.div
                className="w-[90%] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-4 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Can't Accept Order</h3>
                  <p className="text-sm text-gray-500 mt-1">Please select a reason for not accepting this order</p>
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
                            ? "border-black bg-red-50"
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
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Directions Map View */}
      <AnimatePresence>
        {showDirectionsMap && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[120] bg-white"
          >
            {/* Ola Maps Container for Directions */}
            <div
              ref={directionsMapContainerRef}
              key={`directions-map-${riderLocation[0]}-${riderLocation[1]}`}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            />
            
            {/* Loading indicator */}
            {directionsMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <div className="text-gray-600">Loading map...</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reached Pickup Popup */}
      <BottomPopup
        isOpen={showreachedPickupPopup}
        onClose={() => setShowreachedPickupPopup(false)}
        showCloseButton={false}
        closeOnBackdropClick={false}
        maxHeight="70vh"
        showHandle={true}
      >
        <div className="">
          {/* Pickup Label */}
          <div className="mb-4">
            <span className="bg-gray-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              Pick up
            </span>
          </div>

          {/* Restaurant Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedRestaurant?.name || 'Restaurant Name'}
            </h2>
            <p className="text-gray-600 mb-2 leading-relaxed">
              {selectedRestaurant?.address || 'Restaurant Address'}
            </p>
            <p className="text-gray-500 text-sm font-medium">
              Order ID: {selectedRestaurant?.orderId || 'ORD1234567890'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">Call</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Map</span>
            </button>
          </div>

          {/* Reached Pickup Button with Swipe */}
          <div className="relative w-full">
            <motion.div
              ref={reachedPickupButtonRef}
              className="relative w-full bg-green-600 rounded-full overflow-hidden shadow-xl"
              onTouchStart={handlereachedPickupTouchStart}
              onTouchMove={handlereachedPickupTouchMove}
              onTouchEnd={handlereachedPickupTouchEnd}
              whileTap={{ scale: 0.98 }}
            >
              {/* Swipe progress background */}
              <motion.div
                className="absolute inset-0 bg-green-500 rounded-full"
                animate={{
                  width: `${reachedPickupButtonProgress * 100}%`
                }}
                transition={reachedPickupIsAnimatingToComplete ? {
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                } : { duration: 0 }}
              />

              {/* Button content container */}
              <div className="relative flex items-center h-[64px] px-1">
                {/* Left: Black circle with arrow */}
                <motion.div
                  className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shrink-0 relative z-20 shadow-2xl"
                  animate={{
                    x: reachedPickupButtonProgress * (reachedPickupButtonRef.current ? (reachedPickupButtonRef.current.offsetWidth - 56 - 32) : 240)
                  }}
                  transition={reachedPickupIsAnimatingToComplete ? {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  } : { duration: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </motion.div>

                {/* Text - centered and stays visible */}
                <div className="absolute inset-0 flex items-center justify-center left-16 right-4 pointer-events-none">
                  <motion.span
                    className="text-white font-semibold flex items-center justify-center text-center text-base select-none"
                    animate={{
                      opacity: reachedPickupButtonProgress > 0.5 ? Math.max(0.2, 1 - reachedPickupButtonProgress * 0.8) : 1,
                      x: reachedPickupButtonProgress > 0.5 ? reachedPickupButtonProgress * 15 : 0
                    }}
                    transition={reachedPickupIsAnimatingToComplete ? {
                      type: "spring",
                      stiffness: 200,
                      damping: 25
                    } : { duration: 0 }}
                  >
                    {reachedPickupButtonProgress > 0.5 ? 'Release to Confirm' : 'Reached Pickup'}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </BottomPopup>

      {/* Order ID Confirmation Popup - After Reached Pickup - BLOCKING */}
      <BottomPopup
        isOpen={showOrderIdConfirmationPopup}
        onClose={() => {}} // Block closing - must confirm order ID
        showCloseButton={false}
        closeOnBackdropClick={false}
        maxHeight="60vh"
        showHandle={false} // Disable handle to prevent closing
      >
        <div className="">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Confirm Order ID
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Please verify the order ID with the restaurant before pickup
            </p>
            
            {/* Order ID Display */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-500 text-xs mb-2">Order ID</p>
              <p className="text-3xl font-bold text-gray-900 tracking-wider">
                {selectedRestaurant?.orderId || 'ORD1234567890'}
              </p>
            </div>

            {/* Order Picked Up Button with Swipe */}
            <div className="relative w-full">
              <motion.div
                ref={orderIdConfirmButtonRef}
                className="relative w-full bg-green-600 rounded-full overflow-hidden shadow-xl"
                onTouchStart={handleOrderIdConfirmTouchStart}
                onTouchMove={handleOrderIdConfirmTouchMove}
                onTouchEnd={handleOrderIdConfirmTouchEnd}
                whileTap={{ scale: 0.98 }}
              >
                {/* Swipe progress background */}
                <motion.div
                  className="absolute inset-0 bg-green-500 rounded-full"
                  animate={{
                    width: `${orderIdConfirmButtonProgress * 100}%`
                  }}
                  transition={orderIdConfirmIsAnimatingToComplete ? {
                    type: "spring",
                    stiffness: 200,
                    damping: 25
                  } : { duration: 0 }}
                />

                {/* Button content container */}
                <div className="relative flex items-center h-[64px] px-1">
                  {/* Left: Black circle with arrow */}
                  <motion.div
                    className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shrink-0 relative z-20 shadow-2xl"
                    animate={{
                      x: orderIdConfirmButtonProgress * (orderIdConfirmButtonRef.current ? (orderIdConfirmButtonRef.current.offsetWidth - 56 - 32) : 240)
                    }}
                    transition={orderIdConfirmIsAnimatingToComplete ? {
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    } : { duration: 0 }}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Text - centered and stays visible */}
                  <div className="absolute inset-0 flex items-center justify-center left-16 right-4 pointer-events-none">
                    <motion.span
                      className="text-white font-semibold flex items-center justify-center text-center text-base select-none"
                      animate={{
                        opacity: orderIdConfirmButtonProgress > 0.5 ? Math.max(0.2, 1 - orderIdConfirmButtonProgress * 0.8) : 1,
                        x: orderIdConfirmButtonProgress > 0.5 ? orderIdConfirmButtonProgress * 15 : 0
                      }}
                      transition={orderIdConfirmIsAnimatingToComplete ? {
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                      } : { duration: 0 }}
                    >
                      {orderIdConfirmButtonProgress > 0.5 ? 'Release to Confirm' : 'Order Picked Up'}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </BottomPopup>

      {/* Reached Drop Popup - Only show after order ID is confirmed */}
      <BottomPopup
        isOpen={showReachedDropPopup && !showOrderIdConfirmationPopup}
        onClose={() => setShowReachedDropPopup(false)}
        showCloseButton={false}
        closeOnBackdropClick={false}
        maxHeight="70vh"
        showHandle={true}
      >
        <div className="">
          {/* Drop Label */}
          <div className="mb-4">
            <span className="bg-teal-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              Drop
            </span>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedRestaurant?.customerName || 'Customer Name'}
            </h2>
            <p className="text-gray-600 mb-2 leading-relaxed">
              {selectedRestaurant?.customerAddress || 'Customer Address'}
            </p>
            <p className="text-gray-500 text-sm font-medium">
              Order ID: {selectedRestaurant?.orderId || 'ORD1234567890'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">Call</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">Chat</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Map</span>
            </button>
          </div>

          {/* Reached Drop Button with Swipe */}
          <div className="relative w-full">
            <motion.div
              ref={reachedDropButtonRef}
              className="relative w-full bg-green-600 rounded-full overflow-hidden shadow-xl"
              onTouchStart={handleReachedDropTouchStart}
              onTouchMove={handleReachedDropTouchMove}
              onTouchEnd={handleReachedDropTouchEnd}
              whileTap={{ scale: 0.98 }}
            >
              {/* Swipe progress background */}
              <motion.div
                className="absolute inset-0 bg-green-500 rounded-full"
                animate={{
                  width: `${reachedDropButtonProgress * 100}%`
                }}
                transition={reachedDropIsAnimatingToComplete ? {
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                } : { duration: 0 }}
              />

              {/* Button content container */}
              <div className="relative flex items-center h-[64px] px-1">
                {/* Left: Black circle with arrow */}
                <motion.div
                  className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shrink-0 relative z-20 shadow-2xl"
                  animate={{
                    x: reachedDropButtonProgress * (reachedDropButtonRef.current ? (reachedDropButtonRef.current.offsetWidth - 56 - 32) : 240)
                  }}
                  transition={reachedDropIsAnimatingToComplete ? {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  } : { duration: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </motion.div>

                {/* Text - centered and stays visible */}
                <div className="absolute inset-0 flex items-center justify-center left-16 right-4 pointer-events-none">
                  <motion.span
                    className="text-white font-semibold flex items-center justify-center text-center text-base select-none"
                    animate={{
                      opacity: reachedDropButtonProgress > 0.5 ? Math.max(0.2, 1 - reachedDropButtonProgress * 0.8) : 1,
                      x: reachedDropButtonProgress > 0.5 ? reachedDropButtonProgress * 15 : 0
                    }}
                    transition={reachedDropIsAnimatingToComplete ? {
                      type: "spring",
                      stiffness: 200,
                      damping: 25
                    } : { duration: 0 }}
                  >
                    {reachedDropButtonProgress > 0.5 ? 'Release to Confirm' : 'Reached Drop'}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </BottomPopup>

      {/* Order Delivered Bottom Popup */}
      <BottomPopup
        isOpen={showOrderDeliveredAnimation}
        onClose={() => {
          setShowOrderDeliveredAnimation(false)
          setShowCustomerReviewPopup(true)
        }}
        showCloseButton={false}
        closeOnBackdropClick={true}
        maxHeight="80vh"
        showHandle={true}
      >
        <div className="">
          {/* Success Icon and Title */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Great job! Delivery complete 👍
            </h1>
          </div>

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 text-sm">Trip distance</span>
                </div>
                <span className="text-gray-900 font-semibold">{selectedRestaurant?.tripDistance || '8.8 kms'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 text-sm">Trip time</span>
                </div>
                <span className="text-gray-900 font-semibold">{selectedRestaurant?.tripTime || '38 mins'}</span>
              </div>
            </div>
          </div>

          {/* Order Delivered Button with Swipe */}
          <div className="relative w-full">
            <motion.div
              ref={orderDeliveredButtonRef}
              className="relative w-full bg-green-600 rounded-full overflow-hidden shadow-xl"
              onTouchStart={handleOrderDeliveredTouchStart}
              onTouchMove={handleOrderDeliveredTouchMove}
              onTouchEnd={handleOrderDeliveredTouchEnd}
              whileTap={{ scale: 0.98 }}
            >
              {/* Swipe progress background */}
              <motion.div
                className="absolute inset-0 bg-green-500 rounded-full"
                animate={{
                  width: `${orderDeliveredButtonProgress * 100}%`
                }}
                transition={orderDeliveredIsAnimatingToComplete ? {
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                } : { duration: 0 }}
              />

              {/* Button content container */}
              <div className="relative flex items-center h-[64px] px-1">
                {/* Left: Black circle with arrow */}
                <motion.div
                  className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shrink-0 relative z-20 shadow-2xl"
                  animate={{
                    x: orderDeliveredButtonProgress * (orderDeliveredButtonRef.current ? (orderDeliveredButtonRef.current.offsetWidth - 56 - 32) : 240)
                  }}
                  transition={orderDeliveredIsAnimatingToComplete ? {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  } : { duration: 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-white" />
                </motion.div>

                {/* Text - centered and stays visible */}
                <div className="absolute inset-0 flex items-center justify-center left-16 right-4 pointer-events-none">
                  <motion.span
                    className="text-white font-semibold flex items-center justify-center text-center text-base select-none"
                    animate={{
                      opacity: orderDeliveredButtonProgress > 0.5 ? Math.max(0.2, 1 - orderDeliveredButtonProgress * 0.8) : 1,
                      x: orderDeliveredButtonProgress > 0.5 ? orderDeliveredButtonProgress * 15 : 0
                    }}
                    transition={orderDeliveredIsAnimatingToComplete ? {
                      type: "spring",
                      stiffness: 200,
                      damping: 25
                    } : { duration: 0 }}
                  >
                    {orderDeliveredButtonProgress > 0.5 ? 'Release to Confirm' : 'Order Delivered'}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </BottomPopup>

      {/* Customer Review Popup */}
      <BottomPopup
        isOpen={showCustomerReviewPopup}
        onClose={() => setShowCustomerReviewPopup(false)}
        showCloseButton={false}
        closeOnBackdropClick={false}
        maxHeight="80vh"
        showHandle={true}
      >
        <div className="">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Rate Your Experience
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              How was your delivery experience?
            </p>
            
            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setCustomerRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= customerRating ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">★</span>
                  )}
                </button>
              ))}
            </div>

            {/* Optional Review Text */}
            <div className="mb-6">
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={customerReviewText}
                onChange={(e) => setCustomerReviewText(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                setShowCustomerReviewPopup(false)
                setShowPaymentPage(true)
              }}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Submit Review
            </button>
          </div>
        </div>
      </BottomPopup>

      {/* Payment Page */}
      <AnimatePresence>
        {showPaymentPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-white overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-green-500 text-white px-6 py-6">
              <h1 className="text-2xl font-bold mb-2">Payment</h1>
              <p className="text-white/90 text-sm">Order ID: {selectedRestaurant?.orderId || 'ORD1234567890'}</p>
            </div>

            {/* Payment Amount */}
            <div className="px-6 py-8 text-center bg-gray-50">
              <p className="text-gray-600 text-sm mb-2">Payment Amount</p>
              <p className="text-5xl font-bold text-gray-900">
                ₹{selectedRestaurant?.amount?.toFixed(2) || selectedRestaurant?.estimatedEarnings?.toFixed(2) || '76.62'}
              </p>
            </div>

            {/* Payment Details */}
            <div className="px-6 py-6 pb-6 h-full flex flex-col justify-between">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Trip pay</span>
                    <span className="text-gray-900 font-semibold">₹{((selectedRestaurant?.amount || selectedRestaurant?.estimatedEarnings || 76.62) - 5).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Long distance return pay</span>
                    <span className="text-gray-900 font-semibold">₹5.00</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{selectedRestaurant?.amount?.toFixed(2) || selectedRestaurant?.estimatedEarnings?.toFixed(2) || '76.62'}</span>
                  </div>
                </div>
              </div>


              {/* Complete Button */}
              <button
                onClick={() => {
                  setShowPaymentPage(false)
                  navigate("/delivery")
                  // Reset states
                  setTimeout(() => {
                    setReachedDropButtonProgress(0)
                    setReachedDropIsAnimatingToComplete(false)
                    setCustomerRating(0)
                    setCustomerReviewText("")
                  }, 500)
                }}
                className="w-full sticky bottom-4 bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors shadow-lg "
              >
                Complete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}