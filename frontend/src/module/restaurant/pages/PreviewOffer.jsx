import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X, CheckCircle } from "lucide-react"
import BottomNavOrders from "../components/BottomNavOrders"

export default function PreviewOffer() {
  const navigate = useNavigate()
  const location = useLocation()
  const offerData = location.state || {}

  const {
    customerGroup = "all",
    offerPreference = "all",
    discountPercentage = "60",
    maxLimit = "120",
    minOrderValue = "none",
    offerDays = "all",
    startDate = "18 Dec 2025",
    discountType = "percentage",
    goalId,
  } = offerData

  const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(27)
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false)
  const otpInputRefs = useRef([])

  const getCustomerGroupText = () => {
    if (customerGroup === "all") return "Eligible for all customers"
    if (customerGroup === "new") return "Eligible for new customers"
    return "Eligible for all customers"
  }

  const getOfferPreferenceText = () => {
    if (offerPreference === "all") return "Valid for all mealtimes"
    if (offerPreference === "sensitive") return "Valid for offer-sensitive customers"
    if (offerPreference === "premium") return "Valid for premium customers"
    return "Valid for all mealtimes"
  }

  const getOfferDaysText = () => {
    if (offerDays === "all") return "Valid for Monday - Sunday of the week"
    if (offerDays === "mon-thu") return "Valid for Monday - Thursday of the week"
    if (offerDays === "fri-sun") return "Valid for Friday - Sunday of the week"
    return "Valid for all days"
  }

  const getMinOrderText = () => {
    if (minOrderValue === "none") return ""
    return `on orders above ₹${minOrderValue}`
  }

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Only allow single digit
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 4) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 5)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("").concat(Array(5 - pastedData.length).fill(""))
      setOtp(newOtp.slice(0, 5))
      const nextIndex = Math.min(pastedData.length, 4)
      otpInputRefs.current[nextIndex]?.focus()
    }
  }

  const isOtpComplete = otp.every(digit => digit !== "")

  // Resend timer
  useEffect(() => {
    if (isOtpPopupOpen && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (resendTimer === 0) {
      setResendTimer(27) // Reset timer
    }
  }, [isOtpPopupOpen, resendTimer])

  const handleContinueOtp = () => {
    if (isOtpComplete) {
      setIsOtpPopupOpen(false)
      setIsSuccessPopupOpen(true)
      // Reset OTP after showing success
      setTimeout(() => {
        setOtp(["", "", "", "", ""])
        setResendTimer(27)
      }, 2000)
    }
  }

  const handleActivateOffer = () => {
    setIsOtpPopupOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-200 p-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-start ml-4 text-white">
          {discountType === "percentage" ? (
            <>
              <h1 className="text-3xl font-bold mb-1">
                {discountPercentage}% OFF
              </h1>
              <h2 className="text-xl font-bold mb-1">
                up to ₹{maxLimit}
              </h2>
              {minOrderValue !== "none" && (
                <h3 className="text-lg font-bold">
                  {getMinOrderText()}
                </h3>
              )}
            </>
          ) : discountType === "flat" ? (
            <>
              <h1 className="text-3xl font-bold mb-1">
                Flat ₹{maxLimit} OFF
              </h1>
              {minOrderValue !== "none" && (
                <h3 className="text-lg font-bold">
                  {getMinOrderText()}
                </h3>
              )}
            </>
          ) : discountType === "percentage-menu" ? (
            <>
              <h1 className="text-2xl font-bold mb-1">
                Percentage discount
              </h1>
            </>
          ) : discountType === "flat-price-menu" ? (
            <>
              <h1 className="text-2xl font-bold mb-1">
                Flat price offer
              </h1>
            </>
          ) : discountType === "bogo-menu" ? (
            <>
              <h1 className="text-2xl font-bold mb-1">
                BOGO offer
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">
                Freebie offer
              </h1>
              {minOrderValue && minOrderValue !== "none" && (
                <h3 className="text-lg font-semibold">
                  {minOrderValue}
                </h3>
              )}
            </>
          )}
        </div>
      </div>

      {/* Offer Details */}
      <div className="flex-1 px-4 py-6 bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Offer Details</h2>
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">{getOfferPreferenceText()}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">{getCustomerGroupText()}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">Applicable on all menu items, excluding MRP items</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">{getOfferDaysText()}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">Campaign will start on {startDate}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">100% of the discount value is funded by you</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-900 font-medium">•</span>
              <p className="text-sm text-gray-700">Valid at Kadhai Chammach Restaurant, By Pass Road (South) (ID: 20959122)</p>
            </div>
            {offerData.targetMealtime && (
              <div className="flex items-start gap-2">
                <span className="text-gray-900 font-medium">•</span>
                <p className="text-sm text-gray-700">Target mealtime: {offerData.targetMealtime}</p>
              </div>
            )}
            {offerData.discountCards && offerData.discountCards.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-900 font-medium">•</span>
                <p className="text-sm text-gray-700">
                  {offerData.discountCards.length} discount{offerData.discountCards.length > 1 ? "s" : ""} configured
                </p>
              </div>
            )}
            {offerData.priceCards && offerData.priceCards.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-900 font-medium">•</span>
                <p className="text-sm text-gray-700">
                  {offerData.priceCards.length} price offer{offerData.priceCards.length > 1 ? "s" : ""} configured
                </p>
              </div>
            )}
            {offerData.discountConstruct && (
              <div className="flex items-start gap-2">
                <span className="text-gray-900 font-medium">•</span>
                <p className="text-sm text-gray-700">Discount construct: Buy 1 Get 1 free</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Navigate back to timing page for menu discounts or create page for regular discounts
              if (discountType === "percentage-menu") {
                navigate("/restaurant/hub-growth/create-offers/delight-customers/percentage/timings", {
                  state: offerData
                })
              } else if (discountType === "flat-price-menu") {
                navigate("/restaurant/hub-growth/create-offers/delight-customers/flat-price/timings", {
                  state: offerData
                })
              } else if (discountType === "bogo-menu") {
                navigate("/restaurant/hub-growth/create-offers/delight-customers/bogo/timings", {
                  state: offerData
                })
              } else if (discountType === "freebies") {
                navigate("/restaurant/hub-growth/create-offers/delight-customers/freebies/timings", {
                  state: offerData
                })
              } else {
                // Navigate back to step 3 of create offer page
                navigate(`/restaurant/hub-growth/create-offers/${goalId}/${discountType}/create`, {
                  state: {
                    ...offerData,
                    currentStep: 3
                  }
                })
              }
            }}
            className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
            <button
              onClick={handleActivateOffer}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Activate offer
            </button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree and accept all the{" "}
          <span className="text-blue-600 underline">terms and conditions.</span>
        </p>
      </div>

      {/* OTP Verification Popup */}
      <AnimatePresence>
        {isOtpPopupOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOtpPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-[9999]"
            />
            
            {/* Bottom Popup */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[9999] max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-white px-4 py-4 border-b border-gray-200 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Verify that it's you</h2>
                  <button
                    onClick={() => setIsOtpPopupOpen(false)}
                    className="p-1 rounded-full hover:bg-white"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-4">
                  <p className="text-base text-gray-900">
                    We need to verify your account in order to proceed
                  </p>
                  <p className="text-base text-gray-900">
                    Enter the OTP sent on <span className="font-medium">********7415</span> or <span className="font-medium">r********6@gmail.com</span>
                  </p>
                  
                  {/* OTP Input Fields */}
                  <div className="flex justify-center gap-3 mt-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 text-center text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-transparent"
                      />
                    ))}
                  </div>

                  {/* Resend Timer */}
                  <div className="text-right mt-4">
                    <p className="text-sm text-gray-500">
                      Resend OTP in {resendTimer} secs
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="bg-white px-4 py-4 border-t border-gray-200 rounded-b-2xl">
                <button
                  onClick={handleContinueOtp}
                  disabled={!isOtpComplete}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                    isOtpComplete
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {isSuccessPopupOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-[10000]"
            />
            
            {/* Success Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-[10000] px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your offer has been activated successfully.
                </p>
                <button
                  onClick={() => {
                    setIsSuccessPopupOpen(false)
                    navigate("/restaurant/hub-growth/create-offers")
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavOrders />
    </div>
  )
}
