import { ArrowLeft, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  getDeliveryWalletState,
  calculateDeliveryBalances,
  calculatePeriodEarnings
} from "../utils/deliveryWalletState"
import { formatCurrency } from "../../restaurant/utils/currency"

export default function PocketBalancePage() {
  const navigate = useNavigate()
  const [walletState, setWalletState] = useState(() => getDeliveryWalletState())

  // Listen for wallet state updates
  useEffect(() => {
    const handleWalletUpdate = () => {
      setWalletState(getDeliveryWalletState())
    }

    handleWalletUpdate()
    window.addEventListener('deliveryWalletStateUpdated', handleWalletUpdate)
    window.addEventListener('storage', handleWalletUpdate)

    return () => {
      window.removeEventListener('deliveryWalletStateUpdated', handleWalletUpdate)
      window.removeEventListener('storage', handleWalletUpdate)
    }
  }, [])

  const balances = calculateDeliveryBalances(walletState)
  
  // Calculate pocket balance (totalBalance - cashInHand)
  // If negative, delivery person owes money
  const pocketBalance = (balances.totalBalance || 0) - (balances.cashInHand || 0)
  
  // Calculate weekly earnings for the current week
  const weeklyEarnings = calculatePeriodEarnings(walletState, 'week')
  
  // Calculate total withdrawn
  const totalWithdrawn = balances.totalWithdrawn || 0
  
  // Calculate cash collected (cash in hand)
  const cashCollected = balances.cashInHand || 0
  
  // Calculate deductions (pending withdrawals or negative adjustments)
  const deductions = balances.pendingWithdrawals || 0
  
  // Minimum balance required (can be dynamic based on business logic)
  const minBalanceRequired = 300
  
  // Withdrawable amount = pocket balance if positive, otherwise 0
  const withdrawableAmount = pocketBalance > 0 ? pocketBalance : 0

  // Get current week date range
  const getCurrentWeekRange = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const formatDate = (date) => {
      const day = date.getDate()
      const month = date.toLocaleString('en-US', { month: 'short' })
      return `${day} ${month}`
    }

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`
  }

  return (
    <div className="min-h-screen bg-white text-black">

      {/* Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <ArrowLeft onClick={() => navigate(-1)} size={22} className="cursor-pointer" />
        <h1 className="text-lg font-semibold">Pocket balance</h1>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-400 p-4 flex items-start gap-3 text-black">
        <AlertTriangle size={20} />
        <div className="text-sm leading-tight">
          <p className="font-semibold">Withdraw currently disabled</p>
          <p className="text-xs">Withdrawable amount is ₹0</p>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className="px-5 py-6 flex flex-col items-center text-center">
        <p className="text-sm text-gray-600 mb-1">Withdraw amount</p>
        <p className="text-4xl font-bold mb-5">{formatCurrency(withdrawableAmount)}</p>

        <button
          disabled={withdrawableAmount <= 0}
          className={`w-full font-medium py-3 rounded-lg ${
            withdrawableAmount > 0
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Section Header */}
      <div className=" bg-gray-100 py-2 pt-4 text-center text-xs font-semibold text-gray-600">
        POCKET DETAILS • {getCurrentWeekRange()}
      </div>

      {/* Detail Rows */}
      <div className="px-4 pt-2">

        <DetailRow label="Earnings" value={formatCurrency(weeklyEarnings)} />
        <DetailRow label="Amount withdrawn" value={formatCurrency(totalWithdrawn)} />
        <DetailRow label="Cash collected" value={formatCurrency(cashCollected)} />
        <DetailRow label="Deductions" value={formatCurrency(deductions)} />
        <DetailRow label="Pocket balance" value={formatCurrency(pocketBalance)} />

        <DetailRow
          label={
            <div>
              Min. balance required
              <p className="text-xs text-gray-500">
                Resets every Monday and increases with earnings
              </p>
            </div>
          }
          value={formatCurrency(minBalanceRequired)}
          multiline
        />

        <DetailRow label="Withdrawable amount" value={formatCurrency(withdrawableAmount)} />

      </div>
    </div>
  )
}

/* Reusable row component */
function DetailRow({ label, value, multiline = false }) {
  return (
    <div className="py-3 flex justify-between items-start border-b border-gray-100">
      <div className={`text-sm ${multiline ? "" : "font-medium"} text-gray-800`}>
        {label}
      </div>
      <div className="text-sm font-semibold text-black">{value}</div>
    </div>
  )
}
