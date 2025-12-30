import { useState, useEffect, useRef } from "react"
import { locationAPI, userAPI } from "@/lib/api"

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const watchIdRef = useRef(null)
  const updateTimerRef = useRef(null)

  // Function to update location in database
  const updateLocationInDB = async (locationData) => {
    try {
      await userAPI.updateLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || '',
        city: locationData.city || '',
        state: locationData.state || '',
        area: locationData.area || '',
        formattedAddress: locationData.formattedAddress || locationData.address || ''
      })
    } catch (err) {
      // Only log non-network errors (network errors are expected if backend is down)
      if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error') {
        console.error("Error updating location in database:", err)
      }
      // Don't throw error - location still works even if DB update fails
    }
  }

  // Direct browser-based geocoding (works without backend)
  const reverseGeocodeDirect = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      )
      
      if (!response.ok) {
        throw new Error('Geocoding failed')
      }
      
      const data = await response.json()
      
      // Extract detailed address components
      const city = data.city || data.locality || data.cityDistrict || "Unknown City"
      const state = data.principalSubdivision || data.administrativeArea || data.state || ""
      const country = data.countryName || data.country || ""
      const area = data.localityInfo?.administrative?.[1]?.name || 
                   data.subLocality || 
                   data.locality ||
                   data.neighbourhood ||
                   ""
      const street = data.street || data.streetName || data.road || ""
      const postcode = data.postcode || data.postalCode || ""
      
      // Build comprehensive address
      const addressParts = []
      if (street) addressParts.push(street)
      if (area && area !== city) addressParts.push(area)
      if (city) addressParts.push(city)
      if (postcode) addressParts.push(postcode)
      if (state) addressParts.push(state)
      
      const detailedAddress = addressParts.join(", ") || data.formattedAddress || city
      
      const formattedAddress = data.formattedAddress || 
                               `${street ? street + ", " : ""}${area && area !== city ? area + ", " : ""}${city}${state ? ", " + state : ""}`.trim() ||
                               `${city}${state ? ", " + state : ""}`.trim()
      
      return {
        city,
        state,
        country,
        area,
        street,
        postcode,
        address: detailedAddress,
        formattedAddress: formattedAddress || detailedAddress,
        fullAddress: data.formattedAddress || formattedAddress
      }
    } catch (err) {
      // Return coordinates if geocoding fails
      return {
        city: "Current Location",
        state: "",
        country: "",
        area: "",
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }
    }
  }

  // Function to reverse geocode using OLA Maps API (via backend)
  const reverseGeocodeWithOLAMaps = async (latitude, longitude) => {
    try {
      // Create a timeout promise to race against API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 8000) // 8 second timeout
      })

      const response = await Promise.race([
        locationAPI.reverseGeocode(latitude, longitude),
        timeoutPromise
      ])

      const data = response?.data?.data

      // Handle fallback response (from BigDataCloud)
      if (response?.data?.source === 'fallback' && data?.results?.[0]) {
        const fallbackData = data.results[0]
        const city = fallbackData.address_components?.city || "Unknown City"
        const state = fallbackData.address_components?.state || ""
        const country = fallbackData.address_components?.country || ""
        const area = fallbackData.address_components?.area || ""
        const formattedAddr = fallbackData.formatted_address || `${city}${state ? ", " + state : ""}` || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        
        return {
          city,
          state,
          country,
          area,
          address: formattedAddr,
          formattedAddress: formattedAddr,
          fullAddress: formattedAddr
        }
      }

      // Parse OLA Maps response format
      // Adjust based on actual OLA Maps API response structure
      const addressData = data?.results?.[0] || data?.address || {}

      // Extract detailed address components from OLA Maps
      const city = addressData.city || addressData.locality || addressData.city_district || "Unknown City"
      const state = addressData.state || addressData.region || addressData.state_district || ""
      const country = addressData.country || addressData.country_name || ""
      const area = addressData.area || addressData.sub_locality || addressData.neighborhood || addressData.locality || ""
      const street = addressData.street || addressData.address_line1 || addressData.road || ""
      const postcode = addressData.postcode || addressData.postal_code || ""
      
      // Build comprehensive address
      const addressParts = []
      if (street) addressParts.push(street)
      if (area && area !== city) addressParts.push(area)
      if (city) addressParts.push(city)
      if (postcode) addressParts.push(postcode)
      if (state) addressParts.push(state)
      
      const detailedAddress = addressParts.join(", ") || addressData.formatted_address || city
      
      return {
        city,
        state,
        country,
        area,
        street,
        postcode,
        address: detailedAddress,
        formattedAddress: addressData.formatted_address || 
                         addressData.display_name || 
                         detailedAddress ||
                         `${city}${state ? ", " + state : ""}`.trim(),
        fullAddress: addressData.formatted_address || detailedAddress
      }
    } catch (err) {
      // If backend API fails, use direct browser geocoding
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.code === 'ERR_NETWORK') {
        // Use direct browser geocoding as fallback
        return await reverseGeocodeDirect(latitude, longitude)
      }
      
      // Only log non-timeout errors
      if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error' && !err.message?.includes('timeout')) {
        console.error("OLA Maps reverse geocode error:", err)
      }
      
      // Return fallback using direct geocoding
      return await reverseGeocodeDirect(latitude, longitude)
    }
  }

  // Function to get location from database first
  const fetchLocationFromDB = async () => {
    try {
      const response = await userAPI.getLocation()
      const dbLocation = response?.data?.data?.location

      if (dbLocation && dbLocation.latitude && dbLocation.longitude) {
        return {
          city: dbLocation.city || "Unknown City",
          state: dbLocation.state || "",
          country: dbLocation.country || "",
          area: dbLocation.area || "",
          street: dbLocation.street || "",
          postcode: dbLocation.postcode || "",
          latitude: dbLocation.latitude,
          longitude: dbLocation.longitude,
          address: dbLocation.address || dbLocation.formattedAddress || "Unknown Location",
          formattedAddress: dbLocation.formattedAddress || dbLocation.address || "Unknown Location",
          fullAddress: dbLocation.formattedAddress || dbLocation.address || "Unknown Location"
        }
      }
    } catch (err) {
      console.error("Error fetching location from database:", err)
    }
    return null
  }

  // Main function to get and process location
  const getLocation = async (updateDB = true, forceFresh = false) => {
    // Fetch database location for use as fallback (always fetch, even if forcing fresh)
    let dbLocation = null
    if (!forceFresh) {
      // First try to get from database (only if not forcing fresh)
      dbLocation = await fetchLocationFromDB()
      if (dbLocation && !updateDB) {
        setLocation(dbLocation)
        setLoading(false)
        return dbLocation
      }
    } else {
      // Even when forcing fresh, fetch DB location to use as fallback in error handler
      dbLocation = await fetchLocationFromDB()
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      const defaultLocation = dbLocation || {
        city: "Select Location",
        state: "",
        country: "",
        address: "Location not available",
      }
      setLocation(defaultLocation)
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return defaultLocation
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Reverse geocode using OLA Maps API
            const addressData = await reverseGeocodeWithOLAMaps(latitude, longitude)

            const locationData = {
              ...addressData,
              latitude,
              longitude,
            }

            // Store in localStorage
            localStorage.setItem("userLocation", JSON.stringify(locationData))
            setLocation(locationData)
            setPermissionGranted(true)
            setError(null)

            // Update in database if requested
            if (updateDB) {
              await updateLocationInDB(locationData)
            }

            setLoading(false)
            resolve(locationData)
          } catch (err) {
            // Fallback to direct geocoding if backend fails
            try {
              const fallbackData = await reverseGeocodeDirect(latitude, longitude)
              const locationData = {
                ...fallbackData,
                latitude,
                longitude,
              }
              localStorage.setItem("userLocation", JSON.stringify(locationData))
              setLocation(locationData)
              setPermissionGranted(true)
              setError(null)
              
              if (updateDB) {
                await updateLocationInDB(locationData)
              }
              
              setLoading(false)
              resolve(locationData)
            } catch (fallbackErr) {
              // Final fallback to coordinates
              const locationData = {
                city: "Current Location",
                state: "",
                country: "",
                area: "",
                latitude,
                longitude,
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              }
              localStorage.setItem("userLocation", JSON.stringify(locationData))
              setLocation(locationData)
              setPermissionGranted(true)
              setLoading(false)
              resolve(locationData)
            }
          }
        },
        async (err) => {
          // Try to fetch database location if not already fetched
          let fallbackLocation = dbLocation
          if (!fallbackLocation) {
            try {
              fallbackLocation = await fetchLocationFromDB()
            } catch (dbErr) {
              // Ignore DB fetch errors
            }
          }
          
          // Use database location if available, otherwise default
          const defaultLocation = fallbackLocation || {
            city: "Select Location",
            state: "",
            country: "",
            address: "Location not available",
          }
          setLocation(defaultLocation)
          setError(err.message)
          setPermissionGranted(false)
          setLoading(false)
          
          // Ensure error has code property for proper error handling
          const errorWithCode = {
            ...err,
            code: err.code || (err.message?.includes("denied") || err.message?.includes("permission") ? 1 : 
                              err.message?.includes("unavailable") ? 2 : 
                              err.message?.includes("timeout") ? 3 : 0)
          }
          reject(errorWithCode)
        },
        {
          enableHighAccuracy: true, // Use high accuracy GPS (more accurate, uses more battery)
          timeout: 30000, // 30 second timeout for high accuracy GPS
          maximumAge: 0, // Always get fresh location, don't use cached
        }
      )
    })
  }

  // Watch position for live updates
  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    // Clear existing watch if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode using OLA Maps API
          const addressData = await reverseGeocodeWithOLAMaps(latitude, longitude)

          const locationData = {
            ...addressData,
            latitude,
            longitude,
          }

          // Update localStorage
          localStorage.setItem("userLocation", JSON.stringify(locationData))
          setLocation(locationData)
          setPermissionGranted(true)
          setError(null)

          // Update in database (debounce to avoid too many updates)
          if (updateTimerRef && updateTimerRef.current) {
            clearTimeout(updateTimerRef.current)
          }
          if (updateTimerRef) {
            updateTimerRef.current = setTimeout(() => {
              updateLocationInDB(locationData)
            }, 5000) // Update DB every 5 seconds max
          }
        } catch (err) {
          // Only log non-network errors
          if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error') {
            console.error("Error updating location:", err)
          }
        }
      },
      (err) => {
        setError(err.message)
        setPermissionGranted(false)
      },
        {
          enableHighAccuracy: true, // Use high accuracy GPS (more accurate, uses more battery)
          timeout: 30000, // 30 second timeout for high accuracy GPS
          maximumAge: 0, // Always get fresh location, don't use cached
        }
    )
  }

  // Stop watching location
  const stopWatchingLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (updateTimerRef && updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
      updateTimerRef.current = null
    }
  }

  useEffect(() => {
    // Check if location is stored in localStorage
    const storedLocation = localStorage.getItem("userLocation")
    if (storedLocation) {
      try {
        const parsed = JSON.parse(storedLocation)
        setLocation(parsed)
        setPermissionGranted(true)
        setLoading(false)
        
        // Start watching for live updates
        startWatchingLocation()
        
        return
      } catch (e) {
        console.error("Error parsing stored location:", e)
      }
    }

    // Get location and start watching
    getLocation(true).then(() => {
      startWatchingLocation()
    }).catch(() => {
      // Error already handled in getLocation
    })

    // Cleanup on unmount
    return () => {
      stopWatchingLocation()
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [])

  const requestLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      // Force fresh location when user requests
      await getLocation(true, true)
      startWatchingLocation()
      // getLocation already sets loading to false on success
    } catch (err) {
      // Error already handled in getLocation, but try with cached location
      try {
        await getLocation(true, false)
        startWatchingLocation()
        // getLocation already sets loading to false on success
      } catch (fallbackErr) {
        // All methods failed - rethrow the original error with error code
        setLoading(false)
        // Preserve the error code for proper error handling in UI
        const errorWithCode = err.code ? err : { ...err, code: fallbackErr.code || 0 }
        throw errorWithCode
      }
    }
  }

  return { 
    location, 
    loading, 
    error, 
    permissionGranted, 
    requestLocation,
    startWatchingLocation,
    stopWatchingLocation
  }
}
