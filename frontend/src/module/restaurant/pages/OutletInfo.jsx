import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import {
  ArrowLeft,
  Edit,
  Pencil,
  MapPin,
  Clock,
  Phone,
  Star,
  ChevronRight,
  X,
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
import { restaurantAPI } from "@/lib/api"

const CUISINES_STORAGE_KEY = "restaurant_cuisines"

export default function OutletInfo() {
  const navigate = useNavigate()
  
  // State management
  const [restaurantData, setRestaurantData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restaurantName, setRestaurantName] = useState("")
  const [cuisineTags, setCuisineTags] = useState("")
  const [address, setAddress] = useState("")
  const [mainImage, setMainImage] = useState("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop")
  const [thumbnailImage, setThumbnailImage] = useState("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop")
  const [showEditNameDialog, setShowEditNameDialog] = useState(false)
  const [editNameValue, setEditNameValue] = useState("")
  const [restaurantId, setRestaurantId] = useState("")
  const [restaurantMongoId, setRestaurantMongoId] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageType, setImageType] = useState(null) // 'profile' or 'menu'
  const profileImageInputRef = useRef(null)
  const menuImageInputRef = useRef(null)

  // Format address from location object
  const formatAddress = (location) => {
    if (!location) return ""
    
    const parts = []
    if (location.addressLine1) parts.push(location.addressLine1.trim())
    if (location.addressLine2) parts.push(location.addressLine2.trim())
    if (location.area) parts.push(location.area.trim())
    if (location.city) {
      const city = location.city.trim()
      // Only add city if it's not already included in area
      if (!location.area || !location.area.includes(city)) {
        parts.push(city)
      }
    }
    if (location.landmark) parts.push(location.landmark.trim())
    
    return parts.join(", ") || ""
  }

  // Fetch restaurant data on mount
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          setRestaurantData(data)
          
          // Set restaurant name
          setRestaurantName(data.name || "")
          
          // Set restaurant ID
          setRestaurantId(data.restaurantId || data.id || "")
          // Set MongoDB _id for last 5 digits display
          // Backend returns id field which contains the MongoDB _id
          // Convert to string to ensure we can slice it
          const mongoId = String(data.id || data._id || "")
          setRestaurantMongoId(mongoId)
          
          // Format and set address
          const formattedAddress = formatAddress(data.location)
          setAddress(formattedAddress)
          
          // Format cuisines
          if (data.cuisines && Array.isArray(data.cuisines) && data.cuisines.length > 0) {
            setCuisineTags(data.cuisines.join(", "))
          } else {
            // Load from localStorage as fallback
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
          
          // Set images
          if (data.profileImage?.url) {
            setThumbnailImage(data.profileImage.url)
          }
          if (data.menuImages && Array.isArray(data.menuImages) && data.menuImages.length > 0) {
            // Use first menu image as main image
            setMainImage(data.menuImages[0].url)
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()

    // Listen for updates from edit pages
    const handleCuisinesUpdate = () => {
      fetchRestaurantData()
    }
    const handleAddressUpdate = () => {
      fetchRestaurantData()
    }

    window.addEventListener("cuisinesUpdated", handleCuisinesUpdate)
    window.addEventListener("addressUpdated", handleAddressUpdate)
    
    return () => {
      window.removeEventListener("cuisinesUpdated", handleCuisinesUpdate)
      window.removeEventListener("addressUpdated", handleAddressUpdate)
    }
  }, [])

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

  // Handle profile image replacement
  const handleProfileImageReplace = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setImageType('profile')

      // Upload image to Cloudinary
      const uploadResponse = await restaurantAPI.uploadProfileImage(file)
      const uploadedImage = uploadResponse?.data?.data?.profileImage

      if (uploadedImage) {
        // Update local state immediately for better UX
        if (uploadedImage.url) {
          setThumbnailImage(uploadedImage.url)
        }
        
        // Refresh restaurant data to get latest from backend
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          setRestaurantData(data)
          if (data.profileImage?.url) {
            setThumbnailImage(data.profileImage.url)
          } else if (uploadedImage.url) {
            // Fallback to uploaded image URL
            setThumbnailImage(uploadedImage.url)
          }
        } else if (uploadedImage.url) {
          // Fallback if refresh fails
          setThumbnailImage(uploadedImage.url)
        }
      }
    } catch (error) {
      console.error("Error uploading profile image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
      setImageType(null)
      // Reset input
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = null
      }
    }
  }

  // Handle menu image replacement (main banner)
  const handleMenuImageReplace = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setImageType('menu')

      // Upload image to Cloudinary
      const uploadResponse = await restaurantAPI.uploadMenuImage(file)
      const uploadedImage = uploadResponse?.data?.data?.menuImage

      if (uploadedImage) {
        // Update local state immediately for better UX
        setMainImage(uploadedImage.url)
        
        // Refresh restaurant data to get latest from backend
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          setRestaurantData(data)
          // Use first menu image as main image (it should be the replaced one)
          if (data.menuImages && Array.isArray(data.menuImages) && data.menuImages.length > 0) {
            setMainImage(data.menuImages[0].url)
          } else if (uploadedImage.url) {
            // Fallback to uploaded image URL
            setMainImage(uploadedImage.url)
          }
        } else if (uploadedImage.url) {
          // Fallback if refresh fails
          setMainImage(uploadedImage.url)
        }
      } else {
        // If response structure is different, try to get from menuImages array
        const menuImages = uploadResponse?.data?.data?.menuImages
        if (menuImages && Array.isArray(menuImages) && menuImages.length > 0) {
          setMainImage(menuImages[0].url)
          // Refresh restaurant data
          const response = await restaurantAPI.getCurrentRestaurant()
          const data = response?.data?.data?.restaurant || response?.data?.restaurant
          if (data) {
            setRestaurantData(data)
          }
        }
      }
    } catch (error) {
      console.error("Error uploading menu image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
      setImageType(null)
      // Reset input
      if (menuImageInputRef.current) {
        menuImageInputRef.current.value = null
      }
    }
  }

  // Handle edit name dialog
  const handleOpenEditDialog = () => {
    setEditNameValue(restaurantName)
    setShowEditNameDialog(true)
  }

  const handleSaveName = async () => {
    const newName = editNameValue.trim()
    if (!newName) {
      alert("Restaurant name cannot be empty")
      return
    }

    if (newName === restaurantName) {
      // No change, just close dialog
      setShowEditNameDialog(false)
      return
    }

    try {
      // Update restaurant name via API
      const response = await restaurantAPI.updateProfile({ name: newName })
      
      if (response?.data?.data?.restaurant) {
        // Update local state
        setRestaurantName(newName)
        setRestaurantData(prev => prev ? { ...prev, name: newName } : null)
        setShowEditNameDialog(false)
        
        // Refresh restaurant data to get latest from backend
        const refreshResponse = await restaurantAPI.getCurrentRestaurant()
        const data = refreshResponse?.data?.data?.restaurant || refreshResponse?.data?.restaurant
        if (data) {
          setRestaurantData(data)
          setRestaurantName(data.name || newName)
        }
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Error updating restaurant name:", error)
      alert(`Failed to update restaurant name: ${error.response?.data?.message || error.message || "Please try again."}`)
    }
  }


  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (showEditNameDialog) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showEditNameDialog])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
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
            <span className="text-sm text-gray-900 font-normal">
              Restaurant id: {loading ? "Loading..." : (restaurantMongoId && restaurantMongoId.length >= 5 ? restaurantMongoId.slice(-5) : (restaurantId || "N/A"))}
            </span>
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
          onClick={() => menuImageInputRef.current?.click()}
          disabled={uploadingImage}
          className="absolute top-4 right-4 bg-black/90 hover:bg-black px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-white transition-colors shadow-lg z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pencil className="w-4 h-4" />
          <span>{uploadingImage && imageType === 'menu' ? 'Uploading...' : 'Replace image'}</span>
        </button>
        <input
          ref={menuImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleMenuImageReplace}
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
            onClick={() => profileImageInputRef.current?.click()}
            disabled={uploadingImage}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImage && imageType === 'profile' ? 'Uploading...' : 'Edit photo'}
          </button>
          <input
            ref={profileImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageReplace}
          />
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
                <span className="text-white text-sm font-bold">
                  {restaurantData?.rating?.toFixed(1) || "0.0"}
                </span>
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-gray-800 text-sm font-normal">
                {restaurantData?.totalRatings || 0} DELIVERY REVIEWS
              </span>
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
        <h2 className="text-base font-bold text-gray-900 text-center">Restaurant Information</h2>
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
              <p className="text-base font-semibold text-gray-900">
                {loading ? "Loading..." : (restaurantName || "N/A")}
              </p>
            </div>
            <button
              onClick={handleOpenEditDialog}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors ml-4 shrink-0"
            >
              Edit
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
              <p className="text-base font-semibold text-gray-900">
                {loading ? "Loading..." : (cuisineTags || "No cuisines selected")}
              </p>
            </div>
            <button
              onClick={() => navigate("/restaurant/edit-cuisines")}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors ml-4 shrink-0 self-start"
            >
              Edit
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
                <p className="text-base font-semibold text-gray-900">
                  {loading ? "Loading..." : (address || "No address provided")}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/restaurant/edit-address")}
              className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors ml-4 shrink-0 self-start"
            >
              Edit
            </button>
          </div>
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
              <span className="text-base font-semibold text-gray-900">Outlet Timings</span>
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
              <span className="text-base font-semibold text-gray-900">Contact Details</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-600" />
          </button>
        </motion.div>
      </div>


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
