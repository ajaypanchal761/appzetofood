import { useState } from "react"
import { Plus, Sparkles, Building2, Info, Tag, DollarSign, UtensilsCrossed, Calendar, Clock, Upload, X } from "lucide-react"

export default function AddFood() {
  const [activeLanguage, setActiveLanguage] = useState("default")
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    restaurant: "",
    category: "",
    subCategory: "",
    foodType: "",
    nutrition: "",
    allergenIngredients: "",
    isHalal: false,
    addon: "",
    searchTags: "",
    unitPrice: "0",
    discountType: "Percent (%)",
    discount: "0",
    maxPurchaseQuantity: "",
    stockType: "Unlimited Stock",
    availableTimeStart: "",
    availableTimeEnd: "",
  })

  const languageTabs = [
    { key: "default", label: "Default" },
    { key: "en", label: "English(EN)" },
    { key: "bn", label: "Bengali - বাংলা(BN)" },
    { key: "ar", label: "Arabic - العربية (AR)" },
    { key: "es", label: "Spanish - español(ES)" },
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    alert("Food item added successfully!")
  }

  const handleReset = () => {
    setFormData({
      name: "",
      shortDescription: "",
      restaurant: "",
      category: "",
      subCategory: "",
      foodType: "",
      nutrition: "",
      allergenIngredients: "",
      isHalal: false,
      addon: "",
      searchTags: "",
      unitPrice: "0",
      discountType: "Percent (%)",
      discount: "0",
      maxPurchaseQuantity: "",
      stockType: "Unlimited Stock",
      availableTimeStart: "",
      availableTimeEnd: "",
    })
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Food</h1>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            {languageTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveLanguage(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLanguage === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name and Description Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Name ({activeLanguage === "default" ? "Default" : languageTabs.find(t => t.key === activeLanguage)?.label}) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="New food"
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Short Description ({activeLanguage === "default" ? "Default" : languageTabs.find(t => t.key === activeLanguage)?.label}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                      placeholder="Enter description"
                      rows={6}
                      maxLength={600}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                      {formData.shortDescription.length}/600
                    </div>
                    <button
                      type="button"
                      className="absolute top-2 right-2 px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Food Image */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Food Image
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">Upload Image</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Image format - jpg png jpeg gif</p>
                    <p>Image Size - maximum size 2 MB</p>
                    <p>Image Ratio - 1:1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurants & Category Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Restaurants & Category Info</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Restaurant <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.restaurant}
                  onChange={(e) => handleInputChange("restaurant", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Restaurant</option>
                  <option value="cafe-monarch">Café Monarch</option>
                  <option value="hungry-puppets">Hungry Puppets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Category</option>
                  <option value="burger">Burger</option>
                  <option value="pizza">Pizza</option>
                  <option value="pasta">Pasta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sub Category
                </label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => handleInputChange("subCategory", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Sub Category</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Food Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.foodType}
                  onChange={(e) => handleInputChange("foodType", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Preferences</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  Nutrition
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <input
                  type="text"
                  value={formData.nutrition}
                  onChange={(e) => handleInputChange("nutrition", e.target.value)}
                  placeholder="Type your content and press enter"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  Allegren Ingredients
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <input
                  type="text"
                  value={formData.allergenIngredients}
                  onChange={(e) => handleInputChange("allergenIngredients", e.target.value)}
                  placeholder="Type your content and press enter"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHalal"
                  checked={formData.isHalal}
                  onChange={(e) => handleInputChange("isHalal", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isHalal" className="ml-2 text-sm font-semibold text-slate-700">
                  Is It Halal
                </label>
              </div>
            </div>
          </div>

          {/* Addon */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Addon</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                Select Add-On
                <Info className="w-4 h-4 text-slate-400" />
              </label>
              <select
                value={formData.addon}
                onChange={(e) => handleInputChange("addon", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-4"
              >
                <option value="">Select Add-On</option>
              </select>
              <textarea
                value={formData.addon}
                onChange={(e) => handleInputChange("addon", e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              />
            </div>
          </div>

          {/* Search Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Search Tags</h2>
            </div>

            <div>
              <input
                type="text"
                value={formData.searchTags}
                onChange={(e) => handleInputChange("searchTags", e.target.value)}
                placeholder="Enter tags"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Price Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Unit Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleInputChange("discountType", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="Percent (%)">Percent (%)</option>
                  <option value="Amount ($)">Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  Discount <span className="text-red-500">*</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleInputChange("discount", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  Maximum Purchase Quantity Limit
                  <Info className="w-4 h-4 text-slate-400" />
                </label>
                <input
                  type="number"
                  value={formData.maxPurchaseQuantity}
                  onChange={(e) => handleInputChange("maxPurchaseQuantity", e.target.value)}
                  placeholder="Ex: 10"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Stock Type
                </label>
                <select
                  value={formData.stockType}
                  onChange={(e) => handleInputChange("stockType", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="Unlimited Stock">Unlimited Stock</option>
                  <option value="Limited Stock">Limited Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Food Variations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Food Variations</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add new variation +
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Available Time Starts <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.availableTimeStart}
                    onChange={(e) => handleInputChange("availableTimeStart", e.target.value)}
                    placeholder="--:--"
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Available Time Ends <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.availableTimeEnd}
                    onChange={(e) => handleInputChange("availableTimeEnd", e.target.value)}
                    placeholder="--:--"
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mb-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
            >
              Submit
            </button>
          </div>
        </form>

        {/* Floating AI Button */}
        <button
          type="button"
          className="fixed bottom-8 right-8 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 z-50"
          title="Use AI"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">Use AI</span>
        </button>
      </div>
    </div>
  )
}
