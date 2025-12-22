import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Info,
  Menu,
  X,
  Plus,
  Calendar,
  Clock,
  Upload,
  Image as ImageIcon,
  Tag,
} from "lucide-react"
import Footer from "../components/Footer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export default function RestaurantConfig() {
  // Close Restaurant
  const [closeRestaurant, setCloseRestaurant] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    scheduledDelivery: true,
    homeDelivery: true,
    takeaway: true,
    veg: true,
    nonVeg: true,
    subscriptionBasedOrder: false,
    cutlery: true,
    instantOrder: true,
    halalTagStatus: true,
    extraPackagingCharge: true,
    dineIn: true,
  })

  // Basic Settings
  const [extraPackagingChargeType, setExtraPackagingChargeType] = useState("optional")
  const [extraPackagingChargeAmount, setExtraPackagingChargeAmount] = useState("2")
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("")
  const [minimumTimeForDineIn, setMinimumTimeForDineIn] = useState("")

  // Restaurant Characteristics
  const [characteristics, setCharacteristics] = useState([
    "Bengali",
    "Indian",
    "Pizza",
    "Pasta",
    "Snacks",
  ])
  const [newCharacteristic, setNewCharacteristic] = useState("")

  // Restaurant Meta Data
  const [metaTitle, setMetaTitle] = useState(
    "Hungry Puppets Restaurant: Where Flavor and Fun Meet"
  )
  const [metaDescription, setMetaDescription] = useState(
    "Satisfy your cravings and indulge in a culinary adventure at Hungry Puppets Restaurant. Our menu is a symphony of taste, offering a delightful fusion of flavors"
  )
  const [metaImage, setMetaImage] = useState(null)

  // Indexing Settings
  const [indexing, setIndexing] = useState("index")
  const [noFollow, setNoFollow] = useState(false)
  const [noArchive, setNoArchive] = useState(false)
  const [noImageIndex, setNoImageIndex] = useState(false)
  const [noSnippet, setNoSnippet] = useState(false)
  const [maxSnippet, setMaxSnippet] = useState("0")
  const [maxVideoPreview, setMaxVideoPreview] = useState("0")
  const [maxImagePreview, setMaxImagePreview] = useState("large")

  // Opening & Closing Schedules
  const [schedules, setSchedules] = useState({
    Monday: [
      { opening: "12:00 AM", closing: "04:00 AM" },
      { opening: "06:00 AM", closing: "11:59 PM" },
    ],
    Tuesday: [
      { opening: "12:00 AM", closing: "05:00 AM" },
      { opening: "06:00 AM", closing: "11:59 PM" },
    ],
    Wednesday: [{ opening: "06:17 AM", closing: "11:30 PM" }],
    Thursday: [
      { opening: "12:00 AM", closing: "04:00 AM" },
      { opening: "05:00 AM", closing: "06:00 AM" },
      { opening: "08:00 AM", closing: "11:59 PM" },
    ],
    Friday: [{ opening: "12:00 AM", closing: "11:59 PM" }],
    Saturday: [{ opening: "12:01 AM", closing: "11:59 PM" }],
    Sunday: [{ opening: "12:01 AM", closing: "11:59 PM" }],
  })

  const handleAddCharacteristic = () => {
    if (newCharacteristic.trim() && !characteristics.includes(newCharacteristic.trim())) {
      setCharacteristics([...characteristics, newCharacteristic.trim()])
      setNewCharacteristic("")
    }
  }

  const handleRemoveCharacteristic = (char) => {
    setCharacteristics(characteristics.filter((c) => c !== char))
  }

  const handleAddTimeSlot = (day) => {
    setSchedules({
      ...schedules,
      [day]: [...schedules[day], { opening: "12:00 AM", closing: "11:59 PM" }],
    })
  }

  const handleRemoveTimeSlot = (day, index) => {
    setSchedules({
      ...schedules,
      [day]: schedules[day].filter((_, i) => i !== index),
    })
  }

  const handleTimeChange = (day, index, field, value) => {
    setSchedules({
      ...schedules,
      [day]: schedules[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMetaImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Setup</h1>
      </div>

      {/* Close Restaurant Temporarily Section */}
      <Card className="border-gray-200 shadow-sm bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Close Restaurant Temporarily
              </span>
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <Info className="h-3 w-3 text-gray-600" />
              </div>
            </div>
            <Switch
              checked={closeRestaurant}
              onCheckedChange={setCloseRestaurant}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* General Settings Section */}
      <Card className="border-gray-200 shadow-sm bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Menu className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Row 1 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Scheduled Delivery:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.scheduledDelivery}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, scheduledDelivery: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Home Delivery:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.homeDelivery}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, homeDelivery: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Takeaway:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.takeaway}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, takeaway: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Veg:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.veg}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, veg: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Non Veg:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.nonVeg}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, nonVeg: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Subscription Based Order:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.subscriptionBasedOrder}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, subscriptionBasedOrder: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Cutlery:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.cutlery}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, cutlery: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Instant Order:</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.instantOrder}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, instantOrder: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Halal Tag Status</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.halalTagStatus}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, halalTagStatus: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {/* Row 4 */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Extra Packaging Charge</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Switch
                checked={generalSettings.extraPackagingCharge}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, extraPackagingCharge: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Dine-In</span>
                <Info className="h-4 w-4 text-gray-300" />
              </div>
              <Switch
                checked={generalSettings.dineIn}
                onCheckedChange={(checked) =>
                  setGeneralSettings({ ...generalSettings, dineIn: checked })
                }
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Settings Section */}
      <Card className="border-gray-200 shadow-sm bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Menu className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Basic Settings</h2>
          </div>
          <div className="space-y-4">
            {/* Extra Packaging Charge */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Extra Packaging Charge
                </Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <RadioGroup
                value={extraPackagingChargeType}
                onValueChange={setExtraPackagingChargeType}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="optional" id="optional" />
                  <Label htmlFor="optional" className="text-sm text-gray-700">
                    Optional
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mandatory" id="mandatory" />
                  <Label htmlFor="mandatory" className="text-sm text-gray-700">
                    Mandatory
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Extra Packaging Charge Amount */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Extra Packaging Charge Amount
              </Label>
              <Input
                type="number"
                value={extraPackagingChargeAmount}
                onChange={(e) => setExtraPackagingChargeAmount(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {/* Minimum Order Amount */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Minimum Order Amount
                </Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                className="max-w-xs"
                placeholder="Enter minimum order amount"
              />
            </div>

            {/* Minimum Time For Dine-In Order */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Minimum Time For Dine-In Order
                </Label>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                value={minimumTimeForDineIn}
                onChange={(e) => setMinimumTimeForDineIn(e.target.value)}
                className="max-w-xs"
                placeholder="Enter minimum time"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Restaurant Characteristics Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Set Restaurant Characteristics
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the Restaurant Type that Best Represents Your Establishment.
          </p>
          <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg mb-4 min-h-12">
            {characteristics.map((char) => (
              <div
                key={char}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
              >
                <span>{char}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCharacteristic(char)}
                  className="hover:bg-blue-700 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <input
              type="text"
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddCharacteristic()
                }
              }}
              placeholder="Add characteristic..."
              className="flex-1 min-w-32 outline-none border-none bg-transparent"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCharacteristics([])}
              className="border-gray-200"
            >
              Reset
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Meta Data Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Restaurant Meta Data</h2>

          {/* Meta Title */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Meta Title
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={100}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {metaTitle.length}/100
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Meta Description
            </Label>
            <div className="relative">
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                className="pr-16 resize-y min-h-24"
              />
              <span className="absolute right-3 bottom-3 text-xs text-gray-500">
                {metaDescription.length}/160
              </span>
            </div>
          </div>

          {/* Restaurant Meta Image */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Restaurant meta image
            </Label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-lg bg-red-500 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {metaImage ? (
                  <img src={metaImage} alt="Meta" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white text-center p-2">
                    <div className="text-xs font-bold">Hungry</div>
                    <div className="text-xs font-bold">PUPPETS</div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-2">
                  Jpg, .png, .jpeg, .gif, .bmp, .tif size : Max 2 MB (1:1)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("meta-image-upload").click()}
                  className="border-gray-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  id="meta-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indexing and Preview Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Indexing Options */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <RadioGroup value={indexing} onValueChange={setIndexing}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="index" id="index" />
                  <Label htmlFor="index" className="text-sm text-gray-700 flex items-center gap-2">
                    Index
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-index" id="no-index" />
                  <Label
                    htmlFor="no-index"
                    className="text-sm text-gray-700 flex items-center gap-2"
                  >
                    No Index
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                </div>
              </RadioGroup>
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-follow"
                    checked={noFollow}
                    onCheckedChange={setNoFollow}
                  />
                  <Label htmlFor="no-follow" className="text-sm text-gray-700 flex items-center gap-2">
                    No Follow
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-archive"
                    checked={noArchive}
                    onCheckedChange={setNoArchive}
                  />
                  <Label htmlFor="no-archive" className="text-sm text-gray-700 flex items-center gap-2">
                    No Archive
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-image-index"
                    checked={noImageIndex}
                    onCheckedChange={setNoImageIndex}
                  />
                  <Label
                    htmlFor="no-image-index"
                    className="text-sm text-gray-700 flex items-center gap-2"
                  >
                    No Image Index
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no-snippet"
                    checked={noSnippet}
                    onCheckedChange={setNoSnippet}
                  />
                  <Label htmlFor="no-snippet" className="text-sm text-gray-700 flex items-center gap-2">
                    No Snippet
                    <Info className="h-4 w-4 text-gray-400" />
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Settings */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-sm font-medium text-gray-700">Max Snippet</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="max-snippet-check"
                    checked={maxSnippet !== "0"}
                    onCheckedChange={(checked) => setMaxSnippet(checked ? "1" : "0")}
                  />
                  <Input
                    type="number"
                    value={maxSnippet}
                    onChange={(e) => setMaxSnippet(e.target.value)}
                    className="max-w-24"
                    disabled={maxSnippet === "0"}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Max Video Preview
                </Label>
                <Input
                  type="number"
                  value={maxVideoPreview}
                  onChange={(e) => setMaxVideoPreview(e.target.value)}
                  className="max-w-24"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Max Image Preview
                </Label>
                <Select value={maxImagePreview} onValueChange={setMaxImagePreview}>
                  <SelectTrigger className="max-w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Changes Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Save Changes
        </Button>
      </div>

      {/* Restaurant Opening & Closing Schedules */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Restaurant Opening & Closing Schedules
            </h2>
          </div>
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-medium text-gray-700 min-w-20">{day} :</span>
                  {schedules[day].map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 mr-1">Opening Time</span>
                        <Input
                          type="text"
                          value={slot.opening}
                          onChange={(e) => handleTimeChange(day, index, "opening", e.target.value)}
                          className="w-24 h-8 text-sm border-none p-0"
                        />
                      </div>
                      <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 mr-1">Closing Time</span>
                        <Input
                          type="text"
                          value={slot.closing}
                          onChange={(e) => handleTimeChange(day, index, "closing", e.target.value)}
                          className="w-24 h-8 text-sm border-none p-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(day, index)}
                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddTimeSlot(day)}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

