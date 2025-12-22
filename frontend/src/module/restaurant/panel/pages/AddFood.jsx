import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Sparkles,
  Upload,
  Info,
  Clock,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/Footer"

export default function AddFood() {
  const [selectedLanguage, setSelectedLanguage] = useState("default")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)

  const languages = [
    { value: "default", label: "Default" },
    { value: "en", label: "English(EN)" },
    { value: "bn", label: "Bengali - বাংলা(BN)" },
    { value: "ar", label: "Arabic - العربية (AR)" },
    { value: "es", label: "Spanish - español(ES)" },
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(URL.createObjectURL(file))
    }
  }

  const handleGenerate = (type) => {
    // Placeholder for AI generation functionality
    console.log(`Generate ${type} for language: ${selectedLanguage}`)
    // TODO: Implement AI generation logic
  }

  const handleReset = () => {
    setName("")
    setDescription("")
    setSelectedImage(null)
    setSelectedLanguage("default")
    // Reset any other form fields if needed
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validate required fields
    if (!name.trim()) {
      alert("Please enter a food name")
      return
    }
    if (!description.trim()) {
      alert("Please enter a description")
      return
    }
    // TODO: Implement form submission logic
    console.log("Form submitted:", { name, description, selectedLanguage, selectedImage })
    alert("Food item submitted successfully!")
  }

  const handleAddVariation = () => {
    // TODO: Implement add variation logic
    console.log("Add new variation clicked")
    // This could open a modal or navigate to a variation form
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-600 flex items-center justify-center shadow-md">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Food</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create a new food item for your restaurant</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Add New Food */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 flex items-center">
            <CardTitle className="text-lg font-semibold text-gray-800">Add New Food</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Language Tabs */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Language</Label>
              <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <TabsList className="inline-flex w-full h-10 bg-gray-100 rounded-lg p-1 gap-1">
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
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Name ({languages.find((l) => l.value === selectedLanguage)?.label.split("(")[0]}){" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="New food"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 pr-24 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate("name")}
                  className="absolute top-0 right-0 h-10 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-blue-200 px-4 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Generate
                </Button>
              </div>
            </div>

            {/* Short Description Field */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Short Description ({languages.find((l) => l.value === selectedLanguage)?.label.split("(")[0]}){" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  placeholder="Enter short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[140px] pr-20 pb-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  maxLength={600}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded">
                  {description.length}/600
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate("description")}
                  className="absolute top-3 right-3 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-blue-200 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Food Image */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100 flex items-center">
            <CardTitle className="text-lg font-semibold text-gray-800">Food Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-primary-orange hover:bg-orange-50/30 transition-all duration-300 cursor-pointer group">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/jpg,image/png,image/jpeg,image/gif"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Uploaded"
                        className="w-full h-64 object-cover rounded-xl mx-auto shadow-md"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300"></div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedImage(null)
                      }}
                      className="bg-white hover:bg-gray-50"
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-700 group-hover:text-primary-orange transition-colors">
                        Upload Image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Click or drag and drop</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Image Requirements */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Image Requirements:</p>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>Image format - jpg png jpeg gif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>Image Size - maximum size 2 MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>Image Ratio - 1:1</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants & Category Info */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 flex items-center">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Restaurants & Category Info
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate("restaurant-category")}
              className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-blue-200 shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* First Row - Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pizza">Pizza</SelectItem>
                  <SelectItem value="burger">Burger</SelectItem>
                  <SelectItem value="pasta">Pasta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                Sub Category
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select Sub Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Food Type <span className="text-red-500">*</span>
              </Label>
              <Select>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select Preferences" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row - Nutrition and Allergen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                Nutrition
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Label>
              <Input
                placeholder="Type your content and, press enter"
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                Allergen Ingredients
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Label>
              <Input
                placeholder="Type your content and, press enter"
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Is It Halal Checkbox */}
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox id="halal" className="h-5 w-5 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
            <Label htmlFor="halal" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Is It Halal
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Addon Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 flex items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Addon</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              Select Add-On
              <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </Label>
            <Input
              placeholder="Select add-ons"
              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 flex items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Availability</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Available Time Starts <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="time"
                  placeholder="--:-- --"
                  className="w-full h-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Available Time Ends <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="time"
                  placeholder="--:-- --"
                  className="w-full h-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Tags Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 flex items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">Search Tags</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Input
            placeholder="Enter tags"
            className="w-full h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </CardContent>
      </Card>

      {/* Price Information Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 flex items-center">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-lg font-semibold text-gray-800">Price Information</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate("price")}
              className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-blue-200 shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Unit Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                defaultValue="0"
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Discount Type</Label>
              <Select defaultValue="percent">
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="amount">Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                Discount <span className="text-red-500">*</span>
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Label>
              <Input
                type="number"
                placeholder="0"
                defaultValue="0"
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                Maximum Purchase Quantity Limit
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Label>
              <Input
                placeholder="Ex: 10"
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Stock Type</Label>
              <Select defaultValue="unlimited">
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited Stock</SelectItem>
                  <SelectItem value="limited">Limited Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Variations Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 flex items-center">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-lg font-semibold text-gray-800">Food Variations</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddVariation}
                className="text-primary-orange hover:text-primary-orange/80 hover:bg-orange-50 font-semibold"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add new variation +
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerate("variations")}
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-blue-200 shadow-sm"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Generate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium">No variations added yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add new variation +" to add variations</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pb-6 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 h-11 px-6 font-semibold shadow-sm"
        >
          Reset
        </Button>
        <Button 
          type="button"
          onClick={handleSubmit}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11 px-8 font-semibold shadow-lg"
        >
          Submit
        </Button>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}
