import { Link } from "react-router-dom"
import { ChevronDown, ShoppingCart, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocation } from "../hooks/useLocation"
import { useCart } from "../context/CartContext"
import { useLocationSelector } from "./UserLayout"
import { FaLocationDot } from "react-icons/fa6"
import appzetoLogo from "@/assets/appzetologo.png"

export default function PageNavbar({ 
  textColor = "white", 
  zIndex = 20, 
  showProfile = false,
  onNavClick 
}) {
  const { location, loading } = useLocation()
  const { getCartCount } = useCart()
  const { openLocationSelector } = useLocationSelector()
  const cartCount = getCartCount()

  // Display more detailed location information
  const cityName = location?.city || location?.area || "Select"
  const stateName = location?.state || "Location"
  const areaName = location?.area && location?.area !== location?.city ? location.area : null

  const handleLocationClick = () => {
    // Open location selector overlay
    openLocationSelector()
  }

  const textColorClass = textColor === "white" ? "text-white" : "text-black"
  const iconFill = textColor === "white" ? "white" : "black"
  const ringColor = textColor === "white" ? "ring-white/30" : "ring-gray-800/30"

  const zIndexClass = zIndex === 50 ? "z-50" : "z-20"

  return (
    <nav 
      className={`relative ${zIndexClass} w-full px-1 pr-2 sm:px-2 sm:pr-3 md:px-3 lg:px-6 xl:px-8 py-1.5 sm:py-3 lg:py-4 backdrop-blur-sm`}
      onClick={onNavClick}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-7xl mx-auto">
        {/* Left: Location - Hidden on desktop, shown on mobile */}
        <div className="flex md:hidden items-center gap-3 sm:gap-4 min-w-0">
          {/* Location Button */}
          <Button
            variant="ghost"
            onClick={handleLocationClick}
            disabled={loading}
            className="h-auto px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-white/20 transition-colors rounded-lg flex-shrink-0"
          >
            {loading ? (
              <span className={`text-sm font-bold ${textColorClass} ${textColor === "white" ? "drop-shadow-lg" : ""}`}>
                Loading...
              </span>
            ) : (
              <div className="flex flex-col items-start min-w-0">
                <div className="flex items-center gap-1.5">
                  <FaLocationDot 
                    className={`h-6 w-6 sm:h-7 sm:w-7 ${textColorClass} flex-shrink-0 ${textColor === "white" ? "drop-shadow-lg" : ""}`} 
                    fill={iconFill} 
                    strokeWidth={2} 
                  />
                  <span className={`text-md sm:text-lg font-bold ${textColorClass} truncate max-w-[120px] sm:max-w-[180px] ${textColor === "white" ? "drop-shadow-lg" : ""}`}>
                    {areaName || cityName}
                  </span>
                  <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 ${textColorClass} flex-shrink-0 ${textColor === "white" ? "drop-shadow-lg" : ""}`} strokeWidth={2.5} />
                </div>
                {(location?.city || location?.state) && (
                  <span className={`text-xs font-bold ${textColorClass}${textColor === "white" ? "/90" : ""} truncate max-w-[120px] sm:max-w-[180px] mt-0.5 ${textColor === "white" ? "drop-shadow-md" : ""}`}>
                    {location?.city && location?.state ? `${location.city}, ${location.state}` : (location?.city || location?.state || "")}
                  </span>
                )}
              </div>
            )}
          </Button>
        </div>

        {/* Center: Appzeto Logo */}
        <Link to="/user" className="flex items-center justify-center lg:hidden">
          <img
            src={appzetoLogo}
            alt="Appzeto Logo"
            className="h-12 w-20 mr-3 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
          />
        </Link>

        {/* Right: Actions - Hidden on desktop, shown on mobile */}
        <div className="flex md:hidden items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Wallet Icon */}
          <Link to="/user/wallet">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 hover:opacity-80 transition-opacity"
              title="Wallet"
            >
              <div className={`h-full w-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ${ringColor}`}>
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" strokeWidth={2} />
              </div>
            </Button>
          </Link>

          {/* Cart Icon */}
          <Link to="/user/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 hover:opacity-80 transition-opacity"
              title="Cart"
            >
              <div className={`h-full w-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ${ringColor}`}>
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-800" strokeWidth={2} />
              </div>
              {cartCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center ring-2 ${textColor === "white" ? "ring-white/50" : "ring-gray-800/30"}`}>
                  <span className="text-[9px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span>
                </span>
              )}
            </Button>
          </Link>

          {/* Profile - Only shown if showProfile is true */}
          {showProfile && (
            <Link to="/user/profile">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 hover:opacity-80 transition-opacity"
                title="Profile"
              >
                <div className={`h-full w-full rounded-full bg-blue-100 flex items-center justify-center shadow-lg ring-2 ${ringColor}`}>
                  <span className="text-green-600 text-xs sm:text-sm font-extrabold">
                    A
                  </span>
                </div>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

