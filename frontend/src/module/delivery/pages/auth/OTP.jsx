import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import AnimatedPage from "../../../user/components/AnimatedPage"
import { Input } from "@/components/ui/input"

export default function DeliveryOTP() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [authData, setAuthData] = useState(null)
  const inputRefs = useRef([])

  useEffect(() => {
    // Redirect to home if already authenticated (skip OTP if already logged in)
    const isAuthenticated = localStorage.getItem("delivery_authenticated") === "true"
    if (isAuthenticated) {
      navigate("/delivery", { replace: true })
      return
    }

    // Get auth data from sessionStorage (delivery module key)
    const stored = sessionStorage.getItem("deliveryAuthData")
    if (!stored) {
      // No auth data, redirect to sign in
      navigate("/delivery/sign-in", { replace: true })
      return
    }
    setAuthData(JSON.parse(stored))

    // Start resend timer (60 seconds)
    setResendTimer(60)
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every((digit) => digit !== "") && newOtp.length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index]) {
        // If current input has value, clear it
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      } else if (index > 0) {
        // If current input is empty, move to previous and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
      }
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("")
        const newOtp = [...otp]
        digits.forEach((digit, i) => {
          if (i < 6) {
            newOtp[i] = digit
          }
        })
        setOtp(newOtp)
        if (digits.length === 6) {
          handleVerify(newOtp.join(""))
        } else {
          inputRefs.current[digits.length]?.focus()
        }
      })
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("")
    const newOtp = [...otp]
    digits.forEach((digit, i) => {
      if (i < 6) {
        newOtp[i] = digit
      }
    })
    setOtp(newOtp)
    if (digits.length === 6) {
      handleVerify(newOtp.join(""))
    } else {
      inputRefs.current[digits.length]?.focus()
    }
  }

  const handleVerify = async (otpValue = null) => {
    const code = otpValue || otp.join("")
    
    if (code.length !== 6) {
      return
    }

    setIsLoading(true)
    setError("")

    // Dummy verification - accept any OTP
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSuccess(true)

    // Clear auth data from sessionStorage
    sessionStorage.removeItem("deliveryAuthData")

    // Set authentication state in localStorage
    localStorage.setItem("delivery_authenticated", "true")
    localStorage.setItem("delivery_user", JSON.stringify({
      phone: authData.phone,
      name: authData.name || "Delivery Partner"
    }))

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('deliveryAuthChanged'))

    // Redirect to welcome page after short delay
    setTimeout(() => {
      navigate("/delivery/welcome")
    }, 500)
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)

    // Simulate resend API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Reset timer to 60 seconds
    setResendTimer(60)
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setIsLoading(false)
    setOtp(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
  }

  const getPhoneNumber = () => {
    if (!authData) return ""
    if (authData.method === "phone") {
      // Format phone number as +91-9098569620
      const phone = authData.phone || ""
      // Remove spaces and format
      const cleaned = phone.replace(/\s/g, "")
      // Add hyphen after country code if not present
      if (cleaned.startsWith("+91") && cleaned.length > 3) {
        return cleaned.slice(0, 3) + "-" + cleaned.slice(3)
      }
      return cleaned
    }
    return authData.email || ""
  }

  if (!authData) {
    return null
  }

  return (
    <AnimatedPage className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-center py-4 px-4 border-b border-gray-200">
        <button
          onClick={() => navigate("/delivery/sign-in")}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
        <h1 className="text-lg font-bold text-black">OTP Verification</h1>
      </div> 

      {/* Main Content */}
      <div className="flex flex-col justify-center px-6 pt-8 pb-12">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-base text-black">
              We have sent a verification code to
            </p>
            <p className="text-base text-black font-medium">
              {getPhoneNumber()}
            </p>
          </div>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="w-12 h-12 text-center text-lg font-semibold p-0 border border-black rounded-md focus-visible:ring-0 focus-visible:border-black bg-white"
              />
            ))}
          </div>

          {/* Resend Section */}
          <div className="text-center space-y-1">
            <p className="text-sm text-black">
              Didn't get the OTP?
            </p>
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend SMS in {resendTimer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Resend SMS
              </button>
            )}
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center pt-4">
              <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Go back to login methods */}
      <div className="pt-4 mt-auto px-6 text-center pb-8">
        <button
          type="button"
          onClick={() => navigate("/delivery/sign-in")}
          className="text-sm text-[#E23744] hover:underline"
        >
          Go back to login methods
        </button>
      </div>
    </AnimatedPage>
  )
}
