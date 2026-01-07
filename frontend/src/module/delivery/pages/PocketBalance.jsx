import { ArrowLeft, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  fetchDeliveryWallet,
  calculateDeliveryBalances,
  calculatePeriodEarnings
} from "../utils/deliveryWalletState"
import { formatCurrency } from "../../restaurant/utils/currency"

export default function PocketBalancePage() {
  const navigate = useNavigate()
  const [walletState, setWalletState] = useState({
    totalBalance: 0,
    cashInHand: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
    transactions: [],
    joiningBonusClaimed: false
  })
  const [walletLoading, setWalletLoading] = useState(true)

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setWalletLoading(true)
        const walletData = await fetchDeliveryWallet()
        setWalletState(walletData)
      } catch (error) {
        console.error('Error fetching wallet data:', error)
        setWalletState({
          totalBalance: 0,
          cashInHand: 0,
          totalWithdrawn: 0,
          totalEarned: 0,
          transactions: [],
          joiningBonusClaimed: false
        })
      } finally {
        setWalletLoading(false)
      }
    }

    fetchWalletData()

    // Listen for wallet state updates
    const handleWalletUpdate = () => {
      fetchWalletData()
    }

    window.addEventListener('deliveryWalletStateUpdated', handleWalletUpdate)
    window.addEventListener('storage', handleWalletUpdate)

    return () => {
      window.removeEventListener('deliveryWalletStateUpdated', handleWalletUpdate)
      window.removeEventListener('storage', handleWalletUpdate)
    }
  }, [])

  const balances = calculateDeliveryBalances(walletState)
  
  // Calculate weekly earnings for the current week (excludes bonus)
  const weeklyEarnings = calculatePeriodEarnings(walletState, 'week')
  
  // Calculate total bonus amount from all bonus transactions
  const totalBonus = walletState?.transactions
    ?.filter(t => t.type === 'bonus' && t.status === 'Completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  
  // Calculate total withdrawn (needed for pocket balance calculation)
  const totalWithdrawn = balances.totalWithdrawn || 0
  
  // Pocket balance = total balance (includes bonus + earnings)
  // Formula: Pocket Balance = Earnings + Bonus - Withdrawals
  // Use walletState.pocketBalance if available, otherwise calculate from totalBalance
  let pocketBalance = walletState?.pocketBalance !== undefined 
    ? walletState.pocketBalance 
    : (walletState?.totalBalance || balances.totalBalance || 0)
  
  // IMPORTANT: Ensure pocket balance includes bonus
  // If backend totalBalance is 0 but we have bonus, calculate it manually
  // This ensures bonus is always reflected in pocket balance and withdrawable amount
  if (pocketBalance === 0 && totalBonus > 0) {
    // If totalBalance is 0 but we have bonus, pocket balance = bonus
    pocketBalance = totalBonus
  } else if (pocketBalance > 0 && totalBonus > 0) {
    // Verify pocket balance includes bonus
    // Calculate expected: Earnings + Bonus - Withdrawals
    const expectedBalance = weeklyEarnings + totalBonus - totalWithdrawn
    // Use the higher value to ensure bonus is included
    if (expectedBalance > pocketBalance) {
      pocketBalance = expectedBalance
    }
  }
  
  // Calculate cash collected (cash in hand)
  const cashCollected = balances.cashInHand || 0
  
  // Calculate deductions (pending withdrawals or negative adjustments)
  const deductions = balances.pendingWithdrawals || 0
  
  // Minimum balance required (can be dynamic based on business logic)
  const minBalanceRequired = 300
  
  // Withdrawable amount = pocket balance (includes bonus + earnings)
  // Pocket balance already includes bonus, so withdrawable amount should show it
  const withdrawableAmount = pocketBalance > 0 ? pocketBalance : 0
  
  // Debug logging
  console.log('💰 PocketBalance Page Calculations:', {
    walletStateTotalBalance: walletState?.totalBalance,
    walletStatePocketBalance: walletState?.pocketBalance,
    balancesTotalBalance: balances.totalBalance,
    calculatedPocketBalance: pocketBalance,
    totalBonus: totalBonus,
    weeklyEarnings: weeklyEarnings,
    withdrawableAmount: withdrawableAmount
  })

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
        <DetailRow label="Bonus" value={formatCurrency(totalBonus)} />
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
