import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, ChevronDown, SlidersHorizontal, Bookmark, BadgePercent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Import banner
import gourmetBanner from "@/assets/groumetpagebanner.png"

// Gourmet restaurants data
const gourmetRestaurants = [
  {
    id: 1,
    name: "The Grand Imperial",
    deliveryTime: "35-40 mins",
    distance: "2.5 km",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    offer: "20% OFF on first order",
    featuredDish: "Truffle Risotto",
    featuredPrice: 899
  },
  {
    id: 2,
    name: "La Maison Française",
    deliveryTime: "40-45 mins",
    distance: "3 km",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
    offer: "Free Dessert above ₹1500",
    featuredDish: "Coq au Vin",
    featuredPrice: 1299
  },
  {
    id: 3,
    name: "Sakura Japanese",
    deliveryTime: "30-35 mins",
    distance: "2 km",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop",
    offer: "Complimentary Miso Soup",
    featuredDish: "Omakase Sushi",
    featuredPrice: 1599
  },
  {
    id: 4,
    name: "Olive Garden Italia",
    deliveryTime: "35-40 mins",
    distance: "2.8 km",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&h=600&fit=crop",
    offer: "15% OFF on weekdays",
    featuredDish: "Lobster Linguine",
    featuredPrice: 1199
  },
  {
    id: 5,
    name: "The Royal Mughal",
    deliveryTime: "40-45 mins",
    distance: "3.5 km",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&h=600&fit=crop",
    offer: "Free Delivery above ₹999",
    featuredDish: "Dum Pukht Biryani",
    featuredPrice: 799
  },
  {
    id: 6,
    name: "Azure Mediterranean",
    deliveryTime: "30-35 mins",
    distance: "1.8 km",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop",
    offer: "₹200 OFF above ₹1200",
    featuredDish: "Grilled Sea Bass",
    featuredPrice: 1099
  },
  {
    id: 7,
    name: "Spice Route Thai",
    deliveryTime: "35-40 mins",
    distance: "2.2 km",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&h=600&fit=crop",
    offer: "Buy 2 Get 1 Free on curries",
    featuredDish: "Tom Yum Goong",
    featuredPrice: 699
  },
  {
    id: 8,
    name: "The Grill House",
    deliveryTime: "45-50 mins",
    distance: "4 km",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop",
    offer: "Flat ₹150 OFF",
    featuredDish: "Wagyu Steak",
    featuredPrice: 2499
  },
]

export default function Gourmet() {
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
    <div className="min-h-screen bg-white">
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
            src={gourmetBanner} 
            alt="Gourmet Dining" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 space-y-4 md:space-y-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Premium Gourmet Restaurants</h1>
          <p className="text-sm text-gray-500 mt-1">Exquisite dining experiences delivered to your doorstep</p>
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
            className="h-7 sm:h-8 px-2 sm:px-3 rounded-md flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 font-medium transition-all bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-bold text-black">Filters</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          {/* Filter Buttons */}
          {[
            { id: 'fine-dining', label: 'Fine Dining' },
            { id: 'rating-4-plus', label: 'Rating 4.5+' },
            { id: 'premium', label: 'Premium' },
            { id: 'michelin', label: 'Award Winning' },
            { id: 'continental', label: 'Continental' },
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
                    : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-black">{filter.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Restaurant Count */}
        <p className="text-xs sm:text-sm font-semibold text-gray-400 tracking-widest uppercase">
          {gourmetRestaurants.length} GOURMET RESTAURANTS
        </p>

        {/* Restaurant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {gourmetRestaurants.map((restaurant) => {
            const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
            const isFavorite = favorites.has(restaurant.id)

            return (
              <Link key={restaurant.id} to={`/user/restaurants/${restaurantSlug}`}>
                <Card className="overflow-hidden cursor-pointer border-0 group bg-white shadow-md hover:shadow-xl transition-all duration-300 py-0 rounded-2xl mb-4">
                  {/* Image Section */}
                  <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden rounded-t-2xl">
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
                      className="absolute top-3 right-3 h-9 w-9 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(restaurant.id)
                      }}
                    >
                      <Bookmark className={`h-5 w-5 ${isFavorite ? "fill-gray-800 text-gray-800" : "text-gray-600"}`} strokeWidth={2} />
                    </Button>
                  </div>
                  
                  {/* Content Section */}
                  <CardContent className="p-3 sm:p-4">
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
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}

