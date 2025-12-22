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

export default function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [animationKey, setAnimationKey] = useState(0)
  const profileRef = useRef(null)
  const navButtonsRef = useRef(null)
  const sectionsRef = useRef(null)

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

  // Listen for refresh events from bottom navigation
  useEffect(() => {
    const handleProfileRefresh = () => {
      setAnimationKey(prev => prev + 1)
    }

    window.addEventListener('deliveryProfileRefresh', handleProfileRefresh)

    return () => {
      window.removeEventListener('deliveryProfileRefresh', handleProfileRefresh)
    }
  }, [])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear authentication state
      localStorage.removeItem("delivery_authenticated")
      localStorage.removeItem("delivery_user")
      
      // Clear gig store data
      localStorage.removeItem("delivery_gig_storage")
      
      // Clear delivery module storage
      localStorage.removeItem("delivery_module_storage")
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('deliveryAuthChanged'))
      
      // Redirect to login
      navigate("/delivery/login", { replace: true })
    }
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
                  <h2 className="text-2xl md:text-3xl font-bold">Manish Kumar Yadav</h2>
                  <ChevronRight className="w-5 h-5" />
                </div>
                <p className="text-gray-600 text-sm md:text-base mb-3">FE2411651</p>
              </div>
              <div className="relative shrink-0 ml-4">
                <img 
                  src="https://i.pravatar.cc/240?img=12"
                  alt="Profile"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-white">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <div className="px-4 py-6 pb-24 md:pb-6">

        {/* Navigation Buttons */}
        <div ref={navButtonsRef} className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => navigate("/delivery/gig?tab=history")}
            className="bg-white rounded-lg p-4 flex flex-col items-center gap-1 hover:bg-gray-200 transition-colors"
          >
            <div className="rounded-lg p-2">
              <span className="text-xl font-bold">g</span>
            </div>
            <span className="text-xs font-medium">Gigs history</span>
          </button>
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
          {/* Your fleet coach */}
          <Card className="py-0 bg-white border-0 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium mb-1">Your fleet coach</h3>
                <p className="text-gray-600 text-sm">Pavan Sharma</p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                alt="Fleet Coach"
                className="w-12 h-12 rounded-full object-cover"
              />
            </CardContent>
          </Card>

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

