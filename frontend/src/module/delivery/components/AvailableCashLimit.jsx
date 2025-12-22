export default function AvailableCashLimit({onClose}) {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">

      {/* Rows */}
      <div className="">
        {/* Total cash limit with subtext */}
        <div className="py-3 flex justify-between border-b border-gray-200 items-start">
          <div>
            <div className="text-sm font-medium">Total cash limit</div>
            <div className="text-xs text-gray-500 leading-tight mt-1">
              Resets every Monday and increases with<br />
              earnings
            </div>
          </div>
          <div className="text-sm font-semibold">₹750</div>
        </div>

        {/* Other rows */}
        <DetailRow label="Cash in hand" value="₹0" />
        <DetailRow label="Deductions" value="₹0" />
        <DetailRow label="Pocket withdrawals" value="₹0" />
        <DetailRow label="Settlement adjustment" value="₹0" />

        {/* Final total */}
        <div className="py-3 flex justify-between items-center border-b border-gray-200">
          <div className="text-sm font-medium">Available cash limit</div>
          <div className="text-sm font-semibold">₹750</div>
        </div>
      </div>

      {/* Bottom Button */}
      <div onClick={onClose} className="mt-6">
        <button className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium">
          Okay
        </button>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="py-3 flex justify-between items-center border-b border-gray-200">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
