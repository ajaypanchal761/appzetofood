import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Menu, ChevronRight, MapPin, X, Bell } from "lucide-react"

export default function RestaurantNavbar({
  restaurantName = "Kadhai Chammach Restaurant",
  location = "By Pass Road (South)",
  showSearch = true,
  showOfflineOnlineTag = true,
  showNotifications = true,
}) {
  const navigate = useNavigate()
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [status, setStatus] = useState("Offline")

  // Load status from localStorage on mount
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem('restaurant_online_status')
      if (savedStatus !== null) {
        setStatus(JSON.parse(savedStatus) ? "Online" : "Offline")
      }
    } catch (error) {
      console.error("Error loading restaurant status:", error)
    }
  }, [])

  // Listen for status changes
  useEffect(() => {
    const handleStatusChange = (event) => {
      setStatus(event.detail.isOnline ? "Online" : "Offline")
    }

    window.addEventListener('restaurantStatusChanged', handleStatusChange)
    
    return () => {
      window.removeEventListener('restaurantStatusChanged', handleStatusChange)
    }
  }, [])

  const handleStatusClick = () => {
    navigate("/restaurant/status")
  }

  const handleSearchClick = () => {
    setIsSearchActive(true)
  }

  const handleSearchClose = () => {
    setIsSearchActive(false)
    setSearchValue("")
  }

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value)
  }

  const handleMenuClick = () => {
    navigate("/restaurant/explore")
  }

  const handleNotificationsClick = () => {
    navigate("/restaurant/notifications")
  }

  // Show search input when search is active
  if (isSearchActive) {
    return (
      <div className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search by order ID"
            className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleSearchClose}
          className="w-6 h-6 bg-black rounded-full flex items-center justify-center shrink-0"
          aria-label="Close search"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left Side - Restaurant Info */}
      <div className="flex-1 min-w-0 pr-4">
        {/* Restaurant Name */}
        <h1 className="text-base font-bold text-gray-900 truncate">
          {restaurantName}
        </h1>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
          <p className="text-xs text-gray-600 truncate">
            {location}
          </p>
        </div>
      </div>

      {/* Right Side - Interactive Elements */}
      <div className="flex items-center">
        {/* Offline/Online Status Tag */}
        {showOfflineOnlineTag && (
          <button
            onClick={handleStatusClick}
            className={`flex items-center gap-1.5 px-2 py-1 border rounded-full hover:opacity-80 transition-all ${
              status === "Online" 
                ? "bg-green-50 border-green-300" 
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              status === "Online" ? "bg-green-500" : "bg-gray-500"
            }`}></span>
            <span className={`text-sm font-medium ${
              status === "Online" ? "text-green-700" : "text-gray-700"
            }`}>
              {status}
            </span>
            <ChevronRight className={`w-4 h-4 ${
              status === "Online" ? "text-green-700" : "text-gray-700"
            }`} />
          </button>
        )}

        {/* Search Icon */}
        {showSearch && (
          <button
            onClick={handleSearchClick}
            className="p-2 ml-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Notifications Icon */}
        {showNotifications && (
          <button
            onClick={handleNotificationsClick}
            className="p-2 ml-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Hamburger Menu Icon */}
        <button
          onClick={handleMenuClick}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  )
}
