import { useState, useEffect } from "react"

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Check if location is stored in localStorage
    const storedLocation = localStorage.getItem("userLocation")
    if (storedLocation) {
      try {
        const parsed = JSON.parse(storedLocation)
        setLocation(parsed)
        setPermissionGranted(true)
        setLoading(false)
        return
      } catch (e) {
        console.error("Error parsing stored location:", e)
      }
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    // Request location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocoding to get address
          // Using a free geocoding service (you can replace with your preferred service)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await response.json()

          const locationData = {
            city: data.city || "Unknown City",
            state: data.principalSubdivision || "",
            country: data.countryName || "",
            latitude,
            longitude,
            address: data.locality || data.city || "Unknown Location",
          }

          // Store in localStorage
          localStorage.setItem("userLocation", JSON.stringify(locationData))
          setLocation(locationData)
          setPermissionGranted(true)
          setError(null)
        } catch (err) {
          // Fallback to coordinates if geocoding fails
          const locationData = {
            city: "Current Location",
            state: "",
            country: "",
            latitude,
            longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }
          localStorage.setItem("userLocation", JSON.stringify(locationData))
          setLocation(locationData)
          setPermissionGranted(true)
        }
        setLoading(false)
      },
      (err) => {
        // Default location if permission denied or error
        const defaultLocation = {
          city: "New York",
          state: "NY",
          country: "USA",
          address: "New York, NY",
        }
        setLocation(defaultLocation)
        setError(err.message)
        setPermissionGranted(false)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }, [])

  const requestLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          const data = await response.json()

          const locationData = {
            city: data.city || "Unknown City",
            state: data.principalSubdivision || "",
            country: data.countryName || "",
            latitude,
            longitude,
            address: data.locality || data.city || "Unknown Location",
          }

          localStorage.setItem("userLocation", JSON.stringify(locationData))
          setLocation(locationData)
          setPermissionGranted(true)
          setError(null)
        } catch (err) {
          const locationData = {
            city: "Current Location",
            state: "",
            country: "",
            latitude,
            longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }
          localStorage.setItem("userLocation", JSON.stringify(locationData))
          setLocation(locationData)
          setPermissionGranted(true)
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setPermissionGranted(false)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  return { location, loading, error, permissionGranted, requestLocation }
}



