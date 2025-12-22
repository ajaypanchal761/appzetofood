import { Link, useNavigate } from "react-router-dom"
import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { Star, Clock, MapPin, ArrowDownUp, Timer, ArrowRight, ChevronDown, Bookmark, Share2, Plus, Minus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedPage from "../components/AnimatedPage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLocationSelector } from "../components/UserLayout"
import { useLocation } from "../hooks/useLocation"
import { useCart } from "../context/CartContext"
import PageNavbar from "../components/PageNavbar"
import { foodImages } from "@/constants/images"
import appzetoFoodLogo from "@/assets/appzetofoodlogo.jpeg"
import under250Banner from "@/assets/under250banner.png"
import AddToCartAnimation from "../components/AddToCartAnimation"


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

const under250Restaurants = [
  {
    id: 1,
    name: "Cafe Mocha",
    rating: 4.4,
    deliveryTime: "12-15 mins",
    distance: "0.4 km",
    cuisine: "Cafe • Continental",
    price: "₹120 for two",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    menuItems: [
      {
        id: 1,
        name: "Butter Khichdi",
        price: 224.16,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
      {
        id: 2,
        name: "Pav Bhaji",
        price: 200.16,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
      {
        id: 3,
        name: "Masala Dosa",
        price: 180.50,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: false,
      },
    ],
  },
  {
    id: 2,
    name: "Street Food Corner",
    rating: 4.2,
    deliveryTime: "10-12 mins",
    distance: "0.6 km",
    cuisine: "Street Food • Indian",
    price: "₹80 for two",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop",
    menuItems: [
      {
        id: 4,
        name: "Samosa Chaat",
        price: 120.00,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
      {
        id: 5,
        name: "Aloo Tikki",
        price: 95.50,
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: false,
      },
      {
        id: 6,
        name: "Chole Bhature",
        price: 150.00,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
    ],
  },
  {
    id: 3,
    name: "Quick Bites",
    rating: 4.3,
    deliveryTime: "15-18 mins",
    distance: "1.2 km",
    cuisine: "Fast Food • Snacks",
    price: "₹150 for two",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    menuItems: [
      {
        id: 7,
        name: "French Fries",
        price: 99.00,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
      {
        id: 8,
        name: "Burger",
        price: 180.00,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop",
        isVeg: false,
        bestPrice: false,
      },
    ],
  },
  {
    id: 4,
    name: "Local Delights",
    rating: 4.1,
    deliveryTime: "18-20 mins",
    distance: "1.5 km",
    cuisine: "North Indian • Vegetarian",
    price: "₹200 for two",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
    menuItems: [
      {
        id: 9,
        name: "Dal Makhani",
        price: 220.00,
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
      {
        id: 10,
        name: "Paneer Butter Masala",
        price: 240.00,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop",
        isVeg: true,
        bestPrice: true,
      },
    ],
  },
]

export default function Under250() {
  const { location } = useLocation()
  const navigate = useNavigate()
  const { addToCart, updateQuantity, removeFromCart, getCartItem, cart } = useCart()
  const [activeCategory, setActiveCategory] = useState(null)
  const [showSortPopup, setShowSortPopup] = useState(false)
  const [selectedSort, setSelectedSort] = useState(null)
  const [under30MinsFilter, setUnder30MinsFilter] = useState(false)
  const [showItemDetail, setShowItemDetail] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set())
  const [viewCartButtonBottom, setViewCartButtonBottom] = useState("bottom-20")
  const lastScrollY = useRef(0)

  const sortOptions = [
    { id: null, label: 'Relevance' },
    { id: 'rating-high', label: 'Rating: High to Low' },
    { id: 'delivery-time-low', label: 'Delivery Time: Low to High' },
    { id: 'distance-low', label: 'Distance: Low to High' },
  ]

  const handleClearAll = () => {
    setSelectedSort(null)
  }

  const handleApply = () => {
    setShowSortPopup(false)
    // Apply sorting logic here if needed
  }

  // Sync quantities from cart on mount
  useEffect(() => {
    const cartQuantities = {}
    cart.forEach((item) => {
      cartQuantities[item.id] = item.quantity || 0
    })
    setQuantities(cartQuantities)
  }, [cart])

  // Scroll detection for view cart button positioning
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current)

      // Only update if scroll difference is significant (avoid flickering)
      if (scrollDifference < 5) {
        return
      }

      // Scroll down -> bottom-0, Scroll up -> bottom-20
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setViewCartButtonBottom("bottom-0")
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setViewCartButtonBottom("bottom-20")
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Helper function to update item quantity in both local state and cart
  const updateItemQuantity = (item, newQuantity, event = null, restaurantName = null) => {
    // Update local state
    setQuantities((prev) => ({
      ...prev,
      [item.id]: newQuantity,
    }))

    // Find restaurant name from the item or use provided parameter
    const restaurant = restaurantName || item.restaurant || "Under 250"

    // Prepare cart item with all required properties
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: restaurant,
      description: item.description || "",
      originalPrice: item.originalPrice || item.price,
    }

    // Get source position for animation from event target
    let sourcePosition = null
    if (event) {
      let buttonElement = event.currentTarget
      if (!buttonElement && event.target) {
        buttonElement = event.target.closest('button') || event.target
      }
      
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect()
        const scrollX = window.pageXOffset || window.scrollX || 0
        const scrollY = window.pageYOffset || window.scrollY || 0
        
        sourcePosition = {
          viewportX: rect.left + rect.width / 2,
          viewportY: rect.top + rect.height / 2,
          scrollX: scrollX,
          scrollY: scrollY,
          itemId: item.id,
        }
      }
    }

    // Update cart context
    if (newQuantity <= 0) {
      const productInfo = {
        id: item.id,
        name: item.name,
        imageUrl: item.image,
      }
      removeFromCart(item.id, sourcePosition, productInfo)
    } else {
      const existingCartItem = getCartItem(item.id)
      if (existingCartItem) {
        const productInfo = {
          id: item.id,
          name: item.name,
          imageUrl: item.image,
        }
        
        if (newQuantity > existingCartItem.quantity && sourcePosition) {
          addToCart(cartItem, sourcePosition)
          if (newQuantity > existingCartItem.quantity + 1) {
            updateQuantity(item.id, newQuantity)
          }
        } else if (newQuantity < existingCartItem.quantity && sourcePosition) {
          updateQuantity(item.id, newQuantity, sourcePosition, productInfo)
        } else {
          updateQuantity(item.id, newQuantity)
        }
      } else {
        addToCart(cartItem, sourcePosition)
        if (newQuantity > 1) {
          updateQuantity(item.id, newQuantity)
        }
      }
    }
  }

  const handleItemClick = (item, restaurant) => {
    // Add restaurant info to item for display
    const itemWithRestaurant = {
      ...item,
      restaurant: restaurant.name,
      description: item.description || `${item.name} from ${restaurant.name}`,
      customisable: item.customisable || false,
      notEligibleForCoupons: item.notEligibleForCoupons || false,
    }
    setSelectedItem(itemWithRestaurant)
    setShowItemDetail(true)
  }

  const handleBookmarkClick = (itemId) => {
    setBookmarkedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  return (

    <div className="relative min-h-screen bg-white">
      {/* Banner Section with Navbar */}
      <div className="relative w-full" style={{ height: '30vh', maxHeight: '400px' }}>
        {/* Banner Image */}
        <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
          <img
            src={under250Banner}
            alt="Under 250 Banner"
            className="w-full h-full object-cover md:object-contain"
          />
        </div>

        {/* Navbar */}
        <PageNavbar textColor="black" zIndex={20} showProfile={true} />
      </div>

      {/* Content Section */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 space-y-0 pt-2 sm:pt-3 md:pt-4 lg:pt-6">

        <section className="space-y-1 sm:space-y-1.5">
          <div
            className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto md:overflow-x-visible overflow-y-visible scrollbar-hide scroll-smooth px-2 sm:px-3 py-2 sm:py-3 md:py-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              touchAction: "pan-x pan-y pinch-zoom",
              overflowY: "hidden",
            }}
          >
            {/* All Button */}
            <div className="flex-shrink-0">
              <div className="flex flex-col items-center gap-2 w-[62px] sm:w-24 md:w-28">
                <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-md transition-all">
                  <img
                    src={foodImages[5]}
                    alt="All"
                    className="w-full h-full object-cover bg-white rounded-full"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = foodImages[0]
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 text-center pb-1">
                  All
                </span>
              </div>
            </div>
            {categories.map((category, index) => {
              const isActive = activeCategory === category.id
              return (
                <div key={category.id} className="flex-shrink-0">
                  <Link to={`/user/category/${category.name.toLowerCase()}`}>
                    <div
                      className="flex flex-col items-center gap-2 w-[62px] sm:w-24 md:w-28"
                      onClick={() => setActiveCategory(category.id)}
                    >
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
                      <span className={`text-xs sm:text-sm md:text-base font-semibold text-gray-800 text-center pb-1 ${isActive ? 'border-b-2 border-green-600' : ''}`}>
                        {category.name.length > 7 ? `${category.name.slice(0, 7)}...` : category.name}
                      </span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        <section className="py-2 sm:py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSortPopup(true)}
              className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 rounded-md flex items-center gap-2 whitespace-nowrap flex-shrink-0 font-medium transition-all bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm md:text-base"
            >
              <ArrowDownUp className="h-4 w-4 md:h-5 md:w-5 rotate-90" />
              <span className="text-sm md:text-base font-medium">
                {selectedSort ? sortOptions.find(opt => opt.id === selectedSort)?.label : 'Sort'}
              </span>
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setUnder30MinsFilter(!under30MinsFilter)}
              className={`h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 rounded-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 font-medium transition-all text-sm md:text-base ${
                under30MinsFilter
                  ? 'bg-green-600 text-white border border-green-600 hover:bg-green-600/90'
                  : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
            >
              <Timer className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="text-xs sm:text-sm md:text-base font-medium">Under 30 mins</span>
            </Button>
          </div>
        </section>


        {/* Restaurant Menu Sections */}
        {under250Restaurants.map((restaurant) => {
          const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
          return (
            <section key={restaurant.id} className="pt-4 sm:pt-6 md:pt-8 lg:pt-10">
              {/* Restaurant Header */}
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm md:text-base text-gray-500">
                    <Clock className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.5} />
                    <span className="font-medium">{restaurant.deliveryTime}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 bg-green-800 text-white px-1 py-1 md:px-2 md:py-1.5 rounded-full">
                    <div className="bg-white text-green-700 px-1 py-1 md:px-1.5 md:py-1.5 rounded-full">
                    <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-green-800 text-green-800" />
                    </div>
                    <span className="text-xs md:text-sm font-bold">{restaurant.rating}</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-400 mt-0.5">By 24K+</span>
                </div>
              </div>

              {/* Menu Items Horizontal Scroll */}
              {restaurant.menuItems && restaurant.menuItems.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <div
                    className="flex md:grid gap-3 sm:gap-4 md:gap-4 lg:gap-5 overflow-x-auto md:overflow-x-visible overflow-y-visible scrollbar-hide scroll-smooth pb-2 md:pb-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      touchAction: "pan-x pan-y pinch-zoom",
                      overflowY: "hidden",
                    }}
                  >
                    {restaurant.menuItems.map((item) => {
                      const quantity = quantities[item.id] || 0
                      return (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-full bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleItemClick(item, restaurant)}
                      >
                        {/* Item Image */}
                        <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-44 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=400&fit=crop"
                            }}
                          />
                          {/* Veg Indicator */}
                          {item.isVeg && (
                            <div className="absolute top-2 left-2 h-4 w-4 md:h-5 md:w-5 rounded border-2 border-green-600 bg-white flex items-center justify-center">
                              <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-green-600" />
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="p-3 md:p-4">
                          <div className="flex items-center gap-1 mb-1 md:mb-2">
                            {item.isVeg && (
                              <div className="h-3 w-3 md:h-4 md:w-4 rounded border border-green-600 bg-green-50 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-600" />
                              </div>
                            )}
                            <span className="text-sm md:text-base font-semibold text-gray-900">
                              1 x {item.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-base md:text-lg lg:text-xl font-bold text-gray-900">
                                ₹{Math.round(item.price)}
                              </p>
                              {item.bestPrice && (
                                <p className="text-xs md:text-sm text-gray-500">Best price</p>
                              )}
                            </div>
                            {quantity > 0 ? (
                              <Link to="/user/cart" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant={"outline"}
                                  size="sm"
                                  className="bg-green-600/10 text-green-500 border-green-500 hover:bg-green-700 hover:text-white h-7 md:h-8 px-3 md:px-4 text-xs md:text-sm"
                                >
                                  View cart
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                variant={"outline"}
                                size="sm"
                                className="bg-green-600/10 text-green-500 border-green-500 hover:bg-green-700 hover:text-white h-7 md:h-8 px-3 md:px-4 text-xs md:text-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleItemClick(item, restaurant)
                                }}
                              >
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>

                  {/* View Full Menu Button */}
                  <Link className="flex justify-center mt-2 md:mt-3" to={`/user/restaurants/${restaurantSlug}`}>
                    <Button
                      variant="outline"
                      className="w-min align-center text-center rounded-lg mx-auto bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 h-9 md:h-10 px-4 md:px-6 text-sm md:text-base"
                    >
                      View full menu <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Sort Popup - Bottom Sheet */}
      <AnimatePresence>
        {showSortPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSortPopup(false)}
              className="fixed inset-0 bg-black/50 z-100"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-lg bg-white rounded-t-3xl shadow-2xl z-[110] max-h-[60vh] md:max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">Sort By</h2>
                <button
                  onClick={handleClearAll}
                  className="text-green-600 font-medium text-sm"
                >
                  Clear all
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-3">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id || 'relevance'}
                      onClick={() => setSelectedSort(option.id)}
                      className={`px-4 py-3 rounded-xl border text-left transition-colors ${selectedSort === option.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-600'
                        }`}
                    >
                      <span className={`text-sm font-medium ${selectedSort === option.id ? 'text-green-600' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-4 border-t bg-white">
                <button
                  onClick={() => setShowSortPopup(false)}
                  className="flex-1 py-3 text-center font-semibold text-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={handleApply}
                  className={`flex-1 py-3 font-semibold rounded-xl transition-colors ${selectedSort
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Item Detail Popup */}
      <AnimatePresence>
        {showItemDetail && selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowItemDetail(false)}
            />

            {/* Item Detail Bottom Sheet */}
            <motion.div
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-2xl lg:max-w-3xl z-[10000] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.15, type: "spring", damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Top Center Above Popup with 4px gap */}
              <div className="absolute -top-[44px] left-1/2 -translate-x-1/2 z-[10001]">
                <motion.button
                  onClick={() => setShowItemDetail(false)}
                  className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-900 transition-colors shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>

              {/* Image Section */}
              <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-t-3xl">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                {/* Bookmark and Share Icons Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookmarkClick(selectedItem.id)
                    }}
                    className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      bookmarkedItems.has(selectedItem.id)
                        ? "border-red-500 bg-red-50 text-red-500"
                        : "border-white bg-white/90 text-gray-600 hover:bg-white"
                    }`}
                  >
                    <Bookmark
                      className={`h-5 w-5 transition-all duration-300 ${
                        bookmarkedItems.has(selectedItem.id) ? "fill-red-500" : ""
                      }`}
                    />
                  </button>
                  <button className="h-10 w-10 rounded-full border border-white bg-white/90 text-gray-600 hover:bg-white flex items-center justify-center transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
                {/* Item Name and Indicator */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    {selectedItem.isVeg && (
                      <div className="h-5 w-5 md:h-6 md:w-6 rounded border-2 border-amber-700 bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-amber-700" />
                      </div>
                    )}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                      {selectedItem.name}
                    </h2>
                  </div>
                  {/* Bookmark and Share Icons (Desktop) */}
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBookmarkClick(selectedItem.id)
                      }}
                      className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        bookmarkedItems.has(selectedItem.id)
                          ? "border-red-500 bg-red-50 text-red-500"
                          : "border-gray-300 text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 transition-all duration-300 ${
                          bookmarkedItems.has(selectedItem.id) ? "fill-red-500" : ""
                        }`}
                      />
                    </button>
                    <button className="h-8 w-8 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
                  {selectedItem.description || `${selectedItem.name} from ${selectedItem.restaurant || 'Under 250'}`}
                </p>

                {/* Highly Reordered Progress Bar */}
                {selectedItem.customisable && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }} />
                    </div>
                    <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                      highly reordered
                    </span>
                  </div>
                )}

                {/* Not Eligible for Coupons */}
                {selectedItem.notEligibleForCoupons && (
                  <p className="text-xs text-gray-500 font-medium mb-4">
                    NOT ELIGIBLE FOR COUPONS
                  </p>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="border-t border-gray-200 px-4 md:px-6 lg:px-8 py-4 md:py-5 bg-white">
                <div className="flex items-center gap-4 md:gap-5">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 md:gap-4 border-2 border-gray-300 rounded-lg px-3 md:px-4 h-[44px] md:h-[50px]">
                        <button
                          onClick={(e) =>
                            updateItemQuantity(selectedItem, Math.max(0, (quantities[selectedItem.id] || 0) - 1), e)
                          }
                          disabled={(quantities[selectedItem.id] || 0) === 0}
                          className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <span className="text-lg md:text-xl font-semibold text-gray-900 min-w-[2rem] md:min-w-[2.5rem] text-center">
                          {quantities[selectedItem.id] || 0}
                        </span>
                        <button
                          onClick={(e) =>
                            updateItemQuantity(selectedItem, (quantities[selectedItem.id] || 0) + 1, e)
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                      </div>

                  {/* Add Item Button */}
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white h-[44px] md:h-[50px] rounded-lg font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                    onClick={(e) => {
                      updateItemQuantity(selectedItem, (quantities[selectedItem.id] || 0) + 1, e)
                      setShowItemDetail(false)
                    }}
                  >
                    <span>Add item</span>
                    <div className="flex items-center gap-1">
                      {selectedItem.originalPrice && selectedItem.originalPrice > selectedItem.price && (
                        <span className="text-sm md:text-base line-through text-red-200">
                          ₹{Math.round(selectedItem.originalPrice)}
                        </span>
                      )}
                      <span className="text-base md:text-lg font-bold">
                        ₹{Math.round(selectedItem.price)}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add to Cart Animation */}
      <AddToCartAnimation dynamicBottom={viewCartButtonBottom} />
    </div>
  )
}
