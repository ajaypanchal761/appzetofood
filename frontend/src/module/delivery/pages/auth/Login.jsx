import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import deliveryLoginBanner from "@/assets/deliveryloginbanner.png"

export default function DeliveryLogin() {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState("")

  // Redirect to home if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("delivery_authenticated") === "true"
    if (isAuthenticated) {
      navigate("/delivery", { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleContinue = () => {
      navigate("/delivery/sign-in")
  }

  const handlePhoneChange = (e) => {
    // Only allow digits and limit to 10 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
    setPhoneNumber(value)
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={deliveryLoginBanner}
          alt="Delivery Login Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col">

        {/* Middle Section - Illustration Area (handled by background image) */}
        <div className="flex-1 flex items-center justify-center px-4">
          {/* This space is for the illustration which is in the background image */}
        </div>

        {/* Bottom Section - Form */}
        <div className="p-6 pt-6">
         

          {/* Mobile Number Input */}
          {/* <div className="mb-4">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-300">
                <span className="text-xl">🇮🇳</span>
                <span className="text-gray-700 font-medium">+91</span>
              </div>
              
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Enter mobile number"
                value={phoneNumber}
                onChange={handleContinue}
                maxLength={10}
                className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-base"
              />
            </div>
          </div> */}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className={`w-full py-4 rounded-lg font-bold text-white text-base transition-colors bg-[#00B761] hover:bg-[#00A055] active:bg-[#009049]}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
