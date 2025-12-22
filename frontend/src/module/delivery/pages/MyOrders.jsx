import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play,
  ChevronRight,
  ShoppingBag,
  Bike,
  Coins,
  Shield,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Eye
} from "lucide-react"
import FeedNavbar from "../components/FeedNavbar"
import { useGigStore } from "../store/gigStore"

// Top carousel data
const topCarouselSlides = [
  {
    id: 1,
    title: "Be Winter Ready",
    subtitle: "Get winter collections at up to 80% off",
    background: "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400",
    buttonText: "Shop now",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Summer Sale",
    subtitle: "Up to 70% off on summer essentials",
    background: "bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400",
    buttonText: "Shop now",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "Check out the latest collection",
    background: "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400",
    buttonText: "Shop now",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop"
  }
]

// Shopping products
const shoppingProducts = [
  {
    id: 1,
    title: "Croma 32 inch LED Smart Goo...",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=300&fit=crop",
    price: 11400,
    originalPrice: 19000,
    discount: 40
  },
  {
    id: 2,
    title: "Rechargeable Gun Massager",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    price: 528,
    originalPrice: 1599,
    discount: 67
  },
  {
    id: 3,
    title: "Handle Lock Bike/Scoote",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=300&fit=crop",
    price: 348,
    originalPrice: 600,
    discount: 42
  },
  {
    id: 4,
    title: "Wireless Earbuds",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    price: 1299,
    originalPrice: 2999,
    discount: 57
  }
]

// Appzeto store clothes
const AppzetoStoreClothes = [
  {
    id: 1,
    title: "Light Winter Jacket",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
    price: 350,
    originalPrice: 999,
    discount: 65
  },
  {
    id: 2,
    title: "T-shirt with pocket (Pack of 2)",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    price: 400,
    originalPrice: 500,
    discount: 20
  },
  {
    id: 3,
    title: "Fleece Winter Jacket",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
    price: 549,
    originalPrice: 999,
    discount: 45
  },
  {
    id: 4,
    title: "Appzeto Hoodie",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop",
    price: 699,
    originalPrice: 1299,
    discount: 46
  }
]

// EV Bikes
const evBikes = [
  {
    id: 1,
    name: "Boltly Ebike",
    price: 155,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    name: "NXTE Alfa-Swap",
    price: 196,
    image: "https://images.unsplash.com/photo-1558980664-1db506751c6c?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Gem",
    price: 211,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop"
  }
]

export default function MyOrders() {
  const navigate = useNavigate()
  const { isOnline, goOnline, goOffline } = useGigStore()
  const [currentCarouselSlide, setCurrentCarouselSlide] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoLikes, setVideoLikes] = useState({})
  const [videoDislikes, setVideoDislikes] = useState({})
  const [userReactions, setUserReactions] = useState({})
  const videoRef = useRef(null)
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  // Auto-rotate carousel
  const carouselIntervalRef = useRef(null)
  
  // Handle online toggle
  const handleToggleOnline = () => {
    if (isOnline) {
      goOffline()
    } else {
      goOnline()
    }
  }

  // Carousel auto-rotate
  useEffect(() => {
    carouselIntervalRef.current = setInterval(() => {
      setCurrentCarouselSlide((prev) => (prev + 1) % topCarouselSlides.length)
    }, 4000)
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current)
      }
    }
  }, [])

  const handleVideoClick = (video) => {
    setSelectedVideo(video)
    if (!videoLikes[video.id]) {
      setVideoLikes(prev => ({ ...prev, [video.id]: video.likes || 0 }))
      setVideoDislikes(prev => ({ ...prev, [video.id]: video.dislikes || 0 }))
    }
  }

  const handleLike = (videoId) => {
    const currentReaction = userReactions[videoId]
    if (currentReaction === 'like') {
      setVideoLikes(prev => ({ ...prev, [videoId]: prev[videoId] - 1 }))
      setUserReactions(prev => {
        const newReactions = { ...prev }
        delete newReactions[videoId]
        return newReactions
      })
    } else {
      setVideoLikes(prev => ({ ...prev, [videoId]: (prev[videoId] || 0) + 1 }))
      if (currentReaction === 'dislike') {
        setVideoDislikes(prev => ({ ...prev, [videoId]: prev[videoId] - 1 }))
      }
      setUserReactions(prev => ({ ...prev, [videoId]: 'like' }))
    }
  }

  const handleDislike = (videoId) => {
    const currentReaction = userReactions[videoId]
    if (currentReaction === 'dislike') {
      setVideoDislikes(prev => ({ ...prev, [videoId]: prev[videoId] - 1 }))
      setUserReactions(prev => {
        const newReactions = { ...prev }
        delete newReactions[videoId]
        return newReactions
      })
    } else {
      setVideoDislikes(prev => ({ ...prev, [videoId]: (prev[videoId] || 0) + 1 }))
      if (currentReaction === 'like') {
        setVideoLikes(prev => ({ ...prev, [videoId]: prev[videoId] - 1 }))
      }
      setUserReactions(prev => ({ ...prev, [videoId]: 'dislike' }))
    }
  }

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setSelectedVideo(null)
  }

  // Touch handlers for vertical swipe
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY
  }

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return
    touchStartY.current = 0
    touchEndY.current = 0
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Lifestyle store video
  const lifestyleStoreVideo = {
    id: 1,
    title: "Lifestyle store",
    subtitle: "Heavy discounts on top brands",
    thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    views: 12500,
    likes: 890,
    dislikes: 12
  }

  // Rent EV bikes video
  const rentEvBikesVideo = {
    id: 2,
    title: "Benefits of EV",
    subtitle: "Cost saving, Less repair, Easy charging",
    thumbnail: "https://images.unsplash.com/photo-1558980664-1db506751c6c?w=800&h=600&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    views: 9800,
    likes: 650,
    dislikes: 8
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-24 pt-8">
      {/* Feed Navbar */}
      <FeedNavbar
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
        onEmergencyClick={() => {}}
        onHelpClick={() => {}}
        className=""
      />

      {/* Top Carousel */}
      <div className="relative my-6">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentCarouselSlide * 100}%)` }}
          >
            {topCarouselSlides.map((slide) => (
              <div key={slide.id} className="min-w-full">
                <div className={`mx-4 rounded-2xl ${slide.background} p-6 relative overflow-hidden`}>
                  <div className="relative z-10">
                    <h2 className="text-white text-2xl font-bold mb-2">{slide.title}</h2>
                    <p className="text-white text-sm mb-4 opacity-90">{slide.subtitle}</p>
                    <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                      {slide.buttonText}
                    </button>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {topCarouselSlides.map((_, index) => (
        <button
              key={index}
              onClick={() => setCurrentCarouselSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentCarouselSlide
                  ? "bg-gray-800 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick links</h2>
        <div className="grid grid-cols-3 gap-3">
          {/* Shopping */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-gray-900 font-semibold text-sm mb-3">Shopping</div>
            <div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          
          {/* Rent EV */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-gray-900 font-semibold text-sm mb-3">Rent EV</div>
            <div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <Bike className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          
          {/* Financial welfare */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-gray-900 font-semibold text-sm mb-3">Financial welfare</div>
            <div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <Coins className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Store Video */}
      <div className="px-4 mb-6">
        <div 
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 cursor-pointer"
          onClick={() => handleVideoClick(lifestyleStoreVideo)}
        >
          <div className="p-6 relative z-10">
            <h2 className="text-white text-2xl font-bold mb-2">{lifestyleStoreVideo.title}</h2>
            <p className="text-white text-sm opacity-90">{lifestyleStoreVideo.subtitle}</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </div>
          <div className="absolute inset-0 opacity-20">
            <img 
              src={lifestyleStoreVideo.thumbnail}
              alt={lifestyleStoreVideo.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Shopping Cards - Horizontal Scroll */}
      <div className="mb-6">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Shopping</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4">
          {shoppingProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-48 bg-white flex items-center justify-center">
                <img 
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                </div>
                <span className="text-xs font-medium text-green-600">{product.discount}% Off</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appzeto Store - Horizontal Scroll */}
      <div className="mb-6 bg-blue-50 py-6">
        <div className="px-4 mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Appzeto store</h2>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
            </button>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4">
          {AppzetoStoreClothes.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-48 bg-white flex items-center justify-center">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</span>
                  <span className="text-xs text-gray-500 line-through">{formatCurrency(item.originalPrice)}</span>
                </div>
                <span className="text-xs font-medium text-green-600">{item.discount}% Off</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rent EV Bikes Video */}
      <div className="px-4 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Rent EV bikes</h2>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
            </button>
        </div>
        <div 
          className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 cursor-pointer"
          onClick={() => handleVideoClick(rentEvBikesVideo)}
        >
          <div className="p-6 relative z-10">
            <h2 className="text-white text-2xl font-bold mb-2">{rentEvBikesVideo.title}</h2>
            <p className="text-white text-sm opacity-90 mb-4">{rentEvBikesVideo.subtitle}</p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </div>
          <div className="absolute inset-0 opacity-20">
            <img 
              src={rentEvBikesVideo.thumbnail}
              alt={rentEvBikesVideo.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* EV Bikes Carousel */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth mt-4">
          {evBikes.map((bike) => (
            <div key={bike.id} className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
                <img 
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-1">{bike.name}</h3>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(bike.price)} <span className="text-xs font-normal text-gray-600">per day</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Welfare */}
      <div className="px-4 mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Financial welfare</h2>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
                    </div>
        <div className="grid grid-cols-3 gap-3">
          {/* Insurance */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-gray-900 font-semibold text-sm mb-3">Insurance</div>
            <div className="w-full h-24 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="w-12 h-12 text-red-500" />
                      </div>
                    </div>
          
          {/* Recurring deposits */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-gray-900 font-semibold text-sm mb-3">Recurring deposits</div>
            <div className="w-full h-24 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Coins className="w-12 h-12 text-yellow-600" />
                    </div>
                  </div>
          
          {/* Fixed deposits */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-gray-900 font-semibold text-sm mb-3">Fixed deposits</div>
            <div className="w-full h-24 bg-green-50 rounded-lg flex items-center justify-center">
              <Coins className="w-12 h-12 text-green-600" />
                </div>
          </div>
        </div>
              </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
            />
            
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
            >
              {/* Back Button */}
              <button
                onClick={handleCloseVideo}
                className="absolute top-4 left-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>

              {/* Video Container */}
              <div 
                className="w-full h-full flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    src={selectedVideo.videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                    onError={(e) => {
                      console.error("Video load error:", e)
                    }}
                  />

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                    <h3 className="text-white font-bold text-lg mb-4">{selectedVideo.title}</h3>
                  </div>

                  {/* Actions Bar - Bottom Right Column */}
                  <div className="absolute bottom-6 right-6 flex flex-col items-center gap-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(selectedVideo.id)}
                      className={`flex flex-col items-center gap-1 transition-colors ${
                        userReactions[selectedVideo.id] === 'like'
                          ? 'text-blue-500'
                          : 'text-white hover:text-blue-400'
                      }`}
                    >
                      <ThumbsUp className="w-6 h-6" fill={userReactions[selectedVideo.id] === 'like' ? 'currentColor' : 'none'} />
                      <span className="text-xs font-medium">
                        {videoLikes[selectedVideo.id] || selectedVideo.likes || 0}
                    </span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      onClick={() => handleDislike(selectedVideo.id)}
                      className={`flex flex-col items-center gap-1 transition-colors ${
                        userReactions[selectedVideo.id] === 'dislike'
                          ? 'text-red-500'
                          : 'text-white hover:text-red-400'
                      }`}
                    >
                      <ThumbsDown className="w-6 h-6" fill={userReactions[selectedVideo.id] === 'dislike' ? 'currentColor' : 'none'} />
                      <span className="text-xs font-medium">
                        {videoDislikes[selectedVideo.id] || selectedVideo.dislikes || 0}
                      </span>
                    </button>

                    {/* Views */}
                    <div className="flex flex-col items-center gap-1 text-white">
                      <Eye className="w-6 h-6" />
                      <span className="text-xs font-medium">
                        {selectedVideo.views?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
              </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
