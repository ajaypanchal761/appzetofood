import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { useProgressStore } from "../store/progressStore"
import FeedNavbar from "../components/FeedNavbar"

export default function TripHistory() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("daily")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTripType, setSelectedTripType] = useState("ALL TRIPS")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTripTypePicker, setShowTripTypePicker] = useState(false)

  const tripTypes = ["ALL TRIPS", "Completed", "Cancelled", "Pending"]

  // Generate dummy trip data based on selected date and filters
  const generateDummyTrips = (date, period, tripType) => {
    const trips = []
    const seed = date.toISOString().split('T')[0].replace(/-/g, '')
    const seedNum = parseInt(seed) % 1000
    
    const count = period === 'daily' ? (seedNum % 10) + 1 : period === 'weekly' ? (seedNum % 30) + 5 : (seedNum % 50) + 10

    for (let i = 0; i < count; i++) {
      const orderId = `ORD${String(100000 + seedNum + i).slice(-6)}`
      const statuses = tripType === "ALL TRIPS" 
        ? ["Completed", "Cancelled", "Pending"]
        : [tripType]
      
      const status = statuses[(seedNum + i) % statuses.length]
      const hours = Math.floor((seedNum + i) % 24)
      const minutes = Math.floor((seedNum + i * 2) % 60)
      const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      
      const amount = ((seedNum + i) % 500) + 50
      
      trips.push({
        id: orderId,
        orderId,
        restaurant: `Restaurant ${String.fromCharCode(65 + (seedNum + i) % 26)}`,
        customer: `Customer ${i + 1}`,
        status,
        time,
        amount,
        date: new Date(date.getTime() - i * 3600000)
      })
    }

    return trips.sort((a, b) => b.date - a.date)
  }

  const [trips, setTrips] = useState(() => 
    generateDummyTrips(selectedDate, activeTab, selectedTripType)
  )

  const { updateTodayTrips } = useProgressStore()

  useEffect(() => {
    const tripsData = generateDummyTrips(selectedDate, activeTab, selectedTripType)
    setTrips(tripsData)
    
    // Update store if viewing today's data and showing all trips
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateNormalized = new Date(selectedDate)
    selectedDateNormalized.setHours(0, 0, 0, 0)
    
    if (activeTab === "daily" && selectedDateNormalized.getTime() === today.getTime() && selectedTripType === "ALL TRIPS") {
      updateTodayTrips(tripsData.length)
    }
  }, [selectedDate, activeTab, selectedTripType, updateTodayTrips])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDatePicker(false)
      setShowTripTypePicker(false)
    }
    if (showDatePicker || showTripTypePicker) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showDatePicker, showTripTypePicker])

  // Format date for display
  const formatDateDisplay = (date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      const options = { day: 'numeric', month: 'short' }
      return date.toLocaleDateString('en-US', options)
    }
  }

  // Generate recent dates for picker
  const generateRecentDates = () => {
    const dates = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date)
    }
    return dates
  }

  const recentDates = generateRecentDates()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-lg font-bold text-black flex-1 text-center">Trip History</h1>
        <div className="w-10"></div>
      </div>

      {/* Period Selection Tabs */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => {
              setActiveTab("daily")
              setShowDatePicker(false)
            }}
            className="relative"
          >
            <span className={`text-base font-medium transition-colors ${
              activeTab === "daily" ? "text-green-600" : "text-gray-500"
            }`}>
              Daily
            </span>
            {activeTab === "daily" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 mt-2"></div>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("weekly")
              setShowDatePicker(false)
            }}
            className="relative"
          >
            <span className={`text-base font-medium transition-colors ${
              activeTab === "weekly" ? "text-green-600" : "text-gray-500"
            }`}>
              Weekly
            </span>
            {activeTab === "weekly" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 mt-2"></div>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("monthly")
              setShowDatePicker(false)
            }}
            className="relative"
          >
            <span className={`text-base font-medium transition-colors ${
              activeTab === "monthly" ? "text-green-600" : "text-gray-500"
            }`}>
              Monthly
            </span>
            {activeTab === "monthly" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 mt-2"></div>
            )}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="px-4 py-4 border-b border-gray-200 flex gap-3">
        {/* Date/Period Selector */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDatePicker(!showDatePicker)
            setShowTripTypePicker(false)
          }}
          className="flex-1 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-black">
            {formatDateDisplay(selectedDate)}: {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Trip Type Selector */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowTripTypePicker(!showTripTypePicker)
            setShowDatePicker(false)
          }}
          className="flex-1 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-black">{selectedTripType}</span>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showTripTypePicker ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <div className="fixed left-4 right-4 top-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {recentDates.map((date, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedDate(date)
                setShowDatePicker(false)
              }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                date.toDateString() === selectedDate.toDateString() ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <span className="text-sm text-black">
                {formatDateDisplay(date)}: {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Trip Type Picker Dropdown */}
      {showTripTypePicker && (
        <div className="fixed right-4 top-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
          {tripTypes.map((type, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedTripType(type)
                setShowTripTypePicker(false)
              }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                type === selectedTripType ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <span className="text-sm text-black">{type}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="px-4 py-6">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-base">No trips found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-base font-semibold text-black">{trip.orderId}</p>
                    <p className="text-sm text-gray-600 mt-1">{trip.restaurant}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    trip.status === 'Completed' ? 'text-green-600' :
                    trip.status === 'Cancelled' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium text-black mt-1">{trip.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-black mt-1">₹{trip.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

