import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Printer, Building2 } from "lucide-react"
import Footer from "../components/Footer"

export default function MyQrCode() {
  const [formData, setFormData] = useState({
    title: "test",
    description: "test test",
    phone: "06123456789",
    websiteLink: "https://appzetofood-admin.6amtech.com",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      phone: "",
      websiteLink: "",
    })
  }

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving QR code data:", formData)
  }

  const handlePrint = () => {
    // Handle print logic here
    window.print()
  }

  // Generate QR code URL (using a QR code API service)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    formData.websiteLink || "https://appzetofood-admin.6amtech.com"
  )}`

  // Mask phone number
  const maskedPhone = formData.phone
    ? formData.phone.slice(0, 1) + "*".repeat(formData.phone.length - 1)
    : "0**********"

  // Mask email (if needed)
  const maskedEmail = "t**********@gmail.com"

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <QrCode className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">QR Card Design</h1>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - QR Card Preview */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">QR Card Design</h2>
              <Button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>

            {/* QR Card Preview */}
            <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg overflow-hidden shadow-lg">
              {/* Background Pattern - Food Items */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 20px,
                    rgba(0,0,0,0.05) 20px,
                    rgba(0,0,0,0.05) 40px
                  )`,
                }}
              />

              {/* Top Section - Icon and Title */}
              <div className="relative pt-8 pb-4 px-6 text-center">
                {/* White Square with Icon */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-lg shadow-md mb-3">
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-orange-500 to-gray-700 flex items-center justify-center p-3">
                    <Building2 className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {formData.title || "test"}
                </div>
                <div
                  className="text-2xl font-bold mb-6"
                  style={{
                    fontFamily: "cursive",
                    color: "#d97706",
                  }}
                >
                  Scan Me
                </div>
              </div>

              {/* Bottom Section - Dark Blue with QR Code */}
              <div className="relative bg-blue-900 px-6 py-6">
                {/* Decorative Orange Lines */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-lg">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-48 h-48"
                      onError={(e) => {
                        // Fallback if QR code fails to load
                        e.target.style.display = "none"
                        e.target.parentElement.innerHTML =
                          '<div class="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">QR Code</div>'
                      }}
                    />
                  </div>
                </div>

                {/* Horizontal Line */}
                <div className="h-px bg-gray-300 mb-4"></div>

                {/* Description */}
                <div className="text-white text-center mb-4 text-sm">
                  {formData.description || "test test"}
                </div>

                {/* Contact Information */}
                <div className="space-y-2 text-white text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <span>Phone Number :</span>
                    <span>{maskedPhone}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>{formData.websiteLink || "https://appzetofood-admin.6amtech.com"}</span>
                    <span className="text-orange-400">|</span>
                    <span>{maskedEmail}</span>
                  </div>
                </div>

                {/* Decorative Curved Lines */}
                <div className="absolute bottom-2 left-4 right-4 h-8 opacity-20">
                  <svg viewBox="0 0 200 40" className="w-full h-full">
                    <path
                      d="M 0 20 Q 50 10, 100 20 T 200 20"
                      stroke="#f97316"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M 0 25 Q 50 15, 100 25 T 200 25"
                      stroke="#f97316"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Form */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Description Input */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Phone Input */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Website Link Input */}
              <div>
                <Label
                  htmlFor="websiteLink"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Website Link
                </Label>
                <Input
                  id="websiteLink"
                  type="url"
                  value={formData.websiteLink}
                  onChange={(e) => handleInputChange("websiteLink", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

