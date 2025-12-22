import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Edit,
  Handshake,
  Percent,
  Phone,
  MapPin,
  Info,
} from "lucide-react"
import Footer from "../components/Footer"
import bannerImage from "@/assets/restaurant icons/banner.png"
import logoImage from "@/assets/restaurant icons/profile res.png"

export default function MyRestaurant() {
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [announcementText, setAnnouncementText] = useState(
    "New Menu Alert: Enjoy our fresh selection of kebabs, sides, and desserts—crafted to satisfy every craving!"
  )

  const handlePublish = () => {
    // Handle publish logic here
    console.log("Publishing announcement:", announcementText)
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop Details</h1>
          <p className="text-sm text-gray-500">Created at 20 Aug 2021 09:11 pm</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Edit className="h-4 w-4 mr-2" />
          Edit Shop
        </Button>
      </div>

      {/* Shop Information Card */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Banner Image */}
          <div className="relative w-full h-64 overflow-hidden">
            <img
              src={bannerImage}
              alt="Restaurant Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Shop Name and Details */}
          <div className="px-6 pb-6 pt-6">
            {/* Shop Name with Logo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl bg-white shadow-md p-2 flex-shrink-0">
                <img
                  src={logoImage}
                  alt="Restaurant Logo"
                  className="w-full h-full rounded-lg object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Hungry Puppets</h2>
            </div>

            {/* Shop Details - Horizontal Layout */}
            <div className="flex flex-nowrap gap-6 overflow-x-auto">
              {/* Business Model */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Handshake className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">Business Model</div>
                  <div className="text-sm text-gray-600">Commission Base</div>
                </div>
              </div>

              {/* Admin Commission */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Percent className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">Admin Commission</div>
                  <div className="text-sm text-gray-600">10 %</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">Phone</div>
                  <div className="text-sm text-gray-600">+1**********</div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">Address</div>
                  <div className="text-sm text-gray-600">House: 00, Road: 00, Test City</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcement Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {/* Announcement Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Announcement</h2>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <Switch
              checked={announcementEnabled}
              onCheckedChange={setAnnouncementEnabled}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Announcement Content */}
          <div className="p-6">
            {/* Announcement Textarea */}
            <div className="mb-4 w-full">
              <Textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Enter your announcement here..."
                className="w-full min-h-32 resize-y border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={!announcementEnabled}
              />
            </div>

            {/* Publish Button */}
            <div className="flex justify-end">
              <Button
                onClick={handlePublish}
                disabled={!announcementEnabled}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Publish
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

