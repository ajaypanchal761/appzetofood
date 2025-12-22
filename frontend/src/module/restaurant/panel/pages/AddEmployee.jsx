import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, User, Eye, EyeOff, Upload, Image as ImageIcon, Info, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"

export default function AddEmployee() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "+1",
    countryCode: "+1",
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "+1",
      countryCode: "+1",
      role: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: null,
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      alert("Please enter first name")
      return
    }
    if (!formData.lastName.trim()) {
      alert("Please enter last name")
      return
    }
    if (!formData.phone || formData.phone === "+1") {
      alert("Please enter a valid phone number")
      return
    }
    if (!formData.role) {
      alert("Please select a role")
      return
    }
    if (!formData.email.trim()) {
      alert("Please enter an email address")
      return
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address")
      return
    }
    if (!formData.password.trim()) {
      alert("Please enter a password")
      return
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    try {
      // TODO: Implement actual API call to create employee
      console.log("Submitting employee:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert("Employee added successfully!")
      
      // Navigate back to list after successful submission
      navigate("/restaurant-panel/all-employee")
    } catch (error) {
      console.error("Error submitting employee:", error)
      alert("Failed to add employee. Please try again.")
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Users className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* General Information Section */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">General Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Ex: Sakeef Ameer"
                    className="w-full"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Ex: Prodhan"
                    className="w-full"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => handleInputChange("countryCode", value)}
                    >
                      <SelectTrigger className="w-24 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                        <div className="flex items-center gap-2 w-full">
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+880">🇧🇩 +880</SelectItem>
                        <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">
                    Role
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                      <div className="flex items-center gap-2 w-full">
                        <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <SelectValue placeholder="Select Role" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Section */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">Account Info</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Ex: ex@gmail.com"
                    className="w-full"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <span className="text-red-500">*</span>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Ex: 8+ Character"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700"
                    >
                      Confirm Password
                    </Label>
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Ex: 8+ Character"
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Employee Image Upload */}
        <div className="lg:col-span-1 flex">
          <Card className="border-gray-200 shadow-sm flex flex-col w-full h-full">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-sm font-medium text-gray-700">Employee image</Label>
                  <span className="text-red-500 text-sm">Ratio (1:1)</span>
                </div>
              </div>

              {/* Image Preview */}
              <div className="w-full flex-1 min-h-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 mb-4 flex items-center justify-center">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-300 mb-2" />
                    <div className="text-sm text-gray-400">No image selected</div>
                  </div>
                )}
              </div>

              {/* Image Size Info */}
              <p className="text-xs text-gray-600 mb-4">
                Employee image size max 2 MB*
              </p>

              {/* File Upload */}
              <div className="flex items-center gap-2 mt-auto">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="employee-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("employee-image-upload").click()}
                  className="flex-1 border-gray-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose file
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("employee-image-upload").click()}
                  className="border-gray-200"
                >
                  Browse
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="border-gray-200"
        >
          Reset
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Submit
        </Button>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

