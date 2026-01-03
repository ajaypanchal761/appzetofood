import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

// Apply theme on app initialization
const savedTheme = localStorage.getItem('appTheme') || 'light'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

// Suppress browser extension errors and non-critical Ola Maps SDK errors
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
  
  // Suppress non-critical Ola Maps SDK errors
  if (
    errorStr.includes('AbortError') ||
    errorStr.includes('user aborted') ||
    errorStr.includes('sprite@2x.json') ||
    errorStr.includes('sprite@') ||
    errorStr.includes('3d_model') ||
    errorStr.includes('Source layer') && errorStr.includes('does not exist') ||
    (errorStr.includes('AJAXError') && (errorStr.includes('sprite') || errorStr.includes('olamaps.io'))) ||
    (errorStr.includes('olamaps-web-sdk') && (errorStr.includes('AbortError') || errorStr.includes('AJAXError')))
  ) {
    return // Silently ignore non-critical Ola Maps SDK errors
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
    (errorStr.includes('ERR_NETWORK') && errorStr.includes('AxiosError'))
  ) {
    // Only show first occurrence, subsequent ones are suppressed
    // The axios interceptor already handles throttling
    return
  }
  
  originalError.apply(console, args)
}

// Handle unhandled promise rejections from Ola Maps SDK
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason || event
  const errorMsg = error?.message || String(error) || ''
  const errorName = error?.name || ''
  const errorStack = error?.stack || ''
  
  // Suppress non-critical errors from Ola Maps SDK
  if (
    errorName === 'AbortError' ||
    errorMsg.includes('AbortError') ||
    errorMsg.includes('user aborted') ||
    errorMsg.includes('3d_model') ||
    (errorMsg.includes('Source layer') && errorMsg.includes('does not exist')) ||
    (errorMsg.includes('AJAXError') && (errorMsg.includes('sprite') || errorMsg.includes('olamaps.io'))) ||
    errorStack.includes('olamaps-web-sdk')
  ) {
    event.preventDefault() // Prevent error from showing in console
    return
  }
  
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
