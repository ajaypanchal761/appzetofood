import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Edit2, ChevronRight } from "lucide-react"
import BottomPopup from "../components/BottomPopup"
import { toast } from "sonner"

export default function ProfileDetails() {
  const navigate = useNavigate()
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [alternatePhone, setAlternatePhone] = useState("")
  const [showVehiclePopup, setShowVehiclePopup] = useState(false)
  const [showAlternatePhonePopup, setShowAlternatePhonePopup] = useState(false)
  const [vehicleInput, setVehicleInput] = useState("")
  const [alternatePhoneInput, setAlternatePhoneInput] = useState("")

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Profile</h1>
      </div>

      {/* Profile Picture Area */}
      <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
        <img
          src="https://i.pravatar.cc/400?img=12"
          width={400}
          height={400}
          alt="Profile"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Rider Details Section */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Rider details</h2>
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-2 px-3 flex items-center justify-between">
              <p className="text-base text-gray-900">
                Sumit Jaiswal (FE7583766)
              </p>
            </div>
            <div className="divide-y divide-gray-200">
            <div className="p-2 px-3 flex items-center justify-between">
                <p className="text-sm text-gray-900">Zone</p>
                <p className="text-base text-gray-900">Central Indore</p>
              </div>
            <div className="p-2 px-3 flex items-center justify-between">
                <p className="text-sm text-gray-900">City</p>
                <p className="text-base text-gray-900">Indore</p>
              </div>
            <div className="p-2 px-3 flex items-center justify-between">
                <p className="text-sm text-gray-900">Vehicle type</p>
                <p className="text-base text-gray-900">Bike</p>
              </div>
            <div className="p-2 px-3 flex items-center justify-between">
                <p className="text-sm text-gray-900">Vehicle number</p>
                {vehicleNumber ? (
                  <div className="flex items-center gap-2">
                    <p className="text-base text-gray-900">{vehicleNumber}</p>
                    <button
                      onClick={() => {
                        setVehicleInput(vehicleNumber)
                        setShowVehiclePopup(true)
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setVehicleInput("")
                      setShowVehiclePopup(true)
                    }}
                    className="flex items-center gap-2 text-green-600 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Coach Details Section */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-3">Fleet coach details</h2>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <button
              onClick={() => {}}
              className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                alt="Fleet Coach"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <p className="text-sm text-gray-900">etern</p>
                <p className="text-base font-semibold text-gray-900">Harish Rajak</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Personal Details Section */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-3">Personal details</h2>
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Phone</p>
                <p className="text-base text-gray-900">7691810506</p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Alternate phone</p>
                <p className="text-base text-gray-900">{alternatePhone || "-"}</p>
              </div>
              <button
                onClick={() => {
                  setAlternatePhoneInput(alternatePhone)
                  setShowAlternatePhonePopup(true)
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Edit2 className="w-5 h-5 text-green-600" />
              </button>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">DL Expiry</p>
                <p className="text-base text-gray-900"></p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Rating</p>
                <p className="text-base text-gray-900"></p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Extra Cash</p>
                <p className="text-base text-gray-900">0.0</p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">App Version</p>
                <p className="text-base text-gray-900">14.1.0</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Bank details</h2>
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Bank Name</p>
                <p className="text-base text-gray-900"></p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Account Number</p>
                <p className="text-base text-gray-900"></p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">IFSC Code</p>
                <p className="text-base text-gray-900"></p>
              </div>
            </div>
            <div className="p-2 px-3 flex items-center justify-between">
              <div className="w-full align-center flex content-center justify-between">
                <p className="text-sm text-gray-900 mb-1">Pan Card Number</p>
                <p className="text-base text-gray-900"></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Number Popup */}
      <BottomPopup
        isOpen={showVehiclePopup}
        onClose={() => setShowVehiclePopup(false)}
        title={vehicleNumber ? "Edit Vehicle Number" : "Add Vehicle Number"}
        showCloseButton={true}
        closeOnBackdropClick={true}
        maxHeight="50vh"
      >
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={vehicleInput}
              onChange={(e) => setVehicleInput(e.target.value)}
              placeholder="Enter vehicle number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              if (vehicleInput.trim()) {
                setVehicleNumber(vehicleInput.trim())
                setShowVehiclePopup(false)
                toast.success("Vehicle number updated successfully")
              } else {
                toast.error("Please enter a valid vehicle number")
              }
            }}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {vehicleNumber ? "Update" : "Add"}
          </button>
        </div>
      </BottomPopup>

      {/* Alternate Phone Popup */}
      <BottomPopup
        isOpen={showAlternatePhonePopup}
        onClose={() => setShowAlternatePhonePopup(false)}
        title={alternatePhone ? "Edit Alternate Phone" : "Add Alternate Phone"}
        showCloseButton={true}
        closeOnBackdropClick={true}
        maxHeight="50vh"
      >
        <div className="space-y-4">
          <div>
            <input
              type="tel"
              value={alternatePhoneInput}
              onChange={(e) => setAlternatePhoneInput(e.target.value)}
              placeholder="Enter alternate phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              if (alternatePhoneInput.trim()) {
                // Basic phone number validation
                const phoneRegex = /^[0-9]{10}$/
                if (phoneRegex.test(alternatePhoneInput.trim())) {
                  setAlternatePhone(alternatePhoneInput.trim())
                  setShowAlternatePhonePopup(false)
                  toast.success("Alternate phone number updated successfully")
                } else {
                  toast.error("Please enter a valid 10-digit phone number")
                }
              } else {
                toast.error("Please enter a phone number")
              }
            }}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {alternatePhone ? "Update" : "Add"}
          </button>
        </div>
      </BottomPopup>
    </div>
  )
}

