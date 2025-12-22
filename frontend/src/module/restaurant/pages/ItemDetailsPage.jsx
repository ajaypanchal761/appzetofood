import { useState, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Trash2, 
  Check, 
  ChevronDown,
  Edit as EditIcon,
  Plus,
  X,
  Camera,
  ThumbsUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { getAllFoods, saveFood } from "../utils/foodManagement"

export default function ItemDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const isNewItem = id === "new"
  const groupId = location.state?.groupId
  const defaultCategory = location.state?.category || "Varieties"
  const itemData = isNewItem ? null : (location.state?.item || getAllFoods().find(f => f.id === parseInt(id)))
  const fileInputRef = useRef(null)

  const [itemName, setItemName] = useState(itemData?.name || "")
  const [category, setCategory] = useState(itemData?.category || "Varieties")
  const [subCategory, setSubCategory] = useState("Starters")
  const [servesInfo, setServesInfo] = useState("")
  const [itemSizeQuantity, setItemSizeQuantity] = useState("")
  const [itemSizeUnit, setItemSizeUnit] = useState("piece")
  const [itemDescription, setItemDescription] = useState("")
  const [foodType, setFoodType] = useState(itemData?.foodType === "Veg" ? "Veg" : "Non-Veg")
  const [basePrice, setBasePrice] = useState(itemData?.price?.toString() || "159.0")
  const [gst, setGst] = useState("5.0")
  const [isRecommended, setIsRecommended] = useState(itemData?.isRecommended || false)
  const [isInStock, setIsInStock] = useState(itemData?.isAvailable !== false)
  const [weightPerServing, setWeightPerServing] = useState("")
  const [calorieCount, setCalorieCount] = useState("")
  const [proteinCount, setProteinCount] = useState("")
  const [carbohydrates, setCarbohydrates] = useState("")
  const [fatCount, setFatCount] = useState("")
  const [fibreCount, setFibreCount] = useState("")
  const [allergens, setAllergens] = useState("")
  const [showMoreNutrition, setShowMoreNutrition] = useState(false)
  const [selectedTags, setSelectedTags] = useState(itemData?.tags || [])
  const [disclaimerChecked, setDisclaimerChecked] = useState(false)
  const [images, setImages] = useState(itemData?.image ? [itemData.image] : [])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [direction, setDirection] = useState(0)
  const carouselRef = useRef(null)
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false)
  const [isServesPopupOpen, setIsServesPopupOpen] = useState(false)
  const [isItemSizePopupOpen, setIsItemSizePopupOpen] = useState(false)
  const [isGstPopupOpen, setIsGstPopupOpen] = useState(false)
  const [isTagsPopupOpen, setIsTagsPopupOpen] = useState(false)

  const maxNameLength = 70
  const maxDescriptionLength = 100
  const descriptionLength = 50
  const minDescriptionLength =  5
  const nameLength = itemName.length

  // Category options
  const categories = [
    { id: "starters", name: "Starters", subCategories: ["Starters", "Appetizers", "Snacks"] },
    { id: "main-course", name: "Main Course", subCategories: ["Main Course", "Curries", "Biryani"] },
    { id: "desserts", name: "Desserts", subCategories: ["Desserts", "Ice Cream", "Sweets"] },
    { id: "beverages", name: "Beverages", subCategories: ["Beverages", "Juices", "Soft Drinks"] },
    { id: "varieties", name: "Varieties", subCategories: ["Varieties", "Combo", "Special"] },
  ]

  // Serves info options
  const servesOptions = [
    "Serves eg. 1-2 people",
    "Serves eg. 2-3 people",
    "Serves eg. 3-4 people",
    "Serves eg. 4-5 people",
    "Serves eg. 5-6 people",
  ]

  // Item size unit options
  const itemSizeUnits = [
    "slices",
    "kg",
    "litre",
    "ml",
    "serves",
    "cms",
    "piece"
  ]

  // Item tags organized by categories
  const itemTagsCategories = [
    {
      category: "Speciality",
      tags: ["Freshly Frosted", "Pre Frosted", "Chef's Special"]
    },
    {
      category: "Spice Level",
      tags: ["Medium Spicy", "Very Spicy"]
    },
    {
      category: "Miscellaneous",
      tags: ["Gluten Free", "Sugar Free", "Jain"]
    },
    {
      category: "Dietary Restrictions",
      tags: ["Vegan"]
    }
  ]

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => URL.createObjectURL(file))
    setImages([...images, ...newImages])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1)
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0)
    }
  }

  // Swipe handlers
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && images.length > 0) {
      setDirection(1)
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
    if (isRightSwipe && images.length > 0) {
      setDirection(-1)
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setDirection(-1)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleCategorySelect = (catId, subCat) => {
    const selectedCategory = categories.find(c => c.id === catId)
    setCategory(selectedCategory.name)
    setSubCategory(subCat)
    setIsCategoryPopupOpen(false)
  }

  const handleServesSelect = (option) => {
    setServesInfo(option)
    setIsServesPopupOpen(false)
  }

  const handleItemSizeUnitSelect = (unit) => {
    setItemSizeUnit(unit)
    setIsItemSizePopupOpen(false)
  }

  const handleGstSelect = (gstValue) => {
    setGst(gstValue)
    setIsGstPopupOpen(false)
  }

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSave = () => {
    if (!disclaimerChecked) return
    if (!itemName.trim()) {
      alert("Please enter an item name")
      return
    }

    // Prepare food data
    const foodData = {
      id: itemData?.id || undefined, // Let saveFood assign ID for new items
      name: itemName.trim(),
      category: category,
      price: parseFloat(basePrice) || 0,
      image: images.length > 0 ? images[0] : "",
      foodType: foodType,
      description: itemDescription,
      isAvailable: isInStock,
      isRecommended: isRecommended,
      availabilityTimeStart: "12:01 AM",
      availabilityTimeEnd: "11:57 PM",
      discountType: "Percent",
      discountAmount: 0.0,
      discount: null,
      originalPrice: null,
      rating: itemData?.rating || 0.0,
      reviews: itemData?.reviews || 0,
      stock: "Unlimited",
      variations: [],
      tags: selectedTags,
      nutrition: [
        ...(weightPerServing ? [{ name: "Weight per serving", value: weightPerServing, unit: "grams" }] : []),
        ...(calorieCount ? [{ name: "Calorie count", value: calorieCount, unit: "Kcal" }] : []),
        ...(proteinCount ? [{ name: "Protein count", value: proteinCount, unit: "mg" }] : []),
        ...(carbohydrates ? [{ name: "Carbohydrates", value: carbohydrates, unit: "mg" }] : []),
        ...(fatCount ? [{ name: "Fat count", value: fatCount, unit: "mg" }] : []),
        ...(fibreCount ? [{ name: "Fibre count", value: fibreCount, unit: "mg" }] : []),
      ],
      allergies: allergens ? allergens.split(",").map(a => a.trim()) : [],
      nameArabic: "",
    }

    // Save food using the utility function
    const savedFood = saveFood(foodData)
    
    if (savedFood) {
      // Navigate back to HubMenu
      navigate("/restaurant/hub-menu")
      // Trigger a page refresh by dispatching event
      window.dispatchEvent(new CustomEvent('foodsChanged'))
    } else {
      alert("Error saving item. Please try again.")
    }
  }

  const handleDelete = () => {
    // Delete logic here
    console.log("Deleting item:", id)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      <style>{`
        [data-slot="switch"][data-state="checked"] {
          background-color: #16a34a !important;
        }
        [data-slot="switch-thumb"][data-state="checked"] {
          background-color: #ffffff !important;
        }
      `}</style>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Item details</h1>
        </div>
      </div>


      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Carousel */}
        <div className="relative bg-white">
          {images.length > 0 ? (
            <div className="relative w-full h-80 overflow-hidden bg-gray-100">
              {/* Image container with swipe support */}
              <div
                ref={carouselRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="relative w-full h-full"
              >
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentImageIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={`${itemName} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-900" />
                    </button>
                  </>
                )}

                {/* Delete image button */}
                <button
                  onClick={() => handleImageDelete(currentImageIndex)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
                >
                  <Trash2 className="w-5 h-5 text-gray-900" />
                </button>

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
                    <span className="text-white text-xs font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Carousel dots */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 bg-white">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentImageIndex ? 1 : -1)
                        setCurrentImageIndex(index)
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentImageIndex
                          ? "w-8 h-2 bg-gray-900"
                          : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">No images added yet</p>
                <p className="text-xs text-gray-500 mt-1">Tap the button below to add images</p>
              </div>
            </div>
          )}

          {/* Add image button - redesigned */}
          <div className="px-4 py-4 bg-white border-t border-gray-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl text-sm font-semibold cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span>Add Image</span>
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-4 space-y-3">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Category (sub-category)
            </label>
            <button
              onClick={() => setIsCategoryPopupOpen(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {category} ({subCategory})
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Item name
            </label>
            <div className="relative">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                maxLength={maxNameLength}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item name"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100">
                <EditIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-gray-500">
                {nameLength} / {maxNameLength}
              </span>
            </div>
          </div>

          {/* Serves Info */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Serves info, select no. of people
            </label>
            <button
              onClick={() => setIsServesPopupOpen(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {servesInfo || "Serves eg. 1-2 people"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Number of adults who can be served with 1 item
            </p>
          </div>

          {/* Item Size */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Item size
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={itemSizeQuantity}
                onChange={(e) => setItemSizeQuantity(e.target.value)}
                placeholder="Eg. 4"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setIsItemSizePopupOpen(true)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors min-w-[100px]"
              >
                <span className="text-sm text-gray-900">{itemSizeUnit}</span>
                <ChevronDown className="w-5 h-5 text-gray-500 ml-2" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Size of the item e.g. Paneer Tikka, 8 pieces.
            </p>
          </div>

          {/* Item Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Item description
            </label>
            <div className="relative">
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                maxLength={maxDescriptionLength}
                rows={4}
                placeholder="Eg: Yummy veg paneer burger with a soft patty, veggies, cheese, and special sauce"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100">
                <EditIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${descriptionLength < minDescriptionLength ? "text-red-500" : "text-gray-500"}`}>
                {descriptionLength < minDescriptionLength ? "Min 5 characters required" : ""}
              </span>
              <span className="text-xs text-gray-500">
                {descriptionLength} / {maxDescriptionLength}
              </span>
            </div>
            {/* Dietary Options */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setFoodType("Veg")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  foodType === "Veg"
                    ? "border-green-600 border-2 text-green-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {foodType === "Veg" && <Check className="w-4 h-4" />}
                <span>Veg</span>
              </button>
              <button
                onClick={() => setFoodType("Non-Veg")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  foodType === "Non-Veg"
                    ? "border-red-600 border-2 text-red-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {foodType === "Non-Veg" && <Check className="w-4 h-4" />}
                <span>Non-Veg</span>
              </button>
              <button
                onClick={() => setFoodType("Egg")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  foodType === "Egg"
                    ? "border-yellow-600 border-2 text-yellow-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {foodType === "Egg" && <Check className="w-4 h-4" />}
                <span>Egg</span>
              </button>
            </div>
          </div>

          {/* Item Price */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Item price
            </label>
            <div className="space-y-3">
              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1">Base price</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`₹ ${basePrice}`}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100">
                    <EditIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              {/* <div>
                <label className="block text-xs text-gray-600 mb-1">GST</label>
                <button
                  onClick={() => setIsGstPopupOpen(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-900">GST {gst}%</span>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>
              </div> */}
            </div>
            
          </div>

          {/* Recommend and In Stock */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <button
              onClick={() => setIsRecommended(!isRecommended)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isRecommended
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Recommend</span>
            </button>
            <div className="flex items-center gap-2">
              <Switch
                checked={isInStock}
                onCheckedChange={setIsInStock}
                className="data-[state=unchecked]:bg-gray-300"
              />
              <span className="text-sm text-gray-700">In stock</span>
            </div>
          </div>

          {/* Nutritional info per serving */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Nutritional info per serving</h3>
            <p className="text-xs text-gray-500 mb-4">Per serving is corresponding to 1 adult</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Weight per serving</label>
                <div className="relative">
                  <input
                    type="text"
                    value={weightPerServing}
                    onChange={(e) => setWeightPerServing(e.target.value)}
                    placeholder="Eg. 500"
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">grams</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Calorie count</label>
                <div className="relative">
                  <input
                    type="text"
                    value={calorieCount}
                    onChange={(e) => setCalorieCount(e.target.value)}
                    placeholder="Eg. 300"
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">Kcal</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Protein count</label>
                <div className="relative">
                  <input
                    type="text"
                    value={proteinCount}
                    onChange={(e) => setProteinCount(e.target.value)}
                    placeholder="Eg. 50"
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">mg</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Carbohydrates</label>
                <div className="relative">
                  <input
                    type="text"
                    value={carbohydrates}
                    onChange={(e) => setCarbohydrates(e.target.value)}
                    placeholder="Eg. 100"
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">mg</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Fat count</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fatCount}
                    onChange={(e) => setFatCount(e.target.value)}
                    placeholder="Eg. 300"
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">mg</span>
                </div>
              </div>
              
              {showMoreNutrition && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Fibre count</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fibreCount}
                        onChange={(e) => setFibreCount(e.target.value)}
                        placeholder="Eg. 10"
                        className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">mg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Allergens</label>
                    <input
                      type="text"
                      value={allergens}
                      onChange={(e) => setAllergens(e.target.value)}
                      placeholder="Eg. Milk"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <button
                onClick={() => setShowMoreNutrition(!showMoreNutrition)}
                className="w-full py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
              >
                {showMoreNutrition ? "View less" : "View more"}
              </button>
            </div>

            {/* Calculation Tips */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Calculation Tips:</h4>
              <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                <li>Calories (kcal) is generally equal to 4 x Protein (in g) + 4 x Carbs (in g) + 9 x Fats (in g)</li>
                <li>Partial information would not be shown to the customer</li>
              </ol>
            </div>
          </div>

          {/* Select item tags */}
          <div className="mb-12">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select item tags
            </label>
            <button
              onClick={() => setIsTagsPopupOpen(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {selectedTags.length > 0 ? selectedTags.join(", ") : "Select tags"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Selection Popup */}
      <AnimatePresence>
        {isCategoryPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Select category</h2>
                <button
                  onClick={() => setIsCategoryPopupOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">{cat.name}</h3>
                      <div className="space-y-2">
                        {cat.subCategories.map((subCat) => (
                          <button
                            key={subCat}
                            onClick={() => handleCategorySelect(cat.id, subCat)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                              category === cat.name && subCategory === subCat
                                ? "bg-gray-900 text-white"
                                : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Serves Info Popup */}
      <AnimatePresence>
        {isServesPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServesPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Select serves info</h2>
                <button
                  onClick={() => setIsServesPopupOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  {servesOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleServesSelect(option)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        servesInfo === option
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Item Size Unit Popup */}
      <AnimatePresence>
        {isItemSizePopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsItemSizePopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Select unit</h2>
                <button
                  onClick={() => setIsItemSizePopupOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  {itemSizeUnits.map((unit) => (
                    <button
                      key={unit}
                      onClick={() => handleItemSizeUnitSelect(unit)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        itemSizeUnit === unit
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* GST Popup */}
      {/* <AnimatePresence>
        {isGstPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGstPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[60vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Select GST</h2>
                <button
                  onClick={() => setIsGstPopupOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  {gstOptions.map((gstValue) => (
                    <button
                      key={gstValue}
                      onClick={() => handleGstSelect(gstValue)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        gst === gstValue
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {gstValue}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence> */}

      {/* Tags Popup */}
      <AnimatePresence>
        {isTagsPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTagsPopupOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Select item tags</h2>
                <button
                  onClick={() => setIsTagsPopupOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-6">
                  {itemTagsCategories.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-bold text-gray-900 mb-3">
                        {category.category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {category.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                              selectedTags.includes(tag)
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-900 border-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 py-4 border-t border-gray-200">
                <button
                  onClick={() => setIsTagsPopupOpen(false)}
                  className={`w-full py-3 px-4  ${selectedTags.length > 0 ? 'bg-black' : 'bg-gray-500 cursor-not-allowed' } text-white rounded-xl text-sm font-semibold hover:bg-gray-500 transition-colors`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Sticky Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200  z-40">
        
      {/* Disclaimer Checkbox */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={disclaimerChecked}
            onChange={(e) => setDisclaimerChecked(e.target.checked)}
            className="mt-1 w-5 h-5 text-black border-gray-400 focus:ring-black rounded"
            style={{ accentColor: "#000000" }}
          />
          <span className="text-sm text-gray-800">
            I am authorized to make menu edits & responsible for the information shared including item details & prices
          </span>
        </label>
      </div>
        <div className={`flex gap-3 px-4 py-4 ${isNewItem ? 'justify-end' : ''}`}>
          {!isNewItem && (
            <button
              onClick={handleDelete}
              className="flex-1 py-3 px-4 border border-black rounded-lg text-sm font-semibold text-black bg-white hover:bg-gray-50 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!disclaimerChecked}
            className={`${isNewItem ? 'w-full' : 'flex-1'} py-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
              disclaimerChecked
                ? "bg-black text-white hover:bg-black"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
