import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "restaurant_invited_users"

// Country codes
const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
]

export default function InviteUser() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get("role") || "staff"
  
  const [countryCode, setCountryCode] = useState("+91")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState(roleFromUrl)
  const [phoneError, setPhoneError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showInviteSentDialog, setShowInviteSentDialog] = useState(false)
  const [inviteMethod, setInviteMethod] = useState("phone") // "phone" or "email"

  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Phone number validation
  const validatePhone = (phone) => {
    if (!phone.trim()) {
      setPhoneError("Phone number is required")
      return false
    }
    // Remove any non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, "")
    if (digitsOnly.length < 10) {
      setPhoneError("Phone number must be at least 10 digits")
      return false
    }
    if (digitsOnly.length > 15) {
      setPhoneError("Phone number is too long")
      return false
    }
    setPhoneError("")
    return true
  }

  // Email validation
  const validateEmail = (email) => {
    if (!email.trim()) {
      setEmailError("Email is required")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "") // Only allow digits
    setPhoneNumber(value)
    if (value) {
      validatePhone(value)
    } else {
      setPhoneError("")
    }
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value) {
      validateEmail(value)
    } else {
      setEmailError("")
    }
  }

  const handleSendInvite = () => {
    let isValid = false

    if (inviteMethod === "phone") {
      isValid = validatePhone(phoneNumber)
    } else {
      isValid = validateEmail(email)
    }

    if (!isValid) return

    // Create invite object
    const invite = {
      id: Date.now().toString(),
      role: selectedRole,
      phone: inviteMethod === "phone" ? `${countryCode}-${phoneNumber}` : null,
      email: inviteMethod === "email" ? email : null,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: "invited"
    }

    // Save to localStorage
    try {
      const existingInvites = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      existingInvites.push(invite)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingInvites))
      
      // Dispatch event to notify ContactDetails page
      window.dispatchEvent(new Event("invitesUpdated"))
      
      // Show success dialog
      setShowInviteSentDialog(true)
    } catch (error) {
      console.error("Error saving invite:", error)
    }
  }

  const handleInviteSentClose = () => {
    setShowInviteSentDialog(false)
    // Navigate back after a short delay
    setTimeout(() => {
      navigate(-1)
    }, 300)
  }

  const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[2]

  const isFormValid = inviteMethod === "phone" 
    ? phoneNumber.trim().length >= 10 && !phoneError
    : email.trim() && !emailError

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Invite user</h1>
          </div>
          <button
            onClick={() => navigate("/restaurant/contact-details?view=permissions")}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
          >
            View permissions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Phone Number Input Section */}
        <div>
          <div className="flex gap-2 items-stretch mb-3">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-[100px] h-12! border-gray-200 rounded-lg flex items-center shrink-0">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCountry.code}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              className={`flex-1 h-12 border-gray-200 rounded-lg ${phoneError ? "border-red-500" : ""}`}
              maxLength={15}
            />
          </div>
          {phoneError && (
            <p className="text-sm text-red-600 mt-1">{phoneError}</p>
          )}
          <p className="text-sm text-gray-600 font-normal mt-2">
            This user will receive a link by SMS which they need to click on to accept the invite and be added to your outlet.
          </p>
          <button
            onClick={() => {
              setInviteMethod("email")
              setPhoneNumber("")
              setPhoneError("")
            }}
            className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors mt-2"
          >
            Invite by email
          </button>
        </div>

        {/* Email Input Section (shown when invite by email is clicked) */}
        {inviteMethod === "email" && (
          <div>
            <Input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email address"
              className={`w-full h-12 border-gray-200 rounded-lg ${emailError ? "border-red-500" : ""}`}
            />
            {emailError && (
              <p className="text-sm text-red-600 mt-1">{emailError}</p>
            )}
            <p className="text-sm text-gray-600 font-normal mt-2">
              This user will receive a link by email which they need to click on to accept the invite and be added to your outlet.
            </p>
            <button
              onClick={() => {
                setInviteMethod("phone")
                setEmail("")
                setEmailError("")
              }}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors mt-2"
            >
              Invite by phone
            </button>
          </div>
        )}

        {/* User Role Selection */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-0 bg-gray-100 -mx-4 px-4 py-2">
            Select user role
          </h2>
          <div className="mt-2 border-b border-gray-200">
            {["staff", "manager", "owner"].map((role, index, arr) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 transition-colors ${
                  index < arr.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <span className="text-base font-normal text-gray-900 capitalize">{role}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === role
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}>
                  {selectedRole === role && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Send Invite Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
        <Button
          onClick={handleSendInvite}
          disabled={!isFormValid}
          className={`w-full py-3 ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          } transition-colors`}
        >
          Send invite
        </Button>
      </div>

      {/* Invite Sent Success Dialog */}
      <Dialog open={showInviteSentDialog} onOpenChange={setShowInviteSentDialog}>
        <DialogContent className="sm:max-w-md p-4 w-[90%] gap-2 flex flex-col"> 
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900 text-center">
              Invite sent successfully!
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-600">
              {inviteMethod === "phone"
                ? `An invitation has been sent to ${countryCode}-${phoneNumber}. The user will receive an SMS with a link to accept the invite.`
                : `An invitation has been sent to ${email}. The user will receive an email with a link to accept the invite.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleInviteSentClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
