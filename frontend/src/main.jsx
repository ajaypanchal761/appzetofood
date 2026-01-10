import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'
import { getGoogleMapsApiKey } from './lib/utils/googleMapsApiKey.js'

// Load Google Maps API dynamically from backend database
(async () => {
  try {
    const googleMapsApiKey = await getGoogleMapsApiKey()
    if (googleMapsApiKey && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  } catch (error) {
    console.warn('Failed to load Google Maps API key:', error.message)
    // Fallback to env variable
    const fallbackKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (fallbackKey && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${fallbackKey}&libraries=places,geometry`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }
})()

// Apply theme on app initialization
const savedTheme = localStorage.getItem('appTheme') || 'light'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

// Suppress browser extension errors
const originalError = console.error
console.error = (...args) => {
  const errorStr = args.join(' ')
  
  // Suppress browser extension errors
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('chrome-extension://') ||
     args[0].includes('_$initialUrl') ||
     args[0].includes('_$onReInit') ||
     args[0].includes('_$bindListeners'))
  ) {
    return // Suppress browser extension errors
  }
  
  
  // Suppress geolocation timeout errors (non-critical, will retry)
  if (
    errorStr.includes('Timeout expired') ||
    errorStr.includes('GeolocationPositionError') ||
    (errorStr.includes('code: 3') && errorStr.includes('location'))
  ) {
    return // Silently ignore geolocation timeout errors
  }
  
  // Suppress duplicate network error messages (handled by axios interceptor with cooldown)
  if (
    errorStr.includes('🌐 Network Error') ||
    errorStr.includes('Network Error - Backend server may not be running') ||
    (errorStr.includes('ERR_NETWORK') && errorStr.includes('AxiosError')) ||
    errorStr.includes('💡 API Base URL:') ||
    errorStr.includes('💡 Backend URL:') ||
    errorStr.includes('💡 Start backend with:') ||
    errorStr.includes('💡 Check backend health:') ||
    errorStr.includes('💡 Make sure backend server is running:') ||
    errorStr.includes('❌ Backend not accessible at:') ||
    errorStr.includes('💡 Start backend:')
  ) {
    // Only show first occurrence, subsequent ones are suppressed
    // The axios interceptor already handles throttling
    return
  }
  
  // Suppress timeout errors (handled by axios interceptor)
  if (
    errorStr.includes('timeout of') ||
    errorStr.includes('ECONNABORTED') ||
    (errorStr.includes('AxiosError') && errorStr.includes('timeout'))
  ) {
    // Timeout errors are handled by axios interceptor with proper error handling
    return
  }
  
  // Suppress OTP verification errors (handled by UI error messages)
  if (
    errorStr.includes('OTP Verification Error:') ||
    (errorStr.includes('AxiosError') && errorStr.includes('Request failed with status code 403') && errorStr.includes('verify-otp'))
  ) {
    // OTP errors are already displayed to users via UI error messages
    return
  }
  
  originalError.apply(console, args)
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason || event
  const errorMsg = error?.message || String(error) || ''
  const errorName = error?.name || ''
  
  // Suppress geolocation timeout errors
  if (
    errorMsg.includes('Timeout expired') ||
    errorName === 'GeolocationPositionError' ||
    (error?.code === 3 && errorMsg.includes('timeout'))
  ) {
    event.preventDefault() // Prevent error from showing in console
    return
  }
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-center" richColors offset="80px" />
    </BrowserRouter>
  </StrictMode>,
)
