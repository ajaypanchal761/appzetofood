import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Lenis from "lenis"
import {
  ArrowLeft,
  User,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "restaurant_owner_contact"

const getDefaultOwnerData = () => ({
  name: "RAJKUMAR CHOUHAN Raj",
  phone: "+91-9981127415",
  email: "rrajkumarchouhan96@gmail.com",
  photo: null
})

export default function EditOwner() {
  const navigate = useNavigate()
  const [ownerData, setOwnerData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error("Error loading owner data:", error)
    }
    return getDefaultOwnerData()
  })
  
  const [formData, setFormData] = useState({ ...ownerData })
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(ownerData)
    setHasChanges(changed)
  }, [formData, ownerData])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setOwnerData(parsed)
        setFormData(parsed)
      }
    } catch (error) {
      console.error("Error loading owner data:", error)
    }
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoData = e.target?.result
        setFormData(prev => ({
          ...prev,
          photo: photoData
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      
      // Dispatch event to notify parent page
      window.dispatchEvent(new Event("ownerDataUpdated"))
      
      // Update local state
      setOwnerData({ ...formData })
      setHasChanges(false)
      
      // Navigate back
      navigate(-1)
    } catch (error) {
      console.error("Error saving owner data:", error)
    }
  }

  const handleDeleteAccount = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setShowDeleteDialog(false)
      // Navigate back or to a different page
      navigate(-1)
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Contact details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {formData.photo ? (
                <img 
                  src={formData.photo} 
                  alt="Owner profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 text-sm font-normal hover:text-blue-700 transition-colors"
          >
            Edit photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Name</label>
            <div className="relative">
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter name"
                className="w-full pr-10"
              />
              <Edit className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Phone number</label>
            <div className="relative">
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                className="w-full pr-10 focus-visible:border-black focus-visible:ring-0"
              />
              <Edit className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <div className="relative">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className="w-full pr-10 focus-visible:border-black focus-visible:ring-0"
              />
              <Edit className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="pt-4">
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-normal">Delete your Zomato account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md p-4 w-[90%]">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl leading-none text-red-600">!</span>
            </div>
            <DialogTitle className="text-base font-semibold text-gray-900 text-center">
              You are about to delete your Zomato account
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-gray-600">
              All information associated with your account will be deleted, and you will lose access to your restaurant permanently.
              This information cannot be recovered once the account is deleted. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full py-3 ${
            hasChanges 
              ? "bg-black hover:bg-gray-900 text-white" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          } transition-colors`}
        >
          Save
        </Button>
      </div>
    </div>
  )
}
