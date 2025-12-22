import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, X, Pencil, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useProfile } from "../../context/ProfileContext"

// Gender options
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

// Load profile data from localStorage
const loadProfileFromStorage = () => {
  try {
    const stored = localStorage.getItem('appzeto_user_profile')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading profile from localStorage:', error)
  }
  return null
}

// Save profile data to localStorage
const saveProfileToStorage = (data) => {
  try {
    localStorage.setItem('appzeto_user_profile', JSON.stringify(data))
  } catch (error) {
    console.error('Error saving profile to localStorage:', error)
  }
}

export default function EditProfile() {
  const navigate = useNavigate()
  const { userProfile, updateUserProfile } = useProfile()
  
  // Load from localStorage or use context
  const storedProfile = loadProfileFromStorage()
  const initialProfile = storedProfile || userProfile || {}
  
  const initialFormData = {
    name: initialProfile.name || "Aryan Karma",
    mobile: initialProfile.mobile || initialProfile.phone || "9098569620",
    email: initialProfile.email || "aryankarma29@gmail.com",
    dateOfBirth: initialProfile.dateOfBirth || "",
    anniversary: initialProfile.anniversary || "",
    gender: initialProfile.gender || "",
  }
  
  const [formData, setFormData] = useState(initialFormData)
  const [initialData] = useState(initialFormData)
  const [hasChanges, setHasChanges] = useState(false)

  // Update form data when profile changes
  useEffect(() => {
    const storedProfile = loadProfileFromStorage()
    const profile = storedProfile || userProfile || {}
    const newFormData = {
      name: profile.name || "Aryan Karma",
      mobile: profile.mobile || profile.phone || "9098569620",
      email: profile.email || "aryankarma29@gmail.com",
      dateOfBirth: profile.dateOfBirth || "",
      anniversary: profile.anniversary || "",
      gender: profile.gender || "",
    }
    setFormData(newFormData)
  }, [userProfile])

  // Get avatar initial
  const avatarInitial = formData.name?.charAt(0).toUpperCase() || 'A'

  // Check if form has changes
  useEffect(() => {
    const currentData = JSON.stringify(formData)
    const savedData = JSON.stringify(initialData)
    setHasChanges(currentData !== savedData)
  }, [formData, initialData])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClear = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: ""
    }))
  }

  const handleUpdate = () => {
    // Save to localStorage
    saveProfileToStorage(formData)
    
    // Update context
    updateUserProfile({
      ...formData,
      phone: formData.mobile,
    })
    
    // Navigate back
    navigate("/user/profile")
  }

  const handleMobileChange = () => {
    // Navigate to mobile change page or show modal
    console.log('Change mobile clicked')
  }

  const handleEmailChange = () => {
    // Navigate to email change page or show modal
    console.log('Change email clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Your Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24 bg-blue-400 border-0">
              <AvatarFallback className="bg-blue-400 text-white text-3xl font-semibold">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            {/* Edit Icon */}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-green-700 transition-colors">
              <Pencil className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white rounded-xl shadow-sm border-0">
          <CardContent className="p-4 space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pr-10 h-12 text-base border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg bg-white"
                  placeholder="Name"
                />
                {formData.name && (
                  <button
                    type="button"
                    onClick={() => handleClear('name')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Field */}
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                Mobile
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="flex-1 h-12 text-base  border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg bg-white"
                  placeholder="Mobile"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="flex-1 h-12 text-base border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg bg-white"
                  placeholder="Email"
                />
              </div>
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                Date of birth
              </Label>
              <div className="relative">
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="h-12 text-base border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg pr-10 bg-white [color-scheme:light]"
                />
                {!formData.dateOfBirth && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm mr-2">Date of birth</span>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Anniversary Field */}
            <div className="space-y-1.5">
              <Label htmlFor="anniversary" className="text-sm font-medium text-gray-700">
                Anniversary
              </Label>
              <div className="relative">
                <Input
                  id="anniversary"
                  type="date"
                  value={formData.anniversary}
                  onChange={(e) => handleChange('anniversary', e.target.value)}
                  className="h-12 text-base border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg pr-10 bg-white [color-scheme:light]"
                />
                {!formData.anniversary && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                    <span className="text-gray-400 text-sm mr-2">Anniversary</span>
                    <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                )}
              </div>
            </div>

            {/* Gender Field */}
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender
              </Label>
              <Select
                value={formData.gender || undefined}
                onValueChange={(value) => handleChange('gender', value)}
              >
                <SelectTrigger className="h-12 text-base border border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg bg-white">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Update Profile Button */}
        <Button
          onClick={handleUpdate}
          disabled={!hasChanges}
          className={`w-full h-14 rounded-xl font-semibold text-base transition-all ${
            hasChanges
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Update profile
        </Button>
      </div>
    </div>
  )
}
