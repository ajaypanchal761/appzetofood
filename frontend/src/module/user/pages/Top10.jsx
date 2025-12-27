import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, ChevronDown, SlidersHorizontal, Bookmark, BadgePercent, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Import banner
import top10Banner from "@/assets/top10pagebanner.png"

// Top 10 restaurants data
const top10Restaurants = [
  {
    id: 1,
    rank: 1,
    name: "Paradise Biryani House",
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
    offer: "Flat ₹100 OFF above ₹499",
    featuredDish: "Hyderabadi Biryani",
    featuredPrice: 349
  },
  {
    id: 2,
    rank: 2,
    name: "The Grand Kitchen",
    deliveryTime: "30-35 mins",
    distance: "2 km",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    offer: "20% OFF on weekends",
    featuredDish: "Chef's Special Thali",
    featuredPrice: 449
  },
  {
    id: 3,
    rank: 3,
    name: "Pizza Palace",
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    offer: "Buy 1 Get 1 Free",
    featuredDish: "Margherita Pizza",
    featuredPrice: 299
  },
  {
    id: 4,
    rank: 4,
    name: "Dragon Wok",
    deliveryTime: "25-30 mins",
    distance: "1.2 km",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    offer: "Free Spring Rolls above ₹399",
    featuredDish: "Hakka Noodles",
    featuredPrice: 229
  },
  {
    id: 5,
    rank: 5,
    name: "South Spice",
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    offer: "₹50 OFF on all orders",
    featuredDish: "Masala Dosa",
    featuredPrice: 129
  },
  {
    id: 6,
    rank: 6,
    name: "Burger Barn",
    deliveryTime: "20-25 mins",
    distance: "1 km",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    offer: "Flat ₹75 OFF above ₹299",
    featuredDish: "Double Cheese Burger",
    featuredPrice: 199
  },
  {
    id: 7,
    rank: 7,
    name: "Tandoori Nights",
    deliveryTime: "30-35 mins",
    distance: "1.8 km",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=600&fit=crop",
    offer: "Free Naan with every curry",
    featuredDish: "Butter Chicken",
    featuredPrice: 329
  },
  {
    id: 8,
    rank: 8,
    name: "Sushi Station",
    deliveryTime: "35-40 mins",
    distance: "2.5 km",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop",
    offer: "15% OFF on combo meals",
    featuredDish: "Salmon Sushi Platter",
    featuredPrice: 599
  },
  {
    id: 9,
    rank: 9,
    name: "Cafe Mocha",
    deliveryTime: "15-20 mins",
    distance: "0.6 km",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    offer: "Free Cookie with any coffee",
    featuredDish: "Belgian Waffle",
    featuredPrice: 249
  },
  {
    id: 10,
    rank: 10,
    name: "Kebab Corner",
    deliveryTime: "25-30 mins",
    distance: "1.3 km",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop",
    offer: "₹100 OFF above ₹599",
    featuredDish: "Seekh Kebab Platter",
    featuredPrice: 399
  },
]

export default function Top10() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(new Set())
  const [activeFilters, setActiveFilters] = useState(new Set())

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Banner Section */}
      <div className="relative w-full overflow-hidden min-h-[25vh] md:min-h-[30vh]">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-gray-800/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </button>
        
        {/* Banner Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={top10Banner} 
            alt="Top 10 Restaurants" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 space-y-4 md:space-y-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Top 10 Restaurants</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Most loved restaurants in your area</p>
        </div>

        {/* Filters */}
        <div 
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Filter Button */}
          <Button
            variant="outline"
            className="h-7 sm:h-8 px-2 sm:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 font-medium transition-all bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-bold text-black dark:text-white">Filters</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          {/* Filter Buttons */}
          {[
            { id: 'fast-delivery', label: 'Fast Delivery' },
            { id: 'rating-4-plus', label: 'Rating 4.5+' },
            { id: 'offers', label: 'With Offers' },
            { id: 'nearby', label: 'Nearby' },
            { id: 'pure-veg', label: 'Pure Veg' },
          ].map((filter) => {
            const isActive = activeFilters.has(filter.id)
            return (
              <Button
                key={filter.id}
                variant="outline"
                onClick={() => toggleFilter(filter.id)}
                className={`h-7 sm:h-8 px-2 sm:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-all font-medium ${
                  isActive
                    ? 'bg-primary-orange text-white border border-primary-orange hover:bg-primary-orange/90'
                    : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-black dark:text-white">{filter.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {top10Restaurants.map((restaurant) => {
            const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
            const isFavorite = favorites.has(restaurant.id)

            return (
              <Link key={restaurant.id} to={`/user/restaurants/${restaurantSlug}`}>
                <Card className="overflow-hidden cursor-pointer border-0 group bg-white dark:bg-[#1a1a1a] shadow-md hover:shadow-xl transition-all duration-300 py-0 rounded-2xl mb-4">
                  {/* Image Section */}
                  <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden rounded-t-2xl">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Rank Badge - Top Left */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {restaurant.rank}
                      </div>
                    </div>
                    
                    {/* Featured Dish Badge */}
                    <div className="absolute top-3 left-14">
                      <div className="bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium">
                        {restaurant.featuredDish} · ₹{restaurant.featuredPrice}
                      </div>
                    </div>
                    
                    {/* Bookmark Icon - Top Right */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-9 w-9 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(restaurant.id)
                      }}
                    >
                      <Bookmark className={`h-5 w-5 ${isFavorite ? "fill-gray-800 dark:fill-gray-200 text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`} strokeWidth={2} />
                    </Button>
                  </div>
                  
                  {/* Content Section */}
                  <CardContent className="p-3 sm:p-4">
                    {/* Restaurant Name & Rating */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {restaurant.name}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                        <span className="text-sm font-bold">{restaurant.rating}</span>
                        <Star className="h-3 w-3 fill-white text-white" />
                      </div>
                    </div>
                    
                    {/* Delivery Time & Distance */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Clock className="h-4 w-4" strokeWidth={1.5} />
                      <span className="font-medium">{restaurant.deliveryTime}</span>
                      <span className="mx-1">|</span>
                      <span className="font-medium">{restaurant.distance}</span>
                    </div>
                    
                    {/* Offer Badge */}
                    {restaurant.offer && (
                      <div className="flex items-center gap-2 text-sm">
                        <BadgePercent className="h-4 w-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{restaurant.offer}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}

