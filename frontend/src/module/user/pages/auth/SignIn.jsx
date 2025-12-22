import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Mail, Phone, AlertCircle, Loader2 } from "lucide-react"
import AnimatedPage from "../../components/AnimatedPage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import loginBanner from "@/assets/loginbanner.png"

// Common country codes
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

export default function SignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isSignUp = searchParams.get("mode") === "signup"
  
  const [authMethod, setAuthMethod] = useState("phone") // "phone" or "email"
  const [formData, setFormData] = useState({
    phone: "",
    countryCode: "+91",
    email: "",
    name: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
    name: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // Get selected country details dynamically
  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[2] // Default to India (+91)

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required"
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address"
    }
    return ""
  }

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Phone number is required"
    }
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "")
    const phoneRegex = /^\d{7,15}$/
    if (!phoneRegex.test(cleanPhone)) {
      return "Phone number must be 7-15 digits"
    }
    return ""
  }

  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required"
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters"
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters"
    }
    const nameRegex = /^[a-zA-Z\s'-]+$/
    if (!nameRegex.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes"
    }
    return ""
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Real-time validation
    if (name === "email") {
      setErrors({ ...errors, email: validateEmail(value) })
    } else if (name === "phone") {
      setErrors({ ...errors, phone: validatePhone(value) })
    } else if (name === "name") {
      setErrors({ ...errors, name: validateName(value) })
    }
  }

  const handleCountryCodeChange = (value) => {
    setFormData({
      ...formData,
      countryCode: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate based on auth method
    let hasErrors = false
    const newErrors = { phone: "", email: "", name: "" }

    if (authMethod === "phone") {
      const phoneError = validatePhone(formData.phone)
      newErrors.phone = phoneError
      if (phoneError) hasErrors = true
    } else {
      const emailError = validateEmail(formData.email)
      newErrors.email = emailError
      if (emailError) hasErrors = true
    }

    // Validate name for sign up
    if (isSignUp) {
      const nameError = validateName(formData.name)
      newErrors.name = nameError
      if (nameError) hasErrors = true
    }

    setErrors(newErrors)

    if (hasErrors) {
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store auth data in sessionStorage for OTP page
    const authData = {
      method: authMethod,
      phone: authMethod === "phone" ? `${formData.countryCode} ${formData.phone}` : null,
      email: authMethod === "email" ? formData.email : null,
      name: isSignUp ? formData.name : null,
      isSignUp,
    }
    sessionStorage.setItem("authData", JSON.stringify(authData))

    setIsLoading(false)
    navigate("/user/auth/otp")
  }

  const handleGoogleSignIn = () => {
    // Redirect to OAuth callback
    // In a real app, this would redirect to Google OAuth
    const authUrl = "/user/auth/callback?provider=google"
    window.location.href = authUrl
  }

  const toggleMode = () => {
    const newMode = isSignUp ? "signin" : "signup"
    navigate(`/user/auth/sign-in?mode=${newMode}`, { replace: true })
    // Reset form
    setFormData({ phone: "", countryCode: "+91", email: "", name: "", rememberMe: false })
    setErrors({ phone: "", email: "", name: "" })
  }

  const handleEmailLogin = () => {
    setAuthMethod("email")
  }

  return (
    <AnimatedPage className="max-h-screen overflow-y-hidden flex flex-col bg-white overflow-hidden !pb-0">
      
      {/* Top Section - Red Background with Banner */}
      <div className="relative w-full shrink-0" style={{ height: "45vh", minHeight: "300px" }}>
        <img 
          src={loginBanner} 
          alt="Food Banner" 
          className="w-full h-full object-cover object-center"
        />

      </div>

      {/* Bottom Section - White Login Form */}
      <div className="bg-white p-3 overflow-y-hidden">
        <div className="max-w-md mx-auto space-y-6">
          {/* Heading */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl sm:text-2xl font-bold text-black">
              India's #1 Food Delivery and Dining App
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Log in or sign up
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field for sign up - hidden by default, shown only when needed */}
            {isSignUp && (
              <div className="space-y-2">
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`text-base h-12 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Phone Number Input */}
            {authMethod === "phone" && (
              <div className="space-y-2">
                <div className="flex gap-2 items-stretch">
                  <Select
                    value={formData.countryCode}
                    onValueChange={handleCountryCodeChange}
                  >
                    <SelectTrigger className="w-[100px] !h-12 border-gray-300 rounded-lg flex items-center" size="default">
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
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
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`flex-1 h-12 text-base border-gray-300 rounded-lg ${errors.phone ? "border-red-500" : ""}`}
                    aria-invalid={errors.phone ? "true" : "false"}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Email Input */}
            {authMethod === "email" && (
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full h-12 text-base border-gray-300 rounded-lg ${errors.email ? "border-red-500" : ""}`}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.email}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setAuthMethod("phone")}
                  className="text-xs text-[#E23744] hover:underline text-left"
                >
                  Use phone instead
                </button>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, rememberMe: checked })
                }
                className="w-4 h-4 border-2 border-gray-300 rounded data-[state=checked]:bg-[#E23744] data-[state=checked]:border-[#E23744] flex items-center justify-center"
              />
              <label 
                htmlFor="rememberMe" 
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Remember my login for faster sign-in
              </label>
            </div>

            {/* Continue Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#E23744] hover:bg-[#d32f3d] text-white font-bold text-base rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          {/* Or Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">
                or
              </span>
            </div>
          </div>

          {/* Social Login Icons */}
          <div className="flex justify-center gap-4">
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Sign in with Google"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            {/* Email Login */}
            <button
              type="button"
              onClick={handleEmailLogin}
              className="w-12 h-12 rounded-full border border-[#E23744] flex items-center justify-center hover:bg-[#d32f3d] transition-colors bg-[#E23744]"
              aria-label="Sign in with Email"
            >
              <Mail className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-center text-xs text-gray-500 pt-4">
            <p className="mb-1">
              By continuing, you agree to our
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
              <span>•</span>
              <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="underline hover:text-gray-700">Content Policy</a>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}
