import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Lenis from "lenis"
import { ArrowLeft, Settings, ChevronRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

export default function RestaurantStatus() {
  const navigate = useNavigate()
  const [deliveryStatus, setDeliveryStatus] = useState(false)
  const [rushMode, setRushMode] = useState(false)

  // Load delivery status from localStorage on mount
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem('restaurant_online_status')
      if (savedStatus !== null) {
        setDeliveryStatus(JSON.parse(savedStatus))
      }
    } catch (error) {
      console.error("Error loading delivery status:", error)
    }
  }, [])

  // Handle delivery status change
  const handleDeliveryStatusChange = (checked) => {
    setDeliveryStatus(checked)
    try {
      localStorage.setItem('restaurant_online_status', JSON.stringify(checked))
      // Dispatch custom event for navbar to listen
      window.dispatchEvent(new CustomEvent('restaurantStatusChanged', { 
        detail: { isOnline: checked } 
      }))
    } catch (error) {
      console.error("Error saving delivery status:", error)
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Restaurant status</h1>
            <p className="text-sm text-gray-500 mt-0.5">You are mapped to 1 restaurant</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Restaurant Information Card */}
        <Card className="bg-gray-50 border-none py-0 shadow-sm rounded-b-none rounded-t-lg">
          <CardContent className="p-4 gap-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  Kadhai Chammach Restaurant
                </h2>
                <p className="text-sm text-gray-500">
                  ID: 20959122 | By Pass Road (South), Indore
                </p>
              </div>
              <button
                onClick={() => {
                  // Navigate to restaurant settings
                  navigate("/restaurant/explore")
                }}
                className="ml-3 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shrink-0"
                aria-label="Explore more"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900 mb-1.5">Delivery status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${deliveryStatus ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <p className="text-sm text-gray-500">
                  {deliveryStatus ? 'Receiving orders' : 'Not receiving orders'}
                </p>
              </div>
            </div>
            <Switch
              checked={deliveryStatus}
              onCheckedChange={handleDeliveryStatusChange}
              className="ml-4 data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Rush Mode */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900">Rush mode</p>
            </div>
            <Switch
              checked={rushMode}
              onCheckedChange={setRushMode}
              className="ml-4 data-[state=unchecked]:bg-gray-300"
            />
          </div>

          <p className="text-sm text-gray-700 mb-2">Next scheduled delivery slot</p>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-gray-900">
              14 Dec, 03:45 am - 02:15 pm
            </p>
            <button
              onClick={() => navigate("/restaurant/outlet-timings")}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          

          </CardContent>
        </Card>

  {/* Warning Message */}
  <div className="bg-pink-50 rounded-b-lg rounded-t-none p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-gray-700 flex-1">
            You are currently outside your scheduled delivery timings.
          </p>
        </div>

      
      </div>
    </div>
  )
}
