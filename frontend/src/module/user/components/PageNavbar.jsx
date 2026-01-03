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

  // Function to extract location parts for display
  // Main location: First 2 parts only (e.g., "Mama Loca, G-2")
  // Sub location: City and State (e.g., "New Palasia, Indore")
  const getLocationDisplay = (fullAddress, city, state, area) => {
    if (!fullAddress) {
      // Fallback: Use area and city/state if available
      if (area) {
        return {
          main: area,
          sub: city && state ? `${city}, ${state}` : city || state || ""
        }
      }
      if (city) {
        return {
          main: city,
          sub: state || ""
        }
      }
      return { main: "Select location", sub: "" }
    }
    
    // Split address by comma
    const parts = fullAddress.split(',').map(part => part.trim()).filter(part => part.length > 0)
    
    // Main location: First 2 parts only (e.g., "Mama Loca, G-2")
    let mainLocation = ""
    if (parts.length >= 2) {
      mainLocation = parts.slice(0, 2).join(', ')
    } else if (parts.length >= 1) {
      mainLocation = parts[0]
    }
    
    // Sub location: City and State (prefer from location object, fallback to address parts)
    let subLocation = ""
    if (city && state) {
      subLocation = `${city}, ${state}`
    } else if (city) {
      subLocation = city
    } else if (state) {
      subLocation = state
    }
    
    return {
      main: mainLocation || "Select location",
      sub: subLocation
    }
  }

  // Get display location parts
  // Priority: formattedAddress > address > area/city
  // IMPORTANT: Sub location ALWAYS uses city and state from location object, never from address parts
  const locationDisplay = (() => {
    let mainLocation = ""
    let subLocation = ""
    
    // Get main location from address (first 2 parts only)
    if (location?.formattedAddress) {
      const parts = location.formattedAddress.split(',').map(part => part.trim()).filter(part => part.length > 0)
      if (parts.length >= 2) {
        mainLocation = parts.slice(0, 2).join(', ')
      } else if (parts.length >= 1) {
        mainLocation = parts[0]
      }
    } else if (location?.address) {
      const parts = location.address.split(',').map(part => part.trim()).filter(part => part.length > 0)
      if (parts.length >= 2) {
        mainLocation = parts.slice(0, 2).join(', ')
      } else if (parts.length >= 1) {
        mainLocation = parts[0]
      }
    } else if (location?.area) {
      mainLocation = location.area
    } else if (location?.city) {
      mainLocation = location.city
    } else {
      mainLocation = "Select location"
    }
    
    // Sub location: ALWAYS use city and state from location object ONLY (never from address parts)
    // Check if city and state exist in location object
    const hasCity = location?.city && location.city.trim() !== "" && location.city !== "Unknown City"
    const hasState = location?.state && location.state.trim() !== ""
    
    if (hasCity && hasState) {
      subLocation = `${location.city}, ${location.state}`
    } else if (hasCity) {
      subLocation = location.city
    } else if (hasState) {
      subLocation = location.state
    } else {
      // If city/state not available in location object, try to extract from formattedAddress
      // This is a fallback - formattedAddress format: "Mama Loca, G-2, Princess Center 6/3, Opposite Manpasand Garden, New Palasia, Indore, 452001, India"
      if (location?.formattedAddress) {
        const parts = location.formattedAddress.split(',').map(part => part.trim()).filter(part => part.length > 0)
        
        console.log("📍 Extracting city/state from formattedAddress:", {
          formattedAddress: location.formattedAddress,
          parts: parts,
          partsLength: parts.length
        })
        
        // For Indian addresses: city and state are usually before pincode (which is a 6-digit number)
        // Format: "Mama Loca, G-2, Princess Center 6/3, Opposite Manpasand Garden, New Palasia, Indore, 452001, India"
        if (parts.length >= 4) {
          // Method 1: Find pincode index (6-digit number)
          const pincodeIndex = parts.findIndex(part => /^\d{6}$/.test(part))
          
          console.log("📍 Pincode index:", pincodeIndex)
          
          if (pincodeIndex > 1 && pincodeIndex !== -1) {
            // City is 2 positions before pincode, State is 1 position before pincode
            const cityPart = parts[pincodeIndex - 2]
            const statePart = parts[pincodeIndex - 1]
            
            console.log("📍 Extracted from pincode position:", { cityPart, statePart, pincodeIndex })
            
            // Validate: both should be non-empty and not numbers
            if (cityPart && statePart && 
                !cityPart.match(/^\d+$/) && 
                !statePart.match(/^\d+$/) &&
                cityPart.length > 2 && 
                statePart.length > 2) {
              subLocation = `${cityPart}, ${statePart}`
              console.log("✅ Using extracted city/state (pincode method):", subLocation)
            }
          }
          
          // Method 2: If pincode not found or extraction failed, try alternative method
          if (!subLocation && parts.length >= 4) {
            // Last part is usually "India", second last might be pincode
            const lastPart = parts[parts.length - 1]
            const secondLastPart = parts[parts.length - 2]
            
            console.log("📍 Trying India method:", { lastPart, secondLastPart })
            
            // If last part is "India" and second last is pincode (6-digit)
            if (lastPart === "India" && /^\d{6}$/.test(secondLastPart)) {
              // City and state are 3 and 4 positions before "India"
              // Format: "..., New Palasia, Indore, 452001, India"
              // parts[length-1] = "India"
              // parts[length-2] = "452001" (pincode)
              // parts[length-3] = "Indore" (state)
              // parts[length-4] = "New Palasia" (city)
              const cityPart = parts[parts.length - 4]
              const statePart = parts[parts.length - 3]
              
              console.log("📍 Extracted from India position:", { cityPart, statePart })
              
              if (cityPart && statePart && 
                  !cityPart.match(/^\d+$/) && 
                  !statePart.match(/^\d+$/) &&
                  cityPart.length > 2 && 
                  statePart.length > 2) {
                subLocation = `${cityPart}, ${statePart}`
                console.log("✅ Using extracted city/state (India method):", subLocation)
              }
            }
          }
          
          // Method 3: Direct extraction - if we have 8 parts, city and state are at index 4 and 5
          // Format: "Mama Loca, G-2, Princess Center 6/3, Opposite Manpasand Garden, New Palasia, Indore, 452001, India"
          // parts[4] = "New Palasia" (city), parts[5] = "Indore" (state)
          if (!subLocation && parts.length >= 6) {
            // If we have pincode at index 6, city and state are at 4 and 5
            const pincodeIndex = parts.findIndex(part => /^\d{6}$/.test(part))
            if (pincodeIndex === 6 && parts.length >= 7) {
              const cityPart = parts[4]
              const statePart = parts[5]
              
              console.log("📍 Direct extraction (index method):", { cityPart, statePart, pincodeIndex })
              
              if (cityPart && statePart && 
                  !cityPart.match(/^\d+$/) && 
                  !statePart.match(/^\d+$/) &&
                  cityPart.length > 2 && 
                  statePart.length > 2) {
                subLocation = `${cityPart}, ${statePart}`
                console.log("✅ Using extracted city/state (direct index method):", subLocation)
              }
            }
          }
          
          // Method 4: Simple fallback - if we have 6+ parts, always try parts[4] and parts[5]
          // This is the most reliable method for the given address format
          // Format: "Mama Loca, G-2, Princess Center 6/3, Opposite Manpasand Garden, New Palasia, Indore, 452001, India"
          // parts[0] = "Mama Loca", parts[1] = "G-2", parts[2] = "Princess Center 6/3", parts[3] = "Opposite Manpasand Garden"
          // parts[4] = "New Palasia" (city), parts[5] = "Indore" (state)
          if (!subLocation && parts.length >= 6) {
            // Directly use parts[4] and parts[5] - these are ALWAYS city and state for this format
            const cityPart = parts[4]
            const statePart = parts[5]
            
            console.log("📍 Simple fallback (parts[4] and parts[5]):", { 
              cityPart, 
              statePart, 
              partsLength: parts.length,
              allParts: parts
            })
            
            // Less strict validation - just check they're not numbers and not empty
            if (cityPart && statePart && 
                !cityPart.match(/^\d+$/) && 
                !statePart.match(/^\d+$/) &&
                cityPart.length > 1 && 
                statePart.length > 1) {
              subLocation = `${cityPart}, ${statePart}`
              console.log("✅ Using extracted city/state (simple fallback):", subLocation)
            } else {
              console.log("⚠️ Validation failed for parts[4] and parts[5]:", { cityPart, statePart })
            }
          }
        }
      }
      
      // Also try from address field if formattedAddress didn't work
      if (!subLocation && location?.address && location.address !== location?.formattedAddress) {
        const parts = location.address.split(',').map(part => part.trim()).filter(part => part.length > 0)
        console.log("📍 Trying address field:", { address: location.address, parts })
        
        if (parts.length >= 4) {
          const pincodeIndex = parts.findIndex(part => /^\d{6}$/.test(part))
          if (pincodeIndex > 1 && pincodeIndex !== -1) {
            const cityPart = parts[pincodeIndex - 2]
            const statePart = parts[pincodeIndex - 1]
            if (cityPart && statePart && 
                !cityPart.match(/^\d+$/) && 
                !statePart.match(/^\d+$/) &&
                cityPart.length > 2 && 
                statePart.length > 2) {
              subLocation = `${cityPart}, ${statePart}`
              console.log("✅ Using extracted city/state from address field:", subLocation)
            }
          }
        }
      }
      
      // If still empty, leave it empty
      if (!subLocation) {
        subLocation = ""
        console.log("⚠️ Could not extract city/state from address")
      }
    }
    
    // Debug log
    console.log("📍 PageNavbar Location Display:", {
      location: location,
      city: location?.city,
      state: location?.state,
      hasCity,
      hasState,
      mainLocation,
      subLocation,
      formattedAddress: location?.formattedAddress,
      address: location?.address,
      finalSubLocation: subLocation || "EMPTY"
    })
    
    // CRITICAL: Ensure subLocation is NEVER from address parts[1] and parts[2]
    // If subLocation looks like "G-2, Princess Center 6/3", it's wrong - force extraction
    if (subLocation && (subLocation.includes("G-2") || subLocation.includes("Princess Center"))) {
      console.warn("⚠️⚠️⚠️ WRONG subLocation detected:", subLocation)
      console.warn("⚠️ Forcing re-extraction from formattedAddress")
      
      // Force re-extraction
      if (location?.formattedAddress) {
        const parts = location.formattedAddress.split(',').map(part => part.trim()).filter(part => part.length > 0)
        if (parts.length >= 6) {
          const cityPart = parts[4]
          const statePart = parts[5]
          if (cityPart && statePart && 
              !cityPart.match(/^\d+$/) && 
              !statePart.match(/^\d+$/) &&
              cityPart.length > 1 && 
              statePart.length > 1) {
            subLocation = `${cityPart}, ${statePart}`
            console.log("✅✅✅ FORCED extraction - New subLocation:", subLocation)
          }
        }
      }
    }
    
    return {
      main: mainLocation,
      sub: subLocation
    }
  })()

  const mainLocationName = locationDisplay.main
  const subLocationName = locationDisplay.sub

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
                  <span className={`text-md sm:text-lg font-bold ${textColorClass} whitespace-nowrap ${textColor === "white" ? "drop-shadow-lg" : ""}`}>
                    {mainLocationName}
                  </span>
                  <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 ${textColorClass} flex-shrink-0 ${textColor === "white" ? "drop-shadow-lg" : ""}`} strokeWidth={2.5} />
                </div>
                {/* Show sub location (city, state) in second line */}
                {subLocationName && (
                  <span className={`text-xs font-bold ${textColorClass}${textColor === "white" ? "/90" : ""} whitespace-nowrap mt-0.5 ${textColor === "white" ? "drop-shadow-md" : ""}`}>
                    {subLocationName}
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

