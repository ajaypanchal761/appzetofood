import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Lenis from "lenis"
import { ArrowLeft, ChevronDown } from "lucide-react"
import BottomPopup from "@/module/delivery/components/BottomPopup"

const ADDRESS_STORAGE_KEY = "restaurant_address"

// Default coordinates for Indore (can be updated based on actual location)
const DEFAULT_LAT = 22.7196
const DEFAULT_LNG = 75.8577

export default function EditRestaurantAddress() {
  const navigate = useNavigate()
  const [address, setAddress] = useState("Musakhedi, Idrish Nagar, By Pass Road (South), Indore")
  const [restaurantName, setRestaurantName] = useState("Kadhai Chammach Restaurant")
  const [showSelectOptionDialog, setShowSelectOptionDialog] = useState(false)
  const [selectedOption, setSelectedOption] = useState("minor_correction") // "update_address" or "minor_correction"
  const [lat, setLat] = useState(DEFAULT_LAT)
  const [lng, setLng] = useState(DEFAULT_LNG)

  // Load data from localStorage and listen for updates
  useEffect(() => {
    const loadData = () => {
      try {
        const savedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY)
        if (savedAddress) {
          setAddress(savedAddress)
        }

        // Try to get restaurant name from various possible storage keys
        const savedName = localStorage.getItem("restaurant_name") || 
                         localStorage.getItem("restaurantName") ||
                         "Kadhai Chammach Restaurant"
        setRestaurantName(savedName)
      } catch (error) {
        console.error("Error loading data from storage:", error)
      }
    }

    loadData()

    // Listen for address updates
    const handleAddressUpdate = () => {
      loadData()
    }

    window.addEventListener("addressUpdated", handleAddressUpdate)
    return () => window.removeEventListener("addressUpdated", handleAddressUpdate)
  }, [])

  // Lenis smooth scrolling
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
  }, [])

  // Handle opening Google Maps app
  const handleViewOnMap = () => {
    // Create Google Maps URL for the restaurant location
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    
    // Try to open in Google Maps app (mobile) or web
    window.open(googleMapsUrl, "_blank")
  }

  // Handle Update button click
  const handleUpdateClick = () => {
    setShowSelectOptionDialog(true)
  }

  // Handle Proceed to update
  const handleProceedUpdate = () => {
    // Here you would handle the actual update logic based on selectedOption
    if (selectedOption === "update_address") {
      // Navigate to FSSAI update or address update flow
      console.log("Update outlet address (FSSAI required)")
    } else {
      // Handle minor correction
      console.log("Make a minor correction to the location pin")
    }
    
    setShowSelectOptionDialog(false)
    // You can navigate or show success message here
  }

  // Get simplified address for navbar (last two parts: area, city)
  const getSimplifiedAddress = (fullAddress) => {
    const parts = fullAddress.split(",").map(p => p.trim())
    if (parts.length >= 2) {
      // Return last two parts (e.g., "By Pass Road (South), Indore")
      return parts.slice(-2).join(", ")
    }
    return fullAddress
  }
  
  const simplifiedAddress = getSimplifiedAddress(address)

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="text-base font-bold text-gray-900 truncate">{restaurantName}</h1>
            <ChevronDown className="w-4 h-4 text-gray-900 shrink-0" />
          </div>
          <p className="text-xs text-gray-600 truncate">{simplifiedAddress}</p>
        </div>
      </div>

      {/* Map Section - Takes remaining space */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Google Maps Embed */}
        <iframe
          src={`https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
        
        {/* Custom Marker Tooltip Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          {/* Tooltip */}
          <div className="bg-black text-white px-3 py-2 rounded-lg mb-2 whitespace-nowrap shadow-lg">
            <p className="text-xs font-semibold">Your outlet location</p>
            <p className="text-[10px] text-gray-300">Orders will be picked up from here</p>
          </div>
          {/* Marker Pin */}
          <div className="w-6 h-6 bg-black rounded-full border-2 border-white shadow-lg mx-auto"></div>
        </div>

        {/* Address Details Section - Overlays map at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-20 px-4 pt-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">Outlet address</h2>
          
          {/* Informational Banner */}
          <div className="bg-blue-100 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-gray-900">
              Customers and Zomato delivery partners will use this to locate your outlet.
            </p>
          </div>

          {/* Current Address Display */}
          <div className="mb-4">
            <p className="text-base text-gray-900">{address}</p>
          </div>

          {/* Update Button */}
          <div className="pb-4">
            <button
              onClick={handleUpdateClick}
              className="w-full bg-black text-white font-semibold py-4 text-base rounded-lg"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Select Option Bottom Popup */}
      <BottomPopup
        isOpen={showSelectOptionDialog}
        onClose={() => setShowSelectOptionDialog(false)}
        title="Select an option"
        maxHeight="auto"
      >
        <div className=" space-y-0">
          {/* Option 1: Update outlet address */}
          <button
            onClick={() => setSelectedOption("update_address")}
            className="w-full flex items-start justify-between py-4 border-b border-dashed border-gray-300"
          >
            <div className="flex-1 text-left">
              <p className="text-base font-semibold text-gray-900 mb-1">
                Update outlet address (FSSAI required)
              </p>
              <p className="text-sm text-gray-500">{address}</p>
            </div>
            <div className="ml-4 shrink-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === "update_address"
                    ? "border-black bg-black"
                    : "border-gray-300"
                }`}
              >
                {selectedOption === "update_address" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>

          {/* Option 2: Minor correction */}
          <button
            onClick={() => setSelectedOption("minor_correction")}
            className="w-full flex items-start justify-between py-4"
          >
            <div className="flex-1 text-left">
              <p className="text-base font-semibold text-gray-900 mb-1">
                Make a minor correction to the location pin
              </p>
              <p className="text-sm text-gray-500">
                If location pin on the map is slightly misplaced
              </p>
            </div>
            <div className="ml-4 shrink-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === "minor_correction"
                    ? "border-black bg-black"
                    : "border-gray-300"
                }`}
              >
                {selectedOption === "minor_correction" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>

          {/* Proceed Button */}
          <button
            onClick={handleProceedUpdate}
            className="w-full bg-black text-white font-semibold py-4 rounded-lg mt-6"
          >
            Proceed to update
          </button>
        </div>
      </BottomPopup>
    </div>
  )
}
