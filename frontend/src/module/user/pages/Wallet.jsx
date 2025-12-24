import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, IndianRupee, Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />
      case 'deduction':
        return <ArrowUpCircle className="h-5 w-5 text-red-600" />
      case 'refund':
        return <RefreshCw className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'addition':
        return 'text-green-600'
      case 'deduction':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Wallet Icon & Title Section */}
        <div className="flex flex-col items-center justify-center py-4">
          {/* Wallet Icon */}
          <div className="relative mb-3">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg transform rotate-[-5deg]">
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
                <IndianRupee className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            {/* 3D effect shadow */}
            <div className="absolute inset-0 bg-red-800 rounded-xl transform rotate-[-5deg] translate-y-1 -z-10 opacity-25"></div>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">Appzeto Food Money</h1>
          
          {/* Current Balance */}
          <div className="mb-2">
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAmount(currentBalance)}</p>
          </div>
          
          {/* Subtitle */}
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center max-w-xs">
            Add money to enjoy one-tap, seamless payments
          </p>
        </div>

        {/* Add Money Button */}
        <Button 
          className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          onClick={() => {
            // Navigate to add money page or show modal
            console.log('Add money clicked')
          }}
        >
          <Plus className="h-5 w-5" />
          Add money
        </Button>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
            TRANSACTION HISTORY
          </h2>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-[#1a1a1a] border-2 border-green-600 text-green-600'
                      : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className=" py-0 border border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 dark:text-white font-medium text-sm truncate">
                            {transaction.description}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                            {transaction.date} • {transaction.time}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`flex-shrink-0 font-semibold text-base ${getTransactionColor(transaction.type)}`}>
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
            <div className="py-12">
              {/* Placeholder Cards */}
              <div className="space-y-3 mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3"
                    style={{
                      opacity: 0.3 + (i * 0.15)
                    }}
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-600 text-sm text-center font-medium">
                Your transactions will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

