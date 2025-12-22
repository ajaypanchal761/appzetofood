import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  ArrowLeft,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  getDeliveryTransactionsByType, 
  getDeliveryTransactionsByStatus 
} from "../utils/deliveryWalletState"
import { formatCurrency } from "../../restaurant/utils/currency"

export default function TransactionHistory() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("withdraw")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showDropdown, setShowDropdown] = useState(false)
  const [transactions, setTransactions] = useState([])
  const dropdownRef = useRef(null)

  // Load transactions based on active tab and selected status
  useEffect(() => {
    const loadTransactions = () => {
      let filteredTransactions = []
      
      if (activeTab === "withdraw") {
        filteredTransactions = getDeliveryTransactionsByType("withdrawal")
      } else if (activeTab === "payment") {
        filteredTransactions = getDeliveryTransactionsByType("payment")
      } else {
        filteredTransactions = getDeliveryTransactionsByType("all")
      }
      
      // Filter by status if not "All"
      if (selectedStatus !== "All") {
        filteredTransactions = filteredTransactions.filter(
          t => t.status === selectedStatus
        )
      }
      
      setTransactions(filteredTransactions)
    }

    loadTransactions()

    // Listen for wallet state updates
    const handleWalletUpdate = () => {
      loadTransactions()
    }

    window.addEventListener('deliveryWalletStateUpdated', handleWalletUpdate)
    window.addEventListener('storage', handleWalletUpdate)

    return () => {
      window.removeEventListener('deliveryWalletStateUpdated', handleWalletUpdate)
      window.removeEventListener('storage', handleWalletUpdate)
    }
  }, [activeTab, selectedStatus, location.pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the filter button
      const isFilterButton = event.target.closest('[data-filter-button]')
      
      // Check if click is inside the dropdown
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target)
      
      // Close if clicked outside both button and dropdown
      if (!isFilterButton && !isInsideDropdown) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      // Add event listener after a small delay to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside, true)
      }, 10)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener("click", handleClickOutside, true)
      }
    }
  }, [showDropdown])


  return (
    <div className="min-h-screen bg-[#f6e9dc] overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:py-3 flex items-center gap-4 rounded-b-3xl md:rounded-b-none">
        <button 
          onClick={() => navigate("/delivery/account")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">Transaction History</h1>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24 md:pb-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`pb-3 px-2 text-sm md:text-base font-medium transition-colors relative ${
              activeTab === "withdraw"
                ? "text-[#ff8100]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Withdraw Request
            {activeTab === "withdraw" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff8100]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`pb-3 px-2 text-sm md:text-base font-medium transition-colors relative ${
              activeTab === "payment"
                ? "text-[#ff8100]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Payment History
            {activeTab === "payment" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff8100]"
              />
            )}
          </button>
        </div>

        {/* Transaction History Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">All Transactions</h2>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                setShowDropdown(!showDropdown)
              }}
              data-filter-button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </motion.button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedStatus("All")
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors rounded-t-md ${
                    selectedStatus === "All" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedStatus("Pending")
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedStatus === "Pending" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedStatus("Approved")
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedStatus === "Approved" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedStatus("Denied")
                    setShowDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors rounded-b-md ${
                    selectedStatus === "Denied" ? "bg-gray-100 font-medium" : ""
                  }`}
                >
                  Denied
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold text-base md:text-lg mb-1">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-gray-600 text-sm md:text-base">
                      {transaction.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-xs md:text-sm font-medium px-3 py-1 rounded-full mb-2 ${
                      transaction.status === "Completed" 
                        ? "bg-green-100 text-green-700" 
                        : transaction.status === "Pending"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {transaction.status}
                    </span>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {transaction.date}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-900 text-base md:text-lg">No transactions found</p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

