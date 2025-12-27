import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, IndianRupee, Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AnimatedPage from "../components/AnimatedPage"

// Transaction types
const TRANSACTION_TYPES = {
  ALL: 'all',
  ADDITIONS: 'additions',
  DEDUCTIONS: 'deductions',
  REFUNDS: 'refunds'
}

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    type: 'addition',
    amount: 500,
    description: 'Added money via UPI',
    date: '2024-01-15',
    time: '10:30 AM',
    status: 'completed'
  },
  {
    id: 2,
    type: 'deduction',
    amount: 250,
    description: 'Order payment - Pizza Paradise',
    date: '2024-01-14',
    time: '08:15 PM',
    status: 'completed'
  },
  {
    id: 3,
    type: 'refund',
    amount: 150,
    description: 'Refund - Order cancelled',
    date: '2024-01-13',
    time: '02:45 PM',
    status: 'completed'
  },
  {
    id: 4,
    type: 'deduction',
    amount: 180,
    description: 'Order payment - Biryani House',
    date: '2024-01-12',
    time: '07:20 PM',
    status: 'completed'
  },
  {
    id: 5,
    type: 'addition',
    amount: 1000,
    description: 'Added money via Card',
    date: '2024-01-10',
    time: '11:00 AM',
    status: 'completed'
  },
  {
    id: 6,
    type: 'deduction',
    amount: 320,
    description: 'Order payment - Chinese Wok',
    date: '2024-01-09',
    time: '06:30 PM',
    status: 'completed'
  },
  {
    id: 7,
    type: 'refund',
    amount: 80,
    description: 'Refund - Partial refund',
    date: '2024-01-08',
    time: '03:15 PM',
    status: 'completed'
  },
  {
    id: 8,
    type: 'addition',
    amount: 300,
    description: 'Added money via Wallet',
    date: '2024-01-07',
    time: '09:45 AM',
    status: 'completed'
  },
]

// Calculate current balance
const calculateBalance = (transactions) => {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === 'addition' || transaction.type === 'refund') {
      return balance + transaction.amount
    } else if (transaction.type === 'deduction') {
      return balance - transaction.amount
    }
    return balance
  }, 0)
}

export default function Wallet() {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState(TRANSACTION_TYPES.ALL)
  const currentBalance = calculateBalance(mockTransactions)

  // Filter transactions based on selected filter
  const filteredTransactions = useMemo(() => {
    if (selectedFilter === TRANSACTION_TYPES.ALL) {
      return mockTransactions
    }
    return mockTransactions.filter(transaction => {
      if (selectedFilter === TRANSACTION_TYPES.ADDITIONS) {
        return transaction.type === 'addition'
      } else if (selectedFilter === TRANSACTION_TYPES.DEDUCTIONS) {
        return transaction.type === 'deduction'
      } else if (selectedFilter === TRANSACTION_TYPES.REFUNDS) {
        return transaction.type === 'refund'
      }
      return true
    })
  }, [selectedFilter])

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'addition':
        return <ArrowDownCircle className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-600 dark:text-green-400" />
      case 'deduction':
        return <ArrowUpCircle className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-red-600 dark:text-red-400" />
      case 'refund':
        return <RefreshCw className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
      default:
        return null
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'addition':
        return 'text-green-600 dark:text-green-400'
      case 'deduction':
        return 'text-red-600 dark:text-red-400'
      case 'refund':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-5">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-white" />
            </button>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8">
        {/* Wallet Info Section - Desktop: Side by side, Mobile: Stacked */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 lg:gap-10">
          {/* Left: Wallet Icon & Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 lg:gap-8 flex-1">
            {/* Wallet Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transform rotate-[-5deg]">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <IndianRupee className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16 text-white" strokeWidth={2.5} />
                </div>
              </div>
              {/* 3D effect shadow */}
              <div className="absolute inset-0 bg-red-800 rounded-xl md:rounded-2xl transform rotate-[-5deg] translate-y-1 -z-10 opacity-25"></div>
            </div>

            {/* Wallet Details */}
            <div className="flex flex-col md:items-start items-center text-center md:text-left">
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">Appzeto Food Money</h2>
              
              {/* Current Balance */}
              <div className="mb-2 md:mb-3">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm lg:text-base mb-1">Current Balance</p>
                <p className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 dark:text-white">{formatAmount(currentBalance)}</p>
              </div>
              
              {/* Subtitle */}
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm lg:text-base text-center md:text-left max-w-md">
                Add money to enjoy one-tap, seamless payments
              </p>
            </div>
          </div>

          {/* Right: Add Money Button */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button 
              className="w-full md:w-auto md:min-w-[200px] lg:min-w-[240px] h-12 md:h-14 lg:h-16 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold text-sm md:text-base lg:text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                // Navigate to add money page or show modal
                console.log('Add money clicked')
              }}
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              Add money
            </Button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Header with Title and Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
              TRANSACTION HISTORY
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-2 md:pb-0">
              {[
                { id: TRANSACTION_TYPES.ALL, label: 'All Transactions' },
                { id: TRANSACTION_TYPES.ADDITIONS, label: 'Additions' },
                { id: TRANSACTION_TYPES.DEDUCTIONS, label: 'Deductions' },
                { id: TRANSACTION_TYPES.REFUNDS, label: 'Refunds' },
              ].map((filter) => {
                const isSelected = selectedFilter === filter.id
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl text-xs md:text-sm lg:text-base font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-[#1a1a1a] border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 shadow-sm'
                        : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm'
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="py-0 border border-gray-100 dark:border-gray-800 shadow-sm dark:bg-[#1a1a1a] hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4 md:p-5 lg:p-6">
                    <div className="flex items-center justify-between gap-4 md:gap-6">
                      <div className="flex items-center gap-4 md:gap-5 lg:gap-6 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800/50">
                            {getTransactionIcon(transaction.type)}
                          </div>
                        </div>
                        
                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white font-semibold text-sm md:text-base lg:text-lg truncate mb-1">
                            {transaction.description}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm lg:text-base">
                            {transaction.date} • {transaction.time}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`flex-shrink-0 font-bold text-lg md:text-xl lg:text-2xl ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deduction' ? '-' : '+'}
                        {formatAmount(transaction.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-12 md:py-16 lg:py-20 xl:py-24">
              {/* Placeholder Cards */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 max-w-2xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 md:gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 md:px-5 lg:px-6 py-3 md:py-4"
                    style={{
                      opacity: 0.3 + (i * 0.15)
                    }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-2 md:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base lg:text-lg text-center font-medium">
                Your transactions will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}

