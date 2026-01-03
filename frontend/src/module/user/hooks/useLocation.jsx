import { useState, useEffect, useRef } from "react"
import { locationAPI, userAPI } from "@/lib/api"

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const watchIdRef = useRef(null)
  const updateTimerRef = useRef(null)

  /* ===================== DB UPDATE ===================== */
  const updateLocationInDB = async (locationData) => {
    try {
      // Check if user is authenticated before trying to update DB
      const userToken = localStorage.getItem('user_accessToken') || localStorage.getItem('accessToken')
      if (!userToken || userToken === 'null' || userToken === 'undefined') {
        // User not logged in - skip DB update, just use localStorage
        console.log("ℹ️ User not authenticated, skipping DB update (using localStorage only)")
        return
      }

      await userAPI.updateLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || "",
        city: locationData.city || "",
        state: locationData.state || "",
        area: locationData.area || "",
        formattedAddress:
          locationData.formattedAddress || locationData.address || "",
      })
    } catch (err) {
      // Only log non-network and non-auth errors
      if (err.code !== "ERR_NETWORK" && err.response?.status !== 404 && err.response?.status !== 401) {
        console.error("DB location update error:", err)
      } else if (err.response?.status === 404 || err.response?.status === 401) {
        // 404 or 401 means user not authenticated or route doesn't exist
        // Silently skip - this is expected for non-authenticated users
        console.log("ℹ️ Location update skipped (user not authenticated or route not available)")
      }
    }
  }

  // Google Places API removed - using OLA Maps only

  /* ===================== DIRECT REVERSE GEOCODE ===================== */
  const reverseGeocodeDirect = async (latitude, longitude) => {
    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 3000) // Faster timeout

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      )

      const data = await res.json()

      return {
        city: data.city || data.locality || "Unknown City",
        state: data.principalSubdivision || "",
        country: data.countryName || "",
        area: data.subLocality || "",
        address:
          data.formattedAddress ||
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        formattedAddress:
          data.formattedAddress ||
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      }
    } catch {
      return {
        city: "Current Location",
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      }
    }
  }

  /* ===================== OLA MAPS REVERSE GEOCODE ===================== */
  const reverseGeocodeWithOLAMaps = async (latitude, longitude) => {
    try {
      console.log("🔍 Fetching address from OLA Maps for:", latitude, longitude)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("OLA Maps API timeout")), 10000)
      )
      
      const apiPromise = locationAPI.reverseGeocode(latitude, longitude)
      const res = await Promise.race([apiPromise, timeoutPromise])
      
      // Log full response for debugging
      console.log("📦 Full OLA Maps API Response:", JSON.stringify(res?.data, null, 2))
      
      // Check if response is valid
      if (!res || !res.data) {
        throw new Error("Invalid response from OLA Maps API")
      }
      
      // Check if API call was successful
      if (res.data.success === false) {
        throw new Error(res.data.message || "OLA Maps API returned error")
      }
      
      // Backend returns: { success: true, data: { results: [{ formatted_address, address_components: { city, state, country, area } }] } }
      const backendData = res?.data?.data || {}
      
      // Debug: Check backend data structure
      console.log("🔍 Backend data structure:", {
        hasResults: !!backendData.results,
        hasResult: !!backendData.result,
        keys: Object.keys(backendData),
        dataType: typeof backendData,
        backendData: JSON.stringify(backendData, null, 2).substring(0, 500) // First 500 chars
      })
      
      // Handle different OLA Maps response structures
      // Backend processes OLA Maps response and returns: { results: [{ formatted_address, address_components: { city, state, area } }] }
      let result = null;
      if (backendData.results && Array.isArray(backendData.results) && backendData.results.length > 0) {
        result = backendData.results[0];
        console.log("✅ Using results[0] from backend")
      } else if (backendData.result && Array.isArray(backendData.result) && backendData.result.length > 0) {
        result = backendData.result[0];
        console.log("✅ Using result[0] from backend")
      } else if (backendData.results && !Array.isArray(backendData.results)) {
        result = backendData.results;
        console.log("✅ Using results object from backend")
      } else {
        result = backendData;
        console.log("⚠️ Using backendData directly (fallback)")
      }
      
      if (!result) {
        console.warn("⚠️ No result found in backend data")
        result = {};
      }
      
      console.log("📦 Parsed result:", {
        hasFormattedAddress: !!result.formatted_address,
        hasAddressComponents: !!result.address_components,
        formattedAddress: result.formatted_address,
        addressComponents: result.address_components
      })
      
      // Extract address_components - handle both object and array formats
      let addressComponents = {};
      if (result.address_components) {
        if (Array.isArray(result.address_components)) {
          // Google Maps style array
          result.address_components.forEach(comp => {
            const types = comp.types || [];
            if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
              addressComponents.area = comp.long_name || comp.short_name;
            } else if (types.includes('neighborhood') && !addressComponents.area) {
              addressComponents.area = comp.long_name || comp.short_name;
            } else if (types.includes('locality')) {
              addressComponents.city = comp.long_name || comp.short_name;
            } else if (types.includes('administrative_area_level_1')) {
              addressComponents.state = comp.long_name || comp.short_name;
            } else if (types.includes('country')) {
              addressComponents.country = comp.long_name || comp.short_name;
            }
          });
        } else {
          // Object format
          addressComponents = result.address_components;
        }
      } else if (result.components) {
        addressComponents = result.components;
      }
      
      console.log("📦 Parsed result structure:", { 
        result, 
        addressComponents,
        hasArrayComponents: Array.isArray(result.address_components),
        hasObjectComponents: !Array.isArray(result.address_components) && !!result.address_components
      })
      
      // Extract address details - try multiple possible response structures
      let city = addressComponents?.city || 
                 result?.city || 
                 result?.locality || 
                 result?.address_components?.city || 
                 ""
      
      let state = addressComponents?.state || 
                  result?.state || 
                  result?.administrative_area_level_1 || 
                  result?.address_components?.state || 
                  ""
      
      let country = addressComponents?.country || 
                    result?.country || 
                    result?.country_name || 
                    result?.address_components?.country || 
                    ""
      
      let formattedAddress = result?.formatted_address || 
                            result?.formattedAddress || 
                            result?.address || 
                            ""

      // PRIORITY 1: Extract area from formatted_address FIRST (most reliable for Indian addresses)
      // Indian address format: "Area, City, State" e.g., "New Palasia, Indore, Madhya Pradesh"
      // ALWAYS try formatted_address FIRST - it's the most reliable source and preserves full names like "New Palasia"
      let area = ""
      if (formattedAddress) {
        const addressParts = formattedAddress.split(',').map(part => part.trim()).filter(part => part.length > 0)
        
        console.log("🔍 Parsing formatted address for area:", { formattedAddress, addressParts, city, state, currentArea: area })
        
        // ZOMATO-STYLE: If we have 3+ parts, first part is ALWAYS the area/locality
        // Format: "New Palasia, Indore, Madhya Pradesh" -> area = "New Palasia"
        if (addressParts.length >= 3) {
          const firstPart = addressParts[0]
          const secondPart = addressParts[1] // Usually city
          const thirdPart = addressParts[2]  // Usually state
          
          // First part is the area (e.g., "New Palasia")
          // Second part is usually city (e.g., "Indore")
          // Third part is usually state (e.g., "Madhya Pradesh")
          if (firstPart && firstPart.length > 2 && firstPart.length < 50) {
            // Make sure first part is not the same as city or state
            const firstLower = firstPart.toLowerCase()
            const cityLower = (city || secondPart || "").toLowerCase()
            const stateLower = (state || thirdPart || "").toLowerCase()
            
            if (firstLower !== cityLower && 
                firstLower !== stateLower &&
                !firstPart.match(/^\d+/) && // Not a number
                !firstPart.match(/^\d+\s*(km|m|meters?)$/i) && // Not a distance
                !firstLower.includes("district") && // Not a district name
                !firstLower.includes("city")) { // Not a city name
              area = firstPart
              console.log("✅✅✅ EXTRACTED AREA from formatted address (3+ parts):", area)
              
              // Also update city if second part matches better
              if (secondPart && (!city || secondPart.toLowerCase() !== city.toLowerCase())) {
                city = secondPart
              }
              // Also update state if third part matches better
              if (thirdPart && (!state || thirdPart.toLowerCase() !== state.toLowerCase())) {
                state = thirdPart
              }
            }
          }
        } else if (addressParts.length === 2 && !area) {
          // Two parts: Could be "Area, City" or "City, State"
          const firstPart = addressParts[0]
          const secondPart = addressParts[1]
          
          // Check if first part is city (if we already have city name)
          const isFirstCity = city && firstPart.toLowerCase() === city.toLowerCase()
          
          // If first part is NOT the city, it's likely the area
          if (!isFirstCity && 
              firstPart.length > 2 && 
              firstPart.length < 50 &&
              !firstPart.toLowerCase().includes("district") &&
              !firstPart.toLowerCase().includes("city") &&
              !firstPart.match(/^\d+/)) {
            area = firstPart
            console.log("✅ Extracted area from 2 part address:", area)
            // Update city if second part exists
            if (secondPart && !city) {
              city = secondPart
            }
          } else if (isFirstCity) {
            // First part is city, second part might be state
            // No area in this case, but update state if needed
            if (secondPart && !state) {
              state = secondPart
            }
          }
        } else if (addressParts.length === 1 && !area) {
          // Single part - could be just city or area
          const singlePart = addressParts[0]
          if (singlePart && singlePart.length > 2 && singlePart.length < 50) {
            // If it doesn't match city exactly, it might be an area
            if (!city || singlePart.toLowerCase() !== city.toLowerCase()) {
              // Don't use as area if it looks like a city name (contains common city indicators)
              if (!singlePart.toLowerCase().includes("city") &&
                  !singlePart.toLowerCase().includes("district")) {
                // Could be area, but be cautious - only use if we're sure
                console.log("⚠️ Single part address - ambiguous, not using as area:", singlePart)
              }
            }
          }
        }
      }
      
      // PRIORITY 2: If still no area from formatted_address, try from address_components (fallback)
      // Note: address_components might have incomplete/truncated names like "Palacia" instead of "New Palasia"
      // So we ALWAYS prefer formatted_address extraction over address_components
      if (!area && addressComponents) {
        // Try all possible area fields (but exclude state and generic names!)
        const possibleAreaFields = [
          addressComponents.sublocality,
          addressComponents.sublocality_level_1,
          addressComponents.neighborhood,
          addressComponents.sublocality_level_2,
          addressComponents.locality,
          addressComponents.area, // Check area last
        ].filter(field => {
          // Filter out invalid/generic area names
          if (!field) return false
          const fieldLower = field.toLowerCase()
          return fieldLower !== state.toLowerCase() && 
                 fieldLower !== city.toLowerCase() &&
                 !fieldLower.includes("district") &&
                 !fieldLower.includes("city") &&
                 field.length > 3 // Minimum length
        })
        
        if (possibleAreaFields.length > 0) {
          const fallbackArea = possibleAreaFields[0]
          // CRITICAL: If formatted_address exists and has a different area, prefer formatted_address
          // This ensures "New Palasia" from formatted_address beats "Palacia" from address_components
          if (formattedAddress && formattedAddress.toLowerCase().includes(fallbackArea.toLowerCase())) {
            // formatted_address contains the fallback area, so it's likely more complete
            // Try one more time to extract from formatted_address
            console.log("⚠️ address_components has area but formatted_address might have full name, re-checking formatted_address")
          } else {
            area = fallbackArea
            console.log("✅ Extracted area from address_components (fallback):", area)
          }
        }
      }

      // Also check address_components array structure (Google Maps style)
      if (!area && result?.address_components && Array.isArray(result.address_components)) {
        const components = result.address_components
        // Find sublocality or neighborhood in the components array
        const sublocality = components.find(comp => 
          comp.types?.includes('sublocality') || 
          comp.types?.includes('sublocality_level_1') ||
          comp.types?.includes('neighborhood')
        )
        if (sublocality?.long_name || sublocality?.short_name) {
          area = sublocality.long_name || sublocality.short_name
        }
      }

      // FINAL FALLBACK: If area is still empty, force extract from formatted_address
      // This is the last resort - be very aggressive (ZOMATO-STYLE)
      // Even if formatted_address only has 2 parts (City, State), try to extract area
      if (!area && formattedAddress) {
        const parts = formattedAddress.split(',').map(p => p.trim()).filter(p => p.length > 0)
        console.log("🔍 Final fallback: Parsing formatted_address for area", { parts, city, state })
        
        if (parts.length >= 2) {
          const potentialArea = parts[0]
          // Very lenient check - if it's not obviously city/state, use it as area
          const potentialAreaLower = potentialArea.toLowerCase()
          const cityLower = (city || "").toLowerCase()
          const stateLower = (state || "").toLowerCase()
          
          if (potentialArea && 
              potentialArea.length > 2 && 
              potentialArea.length < 50 &&
              !potentialArea.match(/^\d+/) &&
              potentialAreaLower !== cityLower &&
              potentialAreaLower !== stateLower &&
              !potentialAreaLower.includes("district") &&
              !potentialAreaLower.includes("city")) {
            area = potentialArea
            console.log("✅✅✅ FORCE EXTRACTED area (final fallback):", area)
          }
        }
      }

      // Final validation and logging
      console.log("✅✅✅ FINAL PARSED OLA Maps response:", { 
        city, 
        state, 
        country, 
        area, 
        formattedAddress,
        hasArea: !!area,
        areaLength: area?.length || 0
      })

      // CRITICAL: If formattedAddress has only 2 parts, OLA Maps didn't provide sublocality
      // Try to get more detailed location using coordinates-based search
      if (!area && formattedAddress) {
        const parts = formattedAddress.split(',').map(p => p.trim()).filter(p => p.length > 0)
        
        // If we have 3+ parts, extract area from first part
        if (parts.length >= 3) {
          // ZOMATO PATTERN: "New Palasia, Indore, Madhya Pradesh"
          // First part = Area, Second = City, Third = State
          const potentialArea = parts[0]
          // Validate it's not state, city, or generic names
          const potentialAreaLower = potentialArea.toLowerCase()
          if (potentialAreaLower !== state.toLowerCase() && 
              potentialAreaLower !== city.toLowerCase() &&
              !potentialAreaLower.includes("district") &&
              !potentialAreaLower.includes("city")) {
            area = potentialArea
            if (!city && parts[1]) city = parts[1]
            if (!state && parts[2]) state = parts[2]
            console.log("✅✅✅ ZOMATO-STYLE EXTRACTION:", { area, city, state })
          }
        } else if (parts.length === 2) {
          // Only 2 parts: "Indore, Madhya Pradesh" - area is missing
          // OLA Maps API didn't provide sublocality
          console.warn("⚠️ Only 2 parts in address - OLA Maps didn't provide sublocality")
          // Try to extract from other fields in the response
          // Check if result has any other location fields
          if (result.locality && result.locality !== city) {
            area = result.locality
            console.log("✅ Using locality as area:", area)
          } else if (result.neighborhood) {
            area = result.neighborhood
            console.log("✅ Using neighborhood as area:", area)
          } else {
            // Leave area empty - will show city instead
            area = ""
          }
        }
      }
      
      // FINAL VALIDATION: Never use state as area!
      if (area && state && area.toLowerCase() === state.toLowerCase()) {
        console.warn("⚠️⚠️⚠️ REJECTING area (same as state):", area)
        area = ""
      }
      
      // FINAL VALIDATION: Reject district names
      if (area && area.toLowerCase().includes("district")) {
        console.warn("⚠️⚠️⚠️ REJECTING area (contains district):", area)
        area = ""
      }

      // If we have a valid formatted address or city, return it
      if (formattedAddress || city) {
        const finalLocation = {
          city: city || "Unknown City",
          state: state || "",
          country: country || "",
          area: area || "", // Area is CRITICAL - must be extracted
          address: formattedAddress || `${city || "Current Location"}`,
          formattedAddress: formattedAddress || `${city || "Current Location"}`,
        }
        
        console.log("✅✅✅ RETURNING LOCATION DATA:", finalLocation)
        return finalLocation
      }

      // If no valid data, throw to trigger fallback
      throw new Error("No valid address data from OLA Maps")
    } catch (err) {
      console.warn("⚠️ OLA Maps failed, trying direct geocoding:", err.message)
      // Fallback to direct reverse geocoding (no Google Maps dependency)
      try {
        return await reverseGeocodeDirect(latitude, longitude)
      } catch (fallbackErr) {
        // If all fail, return minimal location data
        console.error("❌ All reverse geocoding failed:", fallbackErr)
        return {
          city: "Current Location",
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }
      }
    }
  }

  /* ===================== DB FETCH ===================== */
  const fetchLocationFromDB = async () => {
    try {
      // Check if user is authenticated before trying to fetch from DB
      const userToken = localStorage.getItem('user_accessToken') || localStorage.getItem('accessToken')
      if (!userToken || userToken === 'null' || userToken === 'undefined') {
        // User not logged in - skip DB fetch, return null to use localStorage
        return null
      }

      const res = await userAPI.getLocation()
      const loc = res?.data?.data?.location
      if (loc?.latitude && loc?.longitude) {
        try {
          const addr = await reverseGeocodeWithOLAMaps(
            loc.latitude,
            loc.longitude
          )
          return { ...addr, latitude: loc.latitude, longitude: loc.longitude }
        } catch (geocodeErr) {
          // If reverse geocoding fails, return location with coordinates only
          console.error("Reverse geocoding failed in fetchLocationFromDB:", geocodeErr)
          return {
            latitude: loc.latitude,
            longitude: loc.longitude,
            city: "Current Location",
            address: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
            formattedAddress: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
          }
        }
      }
    } catch (err) {
      // Silently fail for 404/401 (user not authenticated) or network errors
      if (err.code !== "ERR_NETWORK" && err.response?.status !== 404 && err.response?.status !== 401) {
        console.error("DB location fetch error:", err)
      }
    }
    return null
  }

  /* ===================== MAIN LOCATION ===================== */
  const getLocation = async (updateDB = true, forceFresh = false, showLoading = false) => {
    // If not forcing fresh, try DB first (faster)
    let dbLocation = !forceFresh ? await fetchLocationFromDB() : null
    if (dbLocation && !forceFresh) {
      setLocation(dbLocation)
      if (showLoading) setLoading(false)
      return dbLocation
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      if (showLoading) setLoading(false)
      return dbLocation
    }

    // Helper function to get position with retry mechanism
    const getPositionWithRetry = (options, retryCount = 0) => {
      return new Promise((resolve, reject) => {
        const isRetry = retryCount > 0
        console.log(`📍 Requesting location${isRetry ? ' (retry with lower accuracy)' : ' (high accuracy)'}...`)
        console.log(`📍 Force fresh: ${forceFresh ? 'YES' : 'NO'}, maximumAge: ${options.maximumAge || (forceFresh ? 0 : 60000)}`)
        
        // Use cached location if available and not too old (faster response)
        // If forceFresh is true, don't use cache (maximumAge: 0)
        const cachedOptions = {
          ...options,
          maximumAge: forceFresh ? 0 : (options.maximumAge || 60000), // If forceFresh, get fresh location
        }
        
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude, accuracy } = pos.coords
              const timestamp = pos.timestamp || Date.now()
              
              console.log(`✅ Got location${isRetry ? ' (lower accuracy)' : ' (high accuracy)'}:`, { 
                latitude, 
                longitude, 
                accuracy: `${accuracy}m`,
                timestamp: new Date(timestamp).toISOString(),
                coordinates: `${latitude.toFixed(8)}, ${longitude.toFixed(8)}`
              })
              
              // Get address from OLA Maps API
              console.log("🔍 Calling reverse geocode with coordinates:", { latitude, longitude })
              const addr = await reverseGeocodeWithOLAMaps(latitude, longitude)
              console.log("✅ Reverse geocode result:", addr)

              const finalLoc = { 
                ...addr, 
                latitude, 
                longitude,
                accuracy: accuracy || null
              }
              
            console.log("💾 Saving location:", finalLoc)
            localStorage.setItem("userLocation", JSON.stringify(finalLoc))
            setLocation(finalLoc)
            setPermissionGranted(true)
            if (showLoading) setLoading(false)
            setError(null)

              if (updateDB) {
                await updateLocationInDB(finalLoc).catch(err => {
                  console.warn("Failed to update location in DB:", err)
                })
              }
              resolve(finalLoc)
            } catch (err) {
              console.error("❌ Error processing location:", err)
              // If reverse geocoding fails, still use the coordinates
              const { latitude, longitude } = pos.coords
              const fallbackLoc = {
                latitude,
                longitude,
                city: "Current Location",
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              }
            localStorage.setItem("userLocation", JSON.stringify(fallbackLoc))
            setLocation(fallbackLoc)
            setPermissionGranted(true)
            if (showLoading) setLoading(false)
            if (updateDB) await updateLocationInDB(fallbackLoc).catch(() => {})
            resolve(fallbackLoc)
            }
          },
          async (err) => {
            // If timeout and we haven't retried yet, try with lower accuracy
            if (err.code === 3 && retryCount === 0 && options.enableHighAccuracy) {
              console.warn("⏱️ High accuracy timeout, retrying with lower accuracy...")
              // Retry with lower accuracy - faster response (uses network-based location)
              getPositionWithRetry({
                enableHighAccuracy: false,
                timeout: 5000,  // 5 seconds for lower accuracy (network-based is faster)
                maximumAge: 300000 // Allow 5 minute old cached location for instant response
              }, 1).then(resolve).catch(reject)
              return
            }

            // Don't log timeout errors as errors - they're expected in some cases
            if (err.code === 3) {
              console.warn("⏱️ Geolocation timeout (code 3) - using fallback location")
            } else {
              console.error("❌ Geolocation error:", err.code, err.message)
            }
            // Try multiple fallback strategies
            try {
              // Strategy 1: Use DB location if available
              let fallback = dbLocation
              if (!fallback) {
                fallback = await fetchLocationFromDB()
              }
              
              // Strategy 2: Use cached location from localStorage
              if (!fallback) {
                const stored = localStorage.getItem("userLocation")
                if (stored) {
                  try {
                    fallback = JSON.parse(stored)
                    console.log("✅ Using cached location from localStorage")
                  } catch (parseErr) {
                    console.warn("⚠️ Failed to parse stored location:", parseErr)
                  }
                }
              }
              
              if (fallback) {
                console.log("✅ Using fallback location:", fallback)
                setLocation(fallback)
                // Don't set error for timeout when we have fallback
                if (err.code !== 3) {
                  setError(err.message)
                }
                setPermissionGranted(true) // Still grant permission if we have location
                if (showLoading) setLoading(false)
                resolve(fallback)
              } else {
                // No fallback available
                console.warn("⚠️ No fallback location available")
                setLocation(null)
                setError(err.code === 3 ? "Location request timed out. Please try again." : err.message)
                setPermissionGranted(false)
                if (showLoading) setLoading(false)
                resolve(null)
              }
            } catch (fallbackErr) {
              console.warn("⚠️ Fallback retrieval failed:", fallbackErr)
              setLocation(null)
              setError(err.code === 3 ? "Location request timed out. Please try again." : err.message)
              setPermissionGranted(false)
              if (showLoading) setLoading(false)
              resolve(null)
            }
          },
          options
        )
      })
    }

    // Try with high accuracy first
    // If forceFresh is true, don't use cached location (maximumAge: 0)
    // Otherwise, allow cached location for faster response
    return getPositionWithRetry({ 
      enableHighAccuracy: true,  // Use GPS for exact location
      timeout: 10000,            // 10 seconds timeout (gives GPS time to get accurate fix)
      maximumAge: forceFresh ? 0 : 60000  // If forceFresh, get fresh location. Otherwise allow 1 minute cache
    })
  }

  /* ===================== WATCH LOCATION ===================== */
  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      console.warn("⚠️ Geolocation not supported")
      return
    }

    // Clear any existing watch
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    console.log("👀 Starting to watch location for live updates...")

    let retryCount = 0
    const maxRetries = 2

    const startWatch = (options) => {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            const { latitude, longitude, accuracy } = pos.coords
            console.log("🔄 Location updated:", { latitude, longitude, accuracy: `${accuracy}m` })
            
            // Reset retry count on success
            retryCount = 0
            
            // Get address from OLA Maps API with error handling
            let addr
            try {
              addr = await reverseGeocodeWithOLAMaps(latitude, longitude)
              console.log("✅ Reverse geocoding successful:", { 
                city: addr.city, 
                area: addr.area, 
                formattedAddress: addr.formattedAddress 
              })
            } catch (geocodeErr) {
              console.error("❌ OLA Maps reverse geocoding failed:", geocodeErr.message)
              // Try fallback geocoding
              try {
                console.log("🔄 Trying fallback geocoding...")
                addr = await reverseGeocodeDirect(latitude, longitude)
                console.log("✅ Fallback geocoding successful:", { 
                  city: addr.city, 
                  area: addr.area 
                })
              } catch (fallbackErr) {
                console.error("❌ Fallback geocoding also failed:", fallbackErr.message)
                // Use coordinates only as last resort
                addr = {
                  city: "Current Location",
                  state: "",
                  country: "",
                  area: "",
                  address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                  formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                }
              }
            }
            
            const loc = { 
              ...addr, 
              latitude, 
              longitude,
              accuracy: accuracy || null
            }

            console.log("💾 Updating live location:", loc)
            localStorage.setItem("userLocation", JSON.stringify(loc))
            setLocation(loc)
            setPermissionGranted(true)
            setError(null)

            // Debounce DB updates - only update every 5 seconds
            clearTimeout(updateTimerRef.current)
            updateTimerRef.current = setTimeout(() => {
              updateLocationInDB(loc).catch(err => {
                console.warn("Failed to update location in DB:", err)
              })
            }, 5000)
          } catch (err) {
            console.error("❌ Error processing live location update:", err)
            // If reverse geocoding fails, still use the coordinates
            const { latitude, longitude } = pos.coords
            const fallbackLoc = {
              latitude,
              longitude,
              city: "Current Location",
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            }
            localStorage.setItem("userLocation", JSON.stringify(fallbackLoc))
            setLocation(fallbackLoc)
            setPermissionGranted(true)
          }
        },
        (err) => {
          // Don't log timeout errors for watchPosition (it's a background operation)
          // Only log non-timeout errors
          if (err.code !== 3) {
            console.warn("⚠️ Watch position error (non-timeout):", err.code, err.message)
          }
          
          // If timeout and we haven't exceeded max retries, retry with lower accuracy
          if (err.code === 3 && retryCount < maxRetries) {
            retryCount++
            // Silently retry - don't log timeout errors for background watch
            // console.warn(`⏱️ Watch timeout, retrying with lower accuracy (attempt ${retryCount}/${maxRetries})...`)
            
            // Clear current watch
            if (watchIdRef.current) {
              navigator.geolocation.clearWatch(watchIdRef.current)
              watchIdRef.current = null
            }
            
            // Retry with lower accuracy after a short delay (fallback if GPS fails)
            setTimeout(() => {
              startWatch({
                enableHighAccuracy: false,  // Lower accuracy for retry (network-based)
                timeout: 5000,               // 5 seconds timeout
                maximumAge: 60000            // Allow 1 minute old cached location as fallback
              })
            }, 2000) // Slightly longer delay before retry
            return
          }

          // If all retries failed, silently continue - don't set error state for background watch
          // The watch will keep trying in background, user won't notice
          // Only set error for non-timeout errors that are critical
          if (err.code !== 3) {
            setError(err.message)
            setPermissionGranted(false)
          }
          
          // Don't clear the watch - let it keep trying in background
          // The user might move to a location with better GPS signal
        },
        options
      )
    }

    // Start with high accuracy for live location tracking
    // This ensures we get accurate GPS updates for real-time area detection
    startWatch({ 
      enableHighAccuracy: true,   // Use GPS for accurate live location tracking
      timeout: 10000,             // 10 seconds timeout (allows GPS to get accurate fix)
      maximumAge: 0               // Always get fresh location (no cache for live tracking)
    })
  }

  const stopWatchingLocation = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    clearTimeout(updateTimerRef.current)
  }

  /* ===================== INIT ===================== */
  useEffect(() => {
    // Load stored location first for IMMEDIATE display (no loading state)
    const stored = localStorage.getItem("userLocation")
    if (stored) {
      try {
        const parsedLocation = JSON.parse(stored)
        setLocation(parsedLocation)
        setPermissionGranted(true)
        setLoading(false) // Set loading to false immediately
        console.log("📂 Loaded stored location instantly:", parsedLocation)
      } catch (err) {
        console.error("Failed to parse stored location:", err)
        setLoading(false)
      }
    } else {
      // If no stored location, try DB first (faster than GPS)
      fetchLocationFromDB()
        .then((dbLoc) => {
          if (dbLoc) {
            setLocation(dbLoc)
            setPermissionGranted(true)
            setLoading(false)
            console.log("📂 Loaded location from DB:", dbLoc)
          } else {
            setLoading(false)
          }
        })
        .catch(() => {
          setLoading(false)
        })
    }

    // Request fresh location in BACKGROUND (non-blocking)
    // This updates the location silently without showing loading
    console.log("🚀 Fetching fresh location in background...")
    getLocation(true, true)
      .then((location) => {
        console.log("✅ Fresh location fetched:", location)
        // Start watching for live updates
        startWatchingLocation()
      })
      .catch((err) => {
        console.warn("⚠️ Background location fetch failed (using cached):", err.message)
        // Still start watching in case permission is granted later
        startWatchingLocation()
      })

    return () => {
      console.log("🧹 Cleaning up location watcher")
      stopWatchingLocation()
    }
  }, [])

  const requestLocation = async () => {
    console.log("📍 User requested location update - clearing cache and fetching fresh")
    setLoading(true)
    setError(null)
    
    try {
      // Clear cached location to force fresh fetch
      localStorage.removeItem("userLocation")
      console.log("🗑️ Cleared cached location from localStorage")
      
      // Show loading, so pass showLoading = true
      // forceFresh = true, updateDB = true, showLoading = true
      const location = await getLocation(true, true, true)
      console.log("✅ Fresh location requested successfully:", location)
      console.log("✅ Location details:", {
        formattedAddress: location?.formattedAddress,
        city: location?.city,
        state: location?.state,
        area: location?.area,
        coordinates: location?.latitude && location?.longitude ? 
          `${location.latitude.toFixed(8)}, ${location.longitude.toFixed(8)}` : "N/A"
      })
      
      // Restart watching for live updates
      startWatchingLocation()
      
      return location
    } catch (err) {
      console.error("❌ Failed to request location:", err)
      setError(err.message || "Failed to get location")
      // Still try to start watching in case it works
      startWatchingLocation()
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    location,
    loading,
    error,
    permissionGranted,
    requestLocation,
    startWatchingLocation,
    stopWatchingLocation,
  }
}
