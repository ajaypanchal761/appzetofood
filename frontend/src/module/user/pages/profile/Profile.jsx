import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  ChevronRight, 
  Crown, 
  Wallet, 
  Tag, 
  User, 
  Leaf, 
  Palette, 
  Star, 
  Bookmark, 
  Building2, 
  MessageSquare,
  Moon,
  Sun,
  Check,
  Percent,
  Info,
  PenSquare,
  AlertTriangle,
  Accessibility as AccessibilityIcon,
  Settings as SettingsIcon,
  Power,
  ShoppingCart
} from "lucide-react"

import AnimatedPage from "../../components/AnimatedPage"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfile } from "../../context/ProfileContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { authAPI } from "@/lib/api"
import { firebaseAuth } from "@/lib/firebase"
import { clearModuleAuth } from "@/lib/utils/auth"

export default function Profile() {
  const { userProfile } = useProfile()
  const navigate = useNavigate()
  
  // Popup states
  const [vegModeOpen, setVegModeOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [ratingsOpen, setRatingsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Settings states
  const [vegMode, setVegMode] = useState(true)
  const [appearance, setAppearance] = useState(() => {
    // Load theme from localStorage or default to 'light'
    return localStorage.getItem('appTheme') || 'light'
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (appearance === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    // Save to localStorage
    localStorage.setItem('appTheme', appearance)
  }, [appearance])
  
  // Get first letter of name for avatar
  const avatarInitial = userProfile?.name?.charAt(0)?.toUpperCase() || userProfile?.phone?.charAt(1)?.toUpperCase() || 'U'
  const displayName = userProfile?.name || userProfile?.phone || 'User'
  // Only show email if it exists and is valid, otherwise show phone or "Not available"
  const hasValidEmail = userProfile?.email && userProfile.email.trim() !== '' && userProfile.email.includes('@')
  const displayEmail = hasValidEmail ? userProfile.email : (userProfile?.phone || 'Not available')

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!userProfile) return 0

    // Helper function to check if date field is filled (handles Date objects, date strings, ISO strings)
    const isDateFilled = (dateField) => {
      if (!dateField) return false
      
      // Check if it's a Date object
      if (dateField instanceof Date) {
        return !isNaN(dateField.getTime())
      }
      
      // Check if it's a string
      if (typeof dateField === 'string') {
        const trimmed = dateField.trim()
        if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false
        
        // Try to parse as date (handles various formats: YYYY-MM-DD, ISO strings, etc.)
        const date = new Date(trimmed)
        if (!isNaN(date.getTime())) {
          // Valid date
          return true
        }
      }
      
      return false
    }

    // Check name - must have value
    const hasName = !!(userProfile.name && 
      typeof userProfile.name === 'string' && 
      userProfile.name.trim() !== '')
    
    // Check contact - phone OR email (at least one)
    const hasPhone = !!(userProfile.phone && 
      typeof userProfile.phone === 'string' && 
      userProfile.phone.trim() !== '')
    const hasContact = hasPhone || hasValidEmail
    
    // Check profile image - must have URL string
    const hasImage = !!(userProfile.profileImage && 
      typeof userProfile.profileImage === 'string' && 
      userProfile.profileImage.trim() !== '' &&
      userProfile.profileImage !== 'null' &&
      userProfile.profileImage !== 'undefined')
    
    // Check date of birth
    const hasDateOfBirth = isDateFilled(userProfile.dateOfBirth)
    
    // Check gender - must be valid value
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say']
    const hasGender = !!(userProfile.gender && 
      typeof userProfile.gender === 'string' && 
      userProfile.gender.trim() !== '' &&
      validGenders.includes(userProfile.gender.trim().toLowerCase()))

    // Required fields only (anniversary is NOT counted - it's optional)
    // Only these 5 fields count towards 100%
    const requiredFields = {
      name: hasName,
      contact: hasContact,
      profileImage: hasImage,
      dateOfBirth: hasDateOfBirth,
      gender: hasGender,
    }

    const totalRequiredFields = 5 // Fixed: name, contact, profileImage, dateOfBirth, gender
    const completedRequiredFields = Object.values(requiredFields).filter(Boolean).length
    
    // Calculate percentage based ONLY on required fields (anniversary NOT included)
    const percentage = Math.round((completedRequiredFields / totalRequiredFields) * 100)

    // Always log for debugging (remove in production if needed)
    console.log('🔍 Profile completion check:', {
      requiredFields,
      completedRequiredFields,
      totalRequiredFields,
      percentage,
      fieldStatus: {
        name: hasName ? '✅' : '❌',
        contact: hasContact ? '✅' : '❌',
        profileImage: hasImage ? '✅' : '❌',
        dateOfBirth: hasDateOfBirth ? '✅' : '❌',
        gender: hasGender ? '✅' : '❌',
      },
      rawData: {
        name: userProfile.name || 'missing',
        phone: userProfile.phone || 'missing',
        email: userProfile.email || 'missing',
        profileImage: userProfile.profileImage ? 'exists' : 'missing',
        dateOfBirth: userProfile.dateOfBirth ? String(userProfile.dateOfBirth) : 'missing',
        gender: userProfile.gender || 'missing',
      }
    })

    return percentage
  }

  const profileCompletion = calculateProfileCompletion()
  const isComplete = profileCompletion === 100

  // Handle logout
  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    
    setIsLoggingOut(true)

    try {
      // Call backend logout API to invalidate refresh token
      try {
        await authAPI.logout()
      } catch (apiError) {
        // Continue with logout even if API call fails (network issues, etc.)
        console.warn("Logout API call failed, continuing with local cleanup:", apiError)
      }

      // Sign out from Firebase if user logged in via Google
      try {
        const { signOut } = await import("firebase/auth")
        const currentUser = firebaseAuth.currentUser
        if (currentUser) {
          await signOut(firebaseAuth)
        }
      } catch (firebaseError) {
        // Continue even if Firebase logout fails
        console.warn("Firebase logout failed, continuing with local cleanup:", firebaseError)
      }

      // Clear user module authentication data using utility function
      clearModuleAuth("user")

      // Clear legacy token data for backward compatibility
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user_authenticated")
      localStorage.removeItem("user_user")
      localStorage.removeItem("user")

      // Dispatch auth change event to notify other components
      window.dispatchEvent(new Event("userAuthChanged"))

      // Navigate to sign in page
      navigate("/user/auth/sign-in", { replace: true })
    } catch (err) {
      // Even if there's an error, we should still clear local data and logout
      console.error("Error during logout:", err)
      
      // Clear local data anyway using utility function
      clearModuleAuth("user")
      
      // Clear legacy token data for backward compatibility
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user_authenticated")
      localStorage.removeItem("user_user")
      localStorage.removeItem("user")
      window.dispatchEvent(new Event("userAuthChanged"))

      // Still navigate to login page
      navigate("/user/auth/sign-in", { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Back Arrow */}
        <div className="mb-4">
          <Link to="/user">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <ArrowLeft className="h-5 w-5 text-black dark:text-white" />
            </Button>
          </Link>
        </div>

        {/* Profile Info Card */}
        <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl py-0 pt-1 shadow-sm mb-0 border-0 dark:border-gray-800 overflow-hidden">
          <CardContent className="p-4 py-0 pt-2">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-16 w-16 bg-blue-300 border-0">
                {userProfile?.profileImage && (
                  <AvatarImage 
                    src={userProfile.profileImage} 
                    alt={displayName}
                  />
                )}
                <AvatarFallback className="bg-blue-300 text-white text-2xl font-semibold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-1">
                <h2 className="text-xl font-bold text-black dark:text-white mb-1">{displayName}</h2>
                {hasValidEmail && (
                  <p className="text-sm text-black dark:text-gray-300 mb-1">{userProfile.email}</p>
                )}
                {userProfile?.phone && (
                  <p className={`text-sm ${hasValidEmail ? 'text-gray-600 dark:text-gray-400' : 'text-black dark:text-white'} mb-3`}>
                    {userProfile.phone}
                  </p>
                )}
                {!hasValidEmail && !userProfile?.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Not available</p>
                )}
                {/* <Link to="/user/profile/activity" className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  View activity
                  <ChevronRight className="h-4 w-4" />
                </Link> */}
              </div>
            </div>
            
            {/* Appzeto Gold Banner */}
            <div className="bg-black dark:bg-[#1a1a1a] rounded-none p-4 flex items-center justify-between -mx-4 mb-0 cursor-pointer">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <span className="text-yellow-400 font-medium">Join Appzeto Gold</span>
              </div>
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </CardContent>
        </Card>

         {/* Appzeto Money and Coupons - Side by Side */}
         <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
          <Link to="/user/wallet" className="h-full">
            <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow h-full">
               <CardContent className="p-4 h-full flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 flex-shrink-0">
                  <Wallet className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                 <div className="flex-1 min-w-0 flex flex-col">
                   <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">Appzeto Money</span>
                   <span className="text-base font-semibold text-green-600 dark:text-green-400">₹{userProfile?.wallet?.balance?.toFixed(0) || '0'}</span>
                 </div>
               </CardContent>
             </Card>
           </Link>
          
          <Link to="/user/profile/coupons" className="h-full">
            <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 h-full flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 flex-shrink-0">
                  <Tag className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-gray-900 dark:text-white">Your coupons</p>
                 </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Account Options */}
        <div className="space-y-2 mb-3">

        <Link to="/user/cart" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                    <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Your cart</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>

            
          <Link to="/user/profile/edit" className="block">
            <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">Your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    isComplete 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {profileCompletion}% completed
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setVegModeOpen(true)}
          >
            <CardContent className="p-4  flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                  <Leaf className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-base font-medium text-gray-900 dark:text-white">Veg Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900 dark:text-white">{vegMode ? 'ON' : 'OFF'}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setAppearanceOpen(true)}
          >
            <CardContent className="p-4  flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                  <Palette className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-base font-medium text-gray-900 dark:text-white">Appearance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900 dark:text-white capitalize">{appearance}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setRatingsOpen(true)}
          >
            <CardContent className="p-4  flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                  <Star className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-base font-medium text-gray-900 dark:text-white">Your rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900 dark:text-white">-- ★</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Collections</h3>
          </div>
          <Link to="/user/collections">
            <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4  flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                    <Bookmark className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">Your collections</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Food Orders Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Food Orders</h3>
          </div>
          <div className="space-y-2">
            <Link to="/user/orders" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <Building2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Your orders</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>


            <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                    <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">Hear from restaurants</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coupons Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Coupons</h3>
          </div>
          <Link to="/user/profile/redeem-gold-coupon">
            <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                    <Percent className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">Redeem Gold coupon</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* More Section */}
        <div className="mb-6 pb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">More</h3>
          </div>
          <div className="space-y-2">
            <Link to="/user/profile/about" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <Info className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">About</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/send-feedback" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <PenSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Send feedback</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/report-safety-emergency" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <AlertTriangle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Report a safety emergency</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/accessibility" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <AccessibilityIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Accessibility</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/settings" className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                      <SettingsIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-base font-medium text-gray-900 dark:text-white">Settings</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </CardContent>
              </Card>
            </Link>

            <Card 
              className="bg-white dark:bg-[#1a1a1a] py-0 rounded-xl shadow-sm border-0 dark:border-gray-800 cursor-pointer hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleLogout}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                    <Power className={`h-5 w-5 text-gray-700 dark:text-gray-300 ${isLoggingOut ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Veg Mode Popup */}
      <Dialog open={vegModeOpen} onOpenChange={setVegModeOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-lg font-bold text-gray-900">Veg Mode</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Filter restaurants and dishes based on your dietary preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-5 pb-5">
            <button
              onClick={() => {
                setVegMode(true)
                setVegModeOpen(false)
              }}
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                vegMode
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  vegMode ? 'border-green-600 bg-green-600' : 'border-gray-300'
                }`}>
                  {vegMode && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Veg Mode ON</p>
                  <p className="text-xs text-gray-500">Show only vegetarian options</p>
                </div>
              </div>
              <Leaf className={`h-5 w-5 ${vegMode ? 'text-green-600' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => {
                setVegMode(false)
                setVegModeOpen(false)
              }}
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                !vegMode
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  !vegMode ? 'border-red-600 bg-red-600' : 'border-gray-300'
                }`}>
                  {!vegMode && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">Veg Mode OFF</p>
                  <p className="text-xs text-gray-500">Show all options</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appearance Popup */}
      <Dialog open={appearanceOpen} onOpenChange={setAppearanceOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Appearance</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred theme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-5 pb-5">
            <button
              onClick={() => {
                setAppearance('light')
                setAppearanceOpen(false)
              }}
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                appearance === 'light'
                  ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                appearance === 'light' ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {appearance === 'light' && <Check className="h-3 w-3 text-white" />}
              </div>
              <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white text-sm">Light</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Default light theme</p>
              </div>
            </button>
            <button
              onClick={() => {
                setAppearance('dark')
                setAppearanceOpen(false)
              }}
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                appearance === 'dark'
                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                appearance === 'dark' ? 'border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {appearance === 'dark' && <Check className="h-3 w-3 text-white" />}
              </div>
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white text-sm">Dark</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dark theme</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ratings Popup */}
      <Dialog open={ratingsOpen} onOpenChange={setRatingsOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-lg font-bold text-gray-900">Your Ratings</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              View and manage your restaurant and food ratings
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 pb-5">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold text-base mb-1">No ratings yet</p>
              <p className="text-gray-500 text-xs mb-4 px-4">
                Start rating restaurants and dishes to help others discover great food
              </p>
              <Button
                onClick={() => setRatingsOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white h-10 px-6 rounded-lg text-sm"
              >
                Start Rating
              </Button>
            </div>
            <div className="border-t pt-3 mt-2">
              <p className="text-xs text-gray-500 text-center">
                Your ratings will appear here once you start rating
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}

