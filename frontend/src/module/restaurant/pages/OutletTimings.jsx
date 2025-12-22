import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import { ArrowLeft, ChevronUp, ChevronDown, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const STORAGE_KEY = "restaurant_outlet_timings"

const getDefaultDays = () => ({
  Monday: { isOpen: true, slots: [{ id: Date.now(), start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
  Tuesday: { isOpen: true, slots: [{ id: Date.now() + 1, start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
  Wednesday: { isOpen: true, slots: [{ id: Date.now() + 2, start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
  Thursday: { isOpen: true, slots: [{ id: Date.now() + 3, start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
  Friday: { isOpen: true, slots: [{ id: Date.now() + 4, start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
  Saturday: { isOpen: true, slots: [{ id: Date.now() + 5, start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
  Sunday: { isOpen: true, slots: [{ id: Date.now() + 6, start: "03:45", end: "02:15", startPeriod: "am", endPeriod: "pm" }] },
})

export default function OutletTimings() {
  const navigate = useNavigate()
  const [expandedDay, setExpandedDay] = useState("Monday")
  const isInternalUpdate = useRef(false)
  const [days, setDays] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate and ensure all days have proper structure
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        const validated = {}
        dayNames.forEach(day => {
          if (parsed[day] && parsed[day].slots && Array.isArray(parsed[day].slots)) {
            validated[day] = {
              isOpen: parsed[day].isOpen !== undefined ? parsed[day].isOpen : true,
              slots: parsed[day].slots.filter(slot => slot && slot.start && slot.end)
            }
          } else {
            validated[day] = { isOpen: true, slots: [] }
          }
        })
        return validated
      }
    } catch (error) {
      console.error("Error loading outlet timings:", error)
    }
    return getDefaultDays()
  })

  // Save to localStorage whenever days change (but only if it's an internal update)
  useEffect(() => {
    if (isInternalUpdate.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(days))
        // Dispatch event to notify other components (like DaySlots page)
        window.dispatchEvent(new Event("outletTimingsUpdated"))
      } catch (error) {
        console.error("Error saving outlet timings:", error)
      }
      isInternalUpdate.current = false
    }
  }, [days])

  // Listen for updates from day slots page (external updates)
  useEffect(() => {
    const handleUpdate = () => {
      // Only update if it's not our own update
      if (!isInternalUpdate.current) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY)
          if (saved) {
            const newDays = JSON.parse(saved)
            setDays(prevDays => {
              // Only update if data actually changed
              if (JSON.stringify(newDays) !== JSON.stringify(prevDays)) {
                return newDays
              }
              return prevDays
            })
          }
        } catch (error) {
          console.error("Error loading updated outlet timings:", error)
        }
      }
    }

    window.addEventListener("outletTimingsUpdated", handleUpdate)
    return () => window.removeEventListener("outletTimingsUpdated", handleUpdate)
  }, [])

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

  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  const toggleDayOpen = (day) => {
    isInternalUpdate.current = true
    setDays(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }))
  }

  // Calculate duration between two times
  const calculateDuration = (start, end, startPeriod, endPeriod) => {
    const parseTime = (timeStr, period) => {
      if (!timeStr || !timeStr.includes(":")) return 0
      const [hours, minutes] = timeStr.split(":")
      let hour = parseInt(hours) || 0
      const mins = parseInt(minutes) || 0
      if (period === "pm" && hour !== 12) hour += 12
      if (period === "am" && hour === 12) hour = 0
      return hour * 60 + mins
    }

    const startMinutes = parseTime(start, startPeriod)
    const endMinutes = parseTime(end, endPeriod)
    let diff = endMinutes - startMinutes
    
    // Handle next day
    if (diff < 0) diff += 24 * 60
    
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    
    if (minutes === 0) {
      return `${hours} hrs`
    }
    return `${hours} hrs ${minutes} mins`
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/restaurant")}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Outlet timings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Appzeto delivery Section Header */}
        <div className="mb-6">
          <div className="text-center mb-2">
            <h2 className="text-base font-semibold text-blue-600">Appzeto delivery</h2>
          </div>
          <div className="h-0.5 bg-blue-600"></div>
        </div>

        {/* Day-wise Accordion */}
        <div className="space-y-2">
          {dayNames.map((day, index) => {
            const dayData = days[day] || { isOpen: true, slots: [] }
            const isExpanded = expandedDay === day

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="bg-white border border-gray-200 rounded-sm overflow-hidden"
              >
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(day)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-color transition-all ${isExpanded ? "bg-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-700" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-700" />
                    )}
                    <span className="text-base font-medium text-gray-900">{day}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">{dayData.isOpen ? "Open" : "Close"}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={dayData.isOpen}
                        onCheckedChange={() => toggleDayOpen(day)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 border-t border-gray-100">
                        {dayData.slots && Array.isArray(dayData.slots) && dayData.slots.length > 0 ? (
                          dayData.slots.map((slot, slotIndex) => {
                            if (!slot || !slot.start || !slot.end) return null
                            const duration = calculateDuration(
                              slot.start,
                              slot.end,
                              slot.startPeriod || "am",
                              slot.endPeriod || "pm"
                            )
                            return (
                              <motion.div
                                key={slot.id || slotIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: slotIndex * 0.1 }}
                                className="pl-6 space-y-2"
                              >
                                <p className="text-sm text-gray-900 font-medium">Slot {slotIndex + 1}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-700">
                                    {slot.start || "00:00"} {(slot.startPeriod || "am").toUpperCase()} to {slot.end || "00:00"} {(slot.endPeriod || "pm").toUpperCase()}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">{duration}</span>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })
                        ) : (
                          <p className="pl-6 text-sm text-gray-500">No slots configured</p>
                        )}
                        <button
                          onClick={() => {
                            navigate(`/restaurant/outlet-timings/${day.toLowerCase()}`)
                          }}
                          className="pl-6 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          + Add / Edit time
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
