import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, ChevronRight, Plus, MapPin, MoreHorizontal, Navigation, Home, Building2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocation as useGeoLocation } from "../hooks/useLocation"
import { useProfile } from "../context/ProfileContext"
import { toast } from "sonner"

// Mock nearby locations data - in production this would come from a maps API
const mockNearbyLocations = [
  {
    id: 1,
    name: "Princess Green View Apartment",
    address: "Lala Banarasilal Dawar Marg, New Palasia, Indore",
    distance: "29 m"
  },
  {
    id: 2,
    name: "Western Business Centre",
    address: "New Palasia, Indore",
    distance: "58 m"
  },
  {
    id: 3,
    name: "Maya Regency",
    address: "New Palasia, Indore",
    distance: "72 m"
  },
  {
    id: 4,
    name: "Hotel Apna Palace",
    address: "New Palasia, Indore",
    distance: "120 m"
  },
  {
    id: 5,
    name: "City Central Mall",
    address: "MG Road, Indore",
    distance: "250 m"
  }
]

// Get icon based on address type/label
const getAddressIcon = (address) => {
  const label = (address.label || address.additionalDetails || "").toLowerCase()
  if (label.includes("home")) return Home
  if (label.includes("work") || label.includes("office")) return Briefcase
  if (label.includes("building") || label.includes("apt")) return Building2
  return Home
}

export default function LocationSelectorOverlay({ isOpen, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [searchValue, setSearchValue] = useState("")
  const [filteredLocations, setFilteredLocations] = useState(mockNearbyLocations)
  const { location, loading, requestLocation } = useGeoLocation()
  const { addresses = [] } = useProfile()

  // Current location display
  const currentLocationText = location?.city && location?.state 
    ? `${location.address || location.city}, ${location.state}`
    : location?.city || "Detecting location..."

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredLocations(mockNearbyLocations)
    } else {
      const filtered = mockNearbyLocations.filter((loc) =>
        loc.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchValue.toLowerCase())
      )
      setFilteredLocations(filtered)
    }
  }, [searchValue])

  const handleUseCurrentLocation = async () => {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast.error("Location services are not supported in your browser", {
          duration: 3000,
        })
        return
      }

      // Show loading toast
      toast.loading("Fetching your current location...", {
        id: "location-request",
      })

      // Request location - this will automatically prompt for permission if needed
      await requestLocation()
      
      // Success toast
      toast.success("Location updated successfully!", {
        id: "location-request",
        duration: 2000,
      })
      
      // Close the location selector after successful location fetch
      onClose()
    } catch (error) {
      // Handle permission denied or other errors
      if (error.code === 1 || error.message?.includes("denied") || error.message?.includes("permission")) {
        toast.error("Location permission denied. Please enable location access in your browser settings.", {
          id: "location-request",
          duration: 4000,
        })
      } else if (error.code === 2 || error.message?.includes("unavailable")) {
        toast.error("Location unavailable. Please check your GPS settings.", {
          id: "location-request",
          duration: 3000,
        })
      } else if (error.code === 3 || error.message?.includes("timeout")) {
        toast.error("Location request timed out. Please try again.", {
          id: "location-request",
          duration: 3000,
        })
      } else {
        toast.error("Failed to get location. Please try again.", {
          id: "location-request",
          duration: 3000,
        })
      }
      // Don't close the selector if there's an error, so user can try other options
    }
  }

  const handleAddAddress = () => {
    onClose()
    navigate("/user/profile/addresses/new")
  }

  const handleSelectSavedAddress = (address) => {
    // Update the location in localStorage with this address
    const locationData = {
      city: address.city,
      state: address.state,
      address: `${address.street}, ${address.city}`,
      zipCode: address.zipCode
    }
    localStorage.setItem("userLocation", JSON.stringify(locationData))
    // Trigger a page reload to refresh the location state
    window.location.reload()
  }

  const handleSelectNearbyLocation = (location) => {
    // For now, just set a basic location - in production this would use geocoding
    const locationData = {
      city: "Indore",
      state: "Madhya Pradesh",
      address: location.name
    }
    localStorage.setItem("userLocation", JSON.stringify(locationData))
    window.location.reload()
  }

  const handleEditAddress = (addressId) => {
    onClose()
    navigate(`/user/profile/addresses/${addressId}/edit`)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-[#0a0a0a]"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 -ml-2"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Select a location</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] px-4 sm:px-6 lg:px-8 py-3 max-w-7xl mx-auto w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-orange z-10" />
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for area, street name..."
            className="pl-12 pr-4 h-12 w-full bg-gray-50 dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 focus:border-primary-orange dark:focus:border-primary-orange rounded-xl text-base dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto w-full">
          {/* Use Current Location */}
          <div
            className="px-4 sm:px-6 lg:px-8 py-2 bg-white dark:bg-[#1a1a1a]"
            style={{ animation: 'slideDown 0.3s ease-out 0.1s both' }}
          >
            <button
              onClick={handleUseCurrentLocation}
              disabled={loading}
              className="w-full flex items-center justify-between py-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-700 dark:text-green-400">Use current location</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Getting location..." : currentLocationText}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>

            {/* Add Address */}
            <button
              onClick={handleAddAddress}
              className="w-full flex items-center justify-between py-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-semibold text-green-700 dark:text-green-400">Add Address</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <div
              className="mt-2"
              style={{ animation: 'slideDown 0.3s ease-out 0.2s both' }}
            >
              <div className="px-4 sm:px-6 lg:px-8 py-3">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                  Saved Addresses
                </h2>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a]">
                {addresses.map((address, index) => {
                  const IconComponent = getAddressIcon(address)
                  return (
                    <div
                      key={address.id}
                      className="px-4 sm:px-6 lg:px-8"
                      style={{ animation: `slideUp 0.3s ease-out ${0.25 + index * 0.05}s both` }}
                    >
                      <div 
                        className={`py-4 ${index !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}
                      >
                        <button
                          onClick={() => handleSelectSavedAddress(address)}
                          className="w-full flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors p-2 -m-2"
                        >
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">0 m</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {address.label || address.additionalDetails || "Home"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {address.street}, {address.city}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Phone number: {address.phone || "+91-761041XXXX"}
                            </p>
                          </div>
                        </button>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3 ml-14">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // More options menu - could show a dropdown
                            }}
                            className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditAddress(address.id)
                            }}
                            className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Navigation className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Nearby Locations Section */}
          <div
            className="mt-2 pb-6"
            style={{ animation: 'slideDown 0.3s ease-out 0.3s both' }}
          >
            <div className="px-4 sm:px-6 lg:px-8 py-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                Nearby Locations
              </h2>
            </div>
            <div className="bg-white dark:bg-[#1a1a1a]">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc, index) => (
                  <div
                    key={loc.id}
                    className="px-4 sm:px-6 lg:px-8"
                    style={{ animation: `slideUp 0.3s ease-out ${0.35 + index * 0.05}s both` }}
                  >
                    <button
                      onClick={() => handleSelectNearbyLocation(loc)}
                      className={`w-full flex items-start gap-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        index !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{loc.distance}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{loc.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{loc.address}</p>
                      </div>
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No locations found for "{searchValue}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}



