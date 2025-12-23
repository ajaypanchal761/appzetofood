import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { useRef, useEffect, useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { Star, Clock, MapPin, Heart, Search, Tag, Flame, ShoppingBag, ShoppingCart, Mic, SlidersHorizontal, CheckCircle2, Bookmark, BadgePercent, X, ArrowDownUp, Timer, CalendarClock, ShieldCheck, IndianRupee, UtensilsCrossed, Leaf, AlertCircle, Loader2, Plus, Check, Share2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Footer from "../components/Footer"
import AddToCartButton from "../components/AddToCartButton"
import StickyCartCard from "../components/StickyCartCard"
import { useProfile } from "../context/ProfileContext"
import { useCart } from "../context/CartContext"
import { HorizontalCarousel } from "@/components/ui/horizontal-carousel"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useSearchOverlay, useLocationSelector } from "../components/UserLayout"
import PageNavbar from "../components/PageNavbar"

// Import shared food images - prevents duplication
import { foodImages } from "@/constants/images"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation } from "../hooks/useLocation"
import appzetoFoodLogo from "@/assets/appzetofoodlogo.jpeg"
import offerImage from "@/assets/offerimage.png"
import api from "@/lib/api"
// Explore More Icons
import exploreOffers from "@/assets/explore more icons/offers.png"
import exploreGourmet from "@/assets/explore more icons/gourmet.png"
import exploreTop10 from "@/assets/explore more icons/top 10.png"
import exploreCollection from "@/assets/explore more icons/collection.png"
import exploreGiftCard from "@/assets/explore more icons/gift catrd.png"

// Banner images for hero carousel - will be fetched from API

const categories = [
  { id: 1, name: "Biryani", image: foodImages[0] },
  { id: 2, name: "Cake", image: foodImages[1] },
  { id: 3, name: "Chhole Bhature", image: foodImages[2] },
  { id: 4, name: "Chicken Tanduri", image: foodImages[3] },
  { id: 5, name: "Donuts", image: foodImages[4] },
  { id: 6, name: "Dosa", image: foodImages[5] },
  { id: 7, name: "French Fries", image: foodImages[6] },
  { id: 8, name: "Idli", image: foodImages[7] },
  { id: 9, name: "Momos", image: foodImages[8] },
  { id: 10, name: "Samosa", image: foodImages[9] },
  { id: 11, name: "Starters", image: foodImages[10] },
  { id: 12, name: "Biryani", image: foodImages[0] }, // Repeat first image
]

// Animated placeholder for search - moved outside component to prevent recreation
const placeholders = [
  "Search \"burger\"",
  "Search \"biryani\"",
  "Search \"pizza\"",
  "Search \"desserts\"",
  "Search \"chinese\"",
  "Search \"thali\"",
  "Search \"momos\"",
  "Search \"dosa\""
]

// Deals data - moved outside component
const dealsData = [
  { id: 1, title: "50% Off First Order", description: "Get 50% off on your first order above ₹1667", discount: "50%", color: "from-red-500 to-pink-500" },
  { id: 2, title: "Free Delivery", description: "Free delivery on orders above ₹1245", discount: "FREE", color: "from-green-600 to-emerald-500" },
  { id: 3, title: "Buy 2 Get 1", description: "Buy any 2 items and get 1 free", discount: "B2G1", color: "from-purple-500 to-indigo-500" },
  { id: 4, title: "Weekend Special", description: "Extra 20% off on weekends", discount: "20%", color: "from-blue-500 to-cyan-500" },
]

// Quick Bites data - moved outside component
const quickBitesData = [
  { id: 9, name: "Chicken Wings", price: 8.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&q=80", rating: 4.8 },
  { id: 10, name: "French Fries", price: 4.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&q=80", rating: 4.7 },
  { id: 11, name: "Onion Rings", price: 5.99, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80", rating: 4.6 },
  { id: 12, name: "Mozzarella Sticks", price: 6.99, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80", rating: 4.9 },
  { id: 13, name: "Nachos", price: 7.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop&q=80", rating: 4.8 },
  { id: 14, name: "Garlic Bread", price: 4.49, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop&q=80", rating: 4.7 },
]

// Trending Now data - moved outside component
const trendingData = [
  { id: 15, name: "Spicy Ramen", restaurant: "Noodle House", price: 11.99, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop&q=80", rating: 4.9 },
  { id: 16, name: "BBQ Chicken Pizza", restaurant: "Pizza Corner", price: 13.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=80", rating: 4.8 },
  { id: 17, name: "Sushi Platter", restaurant: "Sushi Master", price: 19.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop&q=80", rating: 4.9 },
  { id: 18, name: "Loaded Burger", restaurant: "Burger Paradise", price: 10.99, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop&q=80", rating: 4.7 },
]

// Best Value Meals data - moved outside component
const bestValueData = [
  { id: 1, name: "Family Combo", description: "2 Pizzas + 2 Sides + 4 Drinks", price: 29.99, originalPrice: 39.99, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&q=80", rating: 4.8 },
  { id: 2, name: "Lunch Special", description: "Main Course + Soup + Dessert", price: 12.99, originalPrice: 18.99, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80", rating: 4.7 },
  { id: 3, name: "Party Pack", description: "10 Items + 6 Drinks + Desserts", price: 49.99, originalPrice: 69.99, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop&q=80", rating: 4.9 },
]

const restaurants = [
  {
    id: 1,
    name: "Golden Dragon",
    cuisine: "Chinese",
    rating: 4.8,
    deliveryTime: "25-30 mins",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    priceRange: "$$",
    featuredDish: "Kung Pao Chicken",
    featuredPrice: 249,
    offer: "Flat ₹50 OFF above ₹199",
  },
  {
    id: 2,
    name: "Burger Paradise",
    cuisine: "American",
    rating: 4.6,
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    priceRange: "$",
    featuredDish: "Classic Burger",
    featuredPrice: 179,
    offer: "20% OFF up to ₹100",
  },
  {
    id: 3,
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.9,
    deliveryTime: "30-35 mins",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
    priceRange: "$$$",
    featuredDish: "Salmon Sushi Roll",
    featuredPrice: 399,
    offer: "Free Delivery above ₹499",
  },
  {
    id: 4,
    name: "Pizza Corner",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    priceRange: "$$",
    featuredDish: "Margherita Pizza",
    featuredPrice: 299,
    offer: "Flat ₹40 OFF above ₹149",
  },
  {
    id: 5,
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.5,
    deliveryTime: "20-25 mins",
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop",
    priceRange: "$",
    featuredDish: "Chicken Tacos",
    featuredPrice: 159,
    offer: "Buy 1 Get 1 Free",
  },
  {
    id: 6,
    name: "Fresh Salad Bar",
    cuisine: "Healthy",
    rating: 4.4,
    deliveryTime: "15-20 mins",
    distance: "0.9 km",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    priceRange: "$$",
    featuredDish: "Caesar Salad",
    featuredPrice: 199,
    offer: "15% OFF on first order",
  },
  {
    id: 7,
    name: "Spice Garden",
    cuisine: "Indian",
    rating: 4.7,
    deliveryTime: "25-30 mins",
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    priceRange: "$$",
    featuredDish: "Butter Chicken",
    featuredPrice: 329,
    offer: "Flat ₹75 OFF above ₹299",
  },
  {
    id: 9,
    name: "Ocean Breeze",
    cuisine: "Seafood",
    rating: 4.8,
    deliveryTime: "30-35 mins",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
    priceRange: "$$$",
    featuredDish: "Grilled Salmon",
    featuredPrice: 449,
    offer: "Free Delivery above ₹399",
  },
  {
    id: 10,
    name: "Smokehouse BBQ",
    cuisine: "American",
    rating: 4.5,
    deliveryTime: "35-40 mins",
    distance: "2.8 km",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    priceRange: "$$",
    featuredDish: "BBQ Ribs",
    featuredPrice: 379,
    offer: "Buy 2 Get 1 Free",
  },
  {
    id: 11,
    name: "Noodle House",
    cuisine: "Asian",
    rating: 4.6,
    deliveryTime: "18-22 mins",
    distance: "1.0 km",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
    priceRange: "$",
    featuredDish: "Spicy Ramen",
    featuredPrice: 199,
    offer: "Flat ₹30 OFF above ₹149",
  },
  {
    id: 12,
    name: "Dessert Delight",
    cuisine: "Desserts",
    rating: 4.9,
    deliveryTime: "15-20 mins",
    distance: "0.7 km",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
    priceRange: "$",
    featuredDish: "Chocolate Cake",
    featuredPrice: 149,
    offer: "20% OFF on desserts",
  },
  {
    id: 13,
    name: "Cafe Mocha",
    cuisine: "Cafe",
    rating: 4.4,
    deliveryTime: "12-15 mins",
    distance: "0.4 km",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    priceRange: "$",
    featuredDish: "Cappuccino & Croissant",
    featuredPrice: 129,
    offer: "Flat ₹25 OFF above ₹99",
  },
  {
    id: 14,
    name: "Apna Sweets",
    cuisine: "Indian",
    rating: 4.7,
    deliveryTime: "20-25 mins",
    distance: "1.1 km",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
    priceRange: "$",
    featuredDish: "Gulab Jamun",
    featuredPrice: 89,
    offer: "50% OFF on sweets",
  },
]

const featuredFoods = [
  {
    id: 1,
    name: "Margherita Pizza",
    restaurant: "Pizza Corner",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&q=80",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Classic Burger",
    restaurant: "Burger Paradise",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop&q=80",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Salmon Sushi Roll",
    restaurant: "Sushi Master",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop&q=80",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Chicken Tacos",
    restaurant: "Taco Fiesta",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop&q=80",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Chicken Biryani",
    restaurant: "Spice Garden",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop&q=80",
    rating: 4.8,
  },
  {
    id: 6,
    name: "Pad Thai",
    restaurant: "Thai Express",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1559314809-0d155b1c5b8e?w=600&h=400&fit=crop&q=80",
    rating: 4.7,
  },
  {
    id: 7,
    name: "Grilled Salmon",
    restaurant: "Ocean Breeze",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop&q=80",
    rating: 4.9,
  },
  {
    id: 8,
    name: "BBQ Ribs",
    restaurant: "Smokehouse",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80",
    rating: 4.8,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [heroSearch, setHeroSearch] = useState("")
  const { openSearch, closeSearch, searchValue, setSearchValue } = useSearchOverlay()
  const { openLocationSelector } = useLocationSelector()
  const [vegMode, setVegMode] = useState(true)
  const [prevVegMode, setPrevVegMode] = useState(true)
  const [showVegModePopup, setShowVegModePopup] = useState(false)
  const [showSwitchOffPopup, setShowSwitchOffPopup] = useState(false)
  const [vegModeOption, setVegModeOption] = useState("all") // "all" or "pure-veg"
  const [isApplyingVegMode, setIsApplyingVegMode] = useState(false)
  const [isSwitchingOffVegMode, setIsSwitchingOffVegMode] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ top: 0, right: 0 })
  const vegModeToggleRef = useRef(null)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [heroBannerImages, setHeroBannerImages] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [landingCategories, setLandingCategories] = useState([])
  const [landingExploreMore, setLandingExploreMore] = useState([])
  const [exploreMoreHeading, setExploreMoreHeading] = useState("Explore More")
  const [loadingLandingConfig, setLoadingLandingConfig] = useState(true)
  const isHandlingSwitchOff = useRef(false)

  // Swipe functionality for hero banner carousel
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchEndX = useRef(0)
  const touchEndY = useRef(0)
  const isSwiping = useRef(false)
  const autoSlideIntervalRef = useRef(null)

  // Handle vegMode toggle - show popup when turned ON or OFF
  useEffect(() => {
    // Skip if we're handling switch off confirmation
    if (isHandlingSwitchOff.current) {
      return
    }

    if (vegMode && !prevVegMode) {
      // Veg mode was just turned ON
      // Calculate popup position relative to toggle
      if (vegModeToggleRef.current) {
        const rect = vegModeToggleRef.current.getBoundingClientRect()
        setPopupPosition({
          top: rect.bottom + 10,
          right: window.innerWidth - rect.right
        })
      }
      setShowVegModePopup(true)
      // Don't update prevVegMode yet - wait for user to apply or cancel
    } else if (!vegMode && prevVegMode) {
      // Veg mode was just turned OFF - show switch off confirmation popup
      isHandlingSwitchOff.current = true
      setShowSwitchOffPopup(true)
      // Revert the toggle state until user confirms
      setVegMode(true)
      // Don't update prevVegMode here - keep it as true so the popup can show again next time
    } else {
      // Normal state change - update prevVegMode
      setPrevVegMode(vegMode)
    }
  }, [vegMode, prevVegMode])

  // Update popup position on scroll/resize
  useEffect(() => {
    if (!showVegModePopup) return

    const updatePosition = () => {
      if (vegModeToggleRef.current) {
        const rect = vegModeToggleRef.current.getBoundingClientRect()
        setPopupPosition({
          top: rect.bottom + 10,
          right: window.innerWidth - rect.right
        })
      }
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [showVegModePopup])

  // Fetch hero banners from API
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        setLoadingBanners(true)
        const response = await api.get('/hero-banners/public')
        if (response.data.success && response.data.data.banners) {
          setHeroBannerImages(response.data.data.banners)
        }
      } catch (error) {
        console.error('Error fetching hero banners:', error)
        // Fallback to empty array if API fails
        setHeroBannerImages([])
      } finally {
        setLoadingBanners(false)
      }
    }

    fetchHeroBanners()
  }, [])

  // Fetch landing page config (categories, explore more, settings)
  useEffect(() => {
    const fetchLandingConfig = async () => {
      try {
        setLoadingLandingConfig(true)
        const response = await api.get('/hero-banners/landing/public')
        if (response.data.success && response.data.data) {
          const apiCategories = response.data.data.categories || []
          const apiExploreMore = response.data.data.exploreMore || []

          // Extra safety: only keep active items and ensure order ascending
          setLandingCategories(
            apiCategories
              .filter((c) => c.isActive !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          )
          setLandingExploreMore(
            apiExploreMore
              .filter((e) => e.isActive !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          )
          setExploreMoreHeading(response.data.data.settings?.exploreMoreHeading || "Explore More")
        }
      } catch (error) {
        console.error('Error fetching landing config:', error)
        // Fallback to empty arrays and default heading
        setLandingCategories([])
        setLandingExploreMore([])
        setExploreMoreHeading("Explore More")
      } finally {
        setLoadingLandingConfig(false)
      }
    }

    fetchLandingConfig()
  }, [])

  // Auto-cycle hero banner images
  useEffect(() => {
    if (heroBannerImages.length === 0) return

    autoSlideIntervalRef.current = setInterval(() => {
      if (!isSwiping.current) {
        setCurrentBannerIndex((prev) => (prev + 1) % heroBannerImages.length)
      }
    }, 3500) // Change every 3.5 seconds

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current)
      }
    }
  }, [heroBannerImages.length])

  // Helper function to reset auto-slide timer
  const resetAutoSlide = useCallback(() => {
    if (autoSlideIntervalRef.current) {
      clearInterval(autoSlideIntervalRef.current)
    }
    if (heroBannerImages.length > 0) {
      autoSlideIntervalRef.current = setInterval(() => {
        if (!isSwiping.current) {
          setCurrentBannerIndex((prev) => (prev + 1) % heroBannerImages.length)
        }
      }, 3500)
    }
  }, [heroBannerImages.length])

  // Swipe handlers for hero banner carousel
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = true
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchEnd = () => {
    if (!isSwiping.current || heroBannerImages.length === 0) return

    const deltaX = touchEndX.current - touchStartX.current
    const deltaY = Math.abs(touchEndY.current - touchStartY.current)
    const minSwipeDistance = 50 // Minimum distance for a swipe

    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        // Swipe right - go to previous image
        setCurrentBannerIndex((prev) => (prev - 1 + heroBannerImages.length) % heroBannerImages.length)
      } else {
        // Swipe left - go to next image
        setCurrentBannerIndex((prev) => (prev + 1) % heroBannerImages.length)
      }
      // Reset auto-slide timer after manual swipe
      resetAutoSlide()
    }

    // Reset swipe state after a short delay
    setTimeout(() => {
      isSwiping.current = false
    }, 300)

    // Reset touch positions
    touchStartX.current = 0
    touchStartY.current = 0
    touchEndX.current = 0
    touchEndY.current = 0
  }

  // Mouse handlers for desktop drag support
  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
    isSwiping.current = true
  }

  const handleMouseMove = (e) => {
    if (!isSwiping.current) return
    touchEndX.current = e.clientX
    touchEndY.current = e.clientY
  }

  const handleMouseUp = () => {
    if (!isSwiping.current || heroBannerImages.length === 0) return

    const deltaX = touchEndX.current - touchStartX.current
    const deltaY = Math.abs(touchEndY.current - touchStartY.current)
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        setCurrentBannerIndex((prev) => (prev - 1 + heroBannerImages.length) % heroBannerImages.length)
      } else {
        setCurrentBannerIndex((prev) => (prev + 1) % heroBannerImages.length)
      }
      // Reset auto-slide timer after manual swipe
      resetAutoSlide()
    }

    setTimeout(() => {
      isSwiping.current = false
    }, 300)

    touchStartX.current = 0
    touchStartY.current = 0
    touchEndX.current = 0
    touchEndY.current = 0
  }
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [sortBy, setSortBy] = useState(null) // null, 'price-low', 'price-high', 'rating-high', 'rating-low'
  const [selectedCuisine, setSelectedCuisine] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState('sort')
  const [isLoadingFilterResults, setIsLoadingFilterResults] = useState(false)
  const categoryScrollRef = useRef(null)
  const gsapAnimationsRef = useRef([])
  const { addFavorite, removeFavorite, isFavorite, getFavorites } = useProfile()
  const { addToCart, cart } = useCart()
  const { location, loading, requestLocation } = useLocation()
  const [showToast, setShowToast] = useState(false)
  const [showManageCollections, setShowManageCollections] = useState(false)
  const [selectedRestaurantSlug, setSelectedRestaurantSlug] = useState(null)

  // Memoize cartCount to prevent recalculation on every render - use cart directly
  const cartCount = useMemo(() =>
    cart.reduce((total, item) => total + (item.quantity || 0), 0),
    [cart]
  )

  const cityName = location?.city || "Select"
  const stateName = location?.state || "Location"

  // Mock points value - replace with actual points from context/store
  const userPoints = 99

  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // Simple filter toggle function
  const toggleFilter = (filterId) => {
    setActiveFilters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(filterId)) {
        newSet.delete(filterId)
      } else {
        newSet.add(filterId)
      }
      return newSet
    })
  }

  // Refs for scroll tracking
  const filterSectionRefs = useRef({})
  const [activeScrollSection, setActiveScrollSection] = useState('sort')
  const rightContentRef = useRef(null)

  // Scroll tracking effect
  useEffect(() => {
    if (!isFilterOpen || !rightContentRef.current) return

    const observerOptions = {
      root: rightContentRef.current,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id')
          if (sectionId) {
            setActiveScrollSection(sectionId)
            setActiveFilterTab(sectionId)
          }
        }
      })
    }, observerOptions)

    // Observe all filter sections
    Object.values(filterSectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [isFilterOpen])

  // Filter restaurants and foods based on active filters
  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants]

    // Apply filters
    if (activeFilters.has('price-under-200')) {
      filtered = filtered.filter(r => r.priceRange === "$" || r.priceRange === "$$")
    }
    if (activeFilters.has('price-under-500')) {
      filtered = filtered.filter(r => r.priceRange !== "$$$")
    }
    if (activeFilters.has('delivery-under-30')) {
      filtered = filtered.filter(r => {
        const timeMatch = r.deliveryTime.match(/(\d+)/)
        return timeMatch && parseInt(timeMatch[1]) <= 30
      })
    }
    if (activeFilters.has('delivery-under-45')) {
      filtered = filtered.filter(r => {
        const timeMatch = r.deliveryTime.match(/(\d+)/)
        return timeMatch && parseInt(timeMatch[1]) <= 45
      })
    }
    if (activeFilters.has('rating-35-plus')) {
      filtered = filtered.filter(r => r.rating >= 3.5)
    }
    if (activeFilters.has('rating-4-plus')) {
      filtered = filtered.filter(r => r.rating >= 4.0)
    }
    if (activeFilters.has('rating-45-plus')) {
      filtered = filtered.filter(r => r.rating >= 4.5)
    }
    if (activeFilters.has('distance-under-1km')) {
      filtered = filtered.filter(r => {
        const distMatch = r.distance.match(/(\d+\.?\d*)/)
        return distMatch && parseFloat(distMatch[1]) <= 1.0
      })
    }
    if (activeFilters.has('distance-under-2km')) {
      filtered = filtered.filter(r => {
        const distMatch = r.distance.match(/(\d+\.?\d*)/)
        return distMatch && parseFloat(distMatch[1]) <= 2.0
      })
    }
    if (activeFilters.has('delivery-under-45')) {
      filtered = filtered.filter(r => {
        const timeMatch = r.deliveryTime.match(/(\d+)/)
        return timeMatch && parseInt(timeMatch[1]) <= 45
      })
    }
    if (activeFilters.has('top-rated')) {
      filtered = filtered.filter(r => r.rating >= 4.5)
    }
    if (activeFilters.has('trusted')) {
      filtered = filtered.filter(r => r.rating >= 4.0)
    }
    if (activeFilters.has('has-offers')) {
      filtered = filtered.filter(r => r.offer && r.offer.length > 0)
    }
    if (selectedCuisine) {
      filtered = filtered.filter(r => r.cuisine === selectedCuisine)
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        const aPrice = a.priceRange === "$" ? 1 : a.priceRange === "$$" ? 2 : 3
        const bPrice = b.priceRange === "$" ? 1 : b.priceRange === "$$" ? 2 : 3
        return aPrice - bPrice
      })
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        const aPrice = a.priceRange === "$" ? 1 : a.priceRange === "$$" ? 2 : 3
        const bPrice = b.priceRange === "$" ? 1 : b.priceRange === "$$" ? 2 : 3
        return bPrice - aPrice
      })
    } else if (sortBy === 'rating-high') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'rating-low') {
      filtered.sort((a, b) => a.rating - b.rating)
    }

    return filtered
  }, [activeFilters, selectedCuisine, sortBy])

  const filteredFeaturedFoods = useMemo(() => {
    let filtered = [...featuredFoods]

    // Apply filters
    if (activeFilters.has('price-under-200')) {
      filtered = filtered.filter(f => f.price * 83 <= 200)
    }
    if (activeFilters.has('price-under-500')) {
      filtered = filtered.filter(f => f.price * 83 <= 500)
    }
    if (activeFilters.has('rating-4-plus')) {
      filtered = filtered.filter(f => f.rating >= 4.0)
    }
    if (activeFilters.has('rating-45-plus')) {
      filtered = filtered.filter(f => f.rating >= 4.5)
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating-high') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'rating-low') {
      filtered.sort((a, b) => a.rating - b.rating)
    }

    return filtered
  }, [activeFilters, sortBy])

  // Memoize callbacks to prevent unnecessary re-renders
  const handleLocationClick = useCallback(() => {
    openLocationSelector()
  }, [openLocationSelector])

  const handleSearchFocus = useCallback(() => {
    // Sync heroSearch with global searchValue when opening overlay
    if (heroSearch) {
      setSearchValue(heroSearch)
    }
    openSearch()
  }, [heroSearch, openSearch, setSearchValue])

  const handleSearchClose = useCallback(() => {
    closeSearch()
    setHeroSearch("")
  }, [closeSearch])

  // Removed GSAP animations - using CSS and ScrollReveal components instead for better performance
  // Auto-scroll removed - manual scroll only

  // Animated placeholder cycling - same as RestaurantDetails highlight offer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 2000) // Change placeholder every 2 seconds (same as RestaurantDetails)

    return () => clearInterval(interval)
  }, []) // placeholders is a constant, no need for dependency

  // Lightweight ScrollReveal replacement - CSS only, no IntersectionObserver
  const ScrollRevealSimple = ({ children, delay = 0, className = "" }) => (
    <div className={className}>
      {children}
    </div>
  )

  // Lightweight TextReveal replacement - CSS only
  const TextRevealSimple = ({ children, className = "" }) => (
    <div className={className}>
      {children}
    </div>
  )

  // Lightweight ShimmerCard replacement - no animations
  const ShimmerCardSimple = ({ children, className = "" }) => (
    <div className={className}>
      {children}
    </div>
  )

  return (
    <div className="relative min-h-screen bg-white">
      {/* Unified Background for Entire Page - Vibrant Food Theme */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden z-0">
        {/* Main Background */}
        <div className="absolute inset-0 bg-white">
        </div>
        {/* Background Elements - Reduced to 2 blobs with CSS animations for better performance */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Top right blob - CSS animation */}
          <div
            style={{
              animation: 'blob 8s ease-in-out infinite',
              willChange: 'transform'
            }}
          />
          {/* Bottom left blob - CSS animation */}
          <div
            style={{
              animation: 'blob-reverse 10s ease-in-out infinite',
              willChange: 'transform'
            }}
          />
        </div>
        {/* CSS keyframes for animations */}
        <style>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(50px, -30px) scale(1.2);
            }
          }
          @keyframes blob-reverse {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-40px, 40px) scale(1.3);
            }
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes wiggle {
            0%, 100% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(10deg);
            }
            75% {
              transform: rotate(-10deg);
            }
          }
          @keyframes placeholderFade {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 0.6;
              transform: translateY(0);
            }
          }
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(15px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {/* Unified Navbar & Hero Section */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '39vh' }}>


        {/* Hero Banner Carousel Background */}
        {loadingBanners ? (
          <div className="absolute top-0 left-0 right-0 bottom-0 z-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading banners...</p>
            </div>
          </div>
        ) : heroBannerImages.length > 0 ? (
          <div
            className="absolute top-0 left-0 right-0 bottom-0 z-0 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {heroBannerImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Hero Banner ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{
                  objectPosition: 'center center',
                  minHeight: '100%',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                draggable={false}
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"%3E%3Crect fill="%23ddd" width="1200" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E'
                }}
              />
            ))}
          </div>
        ) : (
          <div className="absolute top-0 left-0 right-0 bottom-0 z-0 bg-gradient-to-br from-green-400 to-green-600" />
        )}

        {/* Navbar */}
        <PageNavbar textColor="white" zIndex={20} />

        {/* Hero Section */}
        <section className="relative z-20 w-full py-0 sm:py-0">
          {/* Content */}
          <div className="relative z-20 max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
            {/* Search Bar and VEG MODE Container - Sticky */}
            <div className="sticky top-4 z-30 flex items-center gap-3 sm:gap-4">
              {/* Enhanced Search Bar */}
              <div className="flex-1 relative animate-[slideUp_0.4s_ease-out]">
                <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-1 sm:p-1.5 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Search className="h-4 w-4 sm:h-4 sm:w-4 text-green-600 flex-shrink-0 ml-2 sm:ml-3" strokeWidth={2.5} />
                    <div className="flex-1 relative">
                      <div className="relative w-full">
                        <Input
                          value={heroSearch}
                          onChange={(e) => setHeroSearch(e.target.value)}
                          onFocus={handleSearchFocus}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && heroSearch.trim()) {
                              navigate(`/user/search?q=${encodeURIComponent(heroSearch.trim())}`)
                              closeSearch()
                              setHeroSearch("")
                            }
                          }}
                          className="pl-0 pr-2 h-8 sm:h-9 w-full bg-transparent border-0 text-sm sm:text-base font-semibold text-gray-700 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full"
                        />
                        {/* Animated placeholder - same animation as RestaurantDetails highlight offer */}
                        {!heroSearch && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none h-5 overflow-hidden">
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={placeholderIndex}
                                initial={{ y: 16, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -16, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-sm sm:text-base font-semibold text-gray-400 inline-block"
                              >
                                {placeholders[placeholderIndex]}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchFocus}
                      className="flex-shrink-0 mr-2 sm:mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Mic className="h-4 w-4 sm:h-4 sm:w-4 text-gray-500" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* VEG MODE Toggle */}
              <div ref={vegModeToggleRef} className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0 relative">
                <div className="flex flex-col items-center">
                  <span className="text-white text-[13px] sm:text-[11px] font-black leading-none">VEG</span>
                  <span className="text-white text-[9.5px] sm:text-[10px] font-black leading-none">MODE</span>
                </div>
                <Switch
                  checked={vegMode}
                  onCheckedChange={setVegMode}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 w-9 h-4 sm:w-10 sm:h-5 shadow-lg [&_[data-slot=switch-thumb]]:bg-white [&_[data-slot=switch-thumb]]:h-3 [&_[data-slot=switch-thumb]]:w-3 sm:[&_[data-slot=switch-thumb]]:h-4 sm:[&_[data-slot=switch-thumb]]:w-4 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-5 sm:[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-5 [&_[data-slot=switch-thumb]]:data-[state=unchecked]:translate-x-0"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Rest of Content - Container Width with Unified Background */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-0 pt-2 sm:pt-3">
        {/* Food Categories - Horizontal Scroll */}
        <section className="space-y-1 sm:space-y-1.5">
          <div
            ref={categoryScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth px-2 sm:px-3 py-2 sm:py-3"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              touchAction: "pan-x pan-y pinch-zoom",
              overflowY: "hidden",
            }}
          >
            {/* Offer Image - Static, Centered */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden">
                <img
                  src={offerImage}
                  alt="Special Offer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            {loadingLandingConfig ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : landingCategories.length === 0 ? (
              // Fallback to hardcoded categories if API returns empty
              categories.map((category, index) => (
                <ScrollRevealSimple key={category.id} delay={index * 0.05} className="flex-shrink-0">
                  <Link to={`/user/category/${category.name.toLowerCase()}`}>
                    <div className="flex flex-col items-center gap-2 w-[62px] sm:w-24 md:w-28">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md transition-all">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover bg-white rounded-full"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = foodImages[0]
                          }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 text-center">
                        {category.name.length > 7 ? `${category.name.slice(0, 7)}...` : category.name}
                      </span>
                    </div>
                  </Link>
                </ScrollRevealSimple>
              ))
            ) : (
              landingCategories.map((category, index) => (
                <ScrollRevealSimple key={category._id || index} delay={index * 0.05} className="flex-shrink-0">
                  <Link to={`/user/category/${category.slug || category.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex flex-col items-center gap-2 w-[62px] sm:w-24 md:w-28">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md transition-all">
                        <img
                          src={category.imageUrl}
                          alt={category.label}
                          className="w-full h-full object-cover bg-white rounded-full"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = foodImages[0]
                          }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 text-center">
                        {category.label.length > 7 ? `${category.label.slice(0, 7)}...` : category.label}
                      </span>
                    </div>
                  </Link>
                </ScrollRevealSimple>
              ))
            )}
          </div>
        </section>

        {/* Filters */}
        <section className="py-1">
          <div
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Filter Button - Opens Modal */}
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="h-7 sm:h-8 px-2 sm:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 font-medium transition-all bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-bold text-black">Filters</span>
            </Button>

            {/* Filter Buttons */}
            {[
              { id: 'delivery-under-30', label: 'Under 30 mins' },
              { id: 'delivery-under-45', label: 'Under 45 mins' },
              { id: 'distance-under-1km', label: 'Under 1km', icon: MapPin },
              { id: 'distance-under-2km', label: 'Under 2km', icon: MapPin },
            ].map((filter) => {
              const Icon = filter.icon
              const isActive = activeFilters.has(filter.id)
              return (
                <Button
                  key={filter.id}
                  variant="outline"
                  onClick={() => {
                    toggleFilter(filter.id)
                    setIsLoadingFilterResults(true)
                    // Simulate loading for 1 second
                    setTimeout(() => {
                      setIsLoadingFilterResults(false)
                    }, 500)
                  }
                  }
                  className={`h-7 sm:h-8 px-2 sm:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all font-medium ${isActive
                      ? 'bg-green-600 text-white border border-green-600 hover:bg-green-600/90'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                >
                  {Icon && <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${isActive ? 'fill-white' : ''}`} />}
                  <span className="text-xs sm:text-sm font-bold text-black">{filter.label}</span>
                </Button>
              )
            })}
          </div>
        </section>

        {/* Explore More Section */}
        <section className="pt-2 sm:pt-3">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 tracking-widest uppercase mb-2 sm:mb-3 px-1">
            {exploreMoreHeading}
          </h2>
          <div
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {loadingLandingConfig ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : landingExploreMore.length === 0 ? (
              // Fallback to hardcoded explore more if API returns empty
              [
                {
                  id: 'offers',
                  label: 'Offers',
                  image: exploreOffers,
                  href: '/user/offers'
                },
                {
                  id: 'gourmet',
                  label: 'Gourmet',
                  image: exploreGourmet,
                  href: '/user/gourmet'
                },
                {
                  id: 'top10',
                  label: 'Top 10',
                  image: exploreTop10,
                  href: '/user/top-10'
                },
                {
                  id: 'collection',
                  label: 'Collections',
                  image: exploreCollection,
                  href: '/user/collections'
                },
                {
                  id: 'giftcard',
                  label: 'Gift Card',
                  image: exploreGiftCard,
                  href: '/user/gift-card'
                },
              ].map((item) => (
                <Link key={item.id} to={item.href} className="flex-shrink-0 bg-white">
                  <div className="flex flex-col items-center gap-2.5 w-24 sm:w-28 md:w-32 group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 overflow-hidden p-2.5">
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-gray-700 text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              landingExploreMore.map((item) => (
                <Link key={item._id} to={item.link} className="flex-shrink-0 bg-white">
                  <div className="flex flex-col items-center gap-2.5 w-24 sm:w-28 md:w-32 group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 overflow-hidden p-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.label}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = exploreOffers
                        }}
                      />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-gray-700 text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Featured Foods - Horizontal Scroll */}

        {/* Restaurants - Enhanced with Animations */}
        <section className="space-y-0 pt-3 sm:pt-4">
          <TextRevealSimple className="px-1 mb-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-400 tracking-widest uppercase">
                {filteredRestaurants.length} Restaurants Delivering to You
              </h2>
              <span className="text-base sm:text-lg text-gray-500 font-normal">Featured</span>
            </div>
          </TextRevealSimple>
          <div className="relative">
            {/* Loading Overlay */}
            {isLoadingFilterResults && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-green-600 animate-spin" strokeWidth={2.5} />
                  <span className="text-sm font-medium text-gray-700">Loading restaurants...</span>
                </div>
              </div>
            )}
            <div className={`grid grid-cols-1 gap-2 sm:gap-3 pt-1 sm:pt-1.5 ${isLoadingFilterResults ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
              {filteredRestaurants.map((restaurant, index) => {
                const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
                // Direct favorite check - isFavorite is already memoized in context
                const favorite = isFavorite(restaurantSlug)

                const handleToggleFavorite = (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (favorite) {
                    // If already bookmarked, show Manage Collections modal
                    setSelectedRestaurantSlug(restaurantSlug)
                    setShowManageCollections(true)
                  } else {
                    // Add to favorites and show toast
                    addFavorite({
                      slug: restaurantSlug,
                      name: restaurant.name,
                      cuisine: restaurant.cuisine,
                      rating: restaurant.rating,
                      deliveryTime: restaurant.deliveryTime,
                      distance: restaurant.distance,
                      priceRange: restaurant.priceRange,
                      image: restaurant.image
                    })
                    setShowToast(true)
                    setTimeout(() => {
                      setShowToast(false)
                    }, 3000)
                  }
                }

                return (
                  <ScrollRevealSimple key={restaurant.id} delay={index * 0.1}>
                    <Link to={`/user/restaurants/${restaurantSlug}`}>
                      <Card className="overflow-hidden gap-0 cursor-pointer border-0 group bg-white shadow-md hover:shadow-xl transition-all duration-300 py-0 rounded-2xl">
                        {/* Image Section */}
                        <div className="relative h-48 sm:h-56 md:h-60 w-full overflow-hidden rounded-t-2xl">
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Featured Dish Badge - Top Left */}
                          <div className="absolute top-3 left-3">
                            <div className="bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                              {restaurant.featuredDish} · ₹{restaurant.featuredPrice}
                            </div>
                          </div>

                          {/* Bookmark Icon - Top Right */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggleFavorite}
                            className={`absolute top-3 right-3 h-9 w-9  rounded-full border flex items-center justify-center transition-all duration-300 ${favorite
                                ? "border-red-500 bg-red-50 text-red-500"
                                : "border-white bg-white/90 text-gray-600 hover:bg-white"
                              }`}
                          >

                            <Bookmark
                              className={`h-5 w-5 transition-all duration-300 ${favorite ? "fill-red-500" : ""
                                }`} />                       </Button>
                          {/* FREE delivery Badge - Bottom Left (only for first 3 restaurants) */}
                          {index < 3 && (
                            <div className="absolute bottom-0 left-0 sm:bottom-0 sm:left-0 z-10">
                              <div className="bg-gradient-to-r from-blue-600 via-blue-500/80 to-transparent text-white px-2.5 py-1 rounded-r-sm text-[10px] sm:text-xs font-bold shadow-lg backdrop-blur-sm">
                                FREE delivery
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <CardContent className="p-3 sm:p-4 pt-3 sm:pt-4">
                          {/* Restaurant Name & Rating */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">
                                {restaurant.name}
                              </h3>
                            </div>
                            <div className="flex-shrink-0 bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                              <span className="text-sm font-bold">{restaurant.rating}</span>
                              <Star className="h-3 w-3 fill-white text-white" />
                            </div>
                          </div>

                          {/* Delivery Time & Distance */}
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <Clock className="h-4 w-4" strokeWidth={1.5} />
                            <span className="font-medium">{restaurant.deliveryTime}</span>
                            <span className="mx-1">|</span>
                            <span className="font-medium">{restaurant.distance}</span>
                          </div>

                          {/* Offer Badge */}
                          {restaurant.offer && (
                            <div className="flex items-center gap-2 text-sm">
                              <BadgePercent className="h-4 w-4 text-blue-600" strokeWidth={2} />
                              <span className="text-gray-700 font-medium">{restaurant.offer}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </ScrollRevealSimple>
                )
              })}
            </div>
          </div>
          <div className="flex justify-center pt-2 sm:pt-3">
            {/* <Link to="/user/restaurants">
              <Button variant="outline" className="bg-transparent outline-none text-green-600 hover:opacity-80 border-none underline shadow-none  text-xs sm:text-sm md:text-base sm:hidden">
                See All Restaurants
              </Button>
            </Link> */}
          </div>
        </section>
      </div>
      <Footer />

      {/* Filter Modal - Bottom Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Modal Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Filters and sorting</h2>
              <button
                onClick={() => {
                  setActiveFilters(new Set())
                  setSortBy(null)
                  setSelectedCuisine(null)
                }}
                className="text-green-600 font-medium text-sm"
              >
                Clear all
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Tabs */}
              <div className="w-24 sm:w-28 bg-gray-50 border-r flex flex-col">
                {[
                  { id: 'sort', label: 'Sort By', icon: ArrowDownUp },
                  { id: 'time', label: 'Time', icon: Timer },
                  { id: 'rating', label: 'Rating', icon: Star },
                  { id: 'distance', label: 'Distance', icon: MapPin },
                  { id: 'price', label: 'Dish Price', icon: IndianRupee },
                  { id: 'cuisine', label: 'Cuisine', icon: UtensilsCrossed },
                  { id: 'offers', label: 'Offers', icon: BadgePercent },
                  { id: 'trust', label: 'Trust', icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeScrollSection === tab.id || activeFilterTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveFilterTab(tab.id)
                        const section = filterSectionRefs.current[tab.id]
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }}
                      className={`flex flex-col items-center gap-1 py-4 px-2 text-center relative transition-colors ${isActive ? 'bg-white text-green-600' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r" />
                      )}
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                      <span className="text-xs font-medium leading-tight">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Right Content Area - Scrollable */}
              <div ref={rightContentRef} className="flex-1 overflow-y-auto p-4">
                {/* Sort By Tab */}
                <div
                  ref={el => filterSectionRefs.current['sort'] = el}
                  data-section-id="sort"
                  className="space-y-4 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort by</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { id: null, label: 'Relevance' },
                      { id: 'price-low', label: 'Price: Low to High' },
                      { id: 'price-high', label: 'Price: High to Low' },
                      { id: 'rating-high', label: 'Rating: High to Low' },
                      { id: 'rating-low', label: 'Rating: Low to High' },
                    ].map((option) => (
                      <button
                        key={option.id || 'relevance'}
                        onClick={() => setSortBy(option.id)}
                        className={`px-4 py-3 rounded-xl border text-left transition-colors ${sortBy === option.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-600'
                          }`}
                      >
                        <span className={`text-sm font-medium ${sortBy === option.id ? 'text-green-600' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Tab */}
                <div
                  ref={el => filterSectionRefs.current['time'] = el}
                  data-section-id="time"
                  className="space-y-4 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Time</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => toggleFilter('delivery-under-30')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('delivery-under-30')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <Timer className={`h-6 w-6 ${activeFilters.has('delivery-under-30') ? 'text-green-600' : 'text-gray-600'}`} strokeWidth={1.5} />
                      <span className={`text-sm font-medium ${activeFilters.has('delivery-under-30') ? 'text-green-600' : 'text-gray-700'}`}>Under 30 mins</span>
                    </button>
                    <button
                      onClick={() => toggleFilter('delivery-under-45')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('delivery-under-45')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <Timer className={`h-6 w-6 ${activeFilters.has('delivery-under-45') ? 'text-green-600' : 'text-gray-600'}`} strokeWidth={1.5} />
                      <span className={`text-sm font-medium ${activeFilters.has('delivery-under-45') ? 'text-green-600' : 'text-gray-700'}`}>Under 45 mins</span>
                    </button>
                  </div>
                </div>

                {/* Rating Tab */}
                <div
                  ref={el => filterSectionRefs.current['rating'] = el}
                  data-section-id="rating"
                  className="space-y-4 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Rating</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => toggleFilter('rating-35-plus')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('rating-35-plus')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <Star className={`h-6 w-6 ${activeFilters.has('rating-35-plus') ? 'text-green-600 fill-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${activeFilters.has('rating-35-plus') ? 'text-green-600' : 'text-gray-700'}`}>Rated 3.5+</span>
                    </button>
                    <button
                      onClick={() => toggleFilter('rating-4-plus')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('rating-4-plus')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <Star className={`h-6 w-6 ${activeFilters.has('rating-4-plus') ? 'text-green-600 fill-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${activeFilters.has('rating-4-plus') ? 'text-green-600' : 'text-gray-700'}`}>Rated 4.0+</span>
                    </button>
                    <button
                      onClick={() => toggleFilter('rating-45-plus')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('rating-45-plus')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <Star className={`h-6 w-6 ${activeFilters.has('rating-45-plus') ? 'text-green-600 fill-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${activeFilters.has('rating-45-plus') ? 'text-green-600' : 'text-gray-700'}`}>Rated 4.5+</span>
                    </button>
                  </div>
                </div>

                {/* Distance Tab */}
                <div
                  ref={el => filterSectionRefs.current['distance'] = el}
                  data-section-id="distance"
                  className="space-y-4 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distance</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => toggleFilter('distance-under-1km')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('distance-under-1km')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <MapPin className={`h-6 w-6 ${activeFilters.has('distance-under-1km') ? 'text-green-600' : 'text-gray-600'}`} strokeWidth={1.5} />
                      <span className={`text-sm font-medium ${activeFilters.has('distance-under-1km') ? 'text-green-600' : 'text-gray-700'}`}>Under 1 km</span>
                    </button>
                    <button
                      onClick={() => toggleFilter('distance-under-2km')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${activeFilters.has('distance-under-2km')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <MapPin className={`h-6 w-6 ${activeFilters.has('distance-under-2km') ? 'text-green-600' : 'text-gray-600'}`} strokeWidth={1.5} />
                      <span className={`text-sm font-medium ${activeFilters.has('distance-under-2km') ? 'text-green-600' : 'text-gray-700'}`}>Under 2 km</span>
                    </button>
                  </div>
                </div>

                {/* Price Tab */}
                <div
                  ref={el => filterSectionRefs.current['price'] = el}
                  data-section-id="price"
                  className="space-y-4 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dish Price</h3>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => toggleFilter('price-under-200')}
                      className={`px-4 py-3 rounded-xl border text-left transition-colors ${activeFilters.has('price-under-200')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <span className={`text-sm font-medium ${activeFilters.has('price-under-200') ? 'text-green-600' : 'text-gray-700'}`}>Under ₹200</span>
                    </button>
                    <button
                      onClick={() => toggleFilter('price-under-500')}
                      className={`px-4 py-3 rounded-xl border text-left transition-colors ${activeFilters.has('price-under-500')
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <span className={`text-sm font-medium ${activeFilters.has('price-under-500') ? 'text-green-600' : 'text-gray-700'}`}>Under ₹500</span>
                    </button>
                  </div>
                </div>

                {/* Cuisine Tab */}
                <div
                  ref={el => filterSectionRefs.current['cuisine'] = el}
                  data-section-id="cuisine"
                  className="space-y-4 mb-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuisine</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Chinese', 'American', 'Japanese', 'Italian', 'Mexican', 'Indian', 'Asian', 'Seafood', 'Desserts', 'Cafe', 'Healthy'].map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                        className={`px-4 py-3 rounded-xl border text-center transition-colors ${selectedCuisine === cuisine
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-600'
                          }`}
                      >
                        <span className={`text-sm font-medium ${selectedCuisine === cuisine ? 'text-green-600' : 'text-gray-700'}`}>
                          {cuisine}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust Markers Tab */}
                {activeFilterTab === 'trust' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Trust Markers</h3>
                    <div className="flex flex-col gap-3">
                      <button className="px-4 py-3 rounded-xl border border-gray-200 hover:border-green-600 text-left transition-colors">
                        <span className="text-sm font-medium text-gray-700">Top Rated</span>
                      </button>
                      <button className="px-4 py-3 rounded-xl border border-gray-200 hover:border-green-600 text-left transition-colors">
                        <span className="text-sm font-medium text-gray-700">Trusted by 1000+ users</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-4 border-t bg-white">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 text-center font-semibold text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsLoadingFilterResults(true)
                  setIsFilterOpen(false)
                  // Simulate loading for 1 second
                  setTimeout(() => {
                    setIsLoadingFilterResults(false)
                  }, 1000)
                }}
                className={`flex-1 py-3 font-semibold rounded-xl transition-colors ${activeFilters.size > 0 || sortBy || selectedCuisine
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {activeFilters.size > 0 || sortBy || selectedCuisine
                  ? `Show ${filteredRestaurants.length} results`
                  : 'Show results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Veg Mode Popup */}
      <AnimatePresence>
        {showVegModePopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setShowVegModePopup(false)
                // Revert veg mode to OFF if popup is closed without applying
                setVegMode(false)
                setPrevVegMode(false)
              }}
              className="fixed inset-0 bg-black/30 z-[9998] backdrop-blur-sm"
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 0.8
              }}
              className="fixed z-[9999] bg-white rounded-2xl shadow-2xl p-4 w-[calc(100%-2rem)] max-w-xs"
              style={{
                top: `${popupPosition.top}px`,
                right: `${popupPosition.right}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pointer Triangle */}
              <div
                className="absolute -top-2 right-5 w-3 h-3 bg-white transform rotate-45"
                style={{
                  boxShadow: '-2px -2px 4px rgba(0,0,0,0.1)'
                }}
              />

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-3">
                See veg dishes from
              </h3>

              {/* Radio Options */}
              <div className="space-y-2 mb-4">
                {/* All restaurants */}
                <label
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setVegModeOption("all")}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="vegModeOption"
                      value="all"
                      checked={vegModeOption === "all"}
                      onChange={() => setVegModeOption("all")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${vegModeOption === "all"
                        ? "border-green-600 bg-green-600"
                        : "border-gray-300 bg-white"
                      }`}>
                      {vegModeOption === "all" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    All restaurants
                  </span>
                </label>

                {/* Pure Veg restaurants only */}
                <label
                  className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setVegModeOption("pure-veg")}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="vegModeOption"
                      value="pure-veg"
                      checked={vegModeOption === "pure-veg"}
                      onChange={() => setVegModeOption("pure-veg")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${vegModeOption === "pure-veg"
                        ? "border-green-600 bg-green-600"
                        : "border-gray-300 bg-white"
                      }`}>
                      {vegModeOption === "pure-veg" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Pure Veg restaurants only
                  </span>
                </label>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => {
                  setShowVegModePopup(false)
                  setIsApplyingVegMode(true)
                  // Confirm veg mode is ON by updating prevVegMode
                  setPrevVegMode(true)
                  // Simulate applying veg mode settings
                  setTimeout(() => {
                    setIsApplyingVegMode(false)
                  }, 2000)
                }}
                className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors mb-2 text-sm"
              >
                Apply
              </button>

              {/* More settings link */}
              <button
                onClick={() => {
                  setShowVegModePopup(false)
                  // Revert veg mode to OFF if popup is closed without applying
                  setVegMode(false)
                  setPrevVegMode(false)
                }}
                className="w-full text-green-600 font-medium text-xs hover:text-green-700 transition-colors"
              >
                More settings
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Switch Off Veg Mode Popup */}
      <AnimatePresence>
        {showSwitchOffPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setShowSwitchOffPopup(false)
                isHandlingSwitchOff.current = false
                setVegMode(true)
                // prevVegMode stays true (from before), which is correct
              }}
              className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 0.8
              }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-[85%] max-w-sm p-6">
                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
                    <AlertCircle className="w-20 h-20 text-white bg-red-500/90 rounded-full p-2" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Switch off Veg Mode?
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6 text-sm">
                  You'll see all restaurants, including those serving non-veg dishes
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSwitchOffPopup(false)
                      setIsSwitchingOffVegMode(true)
                      // Simulate switching off veg mode
                      setTimeout(() => {
                        setIsSwitchingOffVegMode(false)
                        isHandlingSwitchOff.current = false
                        setVegMode(false)
                        setPrevVegMode(false) // Set to false to match current state (veg mode is OFF)
                      }, 2000)
                    }}
                    className="w-full bg-transparent text-red-600 font-normal py-1 text-normal rounded-xl hover:bg-red-50 transition-colors text-base"
                  >
                    Switch off
                  </button>

                  <button
                    onClick={() => {
                      setShowSwitchOffPopup(false)
                      isHandlingSwitchOff.current = false
                      setVegMode(true)
                      // prevVegMode stays true (from before), which is correct
                    }}
                    className="w-full text-gray-900 font-normal py-1 text-center rounded-xl hover:bg-gray-200 transition-colors text-base"
                  >
                    Keep using this mode
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading Screen - Applying Veg Mode */}
      {/* <AnimatePresence>
        {isApplyingVegMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] bg-white/95 backdrop-blur-md flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {[...Array(8)].map((_, i) => {
                  const baseSize = 112 // Starting size (w-28 = 112px)
                  const maxSize = 600 // Maximum size to expand to
                  return (
                    <motion.div
                      key={i}
                      initial={{ 
                        scale: 1,
                        opacity: 0
                      }}
                      animate={{ 
                        scale: maxSize / baseSize,
                        opacity: [0, 0.4, 0.2, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: i * 0.3 // Stagger each circle by 0.3s so they appear one at a time
                      }}
                      className="absolute rounded-full border border-green-300"
                      style={{
                        width: baseSize,
                        height: baseSize,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        transformOrigin: 'center center'
                      }}
                    />
                  )
                })}
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                  className="relative z-10 w-28 h-28 rounded-full border-2 border-green-300 bg-white flex flex-col items-center justify-center shadow-sm"
                >
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-green-700 font-bold text-xs leading-none">100%</span>
                    <span className="text-green-700 font-bold text-xl leading-none mt-0.5">VEG</span>
                  </motion.div>
                </motion.div>
              </div>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-800 font-normal text-base text-center relative z-10"
              >
                Explore veg dishes from all restaurants
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      <AnimatePresence>
        {isApplyingVegMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] bg-white flex items-center justify-center"
          >
            <div className="relative w-32 h-32 flex items-center justify-center w-full">
              {/* Animated circles - positioned absolutely at the center */}
              {[...Array(8)].map((_, i) => {
                const baseSize = 112
                const maxSize = 600
                return (
                  <motion.div
                    key={i}
                    initial={{
                      scale: 1,
                      opacity: 0,
                    }}
                    animate={{
                      scale: maxSize / baseSize,
                      opacity: [0, 0.4, 0.2, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeOut",
                      delay: i * 0.3,
                    }}
                    className="absolute rounded-full border border-green-300"
                    style={{
                      width: baseSize,
                      height: baseSize,
                      // left: "50%",
                      // top: "50%",
                      // transform: "translate(-50%, -50%)",
                      // transformOrigin: "center center",
                    }}
                  />
                )
              })}

              {/* 100% VEG badge - absolute positioning at exact center */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="absolute z-10 w-28 h-28 rounded-full border-2 border-green-600 bg-white flex flex-col items-center justify-center shadow-sm"
                style={{
                  // left: "50%",
                  // top: "50%",
                  // transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-green-600 font-extrabold text-3xl leading-none">100%</span>
                  <span className="text-green-600 font-extrabold text-3xl leading-none mt-0.5">VEG</span>
                </motion.div>
              </motion.div>

              {/* Text below badge */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-normal text-gray text-center relative z-10 mt-56 w-full"
              >
                Explore veg dishes from all restaurants
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Loading Screen - Switching Off Veg Mode */}
      <AnimatePresence>
        {isSwitchingOffVegMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] bg-white flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Two Circles Spinning in Opposite Directions */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1
                }}
                className="relative w-16 h-16 flex items-center justify-center"
              >
                {/* Outer Circle - Spins Clockwise */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    rotate: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                  className="absolute w-16 h-16 border-[4px] border-transparent border-t-pink-500 border-r-pink-500 rounded-full"
                />

                {/* Inner Circle - Spins Counter-clockwise */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    rotate: {
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                  className="absolute w-12 h-12 border-[4px] border-transparent border-r-pink-500 rounded-full"
                />
              </motion.div>

              {/* Loading Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <motion.h2
                  className="text-xl font-normal text-gray-800 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Switching off
                </motion.h2>
                <motion.p
                  className="text-xl font-normal text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Veg Mode for you
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification - Fixed to viewport bottom */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", damping: 25 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10001] bg-black text-white px-6 py-3 rounded-lg shadow-2xl"
              >
                <p className="text-sm font-medium">Added to bookmark</p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Manage Collections Modal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showManageCollections && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/40 z-[9999]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowManageCollections(false)}
                />

                {/* Manage Collections Bottom Sheet */}
                <motion.div
                  className="fixed left-0 right-0 bottom-0 z-[10000] bg-white rounded-t-3xl shadow-2xl"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.2, type: "spring", damping: 30, stiffness: 400 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Manage Collections</h2>
                    <button
                      onClick={() => setShowManageCollections(false)}
                      className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* Collections List */}
                  <div className="px-4 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {/* Bookmarks Collection */}
                    <button
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Don't close modal on click, let checkbox handle it
                      }}
                    >
                      <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <Bookmark className="h-6 w-6 text-red-500 fill-red-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-gray-900">Bookmarks</span>
                          {selectedRestaurantSlug && (
                            <Checkbox
                              checked={isFavorite(selectedRestaurantSlug)}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  removeFavorite(selectedRestaurantSlug)
                                  setSelectedRestaurantSlug(null)
                                  setShowManageCollections(false)
                                }
                              }}
                              className="h-5 w-5 rounded border-2 border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {!selectedRestaurantSlug && (
                            <div className="h-5 w-5 rounded border-2 border-red-500 bg-red-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {getFavorites().length} restaurant{getFavorites().length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>

                    {/* Create new Collection */}
                    <button
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setShowManageCollections(false)}
                    >
                      <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <Plus className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-base font-medium text-gray-900">
                          Create new Collection
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Done Button */}
                  <div className="border-t border-gray-200 px-4 py-4">
                    <Button
                      className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium"
                      onClick={() => {
                        setSelectedRestaurantSlug(null)
                        setShowManageCollections(false)
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

      <StickyCartCard />
    </div>
  )
}
