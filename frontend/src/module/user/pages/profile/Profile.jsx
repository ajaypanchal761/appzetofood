import { useState } from "react"
import { Link } from "react-router-dom"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Profile() {
  const { userProfile } = useProfile()
  
  // Popup states
  const [vegModeOpen, setVegModeOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [ratingsOpen, setRatingsOpen] = useState(false)
  
  // Settings states
  const [vegMode, setVegMode] = useState(true)
  const [appearance, setAppearance] = useState('light')
  
  // Get first letter of name for avatar
  const avatarInitial = userProfile?.name?.charAt(0).toUpperCase() || 'A'
  const displayName = userProfile?.name || 'Aryan'
  const displayEmail = userProfile?.email || 'aryankarma29@gmail.com'

  return (
    <AnimatedPage className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Back Arrow */}
        <div className="mb-4">
          <Link to="/user">
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <ArrowLeft className="h-5 w-5 text-black" />
            </Button>
          </Link>
        </div>

        {/* Profile Info Card */}
        <Card className="bg-white rounded-2xl py-0 pt-1 shadow-sm mb-0 border-0 overflow-hidden">
          <CardContent className="p-4 py-0 pt-2">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-16 w-16 bg-blue-300 border-0">
                <AvatarFallback className="bg-blue-300 text-white text-2xl font-semibold">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-1">
                <h2 className="text-xl font-bold text-black mb-1">{displayName}</h2>
                <p className="text-sm text-black mb-3">{displayEmail}</p>
                {/* <Link to="/user/profile/activity" className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  View activity
                  <ChevronRight className="h-4 w-4" />
                </Link> */}
              </div>
            </div>
            
            {/* Appzeto Gold Banner */}
            <div className="bg-black rounded-none p-4 flex items-center justify-between -mx-4 mb-0 cursor-pointer">
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
            <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Wallet className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Appzeto Money</p>
                <p className="text-base font-semibold text-gray-900">₹0</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/user/profile/coupons" className="h-full">
            <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Tag className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Your coupons</p>
                <p className="text-base font-semibold text-gray-900">View all</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Account Options */}
        <div className="space-y-2 mb-3">

        <Link to="/user/cart" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <ShoppingCart className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Your cart</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            
          <Link to="/user/profile/edit" className="block">
            <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="text-base font-medium text-gray-900">Your profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                    48% completed
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setVegModeOpen(true)}
          >
            <CardContent className="p-4  flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-full p-2">
                  <Leaf className="h-5 w-5 text-gray-700" />
                </div>
                <span className="text-base font-medium text-gray-900">Veg Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900">{vegMode ? 'ON' : 'OFF'}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setAppearanceOpen(true)}
          >
            <CardContent className="p-4  flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-full p-2">
                  <Palette className="h-5 w-5 text-gray-700" />
                </div>
                <span className="text-base font-medium text-gray-900">Appearance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900 capitalize">{appearance}</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setRatingsOpen(true)}
          >
            <CardContent className="p-4  flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 rounded-full p-2">
                  <Star className="h-5 w-5 text-gray-700" />
                </div>
                <span className="text-base font-medium text-gray-900">Your rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-900">-- ★</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900">Collections</h3>
          </div>
          <Link to="/user/collections">
            <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4  flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Bookmark className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="text-base font-medium text-gray-900">Your collections</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Food Orders Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900">Food Orders</h3>
          </div>
          <div className="space-y-2">
            <Link to="/user/orders" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <Building2 className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Your orders</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>


            <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <MessageSquare className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="text-base font-medium text-gray-900">Hear from restaurants</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coupons Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900">Coupons</h3>
          </div>
          <Link to="/user/profile/redeem-gold-coupon">
            <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Percent className="h-5 w-5 text-gray-700" />
                  </div>
                  <span className="text-base font-medium text-gray-900">Redeem Gold coupon</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* More Section */}
        <div className="mb-6 pb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-green-600 rounded"></div>
            <h3 className="text-base font-semibold text-gray-900">More</h3>
          </div>
          <div className="space-y-2">
            <Link to="/user/profile/about" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <Info className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">About</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/send-feedback" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <PenSquare className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Send feedback</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/report-safety-emergency" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <AlertTriangle className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Report a safety emergency</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/accessibility" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <AccessibilityIcon className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Accessibility</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/settings" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <SettingsIcon className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Settings</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile/logout" className="block">
              <Card className="bg-white py-0 rounded-xl shadow-sm border-0 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <Power className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="text-base font-medium text-gray-900">Log out</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
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
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="text-lg font-bold text-gray-900">Appearance</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
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
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                appearance === 'light' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {appearance === 'light' && <Check className="h-3 w-3 text-white" />}
              </div>
              <Sun className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Light</p>
                <p className="text-xs text-gray-500">Default light theme</p>
              </div>
            </button>
            <button
              onClick={() => {
                setAppearance('dark')
                setAppearanceOpen(false)
              }}
              className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                appearance === 'dark'
                  ? 'border-gray-800 bg-gray-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                appearance === 'dark' ? 'border-gray-800 bg-gray-800' : 'border-gray-300'
              }`}>
                {appearance === 'dark' && <Check className="h-3 w-3 text-white" />}
              </div>
              <Moon className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Dark</p>
                <p className="text-xs text-gray-500">Dark theme (Coming soon)</p>
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

