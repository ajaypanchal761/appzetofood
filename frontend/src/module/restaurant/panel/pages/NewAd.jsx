import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ImageIcon, Upload, ChevronDown } from "lucide-react"
import Footer from "../components/Footer"

const languages = [
  { value: "default", label: "Default" },
  { value: "en", label: "English(EN)" },
  { value: "bn", label: "Bengali - বাংলা(BN)" },
  { value: "ar", label: "Arabic - العربية (AR)" },
  { value: "es", label: "Spanish - español(ES)" },
]

export default function NewAd() {
  const [activeLang, setActiveLang] = useState("default")
  const [title, setTitle] = useState("Exclusive Offer")
  const [description, setDescription] = useState("Get Discount")
  const [adType, setAdType] = useState("restaurant")
  const [validity, setValidity] = useState("")
  const [showReview, setShowReview] = useState(true)
  const [showRating, setShowRating] = useState(true)
  const [profilePreview, setProfilePreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfilePreview(url)
    }
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCoverPreview(url)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Advertisement</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Left: Form */}
        <Card className="xl:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Advertisement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Language Tabs */}
            <Tabs value={activeLang} onValueChange={setActiveLang}>
              <TabsList className="inline-flex w-full h-10 bg-gray-100 rounded-lg p-1 gap-1 mb-4">
                {languages.map((lang) => (
                  <TabsTrigger
                    key={lang.value}
                    value={lang.value}
                    className="flex-1 text-xs font-medium text-gray-900 py-2 data-[state=active]:bg-amber-50 data-[state=active]:text-gray-900 rounded-md transition-all"
                  >
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Advertisement Title */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Advertisement Title (Default)
              </Label>
              <Input
                placeholder="Exclusive Offer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Short Description (Default)
              </Label>
              <Textarea
                placeholder="Get Discount"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Advertisement Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Advertisement Type</Label>
              <Select value={adType} onValueChange={setAdType}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant Promotion</SelectItem>
                  <SelectItem value="campaign">Campaign Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Validity */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Validity</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  placeholder="Select date"
                  className="h-10 border-gray-300 pr-10 focus:border-blue-500 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Show Review & Ratings */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Show Review & Ratings</Label>
              <div className="flex items-center gap-6 bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <Input
                    type="checkbox"
                    checked={showReview}
                    onChange={(e) => setShowReview(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Review</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <Input
                    type="checkbox"
                    checked={showRating}
                    onChange={(e) => setShowRating(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Rating</span>
                </label>
              </div>
            </div>

            {/* Upload Related Files */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Upload Related Files</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Image */}
                <div className="border border-dashed border-gray-300 rounded-md p-4 flex items-center gap-3">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Profile Image</div>
                    <div className="text-xs text-gray-500">Ratio - 1:1</div>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileUpload}
                        className="border-0 p-0 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="border border-dashed border-gray-300 rounded-md p-4 flex items-center gap-3">
                  <div className="flex-shrink-0 h-14 w-24 rounded-md bg-gray-100 flex items-center justify-center">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Upload Cover</div>
                    <div className="text-xs text-gray-500">Ratio - 2:1</div>
                    <div className="mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="border-0 p-0 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="h-10 px-5 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Submit</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Advertisement Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
              <div className="h-40 bg-slate-100 rounded-lg" />
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="profile preview"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
                <div className="ml-auto flex items-center">
                  <span className="bg-orange-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    4.7 (3+)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-5/6" />
              <div className="h-3 bg-slate-200 rounded w-4/6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}


