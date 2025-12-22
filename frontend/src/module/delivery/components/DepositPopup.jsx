import { ChevronRight, CreditCard } from "lucide-react"
import {useState} from "react"
import BottomPopup from "./BottomPopup"

export default function DepositPopup() {

  const [showAmountPopup, setShowAmountPopup] = useState(false)
  const [amount, setAmount] = useState(0)

  // Icons mapped by label
  const items = [
    { id: 1, label: "UPI", icon: <UpiIcon /> },
    { id: 2, label: "Debit card/Net banking", icon: <DebitCardIcon /> },
    { id: 3, label: "Airtel store", icon: <DebitCardIcon /> },
    { id: 4, label: "Relicollect store", icon: <DebitCardIcon /> },
  ]

  return (
    <div className="bg-white">
      {items.map(({ id, label, icon }) => (
        <div
          onClick={()=> setShowAmountPopup(true)}
          key={id}
          className="flex items-center justify-between px-4 py-4 border-b border-gray-200 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {icon}
            </div>
            <span className="font-semibold text-sm text-black">{label}</span>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      ))}

<BottomPopup
  isOpen={showAmountPopup}
  onClose={() => setShowAmountPopup(false)}
  title="Pay"
  showCloseButton={true}
  closeOnBackdropClick={true}
  maxHeight="35vh"
>
  <div className="flex flex-col p-4 space-y-4">
    {/* Label */}
    <div className="text-gray-700 font-medium text-lg">Enter Amount</div>

    {/* Number Input with Rupee symbol */}
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
      <input
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
        placeholder="0.00"
      />
    </div>

    {/* Continue Button */}
    <button
      disabled={Number(amount) <= 0}
      // onClick={handleContinue}
      className={`w-full py-2 rounded-lg text-white font-semibold transition-colors
        ${Number(amount) > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-green-200 cursor-not-allowed'}`}
    >
      Continue
    </button>
  </div>
</BottomPopup>

    </div>
  )
}

// Custom SVG for UPI (simplified)
function UpiIcon() {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 12l6-6v12l6-6" />
    </svg>
  )
}

// Custom SVG for DebitCard (a card shape)
function DebitCardIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}