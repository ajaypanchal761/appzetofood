import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authAPI } from "@/lib/api"
import { getDefaultOTP, isTestPhoneNumber } from "@/lib/utils/otpUtils"
import { setAuthData as setUserAuthData } from "@/lib/utils/auth"

export default function OTP() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [authData, setAuthData] = useState(null)
  const [showNameInput, setShowNameInput] = useState(false)
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState("")
  const [verifiedOtp, setVerifiedOtp] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [contactType, setContactType] = useState("phone")
  const inputRefs = useRef([])

  useEffect(() => {
    // Redirect to home if already authenticated
    const isAuthenticated = localStorage.getItem("user_authenticated") === "true"
    if (isAuthenticated) {
      navigate("/user", { replace: true })
      return
    }

    // Get auth data from sessionStorage
    const stored = sessionStorage.getItem("userAuthData")
    if (!stored) {
      // No auth data, redirect to sign in
      navigate("/user/auth/sign-in", { replace: true })
      return
    }
    const data = JSON.parse(stored)
    setAuthData(data)

    // Handle both phone and email
    if (data.method === "email" && data.email) {
      setContactType("email")
      setContactInfo(data.email)
    } else if (data.phone) {
      setContactType("phone")
      // Extract and format phone number for display
      const phoneMatch = data.phone?.match(/(\+\d+)\s*(.+)/)
      if (phoneMatch) {
        const formattedPhone = `${phoneMatch[1]}-${phoneMatch[2].replace(/\D/g, "")}`
        setContactInfo(formattedPhone)
      } else {
        setContactInfo(data.phone || "")
      }
      
      // Auto-fill OTP for test phone numbers
      if (isTestPhoneNumber(data.phone)) {
        const defaultOtp = getDefaultOTP(data.phone)
        if (defaultOtp) {
          setOtp(defaultOtp.split(""))
        }
      }
    }

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
    if (inputRefs.current[0] && !showNameInput) {
      inputRefs.current[0].focus()
    }
  }, [showNameInput])

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

    // Auto-submit when all 6 digits are entered and we are in OTP step
    if (!showNameInput && newOtp.every((digit) => digit !== "") && newOtp.length === 6) {
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
        if (!showNameInput && digits.length === 6) {
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
    if (!showNameInput && digits.length === 6) {
      handleVerify(newOtp.join(""))
    } else {
      inputRefs.current[digits.length]?.focus()
    }
  }

  const handleVerify = async (otpValue = null) => {
    if (showNameInput) {
      // In name collection step, ignore OTP auto-submit
      return
    }

    const code = otpValue || otp.join("")
    
    if (code.length !== 6) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const phone = authData?.method === "phone" ? authData.phone : null
      const email = authData?.method === "email" ? authData.email : null
      const purpose = authData?.isSignUp ? "register" : "login"

      // First attempt: verify OTP for login/register with user role
      const response = await authAPI.verifyOTP(phone, code, purpose, null, email, "user")
      const data = response?.data?.data || {}

      // If backend tells us this is a new user, ask for name
      if (data.needsName) {
        setShowNameInput(true)
        setVerifiedOtp(code)
        setOtp(["", "", "", "", "", ""])
        setSuccess(false)
        setIsLoading(false)
        return
      }

      // Otherwise, OTP verified and user logged in/registered
      const accessToken = data.accessToken
      const user = data.user

      if (!accessToken || !user) {
        throw new Error("Invalid response from server")
      }

      // Clear auth data from sessionStorage
      sessionStorage.removeItem("userAuthData")

      // Replace old token with new one (handles cross-module login)
      setUserAuthData("user", accessToken, user)

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("userAuthChanged"))

      setSuccess(true)

      // Redirect to user home after short delay
      setTimeout(() => {
        navigate("/user")
      }, 500)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to verify OTP. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitName = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError("Name is required")
      return
    }

    if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }

    if (!verifiedOtp) {
      setError("OTP verification step missing. Please request a new OTP.")
      return
    }

    setIsLoading(true)
    setError("")
    setNameError("")

    try {
      const phone = authData?.method === "phone" ? authData.phone : null
      const email = authData?.method === "email" ? authData.email : null
      const purpose = authData?.isSignUp ? "register" : "login"

      // Second call with name to auto-register and login
      const response = await authAPI.verifyOTP(phone, verifiedOtp, purpose, trimmedName, email, "user")
      const data = response?.data?.data || {}

      const accessToken = data.accessToken
      const user = data.user

      if (!accessToken || !user) {
        throw new Error("Invalid response from server")
      }

      // Clear auth data from sessionStorage
      sessionStorage.removeItem("userAuthData")

      // Replace old token with new one (handles cross-module login)
      setUserAuthData("user", accessToken, user)

      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("userAuthChanged"))

      setSuccess(true)

      // Redirect to user home after short delay
      setTimeout(() => {
        navigate("/user")
      }, 500)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to complete registration. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    setError("")

    try {
      const phone = authData?.method === "phone" ? authData.phone : null
      const email = authData?.method === "email" ? authData.email : null
      const purpose = authData?.isSignUp ? "register" : "login"

      // Call backend to resend OTP
      await authAPI.sendOTP(phone, purpose, email)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to resend OTP. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }

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

    setOtp(["", "", "", "", "", ""])
    setShowNameInput(false)
    setName("")
    setNameError("")
    setVerifiedOtp("")
    inputRefs.current[0]?.focus()
  }

  if (!authData) {
    return null
  }

  return (
    <AnimatedPage className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-center py-4 px-4 border-b border-gray-200">
        <button
          onClick={() => navigate("/user/auth/sign-in")}
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
              {showNameInput
                ? "You're almost done! Please tell us your name to complete registration."
                : contactType === "email"
                ? "We have sent a verification code to"
                : "We have sent a verification code to"}
            </p>
            {!showNameInput && (
              <p className="text-base text-black font-medium">
                {contactInfo}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          {/* OTP Input Fields */}
          {!showNameInput && (
            <>
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
                  Didn't get the {contactType === "email" ? "email" : "SMS"}?
                </p>
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend {contactType === "email" ? "email" : "SMS"} in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    Resend {contactType === "email" ? "email" : "SMS"}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Name Input (shown only after OTP verified and user is new) */}
          {showNameInput && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-black text-left">
                  Full name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError("")
                  }}
                  disabled={isLoading}
                  placeholder="Enter your name"
                  className={`h-11 border ${
                    nameError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {nameError && (
                  <p className="text-xs text-red-500 text-left">
                    {nameError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmitName}
                disabled={isLoading}
                className="w-full h-11 bg-[#E23744] hover:bg-[#d32f3d] text-white font-semibold"
              >
                {isLoading ? "Continuing..." : "Continue"}
              </Button>
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && !showNameInput && (
            <div className="flex justify-center pt-4">
              <Loader2 className="h-6 w-6 text-[#E23744] animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Go back to login methods */}
      <div className="pt-4 mt-auto px-6 text-center pb-8">
        <button
          type="button"
          onClick={() => navigate("/user/auth/sign-in")}
          className="text-sm text-[#E23744] hover:underline"
        >
          Go back to login methods
        </button>
      </div>
    </AnimatedPage>
  )
}
