import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft,
  ChevronDown,
  ArrowRight,
  Calendar
} from "lucide-react"
import { formatCurrency } from "../../restaurant/utils/currency"
import { DateRangeCalendar } from "@/components/ui/date-range-calendar"

export default function Payout() {
  const navigate = useNavigate()
  
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    return weekAgo
  })
  const [endDate, setEndDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef(null)
  
  // Format date range display
  const dateRangeDisplay = useMemo(() => {
    if (!startDate || !endDate) return "Select date range"
    const formatDate = (date) => {
      const day = date.getDate()
      const month = date.toLocaleString('en-US', { month: 'short' })
      return `${day} ${month}`
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }, [startDate, endDate])
  
  // Handle date range change from calendar
  const handleDateRangeChange = (start, end) => {
    setStartDate(start)
    setEndDate(end)
    // Here you would fetch payment data for the selected date range
    // fetchPayoutData(start, end)
  }
  
  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false)
      }
    }
    
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])
  
  // Fetch payout data based on selected date range (mock function - replace with actual API call)
  const getPayoutDataForDateRange = (start, end) => {
    // This would be an API call in a real application
    // For now, return mock data that could vary by date range
    return {
      payoutAmount: 10,
      earnings: 1593.93,
      tips: 10,
      deductions: -14.44,
      excessCash: -1632.81,
      withdrawals: 0,
      transfers: 38.32,
      paymentViaPocket: 0
    }
  }
  
  // Get payout data for current selected date range
  const payoutData = useMemo(() => {
    if (!startDate || !endDate) return {
      payoutAmount: 0,
      earnings: 0,
      tips: 0,
      deductions: 0,
      excessCash: 0,
      withdrawals: 0,
      transfers: 0,
      paymentViaPocket: 0
    }
    return getPayoutDataForDateRange(startDate, endDate)
  }, [startDate, endDate])
  
  const payoutAmount = payoutData.payoutAmount
  const earnings = payoutData.earnings
  const tips = payoutData.tips
  const deductions = payoutData.deductions
  const excessCash = payoutData.excessCash
  const withdrawals = payoutData.withdrawals
  const transfers = payoutData.transfers
  const paymentViaPocket = payoutData.paymentViaPocket

  // Calculate total payout
  const totalPayout = earnings + tips + deductions + excessCash + withdrawals + transfers + paymentViaPocket

  const breakdownItems = [
    { label: "Earnings", amount: earnings, isNegative: false },
    { label: "Tips", amount: tips, isNegative: false },
    { label: "Deductions", amount: deductions, isNegative: true },
    { label: "Excess cash", amount: excessCash, isNegative: true },
    { label: "Withdrawals", amount: withdrawals, isNegative: false },
    { label: "Transfers", amount: transfers, isNegative: false },
    { label: "Payment via pocket", amount: paymentViaPocket, isNegative: false }
  ]

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-green-700 flex flex-col border-b border-gray-200 p-3 rounded-b-xl md:rounded-b-none">
        <div className="relative flex items-center pt-2 justify-center text-white">
          {/* Left button */} 
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
  
          {/* Centered title */}
          <h1 className="text-xl md:text-2xl font-semibold text-white ">
            Payout
          </h1>
        </div>
  
        <div className="bg-white w-full rounded-xl p-6 mt-6 border border-gray-100">
          {/* Date Range Selector with Calendar */}
          <div className="flex justify-center mb-6 relative" ref={calendarRef}>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-gray-900 text-sm font-medium">{dateRangeDisplay}</span>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Calendar Popup */}
            {showCalendar && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 md:left-auto md:transform-none md:right-0">
                <DateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={handleDateRangeChange}
                  onClose={() => setShowCalendar(false)}
                />
              </div>
            )}
          </div>

          {/* Payout Amount */}
          <div className="flex items-center justify-center mb-6">
            <div className="text-gray-900 text-4xl md:text-5xl font-bold">
              {formatCurrency(payoutAmount)}
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-gray-300 mb-6"></div>

          {/* Payout Message */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-600 text-sm md:text-base">You will receive the payout today</p>
            <span className="text-xl">🎉</span>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="px-4 py-6">

        {/* Detailed Breakdown Cards */}
        <div className="space-y-3">
          {breakdownItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors border border-gray-100"
            >
              <span className="text-gray-900 text-sm md:text-base font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm md:text-base font-medium ${
                  item.isNegative ? "text-orange-500" : "text-gray-900"
                }`}>
                  {item.amount < 0 ? "-" : ""}
                  {formatCurrency(Math.abs(item.amount))}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

