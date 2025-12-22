import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import {
  ArrowLeft,
  Share2,
  Edit,
  Pencil,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Star,
  Mic,
  ChevronRight,
  X,
  Copy,
  Check,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const CUISINES_STORAGE_KEY = "restaurant_cuisines"

export default function OutletInfo() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  // State management
  const [restaurantName, setRestaurantName] = useState("Kadhai Chammach Restaurant")
  const [cuisineTags, setCuisineTags] = useState("Pizza, Burger, Rolls, North Indian, Shawarma, Sandwich, Chinese, Momos")
  const [address, setAddress] = useState("Musakhedi, Idrish Nagar, By Pass Road (South), Indore")
  const [mainImage, setMainImage] = useState("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop")
  const [thumbnailImage, setThumbnailImage] = useState("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop")
  const [showEditNameDialog, setShowEditNameDialog] = useState(false)
  const [editNameValue, setEditNameValue] = useState("")
  const [restaurantId] = useState("20959122")
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [copied, setCopied] = useState(false)

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

  // Load cuisines from localStorage
  useEffect(() => {
    const loadCuisines = () => {
      try {
        const saved = localStorage.getItem(CUISINES_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length) {
            setCuisineTags(parsed.join(", "))
          }
        }
      } catch (error) {
        console.error("Error loading cuisines from storage:", error)
      }
    }

    loadCuisines()

    const handleUpdate = () => {
      loadCuisines()
    }

    window.addEventListener("cuisinesUpdated", handleUpdate)
    return () => window.removeEventListener("cuisinesUpdated", handleUpdate)
  }, [])

  // Handle image replacement
  const handleImageReplace = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMainImage(e.target?.result || mainImage)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle edit name dialog
  const handleOpenEditDialog = () => {
    setEditNameValue(restaurantName)
    setShowEditNameDialog(true)
  }

  const handleSaveName = () => {
    if (editNameValue.trim()) {
      setRestaurantName(editNameValue.trim())
      setShowEditNameDialog(false)
    }
  }

  // Share functionality
  const handleShare = async () => {
    setShowSharePopup(true)
  }

  const handleCopyLink = async () => {
    const shareUrl = `https://appzeto.com/restaurant/${restaurantId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleNativeShare = async () => {
    const shareData = {
      title: restaurantName,
      text: `Check out ${restaurantName} on Appzeto!\nRestaurant ID: ${restaurantId}\nAddress: ${address}`,
      url: `https://appzeto.com/restaurant/${restaurantId}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setShowSharePopup(false)
      } else {
        // Fallback to copy
        await handleCopyLink()
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing:", err)
      }
    }
  }

  const handleShareViaWhatsApp = () => {
    const message = `Check out ${restaurantName} on Appzeto!\nRestaurant ID: ${restaurantId}\nAddress: ${address}\n\nhttps://appzeto.com/restaurant/${restaurantId}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setShowSharePopup(false)
  }

  const handleShareViaSMS = () => {
    const message = `Check out ${restaurantName} on Appzeto! Restaurant ID: ${restaurantId}. https://appzeto.com/restaurant/${restaurantId}`
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    window.location.href = smsUrl
    setShowSharePopup(false)
  }

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (showEditNameDialog || showSharePopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showEditNameDialog, showSharePopup])

  return (
    <div className="h-screen bg-white overflow-x-hidden">
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
            <h1 className="text-lg font-bold text-gray-900">Outlet info</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900 font-normal">Res id: {restaurantId}</span>
            <button
              onClick={handleShare}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Section */}
      <div className="relative w-full h-[200px] overflow-visible">
        <img 
          src={mainImage}
          alt="Restaurant banner"
          className="w-full h-full object-cover"
        />
        
        {/* Replace Image Button - Black background with white text */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-4 right-4 bg-black/90 hover:bg-black px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-white transition-colors shadow-lg z-10"
        >
          <Pencil className="w-4 h-4" />
          <span>Replace image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageReplace}
        />

        {/* Thumbnail Section - Overlapping bottom edge */}
        <div className="absolute bottom-0 left-4 -mb-[45px] flex flex-col gap-2 shrink-0 z-10">
          <div className="relative w-[70px] h-[70px] rounded overflow-hidden">
            <img 
              src={thumbnailImage}
              alt="Restaurant thumbnail"
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
          <button
          onClick={() => fileInputRef.current?.click()}
          className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors text-left"
          >
            Edit photo
          </button>
        </div>
      </div>

      {/* Thumbnail and Reviews Section */}
      <div className="px-4 pt-[50px] pb-4 bg-white">
        <div className="flex items-start gap-4">
     
          {/* Reviews Section - Left Aligned */}
          <div className="flex flex-col gap-2">
            {/* Delivery Reviews */}
            <button
              onClick={() => navigate("/restaurant/ratings-reviews")}
              className="flex items-center gap-2 text-left w-full"
            >
              <div className="bg-green-700 px-2.5 py-1.5 rounded flex items-center gap-1 shrink-0">
                <span className="text-white text-sm font-bold">4.0</span>
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-gray-800 text-sm font-normal">19 DELIVERY REVIEWS</span>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-auto" />
            </button>

            {/* Dining Reviews */}
            <div className="flex items-center gap-2">
              <div className="bg-gray-300 px-2.5 py-1.5 rounded flex items-center gap-1 shrink-0">
                <span className="text-white text-sm font-normal">-</span>
                <Star className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-gray-800 text-sm font-normal">NOT ENOUGH DINING REVIEWS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Information Heading */}
      <div className="px-4 py-4">
        <h2 className="text-base font-bold text-gray-900 text-center">Restaurant information</h2>
      </div>

      {/* Information Cards */}
      <div className="px-4 pb-6 space-y-3">
        {/* Restaurant Name Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-100/50  rounded-lg p-4 border border-blue-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-normal mb-1">Restaurant's name</p>
              <p className="text-base font-semibold text-gray-900">{restaurantName}</p>
            </div>
            <button
              onClick={handleOpenEditDialog}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors ml-4 shrink-0"
            >
              edit
            </button>
          </div>
        </motion.div>

        {/* Cuisine Tags Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-blue-100/50 rounded-lg p-4 border border-blue-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-normal mb-1">Cuisine tags</p>
              <p className="text-base font-semibold text-gray-900">{cuisineTags}</p>
            </div>
            <button
              onClick={() => navigate("/restaurant/edit-cuisines")}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors ml-4 shrink-0 self-start"
            >
              edit
            </button>
          </div>
        </motion.div>

        {/* Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-blue-100/50  rounded-lg p-4 border border-blue-300"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-normal mb-1">Address</p>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-base font-semibold text-gray-900">{address}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/restaurant/edit-address")}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors ml-4 shrink-0 self-start"
            >
              edit
            </button>
          </div>
          <button
            onClick={() => {
              // Open Google Maps with restaurant location
              const encodedAddress = encodeURIComponent(address)
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
              window.open(googleMapsUrl, "_blank")
            }}
            className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors"
          >
            View on map
          </button>
           <p className="text-sm text-gray-600 font-normal mb-1">Pickup instructions</p>
          <p className="text-xs text-gray-500 font-normal mb-3">
            Helps our delivery partner reach your outlet faster
          </p>
          <button
            onClick={() => console.log("Record instructions")}
            className="flex items-center gap-2 text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span>Tap here to record instructions</span>
          </button>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-3 pt-2"
        >
          {/* Outlet Timings Card */}
          <button
            onClick={() => navigate("/restaurant/outlet-timings")}
            className="w-full bg-blue-100/50 rounded-lg p-4 border border-blue-300 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-gray-900">Outlet timings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </button>

          {/* Contact Details Card */}
          <button
            onClick={() => navigate("/restaurant/contact-details")}
            className="w-full bg-blue-100/50 rounded-lg p-4 border border-blue-300 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-gray-900">Contact details</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </button>

          {/* View on Zomato Card */}
          <button
            onClick={() => console.log("View on Zomato")}
            className="w-full bg-blue-100/50 rounded-lg p-4 border border-blue-300 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-gray-900">View on Zomato</span>
            </div>
            <ExternalLink className="w-5 h-5 text-blue-600" />
          </button>
        </motion.div>
      </div>

      {/* Share Popup */}
      <AnimatePresence>
        {showSharePopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSharePopup(false)}
            />
            
            {/* Share Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ 
                type: "spring",
                damping: 30,
                stiffness: 300
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">Share outlet info</h2>
                <button
                  onClick={() => setShowSharePopup(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Restaurant Info Preview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{restaurantName}</h3>
                  <p className="text-sm text-gray-600 mb-2">Restaurant ID: {restaurantId}</p>
                  <p className="text-sm text-gray-600">{address}</p>
                </div>

                {/* Copy Link Section */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Share link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`https://appzeto.com/restaurant/${restaurantId}`}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        copied 
                          ? "bg-green-600 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-3">Share via</p>
                  
                  {/* Share via System Dialog */}
                  {navigator.share && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Share2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-base font-medium text-gray-900">Share</p>
                        <p className="text-xs text-gray-500">Open system share dialog</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  )}

                  {/* Share via WhatsApp */}
                  <button
                    onClick={handleShareViaWhatsApp}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base font-medium text-gray-900">WhatsApp</p>
                      <p className="text-xs text-gray-500">Share via WhatsApp</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Share via SMS */}
                  <button
                    onClick={handleShareViaSMS}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base font-medium text-gray-900">SMS</p>
                      <p className="text-xs text-gray-500">Share via text message</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Restaurant Name Dialog */}
      <Dialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog}>
        <DialogContent className="sm:max-w-md p-4 w-[90%]">
          <DialogHeader>
            <DialogTitle className="text-left">Edit Restaurant Name</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              placeholder="Enter restaurant name"
              className="w-full focus-visible:border-black focus-visible:ring-0"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditNameDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveName}
              disabled={!editNameValue.trim()}
              className="bg-black text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
