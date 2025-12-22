import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"

export default function ShowIdCard() {
  const navigate = useNavigate()

  // Sample ID card data - matching the image
  const idCardData = {
    name: "Sumit Jaiswal",
    id: "FE7583766",
    phone: "7691810506",
    status: "Active",
    validTill: "11 December 2025",
    fssaiLicence: "10019064001810"
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Close Button - Top Right */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
      >
        <X className="w-6 h-6 text-black" />
      </button>

      {/* Top Grey Background Section */}
      <div className="bg-gray-200 h-32 relative">
        {/* Profile Picture - Positioned on gray area, overlapping into white */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              e.target.src = "https://ui-avatars.com/api/?name=Sumit+Jaiswal&background=ff8100&color=fff&size=128"
            }}
          />
        </div>
      </div>

      {/* Main White Content Area */}
      <div className="bg-white min-h-[calc(100vh-8rem)] relative pt-16">
        {/* Content - Centered */}
        <div className="flex flex-col items-center px-4 py-4">
          {/* Brand Name */}
          <p className="text-sm text-gray-400 mb-2">appzeto</p>

          {/* Delivery Partner Title */}
          <h1 className="text-3xl font-bold text-black mb-2">DELIVERY PARTNER</h1>

          {/* Service Type */}
          <p className="text-base text-gray-600 mb-4">Essential Services - Food Delivery</p>

          {/* Active Status Button */}
          <div className="mb-4">
            <span className="bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Active
            </span>
          </div>

          {/* Valid Date */}
          <p className="text-sm text-gray-600 mb-6">
            Valid on: {idCardData.validTill}
          </p>

          {/* Name */}
          <h2 className="text-2xl font-bold text-black mb-2">{idCardData.name}</h2>

          {/* ID Number */}
          <p className="text-base text-black mb-6">{idCardData.id}</p>

          {/* Phone Section */}
          <div className="w-full max-w-md mb-4 text-center">
            <p className="text-xs text-gray-500 mb-1">PHONE</p>
            <p className="text-lg font-bold text-black">{idCardData.phone}</p>
          </div>

          {/* Vehicle Section */}
          <div className="w-full max-w-md mb-4 text-center">
            <p className="text-xs text-gray-500">VEHICLE</p>
          </div>

          {/* FSSAI Licence */}
          <div className="w-full max-w-md mb-6 text-center">
            <p className="text-sm text-black">
              FSSAI Licence: {idCardData.fssaiLicence}
            </p>
          </div>

          {/* Company Name */}
          <p className="text-sm text-gray-500">Appzeto Limited</p>
        </div>
      </div>
    </div>
  )
}

