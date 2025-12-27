import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, ChevronRight, ChevronDown, SlidersHorizontal, Bookmark, BadgePercent, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Import banner and deals images
import offerBanner from "@/assets/offerpagebanner.png"
import deal1 from "@/assets/dealsoftheday/dealoftheday1.png"
import deal2 from "@/assets/dealsoftheday/dealoftheday2.png"
import deal3 from "@/assets/dealsoftheday/dealoftheday3.png"

// Restaurant data for offers
const offerRestaurants = [
  {
    id: 1,
    name: "Hotel Apna Avenue",
    deliveryTime: "20-25 mins",
    distance: "1 km",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    offer: "Flat 50% OFF",
    featuredDish: "Paneer Tikka",
    featuredPrice: 199
  },
  {
    id: 2,
    name: "Bansuriwala",
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
    offer: "Flat 50% OFF",
    featuredDish: "Thali",
    featuredPrice: 249
  },
  {
    id: 3,
    name: "Rameshwaram Cafe",
    deliveryTime: "25-30 mins",
    distance: "2 km",
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
    offer: "Flat 50% OFF",
    featuredDish: "Dosa",
    featuredPrice: 129
  },
  {
    id: 4,
    name: "Paradise Biryani",
    deliveryTime: "30-35 mins",
    distance: "2.5 km",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    offer: "Flat 50% OFF",
    featuredDish: "Biryani",
    featuredPrice: 299
  },
  {
    id: 5,
    name: "Punjabi Dhaba",
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
    offer: "Flat 50% OFF",
    featuredDish: "Dal Makhani",
    featuredPrice: 179
  },
]

// Best offers restaurants (for the main list)
const bestOfferRestaurants = [
  {
    id: 1,
    name: "MP-09 Delhi Zayka",
    deliveryTime: "20-25 mins",
    distance: "1 km",
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    offer: "Flat ₹40 OFF above ₹149",
    featuredDish: "Chhole",
    featuredPrice: 179
  },
  {
    id: 2,
    name: "Biryani Blues",
    deliveryTime: "25-30 mins",
    distance: "1.5 km",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
    offer: "50% OFF up to ₹100",
    featuredDish: "Hyderabadi Biryani",
    featuredPrice: 299
  },
  {
    id: 3,
    name: "Pizza Paradise",
    deliveryTime: "20-25 mins",
    distance: "0.8 km",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
    offer: "Buy 1 Get 1 Free",
    featuredDish: "Margherita Pizza",
    featuredPrice: 249
  },
  {
    id: 4,
    name: "Chinese Wok",
    deliveryTime: "30-35 mins",
    distance: "2 km",
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop",
    offer: "20% OFF on all orders",
    featuredDish: "Hakka Noodles",
    featuredPrice: 189
  },
  {
    id: 5,
    name: "South Indian Delight",
    deliveryTime: "15-20 mins",
    distance: "0.5 km",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&h=600&fit=crop",
    offer: "Free Delivery above ₹199",
    featuredDish: "Masala Dosa",
    featuredPrice: 99
  },
  {
    id: 6,
    name: "Burger King",
    deliveryTime: "20-25 mins",
    distance: "1.2 km",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    offer: "Flat ₹50 OFF above ₹299",
    featuredDish: "Whopper",
    featuredPrice: 199
  },
]

const dealsOfTheDay = [deal1, deal2, deal3]

// More offers data matching the image
const moreOffers = [
  {
    id: 1,
    title: "Extra offer",
    subtitle: "with GOLD",
    bgClass: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
    hasIcon: true
  },
  {
    id: 2,
    title: "Minimum",
    subtitle: "₹150 OFF",
    bgClass: "bg-gradient-to-br from-amber-500 to-yellow-500",
  },
  {
    id: 3,
    title: "Crazy",
    subtitle: "60% OFF",
    bgClass: "bg-gradient-to-br from-orange-400 to-red-400",
  },
  {
    id: 4,
    title: "Unlimited",
    subtitle: "discount",
    bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
]

export default function Offers() {
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
            src={offerBanner} 
            alt="Great Offers" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* FLAT 50% OFF Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-black text-red-500 dark:text-red-400 text-center mb-4 tracking-wide">
            FLAT 50% OFF
          </h2>
          
          {/* Restaurant Cards - Grid Layout */}
          <div 
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
          >
            {offerRestaurants.map((restaurant) => (
              <Link 
                key={restaurant.id} 
                to={`/user/restaurants/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full"
              >
                <div className="group">
                  {/* Image Container */}
                  <div className="relative h-32 sm:h-36 rounded-xl overflow-hidden mb-2">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Offer Badge */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded">
                      {restaurant.offer}
                    </div>
                    {/* Ad Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Ad
                    </div>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      {restaurant.rating}
                      <Star className="h-2.5 w-2.5 fill-white" />
                    </div>
                  </div>
                  
                  {/* Restaurant Info */}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* View All Button */}
          <Link to="/user/restaurants">
            <Button 
              variant="ghost" 
              className="w-full mt-4 border-0 text-gray-700 dark:text-gray-300 font-medium rounded-xl h-11 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </section>

        {/* DEALS OF THE DAY Section */}
        <section>
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4">
            DEALS OF THE DAY
          </h2>
          
          {/* Deals Cards - Grid on Desktop, Horizontal Scroll on Mobile */}
          <div 
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-2 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {dealsOfTheDay.map((deal, index) => (
              <Link 
                key={index} 
                to="/user/restaurants"
                className="flex-shrink-0 md:w-full"
              >
                <div className="w-64 h-40 sm:w-72 sm:h-44 md:w-full md:h-48 lg:h-52 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img 
                    src={deal} 
                    alt={`Deal ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* More Offers Section - 2x2 Grid */}
        <section>
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4">
            MORE OFFERS
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {moreOffers.map((offer) => (
              <Link 
                key={offer.id}
                to="/user/restaurants"
                className={`${offer.bgClass} rounded-2xl p-4 h-28 sm:h-32 relative overflow-hidden`}
              >
                {/* Decorative sparkles */}
                <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-white/40 rounded-full" />
                <div className="absolute top-5 left-6 w-1 h-1 bg-white/30 rounded-full" />
                <div className="absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full" />
                
                <div className="relative z-10">
                  <h3 className="text-white text-base sm:text-lg font-bold leading-tight">
                    {offer.title}
                  </h3>
                  <p className={`text-lg sm:text-xl font-black ${offer.id === 1 ? 'text-yellow-400' : 'text-white'}`}>
                    {offer.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BEST OFFERS AROUND YOU Section */}
        <section>
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4">
            BEST OFFERS AROUND YOU
          </h2>
          
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
              { id: 'under-200', label: 'Under ₹200' },
              { id: 'rating-4-plus', label: 'Rating 4.0+' },
              { id: 'pure-veg', label: 'Pure Veg' },
              { id: 'fast-delivery', label: 'Fast Delivery' },
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

          {/* Featured Label */}
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Featured</p>

          {/* Restaurant Cards - 1 Column on Mobile, 3 Columns on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {bestOfferRestaurants.map((restaurant) => {
              const restaurantSlug = restaurant.name.toLowerCase().replace(/\s+/g, "-")
              const isFavorite = favorites.has(restaurant.id)

              return (
                <Link key={restaurant.id} to={`/user/restaurants/${restaurantSlug}`} className="w-full">
                  <Card className="overflow-hidden cursor-pointer border-0 group bg-white dark:bg-[#1a1a1a] shadow-md hover:shadow-xl transition-all duration-300 py-0 rounded-2xl w-full">
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
        </section>
        </div>
      </div>
    </div>
  )
}
