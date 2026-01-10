import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Lenis from "lenis"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  Home,
  FileText,
  UtensilsCrossed,
  User,
  ArrowLeft,
  ArrowRight,
  Star,
  Briefcase,
  Bike,
  Tag,
  Headphones,
  Ticket,
  Car,
  ChevronRight,
  IndianRupee,
  Sparkles,
  LogOut
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { deliveryAPI } from "@/lib/api"
import { toast } from "sonner"
import { clearModuleAuth } from "@/lib/utils/auth"

export default function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [animationKey, setAnimationKey] = useState(0)
  const profileRef = useRef(null)
  const navButtonsRef = useRef(null)
  const sectionsRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
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

    // Small delay to ensure refs are set
    const timeoutId = setTimeout(() => {
      // Reset GSAP animations
      if (profileRef.current) {
        gsap.set(profileRef.current, { opacity: 0, y: 30 })
      }
      if (navButtonsRef.current) {
        gsap.set(navButtonsRef.current, { opacity: 0, y: 30 })
      }
      if (sectionsRef.current) {
        gsap.set(sectionsRef.current, { opacity: 0, y: 30 })
      }

      // GSAP animations
      const tl = gsap.timeline()
      
      if (profileRef.current) {
        tl.to(profileRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        })
      }

      if (navButtonsRef.current) {
        tl.to(navButtonsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.4")
      }

      if (sectionsRef.current) {
        tl.to(sectionsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.4")
      }
    }, 100)

    return () => {
      lenis.destroy()
      clearTimeout(timeoutId)
    }
  }, [location.pathname, animationKey])

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await deliveryAPI.getProfile()
        if (response?.data?.success && response?.data?.data?.profile) {
          const profileData = response.data.data.profile
          setProfile(profileData)
          // Debug: Log profile image data
          console.log("Profile image data:", {
            profileImage: profileData.profileImage,
            documentsPhoto: profileData.documents?.photo,
            hasProfileImage: !!profileData.profileImage?.url,
            hasDocumentsPhoto: !!profileData.documents?.photo
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Listen for refresh events from bottom navigation
  useEffect(() => {
    const handleProfileRefresh = () => {
      setAnimationKey(prev => prev + 1)
      // Refetch profile data
      const fetchProfile = async () => {
        try {
          const response = await deliveryAPI.getProfile()
          if (response?.data?.success && response?.data?.data?.profile) {
            setProfile(response.data.data.profile)
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      }
      fetchProfile()
    }

    window.addEventListener('deliveryProfileRefresh', handleProfileRefresh)

    return () => {
      window.removeEventListener('deliveryProfileRefresh', handleProfileRefresh)
    }
  }, [])

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return
    }

    try {
      // Call logout API to clear refresh token on server
      await deliveryAPI.logout()
    } catch (error) {
      console.error("Logout API error (continuing with local cleanup):", error)
      // Continue with local cleanup even if API call fails
    }

    // Use utility function to clear module auth
    clearModuleAuth("delivery")
    
    // Clear all delivery-related data
    localStorage.removeItem("delivery_gig_storage")
    localStorage.removeItem("delivery_module_storage")
    localStorage.removeItem("app:isOnline")
    
    // Clear sessionStorage
    sessionStorage.removeItem("deliveryAuthData")
    
    // Clear any other delivery-related data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("delivery_")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Dispatch custom events for same-tab updates
    window.dispatchEvent(new Event('deliveryAuthChanged'))
    window.dispatchEvent(new Event('onlineStatusChanged'))
    
    toast.success("Logged out successfully")
    
    // Small delay to ensure cleanup completes
    setTimeout(() => {
      // Redirect to sign-in
      navigate("/delivery/sign-in", { replace: true })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-poppins overflow-x-hidden">
      {/* Main Content */}
        {/* Back Button and Profile Section */}
        <div ref={profileRef} className="mb-0">
          <div className="bg-white p-4 w-full shadow-sm">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Profile Information */}
            <div
              onClick={() => navigate("/delivery/profile/details")}
              className="flex items-start justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {loading ? "Loading..." : profile?.name || "Delivery Partner"}
                  </h2>
                  <ChevronRight className="w-5 h-5" />
                </div>
                <p className="text-gray-600 text-sm md:text-base mb-3">
                  {profile?.deliveryId || "N/A"}
                </p>
              </div>
              <div className="relative shrink-0 ml-4">
                {profile?.profileImage?.url ? (
                  <img 
                    src={profile.profileImage.url}
                    alt="Profile"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      // Fallback to documents.photo if profileImage fails to load
                      if (profile?.documents?.photo) {
                        e.target.src = profile.documents.photo
                      } else {
                        // Show default icon if both fail
                        e.target.style.display = 'none'
                        e.target.nextElementSibling?.classList.remove('hidden')
                      }
                    }}
                  />
                ) : profile?.documents?.photo ? (
                  <img 
                    src={profile.documents.photo}
                    alt="Profile"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      // Show default icon if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                {(!profile?.profileImage?.url && !profile?.documents?.photo) && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-gray-500" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-white">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <div className="px-4 py-6 pb-24 md:pb-6">

        {/* Navigation Buttons */}
        <div ref={navButtonsRef} className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("/delivery/trip-history")}
            className="bg-white rounded-lg p-4 flex flex-col items-center gap-1 hover:bg-gray-200 transition-colors"
          >
            <div className="rounded-lg p-2">
              <Bike className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Trips history</span>
          </button>
          <button
            onClick={() => navigate("/delivery/offers")}
            className="bg-white rounded-lg p-4 flex flex-col items-center gap-1 hover:bg-gray-200 transition-colors"
          >
            <div className="rounded-lg p-2">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Your offers</span>
          </button>
        </div>

        {/* Sections */}
        <div ref={sectionsRef} className="space-y-4">
          {/* Referral bonus */}
          <Card 
            onClick={() => navigate("/delivery/refer-and-earn")}
            className="py-0 bg-white border-0 shadow-none cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium mb-1">₹2000 referral bonus</h3>
                <p className="text-gray-600 text-sm">Refer your friend and earn</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12">
                <IndianRupee className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <div>
            <h3 className="text-base font-medium mb-3 px-1">Support</h3>
            <div className="space-y-0">
              <Card 
                onClick={() => navigate("/delivery/help/center")}
                className="bg-white py-0 border-0 shadow-none rounded-none first:rounded-t-lg last:rounded-b-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-5 h-5" />
                    <span className="text-sm font-medium">Help centre</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
              <div className="h-px bg-gray-200"></div>
              <Card 
                onClick={() => navigate("/delivery/help/tickets")}
                className="bg-white py-0 border-0 shadow-none rounded-none first:rounded-t-lg last:rounded-b-lg cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5" />
                    <span className="text-sm font-medium">Support tickets</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Partner options Section */}
          <div>
            <h3 className="text-base font-medium mb-3 px-1">Partner options</h3>
            <Card 
              onClick={() => {}}
              className="bg-white py-0 border-0 shadow-none rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5" />
                  <span className="text-sm font-medium">Rest points</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>

          {/* Logout Section */}
          <div className="pt-4">
            <Card 
              onClick={handleLogout}
              className="bg-white py-0 border-0 shadow-none rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Log out</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  )
}

