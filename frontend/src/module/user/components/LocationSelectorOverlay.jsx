import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, ChevronRight, Plus, MapPin, MoreHorizontal, Navigation, Home, Building2, Briefcase, Phone, X, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocation as useGeoLocation } from "../hooks/useLocation"
import { useProfile } from "../context/ProfileContext"
import { toast } from "sonner"
import { locationAPI, userAPI } from "@/lib/api"
import { Loader } from '@googlemaps/js-api-loader'

// Google Maps implementation - Leaflet components removed

// Google Maps implementation - removed Leaflet components

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

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
  const { location, loading, requestLocation } = useGeoLocation()
  const { addresses = [], addAddress, updateAddress, userProfile } = useProfile()
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [mapPosition, setMapPosition] = useState([22.7196, 75.8577]) // Default Indore coordinates [lat, lng]
  const [addressFormData, setAddressFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    additionalDetails: "",
    label: "Home",
    phone: "",
  })
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)
  const mapContainerRef = useRef(null)
  const googleMapRef = useRef(null) // Google Maps instance
  const greenMarkerRef = useRef(null) // Green marker for address selection
  const blueDotCircleRef = useRef(null) // Blue dot for user location
  const [currentAddress, setCurrentAddress] = useState("")
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const reverseGeocodeTimeoutRef = useRef(null) // Debounce timeout for reverse geocoding
  const lastReverseGeocodeCoordsRef = useRef(null) // Track last coordinates to avoid duplicate calls

  // Debug: Log API key status (only first few characters for security)
  useEffect(() => {
    if (GOOGLE_MAPS_API_KEY) {
      console.log("✅ Google Maps API Key loaded:", GOOGLE_MAPS_API_KEY.substring(0, 10) + "...")
    } else {
      console.error("❌ Google Maps API Key NOT found! Check .env file and restart dev server.")
    }
  }, [])

  // Current location display - Show complete formatted address (SAVED ADDRESSES FORMAT)
  // Format should match saved addresses: "B2/4, Gandhi Park Colony, Anand Nagar, Indore, Madhya Pradesh, 452001"
  // Show ALL parts of formattedAddress (like saved addresses show all parts)
  const currentLocationText = (() => {
    // Priority 1: Use formattedAddress (complete detailed address) - SAVED ADDRESSES FORMAT
    // Show full address with all parts (street, area, city, state, pincode) - just like saved addresses
    if (location?.formattedAddress && 
        location.formattedAddress !== "Select location" &&
        !location.formattedAddress.match(/^-?\d+\.\d+,\s*-?\d+\.\d+$/)) {
      // Remove "India" from the end if present (saved addresses don't show country)
      let fullAddress = location.formattedAddress
      if (fullAddress.endsWith(', India')) {
        fullAddress = fullAddress.replace(', India', '').trim()
      }
      
      // Show complete address - ALL parts (like saved addresses format)
      // Saved addresses format: "additionalDetails, street, city, state, zipCode"
      // Current location format: "POI, Building, Floor, Area, City, State, Pincode"
      return fullAddress
    }
    
    // Priority 2: Build address from components (SAVED ADDRESSES FORMAT)
    // Format: "street/area, city, state, pincode" (matching saved addresses)
    if (location?.address || location?.area || location?.street) {
      const addressParts = []
      
      // Add street/address/area (like saved addresses' additionalDetails + street)
      if (location.address && location.address !== "Select location") {
        addressParts.push(location.address)
      } else if (location.area) {
        addressParts.push(location.area)
      } else if (location.street) {
        addressParts.push(location.street)
      }
      
      // Add city
      if (location.city) {
        addressParts.push(location.city)
      }
      
      // Add state
      if (location.state) {
        addressParts.push(location.state)
      }
      
      // Add pincode (like saved addresses show zipCode)
      if (location.postalCode) {
        addressParts.push(location.postalCode)
      }
      
      if (addressParts.length > 0) {
        return addressParts.join(', ')
      }
    }
    
    // Priority 3: Use area + city + state + pincode
    if (location?.area && location?.city && location?.state) {
      const parts = [location.area, location.city, location.state]
      if (location.postalCode) {
        parts.push(location.postalCode)
      }
      return parts.join(', ')
    }
    
    // Priority 4: Fallback to city + state + pincode
    if (location?.city && location?.state) {
      const parts = [location.city, location.state]
      if (location.postalCode) {
        parts.push(location.postalCode)
      }
      return parts.join(', ')
    }
    
    // Final fallback
    return location?.city || location?.area || "Detecting location..."
  })()

  // Global error suppression for Ola Maps SDK errors (runs on component mount)
  useEffect(() => {
    // Suppress console errors for non-critical Ola Maps SDK errors
    const originalConsoleError = console.error
    const errorSuppressor = (...args) => {
      const errorStr = args.join(' ')
      // Suppress AbortError and sprite file errors from Ola Maps SDK
      if (errorStr.includes('AbortError') || 
          errorStr.includes('user aborted') ||
          errorStr.includes('sprite@2x.json') ||
          errorStr.includes('3d_model') ||
          (errorStr.includes('Source layer') && errorStr.includes('does not exist')) ||
          (errorStr.includes('AJAXError') && errorStr.includes('sprite')) ||
          (errorStr.includes('AJAXError') && errorStr.includes('olamaps.io'))) {
        // Silently ignore these non-critical errors
        return
      }
      // Log other errors normally
      originalConsoleError.apply(console, args)
    }
    
    // Replace console.error globally
    console.error = errorSuppressor
    
    // Handle unhandled promise rejections
    const unhandledRejectionHandler = (event) => {
      const error = event.reason || event
      const errorMsg = error?.message || String(error) || ''
      const errorName = error?.name || ''
      const errorStack = error?.stack || ''
      
      // Suppress non-critical errors from Ola Maps SDK
      if (errorName === 'AbortError' || 
          errorMsg.includes('AbortError') || 
          errorMsg.includes('user aborted') ||
          errorMsg.includes('3d_model') ||
          (errorMsg.includes('Source layer') && errorMsg.includes('does not exist')) ||
          (errorMsg.includes('AJAXError') && (errorMsg.includes('sprite') || errorMsg.includes('olamaps.io'))) ||
          errorStack.includes('olamaps-web-sdk')) {
        event.preventDefault() // Prevent error from showing in console
        return
      }
    }
    
    window.addEventListener('unhandledrejection', unhandledRejectionHandler)
    
    // Cleanup
    return () => {
      // Restore original console.error
      console.error = originalConsoleError
      // Remove event listener
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
    }
  }, []) // Run once on mount

  // Initialize map position from current location
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setMapPosition([location.latitude, location.longitude])
      // Update map center if Google Maps is initialized
      if (googleMapRef.current) {
        googleMapRef.current.setCenter({
          lat: location.latitude,
          lng: location.longitude
        })
        // Update green marker position
        if (greenMarkerRef.current) {
          greenMarkerRef.current.setPosition({
            lat: location.latitude,
            lng: location.longitude
          })
        }
      }
    }
  }, [location?.latitude, location?.longitude])

  // Initialize Google Maps with Loader (ZOMATO-STYLE)
  useEffect(() => {
    if (!showAddressForm || !mapContainerRef.current || !GOOGLE_MAPS_API_KEY) {
      return
    }

    let isMounted = true
    setMapLoading(true)

    const initializeGoogleMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places", "geocoding"]
        })

        const google = await loader.load()
        
        if (!isMounted || !mapContainerRef.current) return

        // Initial location (Indore center or current location)
        const initialLocation = location?.latitude && location?.longitude
          ? { lat: location.latitude, lng: location.longitude }
          : { lat: 22.7196, lng: 75.8577 }

        // Create map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialLocation,
          zoom: 15,
          disableDefaultUI: true, // Zomato-style clean look
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })

        googleMapRef.current = map

        // Create Green Marker (draggable for address selection)
        const greenMarker = new google.maps.Marker({
          position: initialLocation,
          map: map,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          },
          draggable: true,
          title: "Drag to select location"
        })

        greenMarkerRef.current = greenMarker

        // Handle marker drag - update address
        google.maps.event.addListener(greenMarker, 'dragend', function() {
          const newPos = greenMarker.getPosition()
          const newLat = newPos.lat()
          const newLng = newPos.lng()
          setMapPosition([newLat, newLng])
          handleMapMoveEnd(newLat, newLng)
        })

        // Get user's current location and show Blue Dot
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!isMounted) return
              
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }

              // Create Blue Dot (Circle) for user location
              const blueDot = new google.maps.Circle({
                strokeColor: "#4285F4",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#4285F4",
                fillOpacity: 0.35,
                map: map,
                center: userPos,
                radius: 10 // Small blue dot
              })

              blueDotCircleRef.current = blueDot

              // Center map on user location
              map.setCenter(userPos)
              greenMarker.setPosition(userPos)
              setMapPosition([userPos.lat, userPos.lng])
              
              // Fetch address for user location
              handleMapMoveEnd(userPos.lat, userPos.lng)
            },
            (error) => {
              console.warn("Geolocation error:", error)
              // Still fetch address for initial location
              handleMapMoveEnd(initialLocation.lat, initialLocation.lng)
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          )
        } else {
          // Fetch address for initial location if geolocation not available
          handleMapMoveEnd(initialLocation.lat, initialLocation.lng)
        }

        setMapLoading(false)
      } catch (error) {
        console.error("Error initializing Google Maps:", error)
        setMapLoading(false)
        toast.error("Failed to load map. Please refresh the page.")
      }
    }

    initializeGoogleMap()

    return () => {
      isMounted = false
      // Cleanup markers
      if (greenMarkerRef.current) {
        greenMarkerRef.current.setMap(null)
      }
      if (blueDotCircleRef.current) {
        blueDotCircleRef.current.setMap(null)
      }
    }
  }, [showAddressForm, GOOGLE_MAPS_API_KEY, location?.latitude, location?.longitude])

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
      // Clear any cached location first to ensure fresh coordinates
      console.log("🔄 Requesting fresh location (clearing cache and forcing fresh GPS)...")
      
      // Force fresh location with high accuracy GPS
      // This ensures we get exact landmark like "Mama Loca Cafe" instead of just city
      const locationData = await requestLocation()
      
      console.log("✅ Fresh location received:", {
        formattedAddress: locationData?.formattedAddress,
        address: locationData?.address,
        city: locationData?.city,
        state: locationData?.state,
        area: locationData?.area,
        coordinates: locationData?.latitude && locationData?.longitude ? 
          `${locationData.latitude.toFixed(8)}, ${locationData.longitude.toFixed(8)}` : "N/A",
        hasCompleteAddress: locationData?.formattedAddress && 
          locationData.formattedAddress.split(',').length >= 4
      })
      
      // Verify we got complete address
      if (!locationData?.formattedAddress || 
          locationData.formattedAddress === "Select location" ||
          locationData.formattedAddress.split(',').length < 4) {
        console.warn("⚠️ Location received but address is incomplete. Retrying with force refresh...")
        // Retry once more with explicit force refresh
        const retryLocation = await requestLocation()
        if (retryLocation?.formattedAddress && retryLocation.formattedAddress.split(',').length >= 4) {
          Object.assign(locationData, retryLocation)
          console.log("✅ Retry successful - got complete address:", retryLocation.formattedAddress)
        } else {
          console.warn("⚠️ Retry also returned incomplete address. This might be due to:")
          console.warn("   1. GPS coordinates not accurate (network-based location)");
          console.warn("   2. Location is on a road/street without specific building");
          console.warn("   3. Try on mobile device for better GPS accuracy");
        }
      }
      
      // CRITICAL: Ensure location state is updated in the hook
      // The requestLocation function already updates the state, but we verify here
      console.log("✅✅✅ Final location data to be saved:", {
        formattedAddress: locationData?.formattedAddress,
        address: locationData?.address,
        mainTitle: locationData?.mainTitle,
        hasCompleteAddress: locationData?.formattedAddress && 
          locationData.formattedAddress.split(',').length >= 4
      })
      
      // Save location to backend with ALL fields
      if (locationData?.latitude && locationData?.longitude) {
        try {
          await userAPI.updateLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            address: locationData.address || locationData.formattedAddress || "",
            city: locationData.city || "",
            state: locationData.state || "",
            area: locationData.area || "",
            formattedAddress: locationData.formattedAddress || locationData.address || "",
            accuracy: locationData.accuracy,
            postalCode: locationData.postalCode,
            street: locationData.street,
            streetNumber: locationData.streetNumber
          })
          console.log("✅ Location saved to backend successfully")
        } catch (backendError) {
          // Only log non-network errors (network errors are handled by axios interceptor)
          if (backendError.code !== 'ERR_NETWORK' && backendError.message !== 'Network Error') {
            console.error("Error saving location to backend:", backendError)
          }
          // Don't fail the whole operation if backend save fails
        }
      }
      
      // Success toast with address preview
      const addressPreview = locationData?.formattedAddress || locationData?.address || "Location updated"
      toast.success(`Location updated: ${addressPreview.split(',').slice(0, 2).join(', ')}`, {
        id: "location-request",
        duration: 3000,
      })
      
      // Wait a moment for state to update, then close
      setTimeout(() => {
      onClose()
      }, 500)
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
    setShowAddressForm(true)
    // Initialize form with current location data
    if (location?.latitude && location?.longitude) {
      setMapPosition([location.latitude, location.longitude])
      setAddressFormData(prev => ({
        ...prev,
        city: location.city || "",
        state: location.state || "",
        street: location.address || location.area || "",
        phone: userProfile?.phone || "",
      }))
    }
  }

  const handleAddressFormChange = (e) => {
    setAddressFormData({
      ...addressFormData,
      [e.target.name]: e.target.value,
    })
  }

  // Google Maps loading is handled by the Loader in the initialization useEffect above

  // OLD OLA MAPS INITIALIZATION - REMOVED (Replaced with Google Maps Loader above)
  // All old Ola Maps/Leaflet code has been removed and replaced with Google Maps Loader implementation
  
  // Removed old useEffect that initialized Ola Maps - now using Google Maps Loader above
  // All old Ola Maps initialization code has been removed

  // Resize Google Map when container dimensions change
  useEffect(() => {
    if (googleMapRef.current && showAddressForm) {
      const resizeMap = () => {
        try {
          if (googleMapRef.current && typeof window.google !== 'undefined' && window.google.maps) {
            window.google.maps.event.trigger(googleMapRef.current, 'resize');
            console.log("✅ Google Map resized (container change)");
          }
        } catch (error) {
          console.warn("⚠️ Error resizing map:", error);
        }
      };

      const timer = setTimeout(() => {
        resizeMap();
      }, 300);

      window.addEventListener('resize', resizeMap);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', resizeMap);
      }
    }
  }, [showAddressForm])

  // Track user's live location with blue dot indicator
  const trackUserLocation = (mapInstance, sdkInstance) => {
    if (!navigator.geolocation) {
      console.warn("⚠️ Geolocation is not supported by this browser")
      return
    }

    console.log("🔵🔵🔵 STARTING USER LOCATION TRACKING...")
    console.log("🔵 Map instance:", mapInstance)
    console.log("🔵 SDK instance:", sdkInstance)
    console.log("🔵 SDK instance type:", typeof sdkInstance)
    console.log("🔵 SDK instance keys:", sdkInstance ? Object.keys(sdkInstance).slice(0, 20) : 'null')
    console.log("🔵 Has addMarker:", !!(sdkInstance && sdkInstance.addMarker))
    console.log("🔵 Has Marker:", !!(sdkInstance && sdkInstance.Marker))

    // Clear any existing watchPosition
    if (watchPositionIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current)
      watchPositionIdRef.current = null
    }

    // Helper function to calculate distance between two coordinates (in meters)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3 // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180
      const φ2 = lat2 * Math.PI / 180
      const Δφ = (lat2 - lat1) * Math.PI / 180
      const Δλ = (lon2 - lon1) * Math.PI / 180

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

      return R * c // Distance in meters
    }

    // Helper function to create/update marker (with throttling)
    const createOrUpdateMarker = (latitude, longitude, heading) => {
      // Check if location changed significantly (at least 10 meters)
      if (lastUserLocationRef.current) {
        const distance = calculateDistance(
          lastUserLocationRef.current.latitude,
          lastUserLocationRef.current.longitude,
          latitude,
          longitude
        )
        
        // If distance is less than 10 meters, skip update (unless it's the first time)
        if (distance < 10) {
          // Only log occasionally to avoid console spam
          if (Math.random() < 0.1) { // Log 10% of skipped updates
            console.log(`⏭️ Skipping location update - only moved ${distance.toFixed(2)}m (threshold: 10m)`)
          }
          return
        }
        
        console.log(`📍 Location changed by ${distance.toFixed(2)}m - updating marker`)
      }
      
      // Update last location
      lastUserLocationRef.current = { latitude, longitude, heading }
      
      // 1. Custom Blue Dot Element Banana
      let el = null
      if (userLocationMarkerRef.current) {
        // If marker exists, get its element
        el = userLocationMarkerRef.current.getElement?.() || 
             userLocationMarkerRef.current._element ||
             document.querySelector('.user-location-marker')
      }

      if (!el) {
        el = document.createElement('div')
        el.className = 'user-location-marker'
        // Ensure element is visible with inline styles (same pattern as green pin)
        el.style.cssText = `
          width: 20px;
          height: 20px;
          background-color: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1001;
          display: block;
          visibility: visible;
          opacity: 1;
          cursor: default;
        `
        console.log("✅ Created blue dot element with styles")
      } else {
        // Ensure existing element styles are correct
        el.style.display = 'block'
        el.style.visibility = 'visible'
        el.style.opacity = '1'
        el.style.zIndex = '1001'
      }

      // 2. Agar marker pehle se hai to update karein, nahi to naya banayein
      if (userLocationMarkerRef.current) {
        try {
          if (userLocationMarkerRef.current.setLngLat) {
            userLocationMarkerRef.current.setLngLat([longitude, latitude])
            console.log("✅ Updated existing marker position")
          } else if (userLocationMarkerRef.current.setPosition) {
            userLocationMarkerRef.current.setPosition([longitude, latitude])
            console.log("✅ Updated existing marker position (setPosition)")
          } else {
            console.warn("⚠️ Marker exists but no update method found")
          }
        } catch (error) {
          console.error("❌ Error updating user location marker:", error)
        }
      } else {
        try {
          // Try different marker creation methods - EXACT SAME PATTERN AS GREEN PIN
          let newMarker = null
          
          console.log("🔵 Creating blue dot marker with:", {
            hasSdkInstance: !!sdkInstance,
            hasMapInstance: !!mapInstance,
            sdkAddMarker: !!(sdkInstance && sdkInstance.addMarker),
            sdkMarker: !!(sdkInstance && sdkInstance.Marker),
            element: !!el
          })
          
          // Method 1: Try SDK's addMarker method (EXACT SAME AS GREEN PIN)
          if (sdkInstance && sdkInstance.addMarker) {
            console.log("🔵 Method 1: Using sdkInstance.addMarker (same as green pin)")
            try {
              newMarker = sdkInstance.addMarker({
                element: el,
                anchor: 'center',
                draggable: false
              }).setLngLat([longitude, latitude]).addTo(mapInstance)
              console.log("✅✅✅ Blue dot created using addMarker method:", newMarker)
            } catch (err) {
              console.error("❌ Error in addMarker:", err)
            }
          }
          // Method 2: Try SDK's Marker class (EXACT SAME AS GREEN PIN)
          else if (sdkInstance && sdkInstance.Marker) {
            console.log("🔵 Method 2: Using sdkInstance.Marker (same as green pin)")
            try {
              newMarker = new sdkInstance.Marker({
                element: el,
                anchor: 'center',
                draggable: false
              }).setLngLat([longitude, latitude]).addTo(mapInstance)
              console.log("✅✅✅ Blue dot created using Marker class:", newMarker)
            } catch (err) {
              console.error("❌ Error in Marker constructor:", err)
            }
          }
          // Method 3: Try using MapLibre Marker (fallback - same as green pin)
          else if (window.maplibregl && window.maplibregl.Marker) {
            console.log("🔵 Method 3: Using maplibregl.Marker (fallback)")
            try {
              newMarker = new window.maplibregl.Marker({
                element: el,
                anchor: 'center'
              }).setLngLat([longitude, latitude]).addTo(mapInstance)
              console.log("✅ Blue dot created using maplibregl.Marker")
            } catch (err) {
              console.error("❌ Error in maplibregl.Marker:", err)
            }
          }
          else {
            console.error("❌❌❌ NO MARKER API FOUND for blue dot. Available:", {
              sdkInstance: !!sdkInstance,
              sdkAddMarker: !!(sdkInstance && sdkInstance.addMarker),
              sdkMarker: !!(sdkInstance && sdkInstance.Marker),
              maplibregl: !!window.maplibregl,
              mapInstance: !!mapInstance,
              elementCreated: !!el
            })
          }

          if (newMarker) {
            userLocationMarkerRef.current = newMarker
            console.log("✅ User location marker (blue dot) added successfully:", newMarker)
            
            // Verify blue dot is visible (same pattern as green pin)
            setTimeout(() => {
              const markerEl = newMarker.getElement?.() || newMarker._element
              if (markerEl) {
                console.log("✅ Blue dot element found on map:", markerEl)
                // Ensure element is visible (same as green pin)
                markerEl.style.display = 'block'
                markerEl.style.visibility = 'visible'
                markerEl.style.opacity = '1'
                markerEl.style.zIndex = '1001'
                console.log("✅ Blue dot visibility ensured")
                
                // Also check the inner element (the actual blue dot div)
                const innerEl = markerEl.querySelector('.user-location-marker') || markerEl
                if (innerEl) {
                  innerEl.style.display = 'block'
                  innerEl.style.visibility = 'visible'
                  innerEl.style.opacity = '1'
                  console.log("✅ Blue dot inner element styles ensured")
                }
              } else {
                console.warn("⚠️ Blue dot element not found in DOM")
              }
            }, 500)
            
            // Additional check after 1 second
            setTimeout(() => {
              const markerEl = newMarker.getElement?.() || newMarker._element
              if (markerEl) {
                const computedStyle = window.getComputedStyle(markerEl)
                console.log("🔍 Blue dot computed styles:", {
                  display: computedStyle.display,
                  visibility: computedStyle.visibility,
                  opacity: computedStyle.opacity,
                  zIndex: computedStyle.zIndex
                })
              }
            }, 1000)
            
            // Don't auto-fly to user location - let green pin stay at center
            // User can use "Use current location" button if needed
          } else {
            console.error("❌ Failed to create blue dot marker - all methods failed")
            console.error("🔍 Debug info:", {
              sdkInstance: !!sdkInstance,
              mapInstance: !!mapInstance,
              element: !!el,
              sdkAddMarker: !!(sdkInstance && sdkInstance.addMarker),
              sdkMarker: !!(sdkInstance && sdkInstance.Marker)
            })
          }
        } catch (markerError) {
          console.error("❌ Could not create user location marker:", markerError)
          console.error("Error details:", {
            message: markerError.message,
            stack: markerError.stack,
            name: markerError.name
          })
        }
      }

      // 3. Arrow Direction (Heading) agar available ho
      // Heading is in degrees (0-360), where 0 is North
      if (heading !== null && heading !== undefined && !isNaN(heading)) {
        el.style.transform = `rotate(${heading}deg)`
      } else {
        // Reset transform if no heading
        el.style.transform = 'rotate(0deg)'
      }
    }

    // First, try to get current position immediately
    // Use a small delay to ensure map is fully ready
    console.log("🔵 About to request geolocation...")
    setTimeout(() => {
      console.log("🔵 Requesting geolocation with getCurrentPosition...")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords
          console.log("📍📍📍 Initial location received:", { latitude, longitude, heading })
          console.log("🔵 Calling createOrUpdateMarker with:", { latitude, longitude, heading })
          createOrUpdateMarker(latitude, longitude, heading)
          
          // Then start watching for updates (with throttling)
          watchPositionIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude, heading } = position.coords
              
              // Clear any pending update
              if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current)
              }
              
              // Throttle updates - only process after 2 seconds of no new updates
              locationUpdateTimeoutRef.current = setTimeout(() => {
                // Only log significant updates to avoid console spam
                if (!lastUserLocationRef.current || 
                    calculateDistance(
                      lastUserLocationRef.current.latitude,
                      lastUserLocationRef.current.longitude,
                      latitude,
                      longitude
                    ) >= 10) {
                  console.log("📍 Location update (throttled):", { latitude, longitude, heading })
                }
                createOrUpdateMarker(latitude, longitude, heading)
              }, 2000) // Wait 2 seconds before processing update
            },
            (error) => {
              // Suppress timeout errors - they're non-critical and will retry
              if (error.code === 3) {
                // Timeout - silently ignore, will retry automatically
                return
              } else if (error.code === 1) {
                console.warn("⚠️ Location permission denied by user")
              } else if (error.code === 2) {
                console.warn("⚠️ Location unavailable")
              }
              // Don't log timeout errors repeatedly
            },
            { 
              enableHighAccuracy: false, // Less strict for better compatibility
              timeout: 30000, // Longer timeout (30 seconds)
              maximumAge: 60000 // Allow cached location up to 1 minute old
            }
          )
          console.log("✅ watchPosition started, ID:", watchPositionIdRef.current)
        },
        (error) => {
          // Suppress timeout errors - they're non-critical
          if (error.code === 3) {
            // Timeout - try to use cached location or continue without location
            console.warn("⚠️ Location request timeout - will retry or use cached location")
            
            // Try to get cached location from localStorage
            try {
              const cachedLocation = localStorage.getItem("userLocation")
              if (cachedLocation) {
                const location = JSON.parse(cachedLocation)
                if (location.latitude && location.longitude) {
                  console.log("📍 Using cached location due to timeout:", location)
                  createOrUpdateMarker(location.latitude, location.longitude, null)
                }
              }
            } catch (cacheError) {
              // Ignore cache errors
            }
          } else if (error.code === 1) {
            console.warn("⚠️ Location permission denied")
          } else if (error.code === 2) {
            console.warn("⚠️ Location unavailable")
          } else {
            // Only log non-timeout errors
            console.warn("⚠️ Location error (code:", error.code + "):", error.message)
          }
          
          // Even if initial location fails, try watchPosition with less strict options
          watchPositionIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude, heading } = position.coords
              
              // Clear any pending update
              if (locationUpdateTimeoutRef.current) {
                clearTimeout(locationUpdateTimeoutRef.current)
              }
              
              // Throttle updates - only process after 2 seconds of no new updates
              locationUpdateTimeoutRef.current = setTimeout(() => {
                // Only log significant updates to avoid console spam
                if (!lastUserLocationRef.current || 
                    calculateDistance(
                      lastUserLocationRef.current.latitude,
                      lastUserLocationRef.current.longitude,
                      latitude,
                      longitude
                    ) >= 10) {
                  console.log("📍 Location update (after initial error, throttled):", { latitude, longitude, heading })
                }
                createOrUpdateMarker(latitude, longitude, heading)
              }, 2000) // Wait 2 seconds before processing update
            },
            (error) => {
              // Suppress timeout errors in watchPosition too
              if (error.code === 3) {
                // Timeout - silently ignore, will retry
                return
              } else if (error.code === 1) {
                console.warn("⚠️ Please enable location permission in browser settings")
              }
              // Don't log other errors repeatedly
            },
            { 
              enableHighAccuracy: false, // Less strict for better compatibility
              timeout: 30000, // Longer timeout
              maximumAge: 60000 // Allow cached location up to 1 minute old
            }
          )
          console.log("✅ watchPosition started (fallback), ID:", watchPositionIdRef.current)
        },
        { 
          enableHighAccuracy: false, // Less strict for better compatibility
          timeout: 30000, // Longer timeout (30 seconds)
          maximumAge: 60000 // Allow cached location up to 1 minute old
        }
      )
    }, 500) // Small delay to ensure map is ready
    
    console.log("✅ watchPosition started, ID:", watchPositionIdRef.current)
  }

  const handleMapMoveEnd = async (lat, lng) => {
    // Round coordinates to 6 decimal places (about 10cm precision) to avoid duplicate calls
    const roundedLat = parseFloat(lat.toFixed(6))
    const roundedLng = parseFloat(lng.toFixed(6))
    
    // Check if this is the same location as last call
    if (lastReverseGeocodeCoordsRef.current) {
      const lastLat = parseFloat(lastReverseGeocodeCoordsRef.current.lat.toFixed(6))
      const lastLng = parseFloat(lastReverseGeocodeCoordsRef.current.lng.toFixed(6))
      if (lastLat === roundedLat && lastLng === roundedLng) {
        console.log("⏭️ Skipping reverse geocode - same coordinates as last call")
        return
      }
    }
    
    // Clear any pending timeout
    if (reverseGeocodeTimeoutRef.current) {
      clearTimeout(reverseGeocodeTimeoutRef.current)
    }
    
    // Debounce: Wait 300ms before making the API call
    reverseGeocodeTimeoutRef.current = setTimeout(async () => {
      // Update last coordinates
      lastReverseGeocodeCoordsRef.current = { lat: roundedLat, lng: roundedLng }
      
      setLoadingAddress(true)
      try {
        console.log("🔍 Reverse geocoding for coordinates:", { lat: roundedLat, lng: roundedLng })
        console.log("🔍 Coordinates precision:", { 
          lat: roundedLat.toFixed(8), 
          lng: roundedLng.toFixed(8) 
        })
      
      // Use backend API for reverse geocoding (which uses Ola Maps)
      const response = await locationAPI.reverseGeocode(roundedLat, roundedLng)
      console.log("📦 Full reverse geocode response:", JSON.stringify(response?.data, null, 2))
      
      // Backend returns: { success: true, data: { results: [{ formatted_address, address_components: { city, state, area } }] } }
      const backendData = response?.data?.data
      const result = backendData?.results?.[0] || backendData?.result?.[0] || null
      
      if (result) {
        console.log("📦 Parsed result:", result)
        
        // Extract formatted address (e.g., "New Palasia, Indore, Madhya Pradesh")
        const formattedAddress = result.formatted_address || result.formattedAddress || ""
        
        // Extract address components (backend already processes these)
        const addressComponents = result.address_components || {}
        
        // Get city, state, area from address_components (backend extracts these)
        let city = addressComponents.city || ""
        let state = addressComponents.state || ""
        let area = addressComponents.area || ""
        
        // Helper function to intelligently extract city and state from formatted address
        const extractCityStateFromFormattedAddress = (formattedAddr) => {
          if (!formattedAddr) return { city: "", state: "" }
          
          const parts = formattedAddr.split(',').map(p => p.trim()).filter(p => p.length > 0)
          if (parts.length < 2) return { city: "", state: "" }
          
          // Common Indian state names (for pattern matching)
          const stateNames = [
            "Madhya Pradesh", "Uttar Pradesh", "Maharashtra", "Gujarat", "Rajasthan",
            "Karnataka", "Tamil Nadu", "West Bengal", "Odisha", "Bihar", "Andhra Pradesh",
            "Telangana", "Kerala", "Punjab", "Haryana", "Jharkhand", "Assam", "Himachal Pradesh",
            "Uttarakhand", "Chhattisgarh", "Goa", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
            "Sikkim", "Tripura", "Arunachal Pradesh", "Delhi", "Jammu and Kashmir", "Ladakh"
          ]
          
          // Common Indian city names (for pattern matching)
          const cityNames = [
            "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
            "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore",
            "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana"
          ]
          
          let foundCity = ""
          let foundState = ""
          
          // Search from end to beginning (city and state usually at the end)
          for (let i = parts.length - 1; i >= 0; i--) {
            const part = parts[i]
            const partLower = part.toLowerCase()
            
            // Skip if it's a number (pincode) or "India"
            if (part.match(/^\d+$/) || partLower === "india") continue
            
            // Check if it's a state name
            if (!foundState) {
              const matchingState = stateNames.find(s => 
                partLower === s.toLowerCase() || 
                partLower.includes(s.toLowerCase()) ||
                s.toLowerCase().includes(partLower)
              )
              if (matchingState) {
                foundState = matchingState
                continue
              }
            }
            
            // Check if it's a city name (usually comes before state)
            if (!foundCity && i < parts.length - 1) {
              const matchingCity = cityNames.find(c => 
                partLower === c.toLowerCase() || 
                partLower.includes(c.toLowerCase()) ||
                c.toLowerCase().includes(partLower)
              )
              if (matchingCity) {
                foundCity = matchingCity
                continue
              }
              
              // If no exact match, check if it's a single word and looks like a city name
              // (not too long, not a number, doesn't contain common non-city words)
              if (part.split(' ').length <= 2 && 
                  part.length > 2 && 
                  part.length < 30 &&
                  !part.match(/^\d+/) &&
                  !partLower.includes("near") &&
                  !partLower.includes("sector") &&
                  !partLower.includes("colony") &&
                  !partLower.includes("road") &&
                  !partLower.includes("street") &&
                  !partLower.includes("nursing") &&
                  !partLower.includes("home")) {
                // Likely a city name
                foundCity = part
              }
            }
          }
          
          return { city: foundCity, state: foundState }
        }
        
        // If city or state from backend seems wrong, try to extract from formatted address
        // Check if city/state from backend are reasonable
        const cityFromBackend = city.toLowerCase()
        const stateFromBackend = state.toLowerCase()
        
        // If city contains words like "near", "sector", "colony", it's probably wrong
        const citySeemsWrong = city && (
          cityFromBackend.includes("near") ||
          cityFromBackend.includes("sector") ||
          cityFromBackend.includes("colony") ||
          cityFromBackend.includes("nursing") ||
          cityFromBackend.includes("home") ||
          cityFromBackend.includes("f111") ||
          city.length > 30 // Too long to be a city name
        )
        
        // If state contains words like "sector", "colony", it's probably wrong
        const stateSeemsWrong = state && (
          stateFromBackend.includes("sector") ||
          stateFromBackend.includes("colony") ||
          stateFromBackend.includes("near") ||
          state.length > 30 // Too long to be a state name
        )
        
        // If backend values seem wrong, extract from formatted address
        if (citySeemsWrong || stateSeemsWrong || !city || !state) {
          console.log("🔍 Backend city/state seem incorrect, extracting from formatted address:", {
            cityFromBackend: city,
            stateFromBackend: state,
            citySeemsWrong,
            stateSeemsWrong
          })
          
          const extracted = extractCityStateFromFormattedAddress(formattedAddress)
          if (extracted.city && (citySeemsWrong || !city)) {
            city = extracted.city
            console.log("✅ Extracted city from formatted address:", city)
          }
          if (extracted.state && (stateSeemsWrong || !state)) {
            state = extracted.state
            console.log("✅ Extracted state from formatted address:", state)
          }
        }
        
        // Extract street from formatted address (first part before comma)
        // Format: "New Palasia, Indore, Madhya Pradesh" -> street = "New Palasia"
        // OR: "F111, Near Tejas Nursing Home, Sector F" -> street = "F111"
        let street = ""
        if (formattedAddress) {
          const parts = formattedAddress.split(',').map(p => p.trim()).filter(p => p.length > 0)
          if (parts.length > 0) {
            // First part is usually the street/area
            street = parts[0]
          }
        }
        
        // If no street from formatted address, try to use area
        if (!street && area) {
          street = area
        }
        
        // Get zip code
        const zipCode = addressComponents.pincode || 
                        addressComponents.postal_code || 
                        addressComponents.postalCode ||
                        ""
        
        console.log("✅ Final extracted address components:", { 
          formattedAddress, 
          street, 
          city, 
          state, 
          area,
          zipCode,
          addressComponentsFromBackend: {
            city: addressComponents.city,
            state: addressComponents.state,
            area: addressComponents.area
          }
        })
        
        // Update current address display
        setCurrentAddress(formattedAddress || `${roundedLat.toFixed(6)}, ${roundedLng.toFixed(6)}`)
        
        // Update form data
        // Store full formatted address in additionalDetails (Address details field) - this is what user sees
        // Priority: formattedAddress > street + city + state > area
        const fullAddressForField = formattedAddress || 
                                    (street && city && state ? `${street}, ${city}, ${state}` : '') || 
                                    (area ? area : '') ||
                                    ''
        
        setAddressFormData(prev => ({
          ...prev,
          street: street || prev.street,
          city: city || prev.city,
          state: state || prev.state,
          zipCode: zipCode || prev.zipCode,
          additionalDetails: fullAddressForField || prev.additionalDetails, // Store full address in Address details field
        }))
      } else {
        console.warn("⚠️ No address data in response")
        console.warn("Response structure:", {
          hasData: !!response?.data,
          hasDataData: !!response?.data?.data,
          hasResults: !!response?.data?.data?.results,
          keys: response?.data ? Object.keys(response.data) : []
        })
        setCurrentAddress(`${roundedLat.toFixed(6)}, ${roundedLng.toFixed(6)}`)
      }
    } catch (error) {
      console.error("❌ Error reverse geocoding:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      setCurrentAddress(`${roundedLat.toFixed(6)}, ${roundedLng.toFixed(6)}`)
      // Don't show error toast, just use coordinates
    } finally {
      setLoadingAddress(false)
    }
      }, 300) // 300ms debounce delay
  }

  const handleUseCurrentLocationForAddress = async () => {
    try {
      if (!navigator.geolocation) {
        toast.error("Location services are not supported")
        return
      }

      toast.loading("Getting your fresh location...", { id: "current-location" })
      
      // Force fresh location - don't use cached coordinates
      const locationData = await requestLocation(true, true) // forceFresh = true, updateDB = true
      console.log("📍 Current location data received (fresh):", locationData)
      
      if (!locationData?.latitude || !locationData?.longitude) {
        toast.error("Could not get your location. Please try again.", { id: "current-location" })
        return
      }

      const lat = parseFloat(locationData.latitude)
      const lng = parseFloat(locationData.longitude)
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error("Invalid location coordinates", { id: "current-location" })
        return
      }

      console.log("📍 Setting map position to:", [lat, lng])
      console.log("📍 Location accuracy:", locationData.accuracy ? `${locationData.accuracy}m` : "unknown")
      console.log("📍 Location timestamp:", locationData.timestamp || new Date().toISOString())
      setMapPosition([lat, lng])
      
      // Update Google Maps to new location
      if (googleMapRef.current && window.google && window.google.maps) {
        try {
          console.log("🗺️ Updating Google Map to:", { lat, lng })
          
          // Pan to current location
          googleMapRef.current.panTo({ lat, lng })
          googleMapRef.current.setZoom(17)
          
          // Update green marker position
          if (greenMarkerRef.current) {
            greenMarkerRef.current.setPosition({ lat, lng })
            console.log("✅ Updated green marker position")
          }
          
          // Update blue dot position
          if (blueDotCircleRef.current) {
            blueDotCircleRef.current.setCenter({ lat, lng })
            console.log("✅ Updated blue dot position")
          }
          
          // Wait for map to finish moving, then fetch address
          setTimeout(async () => {
            await handleMapMoveEnd(lat, lng)
            toast.success("Location updated!", { id: "current-location" })
          }, 500)
          
        } catch (mapError) {
          console.error("❌ Error updating map location:", mapError)
          toast.error("Failed to update map location", { id: "current-location" })
        }
      } else {
        // Map not initialized yet, just update position and fetch address
        setTimeout(async () => {
          await handleMapMoveEnd(lat, lng)
          toast.success("Location updated!", { id: "current-location" })
        }, 300)
      }
    } catch (error) {
      console.error("❌ Error getting current location:", error)
      
      // Check if it's a timeout error
      if (error.message && (error.message.includes("timeout") || error.message.includes("Timeout"))) {
        // Try to use cached location from localStorage
        try {
          const stored = localStorage.getItem("userLocation")
          if (stored) {
            const cachedLocation = JSON.parse(stored)
            if (cachedLocation?.latitude && cachedLocation?.longitude) {
              console.log("📍 Using cached location due to timeout:", cachedLocation)
              setMapPosition([cachedLocation.latitude, cachedLocation.longitude])
              
              // Update Google Maps with cached location
              if (googleMapRef.current && window.google && window.google.maps) {
                try {
                  googleMapRef.current.panTo({ lat: cachedLocation.latitude, lng: cachedLocation.longitude });
                  googleMapRef.current.setZoom(17);
                  
                  // Update markers
                  if (greenMarkerRef.current) {
                    greenMarkerRef.current.setPosition({ lat: cachedLocation.latitude, lng: cachedLocation.longitude });
                  }
                  if (blueDotCircleRef.current) {
                    blueDotCircleRef.current.setCenter({ lat: cachedLocation.latitude, lng: cachedLocation.longitude });
                  }
                  
                  setTimeout(async () => {
                    await handleMapMoveEnd(cachedLocation.latitude, cachedLocation.longitude);
                    toast.success("Using cached location", { id: "current-location" });
                  }, 500);
                } catch (mapErr) {
                  console.error("Error updating map with cached location:", mapErr);
                  toast.warning("Location request timed out. Please try again.", { id: "current-location" });
                }
              } else {
                setTimeout(async () => {
                  await handleMapMoveEnd(cachedLocation.latitude, cachedLocation.longitude)
                  toast.success("Using cached location", { id: "current-location" })
                }, 300)
              }
              return
            }
          }
        } catch (cacheErr) {
          console.warn("Failed to use cached location:", cacheErr)
        }
        
        toast.warning("Location request timed out. Please try again or check your GPS settings.", { id: "current-location" })
      } else {
        toast.error("Failed to get current location: " + (error.message || "Unknown error"), { id: "current-location" })
      }
    }
  }

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields (zipCode is optional)
    if (!addressFormData.street || !addressFormData.city || !addressFormData.state) {
      toast.error("Please fill in all required fields (Street, City, State)")
      return
    }
    
    // Validate that we have coordinates
    if (!mapPosition || mapPosition.length !== 2 || !mapPosition[0] || !mapPosition[1]) {
      toast.error("Please select a location on the map")
      return
    }
    
    setLoadingAddress(true)
    try {
      // Prepare address data matching backend format
      // Backend expects: label, street, additionalDetails, city, state, zipCode, latitude, longitude
      // Backend label enum: ['Home', 'Office', 'Other'] - not 'Work'
      // mapPosition is [latitude, longitude]
      
      // Validate and normalize label to match backend enum
      let normalizedLabel = addressFormData.label || "Home"
      if (normalizedLabel === "Work") {
        normalizedLabel = "Office" // Convert Work to Office to match backend enum
      }
      if (!["Home", "Office", "Other"].includes(normalizedLabel)) {
        normalizedLabel = "Other" // Fallback to Other if invalid
      }
      
      // Validate that trimmed fields are not empty
      const trimmedStreet = addressFormData.street.trim()
      const trimmedCity = addressFormData.city.trim()
      const trimmedState = addressFormData.state.trim()
      
      if (!trimmedStreet || !trimmedCity || !trimmedState) {
        toast.error("Street, City, and State cannot be empty")
        setLoadingAddress(false)
        return
      }
      
      const addressToSave = {
        label: normalizedLabel,
        street: trimmedStreet,
        additionalDetails: (addressFormData.additionalDetails || "").trim(),
        city: trimmedCity,
        state: trimmedState,
        zipCode: (addressFormData.zipCode || "").trim(),
        latitude: mapPosition[0], // latitude from mapPosition[0]
        longitude: mapPosition[1], // longitude from mapPosition[1]
      }
      
      // Check if an address with the same label already exists
      const existingAddressWithSameLabel = addresses.find(addr => addr.label === normalizedLabel)
      
      if (existingAddressWithSameLabel) {
        // Update existing address instead of creating a new one
        console.log("🔄 Updating existing address with label:", normalizedLabel)
        await updateAddress(existingAddressWithSameLabel.id, addressToSave)
        toast.success(`Address updated for ${normalizedLabel}!`)
      } else {
        // Create new address
        console.log("💾 Saving new address:", addressToSave)
        await addAddress(addressToSave)
        toast.success(`Address saved as ${normalizedLabel}!`)
      }
      
      // Reset form
      setAddressFormData({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        additionalDetails: "",
        label: "Home",
        phone: "",
      })
      setShowAddressForm(false)
      setLoadingAddress(false)
      
      // Optionally close the overlay after saving
      // onClose()
    } catch (error) {
      console.error("❌ Error saving address:", error)
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        addressData: addressToSave
      })
      
      // Show more detailed error message
      let errorMessage = "Failed to add address. Please try again."
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid address data. Please check all fields."
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later."
      }
      
      toast.error(errorMessage)
      setLoadingAddress(false)
    }
  }

  const handleCancelAddressForm = () => {
    setShowAddressForm(false)
    setAddressFormData({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      additionalDetails: "",
      label: "Home",
      phone: "",
    })
  }

  const handleSelectSavedAddress = async (address) => {
    try {
      // Get coordinates from address location
      const coordinates = address.location?.coordinates || []
      const longitude = coordinates[0]
      const latitude = coordinates[1]

      if (latitude && longitude) {
        // Update location in backend
        await userAPI.updateLocation({
          latitude,
          longitude,
          address: `${address.street}, ${address.city}`,
          city: address.city,
          state: address.state,
          area: address.additionalDetails || "",
          formattedAddress: `${address.street}, ${address.city}, ${address.state}`
        })
      }

      // Update the location in localStorage with this address
      const locationData = {
        city: address.city,
        state: address.state,
        address: `${address.street}, ${address.city}`,
        area: address.additionalDetails || "",
        zipCode: address.zipCode,
        latitude,
        longitude,
        formattedAddress: `${address.street}, ${address.city}, ${address.state}`
      }
      localStorage.setItem("userLocation", JSON.stringify(locationData))
      
      // Close overlay and reload to refresh location state
      onClose()
      window.location.reload()
    } catch (error) {
      console.error("Error selecting saved address:", error)
      toast.error("Failed to update location. Please try again.")
    }
  }

  // Calculate distance for saved addresses
  const getAddressDistance = (address) => {
    if (!location?.latitude || !location?.longitude) return "0 m"
    
    const coordinates = address.location?.coordinates || []
    const addressLng = coordinates[0]
    const addressLat = coordinates[1]
    
    if (!addressLat || !addressLng) return "0 m"
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      addressLat,
      addressLng
    )
    
    return distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(2)} km`
  }

  const handleEditAddress = (addressId) => {
    // Edit address functionality removed - user can delete and add new address instead
    toast.info("To edit address, please delete and add a new one")
  }

  if (!isOpen) return null

  // If showing address form, render full-screen address form
  if (showAddressForm) {
    return (
      <div className="fixed inset-0 z-[10000] bg-white dark:bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelAddressForm}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Select delivery location</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600 z-10" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for area, street name..."
              className="pl-12 pr-4 h-12 w-full bg-gray-50 dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700 focus:border-green-600 dark:focus:border-green-600 rounded-xl"
            />
          </div>
        </div>

        {/* Map Section - Google Maps */}
        <div className="flex-1 relative" style={{ height: '40vh', minHeight: '300px' }}>
          {/* Google Maps Container */}
              <div 
                ref={mapContainerRef} 
                className="w-full h-full bg-gray-200 dark:bg-gray-800"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  minHeight: '300px',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1 
                }}
              />
              
              {/* Loading State */}
              {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 z-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
                  </div>
                </div>
              )}

          {/* API Key Missing Error */}
          {!GOOGLE_MAPS_API_KEY && !mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-20">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Google Maps API key not found</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Please set VITE_GOOGLE_MAPS_API_KEY in .env file</p>
                  </div>
                </div>
          )}

          {/* Use Current Location Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={handleUseCurrentLocationForAddress}
              disabled={mapLoading}
              className="bg-white dark:bg-[#1a1a1a] border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-lg disabled:opacity-50 flex items-center gap-2 px-4 py-2"
            >
              <Crosshair className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-green-600 dark:text-green-400 font-medium">Use current location</span>
            </Button>
          </div>
        </div>

        {/* Form Section - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0a]">
          <div className="px-4 py-4 space-y-4">
            {/* Delivery Details */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Delivery details
              </Label>
              <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {loadingAddress ? "Locating..." : (currentAddress || addressFormData.city && addressFormData.state 
                      ? `${addressFormData.city}, ${addressFormData.state}`
                      : "Select location on map")}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>

            {/* Address Details */}
            <div>
              <Label htmlFor="additionalDetails" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Address details*
              </Label>
              <Input
                id="additionalDetails"
                name="additionalDetails"
                placeholder="E.g. Floor, House no."
                value={addressFormData.additionalDetails}
                onChange={handleAddressFormChange}
                className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700"
              />
            </div>

            {/* Receiver Details */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Receiver details for this address
              </Label>
              <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.name || "User"}, {addressFormData.phone || userProfile?.phone || "Add phone"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>

            {/* Save Address As */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Save address as
              </Label>
              <div className="flex gap-2">
                {["Home", "Office", "Other"].map((label) => (
                  <Button
                    key={label}
                    type="button"
                    onClick={() => setAddressFormData(prev => ({ ...prev, label }))}
                    variant={addressFormData.label === label ? "default" : "outline"}
                    className={`flex-1 ${
                      addressFormData.label === label
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-white dark:bg-[#1a1a1a]"
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hidden required fields for form validation */}
            <div className="hidden">
              <Input
                name="street"
                value={addressFormData.street}
                onChange={handleAddressFormChange}
                required
              />
              <Input
                name="city"
                value={addressFormData.city}
                onChange={handleAddressFormChange}
                required
              />
              <Input
                name="state"
                value={addressFormData.state}
                onChange={handleAddressFormChange}
                required
              />
              {/* zipCode is optional, not required */}
              <Input
                name="zipCode"
                value={addressFormData.zipCode || ""}
                onChange={handleAddressFormChange}
              />
            </div>
          </div>
        </div>

        {/* Save Address Button */}
        <div className="flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 px-4 py-4">
          <form onSubmit={handleAddressFormSubmit}>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
              disabled={loadingAddress}
            >
              {loadingAddress ? "Loading..." : "Save address"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

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
                  <Crosshair className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" strokeWidth={2.5} />
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
                {addresses
                  .filter((address, index, self) => {
                    // Filter out duplicate addresses with same label - keep only first occurrence
                    const firstIndex = self.findIndex(addr => addr.label === address.label)
                    return index === firstIndex
                  })
                  .map((address, index) => {
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
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {address.label || address.additionalDetails || "Home"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {[
                                address.additionalDetails,
                                address.street,
                                address.city,
                                address.state,
                                address.zipCode
                              ].filter(Boolean).join(", ")}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Phone number: {address.phone || userProfile?.phone || "Not provided"}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
        
        /* Blue Dot Indicator for Live Location */
        .user-location-marker {
          width: 20px !important;
          height: 20px !important;
          background-color: #4285F4 !important; /* Google Blue */
          border: 3px solid white !important;
          border-radius: 50% !important;
          box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
          position: relative !important;
          transition: transform 0.3s ease;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 1001 !important;
          pointer-events: none;
        }
        
        /* Ensure marker container is also visible */
        .mapboxgl-marker.user-location-marker,
        .maplibregl-marker.user-location-marker {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 1001 !important;
        }
        
        /* Arrow indicator pointing in direction of movement */
        .user-location-marker::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 8px solid #4285F4;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
        }
        
        /* Pulsing Aura Effect */
        .user-location-marker::after {
          content: "";
          position: absolute;
          width: 40px;
          height: 40px;
          top: -13px;
          left: -13px;
          background-color: rgba(66, 133, 244, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}



