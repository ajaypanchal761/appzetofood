import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Lenis from "lenis"
import { useEffect } from "react"
import { 
  ArrowLeft,
  Home,
  ShoppingBag,
  Store,
  Wallet,
  Menu,
  User,
  Mail,
  Phone,
  Edit,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BottomNavbar from "../components/BottomNavbar"
import MenuOverlay from "../components/MenuOverlay"

export default function EditProfilePage() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "Pichart",
    lastName: "Anthony",
    phone: "01747410000",
    email: "test.restaurant@gmail.com"
  })

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Profile updated:", formData)
    navigate("/restaurant")
  }

  return (
    <div className="min-h-screen bg-[#f6e9dc] overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 flex items-center gap-3">
        <button 
          onClick={() => navigate("/restaurant")}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Profile</h1>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="pb-24 md:pb-6">
        {/* Profile Picture Section with Colorful Background */}
        <div className="relative -mt-1 z-10 pb-10 md:pb-12">
          {/* Colorful Background */}
          <div className="relative h-36 md:h-44">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff8100] via-[#ff9500] to-[#20b2aa] rounded-b-3xl">
              {/* Decorative shapes */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            </div>
          </div>
          
          {/* Profile Picture - Positioned outside background to be fully visible */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=ff8100&color=fff`
                  }}
                />
              </div>
              {/* Edit Profile Picture Button */}
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-30">
                <Edit className="w-3 h-3 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields - Compact */}
        <div className="px-4 pt-2 pb-4">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* First Name */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                First name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8100] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Last name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8100] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <img 
                    src="https://flagcdn.com/w20/us.png" 
                    alt="US" 
                    className="w-4 h-3 object-cover rounded"
                  />
                  <span className="text-xs text-gray-600">+1</span>
                </div>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full pl-16 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8100] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff8100] focus:border-transparent"
                />
              </div>
            </div>

            {/* Update Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#ff8100] hover:bg-[#e67300] text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all"
              >
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <BottomNavbar onMenuClick={() => setShowMenu(true)} />
      
      {/* Menu Overlay */}
      <MenuOverlay showMenu={showMenu} setShowMenu={setShowMenu} />
    </div>
  )
}

