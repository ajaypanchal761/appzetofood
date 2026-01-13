import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Menu, ChevronRight, MapPin, X, Bell } from "lucide-react"
import { restaurantAPI } from "@/lib/api"

export default function RestaurantNavbar({
  restaurantName: propRestaurantName,
  location: propLocation,
  showSearch = true,
  showOfflineOnlineTag = true,
  showNotifications = true,
}) {
  const navigate = useNavigate()
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [status, setStatus] = useState("Offline")
  const [restaurantData, setRestaurantData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveAddress, setLiveAddress] = useState(null)
  const [loadingLiveAddress, setLoadingLiveAddress] = useState(false)
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [addressFetched, setAddressFetched] = useState(false) // Track if address was already fetched to keep it stable

  // Fetch restaurant data on mount
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          console.log("✅ Restaurant data fetched:", {
            name: data.name,
            location: data.location,
            hasCoordinates: !!(data.location?.latitude && data.location?.longitude) || !!(data.location?.coordinates && Array.isArray(data.location.coordinates)),
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            coordinates: data.location?.coordinates
          })
          setRestaurantData(data)
        }
      } catch (error) {
        // Only log error if it's not a network/timeout error (backend might be down/slow)
        if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNABORTED' && !error.message?.includes('timeout')) {
          console.error("Error fetching restaurant data:", error)
        }
        // Continue with default values if fetch fails
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()
  }, [])

  // Request location permission and get exact location using browser geolocation
  useEffect(() => {
    const requestLocationPermission = async () => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn("⚠️ Geolocation is not supported by this browser")
        return
      }

      // Check if we've already fetched address (keep it stable)
      if (addressFetched && liveAddress) {
        console.log("✅ Address already fetched, keeping it stable:", liveAddress)
        return
      }

      // Check if we've already asked for permission
      if (locationPermissionAsked && addressFetched) {
        return
      }

      console.log("📍 Requesting location permission...")
      setLocationPermissionAsked(true)

      // Request permission and get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const accuracy = position.coords.accuracy

          console.log("✅ Location permission granted!")
          console.log("📍 Current location:", { lat, lng, accuracy: `${accuracy}m` })

          // Validate coordinates are in India
          const isInIndiaRange = lat >= 6.5 && lat <= 37.1 && lng >= 68.7 && lng <= 97.4 && lng > 0

          if (!isInIndiaRange) {
            console.warn("⚠️ Current location is outside India range, using stored address")
            setLocationPermissionGranted(false)
            return
          }

          setCurrentLocation({ lat, lng })
          setLocationPermissionGranted(true)

          // Reverse geocode to get address
          try {
            setLoadingLiveAddress(true)
            const { getGoogleMapsApiKey } = await import('@/lib/utils/googleMapsApiKey.js')
            const GOOGLE_MAPS_API_KEY = await getGoogleMapsApiKey()

            if (!GOOGLE_MAPS_API_KEY) {
              console.warn("⚠️ Google Maps API key not found")
              setLoadingLiveAddress(false)
              return
            }

            console.log("📍 Fetching EXACT address for current location:", { lat, lng, accuracy: `${accuracy}m` })

            // Use more specific result types for exact/precise address
            // priority: premise > street_address > establishment > point_of_interest > route
            const reverseGeocodeResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=in&result_type=premise|street_address|establishment|point_of_interest|route|sublocality`
            )
            const reverseGeocodeData = await reverseGeocodeResponse.json()

            if (reverseGeocodeData.status === 'OK' && reverseGeocodeData.results && reverseGeocodeData.results.length > 0) {
              // Find India address result - prefer most specific (premise/establishment) over route
              let indiaResult = null
              
              // First, filter India results only
              const indiaResults = reverseGeocodeData.results.filter(r => {
                const addressComponents = r.address_components || []
                return addressComponents.some(ac => 
                  ac.types.includes('country') && 
                  (ac.short_name === 'IN' || ac.long_name === 'India')
                )
              })
              
              if (indiaResults.length > 0) {
                // Prioritize most specific address types (premise, establishment, street_address)
                indiaResult = indiaResults.find(r => {
                  const types = r.types || []
                  return types.some(t => ['premise', 'establishment', 'street_address', 'point_of_interest'].includes(t))
                }) || indiaResults[0] // Fallback to first India result
              } else {
                // No India result found, use first result but warn
                console.warn("⚠️ No India result found in geocoding response")
                indiaResult = reverseGeocodeData.results[0]
              }

              const addressFromLocation = indiaResult.formatted_address
              const addressTypes = indiaResult.types || []
              console.log("📍 Address types:", addressTypes)
              console.log("📍 Selected address (most specific):", addressFromLocation)
              
              // Check if address is foreign
              const foreignPattern = /\b(USA|United States|Los Angeles|California|CA \d{5}|New York|NY|UK|United Kingdom|London)\b/i
              if (foreignPattern.test(addressFromLocation)) {
                console.warn("⚠️ Address from location appears foreign, using stored address")
                setLoadingLiveAddress(false)
                return
              }

              console.log("✅ EXACT Live address from current location:", addressFromLocation)
              console.log("📍 Location accuracy:", `${accuracy}m`, "- Higher is better, GPS gives ~5-10m")
              setLiveAddress(addressFromLocation)
              setAddressFetched(true) // Mark as fetched to keep it stable

              // Save to backend (only if coordinates changed significantly or first time)
              if (restaurantData?.location) {
                try {
                  const currentLat = restaurantData.location.latitude
                  const currentLng = restaurantData.location.longitude
                  
                  // Only update if coordinates changed significantly (more than 10 meters)
                  // or if no coordinates exist
                  const shouldUpdate = !currentLat || !currentLng || 
                    (Math.abs(currentLat - lat) > 0.0001 || Math.abs(currentLng - lng) > 0.0001) // ~10m difference
                  
                  if (shouldUpdate) {
                    await restaurantAPI.updateProfile({
                      location: {
                        ...restaurantData.location,
                        latitude: lat,
                        longitude: lng,
                        coordinates: [lng, lat],
                        formattedAddress: addressFromLocation
                      }
                    })
                    console.log("✅ Saved EXACT current location to backend")
                  } else {
                    console.log("📍 Location unchanged, keeping existing backend data")
                  }
                } catch (saveError) {
                  console.warn("⚠️ Failed to save current location (non-critical):", saveError)
                }
              }

              setLoadingLiveAddress(false)
            } else {
              console.warn("⚠️ Failed to get address from location:", reverseGeocodeData.status)
              setLoadingLiveAddress(false)
            }
          } catch (error) {
            console.error("❌ Error fetching address from location:", error)
            setLoadingLiveAddress(false)
          }
        },
        (error) => {
          console.warn("⚠️ Location permission denied or error:", error.message)
          setLocationPermissionGranted(false)
          setLocationPermissionAsked(true)
          
          // Show user-friendly message
          if (error.code === error.PERMISSION_DENIED) {
            console.log("📍 Location permission denied by user. Please enable location access in browser settings.")
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.log("📍 Location information unavailable.")
          } else if (error.code === error.TIMEOUT) {
            console.log("📍 Location request timed out.")
          }
        },
        {
          enableHighAccuracy: true, // Request highest accuracy (uses GPS if available)
          timeout: 15000, // 15 second timeout for better accuracy
          maximumAge: 0 // Don't use cached position - always get fresh
        }
      )
    }

    // Only request permission if we have restaurant data and haven't fetched address yet
    if (restaurantData && !addressFetched) {
      requestLocationPermission()
    }
  }, [restaurantData, locationPermissionAsked, addressFetched, liveAddress])

  // Fetch live address from coordinates using reverse geocoding
  // CRITICAL: ALWAYS fetch live address from coordinates when they exist, ignore stored formattedAddress
  useEffect(() => {
    const fetchLiveAddressFromCoordinates = async () => {
      // Reset live address when restaurant data changes
      setLiveAddress(null)
      setLoadingLiveAddress(false)
      
      if (!restaurantData?.location) return
      
      // Check if stored formattedAddress is foreign (from wrong coordinates) - reject it
      if (restaurantData.location.formattedAddress) {
        const foreignPattern = /\b(USA|United States|Los Angeles|California|CA \d{5}|New York|NY|UK|United Kingdom|London)\b/i
        if (foreignPattern.test(restaurantData.location.formattedAddress)) {
          console.warn("⚠️ Stored formattedAddress is from foreign country - ignoring it:", restaurantData.location.formattedAddress)
          // Don't use stored formattedAddress if it's foreign
        }
      }
      
      // Get coordinates from location object
      let latitude = null
      let longitude = null
      
      // Check for coordinates in different possible structures
      if (restaurantData.location.coordinates && Array.isArray(restaurantData.location.coordinates)) {
        // GeoJSON format: [longitude, latitude]
        longitude = restaurantData.location.coordinates[0]
        latitude = restaurantData.location.coordinates[1]
      } else if (restaurantData.location.latitude && restaurantData.location.longitude) {
        // Direct latitude/longitude fields
        latitude = parseFloat(restaurantData.location.latitude)
        longitude = parseFloat(restaurantData.location.longitude)
      }
      
      // Only proceed if we have valid coordinates (not 0, not null, not NaN)
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
        console.log("📍 No valid coordinates found in restaurant location, trying to geocode stored address:", { latitude, longitude })
        
        // Try to geocode the stored address to get coordinates
        const storedAddress = formatAddress(restaurantData.location)
        if (storedAddress && storedAddress.trim() !== "") {
          try {
            const { getGoogleMapsApiKey } = await import('@/lib/utils/googleMapsApiKey.js')
            const GOOGLE_MAPS_API_KEY = await getGoogleMapsApiKey()
            
            if (GOOGLE_MAPS_API_KEY) {
              console.log("🔍 Attempting to geocode stored address to get coordinates:", storedAddress)
              setLoadingLiveAddress(true)
              
              const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(storedAddress)}&key=${GOOGLE_MAPS_API_KEY}&region=in`
              )
              const geocodeData = await geocodeResponse.json()
              
              if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
                const result = geocodeData.results[0]
                const geocodedLat = result.geometry.location.lat
                const geocodedLng = result.geometry.location.lng
                const geocodedAddress = result.formatted_address
                
                console.log("✅ Geocoded stored address, got coordinates:", { geocodedLat, geocodedLng, geocodedAddress })
                
                // Use the geocoded address directly as live address
                setLiveAddress(geocodedAddress)
                
                // Save coordinates and formattedAddress to backend
                try {
                  const { restaurantAPI } = await import('@/lib/api')
                  await restaurantAPI.updateProfile({
                    location: {
                      ...restaurantData.location,
                      latitude: geocodedLat,
                      longitude: geocodedLng,
                      coordinates: [geocodedLng, geocodedLat],
                      formattedAddress: geocodedAddress
                    }
                  })
                  console.log("✅ Saved geocoded coordinates and address to backend")
                } catch (saveError) {
                  console.warn("⚠️ Failed to save geocoded coordinates (non-critical):", saveError)
                }
                
                setLoadingLiveAddress(false)
                return // Use geocoded address, no need to reverse geocode
              } else {
                console.warn("⚠️ Failed to geocode stored address:", geocodeData.status)
                setLiveAddress(null)
                setLoadingLiveAddress(false)
                return
              }
            } else {
              console.warn("⚠️ Google Maps API key not available for geocoding")
              setLiveAddress(null)
              return
            }
          } catch (geocodeError) {
            console.error("❌ Error geocoding stored address:", geocodeError)
            setLiveAddress(null)
            setLoadingLiveAddress(false)
            return
          }
        } else {
          console.log("📍 No stored address to geocode")
          setLiveAddress(null)
          return
        }
      }
      
      // Validate coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        console.log("📍 Coordinates out of valid range:", { latitude, longitude })
        setLiveAddress(null)
        return
      }
      
      // CRITICAL: Check if coordinates are in India BEFORE fetching
      // India: Latitude 6.5° to 37.1° N, Longitude 68.7° to 97.4° E
      // IMPORTANT: Longitude must be positive (East) for India - negative means Western hemisphere (USA/Europe)
      const isInIndiaRange = latitude >= 6.5 && latitude <= 37.1 && longitude >= 68.7 && longitude <= 97.4 && longitude > 0
      
      // Block any negative longitude (Western hemisphere = USA/Europe, not India)
      if (longitude < 0 || !isInIndiaRange) {
        console.error("❌ BLOCKED: Coordinates are OUTSIDE India range!")
        console.error("❌ Coordinates: Lat", latitude, "Lng", longitude)
        console.error("❌ India Range: Lat 6.5-37.1, Lng 68.7-97.4 (must be positive/East)")
        console.error("❌ Current longitude", longitude, "is", longitude < 0 ? "NEGATIVE (Western hemisphere = USA/Europe)" : "OUTSIDE India range")
        console.log("🔍 Attempting to fix wrong coordinates by geocoding stored address...")
        console.log("🔍 Restaurant location data:", JSON.stringify(restaurantData.location, null, 2))
        
        // Clear any wrong live address that might be cached
        setLiveAddress(null)
        setLoadingLiveAddress(true)
        
        // Get stored address from location fields (addressLine1, area, city, etc.)
        const storedAddress = formatAddress(restaurantData.location)
        console.log("🔍 Formatted stored address:", storedAddress)
        console.log("🔍 Stored address is empty?", !storedAddress || storedAddress.trim() === "")
        
        if (storedAddress && storedAddress.trim() !== "") {
          // Check stored address is not foreign
          const foreignPattern = /\b(USA|United States|Los Angeles|California|CA \d{5}|New York|NY|UK|United Kingdom|London)\b/i
          if (!foreignPattern.test(storedAddress)) {
            console.log("📍 Wrong coordinates detected - geocoding stored address to get correct India coordinates:", storedAddress)
            
            try {
              const { getGoogleMapsApiKey } = await import('@/lib/utils/googleMapsApiKey.js')
              const GOOGLE_MAPS_API_KEY = await getGoogleMapsApiKey()
              
              if (GOOGLE_MAPS_API_KEY) {
                // Geocode the stored address to get correct India coordinates
                const geocodeResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(storedAddress)}&key=${GOOGLE_MAPS_API_KEY}&region=in`
                )
                const geocodeData = await geocodeResponse.json()
                
                if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
                  const result = geocodeData.results[0]
                  const correctedLat = result.geometry.location.lat
                  const correctedLng = result.geometry.location.lng
                  const correctedAddress = result.formatted_address
                  
                  // Validate corrected coordinates are in India
                  const isCorrectedInIndia = correctedLat >= 6.5 && correctedLat <= 37.1 && correctedLng >= 68.7 && correctedLng <= 97.4 && correctedLng > 0
                  
                  if (isCorrectedInIndia) {
                    console.log("✅ Geocoded stored address - got correct India coordinates:", { correctedLat, correctedLng, correctedAddress })
                    
                    // Save corrected coordinates and address to backend
                    try {
                      const { restaurantAPI } = await import('@/lib/api')
                      await restaurantAPI.updateProfile({
                        location: {
                          ...restaurantData.location,
                          latitude: correctedLat,
                          longitude: correctedLng,
                          coordinates: [correctedLng, correctedLat], // GeoJSON format: [longitude, latitude]
                          formattedAddress: correctedAddress
                        }
                      })
                      console.log("✅ Saved corrected coordinates and address to backend")
                      
                      // Now use the corrected coordinates for reverse geocoding to get live address
                      console.log("📍 Fetching live address using corrected coordinates...")
                      const reverseGeocodeResponse = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${correctedLat},${correctedLng}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=in&result_type=street_address|premise|point_of_interest|establishment|route|sublocality|locality`
                      )
                      const reverseGeocodeData = await reverseGeocodeResponse.json()
                      
                      if (reverseGeocodeData.status === 'OK' && reverseGeocodeData.results && reverseGeocodeData.results.length > 0) {
                        // Find India address result
                        const indiaResult = reverseGeocodeData.results.find(r => {
                          const addressComponents = r.address_components || []
                          return addressComponents.some(ac => 
                            ac.types.includes('country') && 
                            (ac.short_name === 'IN' || ac.long_name === 'India')
                          )
                        }) || reverseGeocodeData.results[0]
                        
                        const liveAddressFromCoords = indiaResult.formatted_address
                        
                        // Final check - ensure it's not a foreign address
                        if (!foreignPattern.test(liveAddressFromCoords)) {
                          console.log("✅ Using live address from corrected coordinates:", liveAddressFromCoords)
                          setLiveAddress(liveAddressFromCoords)
                          
                          // Update formattedAddress if it's better
                          if (liveAddressFromCoords !== correctedAddress) {
                            try {
                              const { restaurantAPI } = await import('@/lib/api')
                              await restaurantAPI.updateProfile({
                                location: {
                                  ...restaurantData.location,
                                  latitude: correctedLat,
                                  longitude: correctedLng,
                                  coordinates: [correctedLng, correctedLat],
                                  formattedAddress: liveAddressFromCoords
                                }
                              })
                              console.log("✅ Updated formattedAddress with live address from reverse geocoding")
                            } catch (updateError) {
                              console.warn("⚠️ Failed to update formattedAddress (non-critical):", updateError)
                            }
                          }
                        } else {
                          console.warn("⚠️ Reverse geocoded address appears foreign, using geocoded address instead:", correctedAddress)
                          setLiveAddress(correctedAddress)
                        }
                      } else {
                        console.log("📍 Using geocoded address as live address:", correctedAddress)
                        setLiveAddress(correctedAddress)
                      }
                      
                      setLoadingLiveAddress(false)
                      return // Successfully fixed coordinates and got address
                    } catch (saveError) {
                      console.error("❌ Failed to save corrected coordinates:", saveError)
                      // Still use the geocoded address for display
                      setLiveAddress(correctedAddress)
                      setLoadingLiveAddress(false)
                      return
                    }
                  } else {
                    console.warn("⚠️ Geocoded coordinates are still outside India range:", { correctedLat, correctedLng })
                    // Fallback to stored address
                    console.log("📍 Using stored address (geocoding didn't give India coordinates):", storedAddress)
                    setLiveAddress(storedAddress)
                    setLoadingLiveAddress(false)
                    return
                  }
                } else {
                  console.warn("⚠️ Failed to geocode stored address:", geocodeData.status)
                  // Fallback to stored address
                  console.log("📍 Using stored address (geocoding failed):", storedAddress)
                  setLiveAddress(storedAddress)
                  setLoadingLiveAddress(false)
                  return
                }
              } else {
                console.warn("⚠️ Google Maps API key not available for fixing coordinates")
                // Fallback to stored address
                console.log("📍 Using stored address (API key not available):", storedAddress)
                setLiveAddress(storedAddress)
                setLoadingLiveAddress(false)
                return
              }
            } catch (geocodeError) {
              console.error("❌ Error geocoding stored address to fix coordinates:", geocodeError)
              // Fallback to stored address
              console.log("📍 Using stored address (geocoding error):", storedAddress)
              setLiveAddress(storedAddress)
              setLoadingLiveAddress(false)
              return
            }
          } else {
            console.warn("⚠️ Stored address also appears to be foreign:", storedAddress)
            console.warn("⚠️ Cannot fix coordinates - stored address is invalid")
            setLiveAddress(null)
            setLoadingLiveAddress(false)
            return
          }
        } else {
          console.warn("⚠️ No valid stored address available in location fields to geocode")
          console.log("🔍 Trying alternative address formats...")
          
          // Try alternative address formats
          let alternativeAddress = null
          
          // Try with restaurant name + city + state
          if (restaurantData.name && (restaurantData.location?.city || restaurantData.location?.area)) {
            const cityOrArea = restaurantData.location.city || restaurantData.location.area || ""
            const state = restaurantData.location.state || ""
            alternativeAddress = `${restaurantData.name}, ${cityOrArea}${state ? `, ${state}` : ""}, India`
            console.log("🔍 Trying alternative address format 1:", alternativeAddress)
          }
          
          // Try with just city and state
          if (!alternativeAddress && (restaurantData.location?.city || restaurantData.location?.area)) {
            const cityOrArea = restaurantData.location.city || restaurantData.location.area || ""
            const state = restaurantData.location.state || ""
            alternativeAddress = `${cityOrArea}${state ? `, ${state}` : ""}, India`
            console.log("🔍 Trying alternative address format 2:", alternativeAddress)
          }
          
          // Try with just "Indore" as fallback (since user mentioned Indore)
          if (!alternativeAddress) {
            alternativeAddress = "Indore, Madhya Pradesh, India"
            console.log("🔍 Trying default Indore address as fallback:", alternativeAddress)
          }
          
          if (alternativeAddress) {
            try {
              const { getGoogleMapsApiKey } = await import('@/lib/utils/googleMapsApiKey.js')
              const GOOGLE_MAPS_API_KEY = await getGoogleMapsApiKey()
              
              if (GOOGLE_MAPS_API_KEY) {
                console.log("🔍 Geocoding alternative address to get coordinates:", alternativeAddress)
                const geocodeResponse = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(alternativeAddress)}&key=${GOOGLE_MAPS_API_KEY}&region=in`
                )
                const geocodeData = await geocodeResponse.json()
                
                if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
                  const result = geocodeData.results[0]
                  const correctedLat = result.geometry.location.lat
                  const correctedLng = result.geometry.location.lng
                  const correctedAddress = result.formatted_address
                  
                  // Validate corrected coordinates are in India
                  const isCorrectedInIndia = correctedLat >= 6.5 && correctedLat <= 37.1 && correctedLng >= 68.7 && correctedLng <= 97.4 && correctedLng > 0
                  
                  if (isCorrectedInIndia) {
                    console.log("✅ Geocoded alternative address - got correct India coordinates:", { correctedLat, correctedLng, correctedAddress })
                    
                    // Save corrected coordinates and address to backend
                    try {
                      const { restaurantAPI } = await import('@/lib/api')
                      await restaurantAPI.updateProfile({
                        location: {
                          ...restaurantData.location,
                          latitude: correctedLat,
                          longitude: correctedLng,
                          coordinates: [correctedLng, correctedLat],
                          formattedAddress: correctedAddress
                        }
                      })
                      console.log("✅ Saved corrected coordinates from alternative address to backend")
                      setLiveAddress(correctedAddress)
                      setLoadingLiveAddress(false)
                      return
                    } catch (saveError) {
                      console.error("❌ Failed to save corrected coordinates:", saveError)
                      setLiveAddress(correctedAddress)
                      setLoadingLiveAddress(false)
                      return
                    }
                  } else {
                    console.warn("⚠️ Alternative address geocoded to non-India coordinates:", { correctedLat, correctedLng })
                  }
                } else {
                  console.warn("⚠️ Failed to geocode alternative address:", geocodeData.status)
                }
              }
            } catch (altError) {
              console.error("❌ Error geocoding alternative address:", altError)
            }
          }
          
          setLiveAddress(null)
          setLoadingLiveAddress(false)
          return
        }
      }
      
      // Only fetch if coordinates are in India range
      console.log("📍 Fetching live address from coordinates (India range validated):", { 
        latitude, 
        longitude,
        coordinatesArray: restaurantData.location.coordinates
      })
      
      setLoadingLiveAddress(true)
      
      try {
        // Get Google Maps API key
        const { getGoogleMapsApiKey } = await import('@/lib/utils/googleMapsApiKey.js')
        const GOOGLE_MAPS_API_KEY = await getGoogleMapsApiKey()
        
        if (!GOOGLE_MAPS_API_KEY) {
          console.warn("⚠️ Google Maps API key not found, cannot fetch live address")
          setLiveAddress(null)
          setLoadingLiveAddress(false)
          return
        }
        
        // Log coordinates being used for debugging
        console.log("📍 Fetching address for coordinates:", { latitude, longitude })
        
        // Reverse geocode coordinates to get address with timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Google Maps API timeout")), 10000)
        )
        
        // Use region=in to prioritize India addresses and better result types
        const apiPromise = fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en&region=in&result_type=street_address|premise|point_of_interest|establishment|route|sublocality|locality`
        ).then(res => res.json())
        
        const data = await Promise.race([apiPromise, timeoutPromise])
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          // Filter results to prioritize India addresses
          let result = null
          
          // First, try to find India address
          const indiaResult = data.results.find(r => {
            const addressComponents = r.address_components || []
            return addressComponents.some(ac => 
              ac.types.includes('country') && 
              (ac.short_name === 'IN' || ac.long_name === 'India')
            )
          })
          
          if (indiaResult) {
            result = indiaResult
            console.log("✅ Found India address from results")
          } else {
            // No India address found - check if address is from foreign country
            const firstResult = data.results[0]
            const addressComponents = firstResult.address_components || []
            const countryComponent = addressComponents.find(ac => ac.types.includes('country'))
            
            if (countryComponent && countryComponent.short_name !== 'IN' && countryComponent.long_name !== 'India') {
              console.warn("⚠️ Address from foreign country detected:", countryComponent.long_name)
              console.warn("⚠️ Using stored address instead of foreign address")
              
              // Use stored address instead of foreign address
              const storedAddress = formatAddress(restaurantData.location)
              if (storedAddress && storedAddress.trim() !== "" && !storedAddress.includes('Los Angeles') && !storedAddress.includes('USA')) {
                console.log("📍 Using stored address instead of foreign address:", storedAddress)
                setLiveAddress(storedAddress)
                setLoadingLiveAddress(false)
                return
              }
            }
            
            // Use first result only if we haven't returned yet
            result = firstResult
          }
          
          const formattedAddress = result.formatted_address
          
          // Foreign country pattern for validation
          const foreignCountryPattern = /\b(USA|United States|Los Angeles|California|CA \d{5}|New York|NY|UK|United Kingdom|London|Canada|Australia|Singapore|Dubai)\b/i
          
          // Validate that it's not just coordinates
          const isCoordinatesPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(formattedAddress.trim())
          if (!isCoordinatesPattern && formattedAddress.trim() !== "") {
            // CRITICAL: Reject any foreign country addresses (USA, UK, etc.)
            if (foreignCountryPattern.test(formattedAddress)) {
              console.warn("⚠️ REJECTED: Address is from foreign country:", formattedAddress)
              console.warn("⚠️ Using stored address instead")
              
              // Use stored address if available
              const storedAddress = formatAddress(restaurantData.location)
              if (storedAddress && storedAddress.trim() !== "" && !foreignCountryPattern.test(storedAddress)) {
                console.log("📍 Using stored address instead of foreign address:", storedAddress)
                setLiveAddress(storedAddress)
                setLoadingLiveAddress(false)
                return // STOP - don't use foreign address
              } else {
                console.warn("⚠️ Stored address also appears to be foreign or unavailable")
                setLiveAddress(null)
                setLoadingLiveAddress(false)
                return // STOP - don't use foreign address
              }
            }
            
            console.log("✅ Live address fetched from coordinates:", formattedAddress)
            
            // DON'T save wrong addresses to backend - validate before saving
            // Only save if coordinates are in India range AND address doesn't contain foreign countries
            const isInIndiaRange = latitude >= 6.5 && latitude <= 37.1 && longitude >= 68.7 && longitude <= 97.4
            // foreignCountryPattern is already declared above, reuse it
            const isForeignAddress = foreignCountryPattern.test(formattedAddress)
            
            if (isInIndiaRange && !isForeignAddress) {
              // Valid India address - save to backend for future use
              try {
                const currentLocation = restaurantData.location
                if (currentLocation && (currentLocation.latitude !== latitude || currentLocation.longitude !== longitude || currentLocation.formattedAddress !== formattedAddress)) {
                  const { restaurantAPI } = await import('@/lib/api')
                  await restaurantAPI.updateProfile({
                    location: {
                      ...currentLocation,
                      latitude,
                      longitude,
                      coordinates: [longitude, latitude],
                      formattedAddress: formattedAddress
                    }
                  })
                  console.log("✅ Saved fetched address to backend")
                }
              } catch (saveError) {
                console.warn("⚠️ Failed to save fetched address to backend (non-critical):", saveError)
              }
            } else {
              console.warn("⚠️ NOT saving address to backend - coordinates wrong or foreign address")
            }
            
            setLiveAddress(formattedAddress)
          } else {
            console.warn("⚠️ Address from coordinates appears to be invalid:", formattedAddress)
          }
        } else {
          console.warn("⚠️ No address found for coordinates. Status:", data.status, data.error_message || "")
          setLiveAddress(null) // Clear live address if API call failed
        }
      } catch (error) {
        console.error("❌ Error fetching live address:", error)
        setLiveAddress(null) // Clear live address on error
      } finally {
        setLoadingLiveAddress(false)
      }
    }
    
    fetchLiveAddressFromCoordinates()
  }, [restaurantData])

  // Format full address from location object
  const formatAddress = (location) => {
    if (!location) return ""
    
    // Priority 1: Use formattedAddress if available (complete address from Google Places API)
    if (location.formattedAddress && location.formattedAddress.trim() !== "" && location.formattedAddress !== "Select location") {
      // Check if it's just coordinates (latitude, longitude format)
      const isCoordinates = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(location.formattedAddress.trim())
      if (!isCoordinates) {
        return location.formattedAddress.trim()
      }
    }
    
    // Priority 2: Use address field if available
    if (location.address && location.address.trim() !== "") {
      return location.address.trim()
    }
    
    // Priority 3: Build from individual components
    const parts = []
    
    // Add street address (addressLine1 or street)
    if (location.addressLine1) {
      parts.push(location.addressLine1.trim())
    } else if (location.street) {
      parts.push(location.street.trim())
    }
    
    // Add addressLine2 if available
    if (location.addressLine2) {
      parts.push(location.addressLine2.trim())
    }
    
    // Add area if available
    if (location.area) {
      parts.push(location.area.trim())
    }
    
    // Add landmark if available
    if (location.landmark) {
      parts.push(location.landmark.trim())
    }
    
    // Add city if available and not already in area
    if (location.city) {
      const city = location.city.trim()
      // Only add city if it's not already included in previous parts
      const cityAlreadyIncluded = parts.some(part => part.toLowerCase().includes(city.toLowerCase()))
      if (!cityAlreadyIncluded) {
        parts.push(city)
      }
    }
    
    // Add state if available
    if (location.state) {
      const state = location.state.trim()
      // Only add state if it's not already included
      const stateAlreadyIncluded = parts.some(part => part.toLowerCase().includes(state.toLowerCase()))
      if (!stateAlreadyIncluded) {
        parts.push(state)
      }
    }
    
    // Add zipCode/pincode if available
    if (location.zipCode || location.pincode || location.postalCode) {
      const zip = (location.zipCode || location.pincode || location.postalCode).trim()
      parts.push(zip)
    }
    
    return parts.length > 0 ? parts.join(", ") : ""
  }

  // Get restaurant name (use prop if provided, otherwise use fetched data)
  const restaurantName = propRestaurantName || restaurantData?.name || "Restaurant"

  // Get location - Priority: propLocation > liveAddress (from browser geolocation) > liveAddress (from stored coordinates) > formattedAddress from stored data
  // CRITICAL: Browser geolocation has highest priority for live address
  // Only show stored address if no live address is available
  let location = ""
  
  // Check if coordinates exist in restaurant location (with proper validation)
  const hasCoordinates = restaurantData?.location && (() => {
    let lat = null
    let lng = null
    
    // Check for coordinates in different structures
    if (restaurantData.location.coordinates && Array.isArray(restaurantData.location.coordinates) && 
        restaurantData.location.coordinates.length >= 2) {
      lng = restaurantData.location.coordinates[0]
      lat = restaurantData.location.coordinates[1]
    } else if (restaurantData.location.latitude && restaurantData.location.longitude) {
      lat = parseFloat(restaurantData.location.latitude)
      lng = parseFloat(restaurantData.location.longitude)
    }
    
    // Validate coordinates (not null, not NaN, not 0, within valid ranges)
    const isValid = lat !== null && lng !== null && 
                   !isNaN(lat) && !isNaN(lng) &&
                   lat !== 0 && lng !== 0 &&
                   lat >= -90 && lat <= 90 &&
                   lng >= -180 && lng <= 180
    
    return isValid
  })()
  
  // Get actual coordinates for logging
  let actualLat = null
  let actualLng = null
  if (restaurantData?.location) {
    if (restaurantData.location.coordinates && Array.isArray(restaurantData.location.coordinates)) {
      actualLng = restaurantData.location.coordinates[0]
      actualLat = restaurantData.location.coordinates[1]
    } else if (restaurantData.location.latitude && restaurantData.location.longitude) {
      actualLat = parseFloat(restaurantData.location.latitude)
      actualLng = parseFloat(restaurantData.location.longitude)
    }
  }
  
  console.log("🔍 Location Display Logic:", {
    hasPropLocation: !!propLocation,
    hasCurrentLocation: !!currentLocation,
    locationPermissionGranted,
    hasCoordinates,
    hasLiveAddress: !!liveAddress,
    liveAddressValue: liveAddress, // Show actual value
    loadingLiveAddress,
    actualCoordinates: { lat: actualLat, lng: actualLng },
    isCoordinatesInIndia: actualLng !== null ? (actualLat >= 6.5 && actualLat <= 37.1 && actualLng >= 68.7 && actualLng <= 97.4 && actualLng > 0) : false,
    storedAddress: restaurantData?.location ? formatAddress(restaurantData.location) : null
  })
  
  if (propLocation) {
    // Explicit prop takes highest priority
    location = propLocation
    console.log("📍 Using propLocation:", location)
  } else if (liveAddress && locationPermissionGranted) {
    // Browser geolocation address has highest priority (if permission granted)
    const foreignCountryPattern = /\b(USA|United States|Los Angeles|California|CA \d{5}|New York|NY|UK|United Kingdom|London|Canada|Australia|Singapore|Dubai)\b/i
    if (foreignCountryPattern.test(liveAddress)) {
      console.warn("⚠️ Live address from browser geolocation appears foreign, checking stored address")
      const storedAddress = formatAddress(restaurantData?.location)
      if (storedAddress && storedAddress.trim() !== "" && !foreignCountryPattern.test(storedAddress)) {
        location = storedAddress
        console.log("📍 Using stored address instead of foreign browser geolocation address")
      } else {
        location = ""
      }
    } else {
      location = liveAddress
      console.log("✅ Using live address from browser geolocation:", location)
    }
  } else if (hasCoordinates) {
    // Coordinates exist - ONLY use live address from coordinates, never stored address
    if (liveAddress) {
      // CRITICAL: Validate that live address is not from foreign country
      const foreignCountryPattern = /\b(USA|United States|Los Angeles|California|CA \d{5}|New York|NY|UK|United Kingdom|London|Canada|Australia|Singapore|Dubai)\b/i
      if (foreignCountryPattern.test(liveAddress)) {
        console.warn("⚠️ REJECTED: Live address is from foreign country, using stored address instead:", liveAddress)
        
        // Use stored address instead
        const storedAddress = formatAddress(restaurantData.location)
        if (storedAddress && storedAddress.trim() !== "" && !foreignCountryPattern.test(storedAddress)) {
          location = storedAddress
          console.log("📍 Using stored address instead of foreign live address:", location)
        } else {
          location = ""
          console.warn("⚠️ No valid stored address available")
        }
      } else {
        location = liveAddress
        console.log("✅ Using live address from coordinates:", location)
      }
    } else if (loadingLiveAddress) {
      // Still loading - show loading message, NEVER stored address
      location = "" // Don't show stored address while loading
      console.log("⏳ Loading live address from coordinates, NOT showing stored address")
    } else {
      // Coordinates exist but live address fetch failed or not started yet
      // Still don't show stored address - wait or retry
      location = "" // CRITICAL: Never show stored address when coordinates exist
      console.log("⏳ Coordinates exist, waiting for live address. NOT showing stored address.", {
        loadingLiveAddress,
        liveAddress: liveAddress || "null",
        storedAddressWouldBe: restaurantData?.location ? formatAddress(restaurantData.location) : "none"
      })
    }
  } else {
    // No coordinates - safe to use stored address
    if (restaurantData?.location) {
      location = formatAddress(restaurantData.location)
      console.log("📍 No coordinates found, using stored address:", location)
    }
  }

  // Load status from localStorage on mount and listen for changes
  useEffect(() => {
    const updateStatus = () => {
      try {
        const savedStatus = localStorage.getItem('restaurant_online_status')
        if (savedStatus !== null) {
          const isOnline = JSON.parse(savedStatus)
          setStatus(isOnline ? "Online" : "Offline")
        } else {
          // Default to Offline if not set
          setStatus("Offline")
        }
      } catch (error) {
        console.error("Error loading restaurant status:", error)
        setStatus("Offline")
      }
    }

    // Load initial status
    updateStatus()

    // Listen for status changes from RestaurantStatus page
    const handleStatusChange = (event) => {
      const isOnline = event.detail?.isOnline ?? false
      setStatus(isOnline ? "Online" : "Offline")
    }

    window.addEventListener('restaurantStatusChanged', handleStatusChange)
    
    // Also check localStorage periodically to catch direct changes
    const interval = setInterval(updateStatus, 1000)
    
    return () => {
      window.removeEventListener('restaurantStatusChanged', handleStatusChange)
      clearInterval(interval)
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
          {loading ? "Loading..." : restaurantName}
        </h1>
        
        {/* Location */}
        {/* Show location if:
            1. We have a location string to display (live from browser geolocation or stored)
            2. We're loading live address (from browser geolocation or coordinates)
            3. We have restaurant data with location (fallback to stored address)
        */}
        {(() => {
          const shouldShowLocation = location || 
                                    loadingLiveAddress || 
                                    locationPermissionGranted ||
                                    (restaurantData?.location && !propLocation)
          
          if (!shouldShowLocation) return null
          
          let displayText = ""
          if (loadingLiveAddress) {
            if (locationPermissionGranted || currentLocation) {
              displayText = "📍 Getting your location..."
            } else {
              displayText = "📍 Loading address..."
            }
          } else if (location) {
            displayText = location
          } else if (locationPermissionGranted && !liveAddress) {
            displayText = "📍 Getting address..."
          } else {
            displayText = "📍 Location"
          }
          
          return (
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
              <p className="text-xs text-gray-600 truncate" title={displayText}>
                {displayText}
            </p>
          </div>
          )
        })()}
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
