import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { ArrowLeft, Info, Users, HandCoins, ChevronDown, Edit, Calendar, X, Check } from "lucide-react"
import BottomNavOrders from "../components/BottomNavOrders"

const discountTypeTitles = {
  percentage: "Create percentage discount",
  flat: "Create flat discount",
}

const flatDiscountAmounts = ["100", "150", "200", "250", "300"]

export default function CreatePercentageDiscount() {
  const navigate = useNavigate()
  const location = useLocation()
  const { goalId, discountType } = useParams()
  const savedState = location.state || {}
  
  // Step 1: Customer target
  const [customerGroup, setCustomerGroup] = useState(savedState.customerGroup || "all")
  const [offerPreference, setOfferPreference] = useState(savedState.offerPreference || "all")
  
  // Step 2: Discount selection
  const [discountPercentage, setDiscountPercentage] = useState(savedState.discountPercentage || "60")
  const [maxLimit, setMaxLimit] = useState(savedState.maxLimit || "120")
  const [minOrderValue, setMinOrderValue] = useState(savedState.minOrderValue || "none")
  
  // Step 3: Offer timings
  const [offerDays, setOfferDays] = useState(savedState.offerDays || "all")
  const [startDate, setStartDate] = useState(savedState.startDate || "18 Dec 2025")

  const pageTitle = discountTypeTitles[discountType] || "Create discount"

  const [infoModal, setInfoModal] = useState({ open: false, type: null })
  const [discountModal, setDiscountModal] = useState({ open: false, type: null }) // 'percentage' or 'maxLimit'
  const [searchQuery, setSearchQuery] = useState("")

  const openInfo = (type) => {
    setInfoModal({ open: true, type })
  }

  const closeInfo = () => {
    setInfoModal({ open: false, type: null })
  }

  const openDiscountModal = (type) => {
    setDiscountModal({ open: true, type })
    setSearchQuery("")
  }

  const closeDiscountModal = () => {
    setDiscountModal({ open: false, type: null })
    setSearchQuery("")
  }

  const handleDiscountSelect = (value) => {
    if (discountModal.type === "percentage") {
      setDiscountPercentage(value)
    } else if (discountModal.type === "maxLimit") {
      setMaxLimit(value)
    }
    closeDiscountModal()
  }

  const getDiscountOptions = () => {
    if (discountModal.type === "percentage") {
      return ["60", "50", "40", "30", "20", "10"]
    } else if (discountModal.type === "maxLimit") {
      if (discountType === "percentage") {
        return ["120", "150", "180", "200"]
      } else {
        return flatDiscountAmounts
      }
    }
    return []
  }

  const getFilteredOptions = () => {
    const options = getDiscountOptions()
    if (!searchQuery.trim()) return options
    return options.filter(opt => opt.includes(searchQuery))
  }

  const getCurrentSelectedValue = () => {
    if (discountModal.type === "percentage") {
      return discountPercentage
    } else if (discountModal.type === "maxLimit") {
      return maxLimit
    }
    return ""
  }

  const getInfoModalContent = () => {
    switch (infoModal.type) {
      case "customerGroup":
        return {
          title: "Choose customer group",
          body: (
            <div className="space-y-4 text-sm text-gray-800">
              <p>
                Decide which set of customers this offer should be visible to, based on their
                relationship with your restaurant.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">All customers</h3>
                <p>Customers who have ordered from you before as well as new customers.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">New customers</h3>
                <p>Customers who haven&apos;t ordered from your restaurant in the last 90 days.</p>
              </div>
            </div>
          ),
        }
      case "offerPreference":
        return {
          title: "Choose offer preference type",
          body: (
            <div className="space-y-4 text-sm text-gray-800">
              <p>
                You have the flexibility to select the offer affinity type of customers based on
                their inclination toward offers.
              </p>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">All type</h3>
                <p>Customers who have any level of affinity towards offers.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Offer sensitive</h3>
                <p>Customers who are highly likely to order only from restaurants that offer discounts.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Premium</h3>
                <p>
                  Customers who prioritize quality over discounts, but offers can still influence
                  their decision.
                </p>
              </div>
            </div>
          ),
        }
      case "discountValue":
        return {
          title: "Choose discount value",
          body: (
            <div className="space-y-4 text-sm text-gray-800">
              <p>
                Select the discount structure that best matches your business goals while keeping
                profitability in mind.
              </p>
              <p>
                Higher discounts can help you drive more orders, while moderate discounts are better
                suited for sustainable growth.
              </p>
            </div>
          ),
        }
      case "minOrder":
        return {
          title: "Select minimum order value",
          body: (
            <div className="space-y-4 text-sm text-gray-800">
              <p>
                Set a minimum cart value to ensure that the orders you receive with this offer
                remain profitable for your restaurant.
              </p>
              <p>
                A higher minimum order value can help increase your average order value, while a
                lower value makes the offer more accessible.
              </p>
            </div>
          ),
        }
      case "timings":
        return {
          title: "Offer timings",
          body: (
            <div className="space-y-4 text-sm text-gray-800">
              <p>
                Choose the days and start date for this offer to control when it is visible to
                customers.
              </p>
              <p>
                You can align offer timings with your peak hours, slow days, or special occasions to
                maximise impact.
              </p>
            </div>
          ),
        }
      default:
        return {
          title: "More information",
          body: (
            <p className="text-sm text-gray-800">
              Get additional context about this setting to help you configure the offer in the best
              possible way.
            </p>
          ),
        }
    }
  }

  // Check if all form fields are filled
  const isFormValid = () => {
    return (
      customerGroup &&
      offerPreference &&
      discountPercentage &&
      maxLimit &&
      minOrderValue !== undefined &&
      offerDays &&
      startDate
    )
  }

  const handlePreview = () => {
    // Navigate to preview page
    navigate(`/restaurant/hub-growth/create-offers/${goalId}/${discountType}/preview`, {
      state: {
        customerGroup,
        offerPreference,
        discountPercentage,
        maxLimit,
        minOrderValue,
        offerDays,
        startDate,
        discountType,
        goalId,
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/restaurant/hub-growth/create-offers/${goalId}`)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{pageTitle}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Step 1: Customer target */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 tracking-wider">Customer target</p>
                  <p className="text-xs text-gray-500 tracking-wider">(STEP 1/3)</p>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
            <div className="space-y-4">
              {/* Choose customer group */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Choose customer group</h3>
                  </div>
                  <button
                    onClick={() => openInfo("customerGroup")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">All customers</span>
                    </div>
                    <input
                      type="radio"
                      name="customerGroup"
                      value="all"
                      checked={customerGroup === "all"}
                      onChange={(e) => setCustomerGroup(e.target.value)}
                      className="mt-1 w-5 h-5 text-black border-gray-400 focus:ring-black"
                      style={{ accentColor: "#000000" }}
                    />
                  </label>
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">New customers</span>
                      <p className="text-xs text-gray-500 mt-1">Customers who haven't ordered in the last 90 days</p>
                    </div>
                    <input
                      type="radio"
                      name="customerGroup"
                      value="new"
                      checked={customerGroup === "new"}
                      onChange={(e) => setCustomerGroup(e.target.value)}
                      className="mt-1 w-5 h-5 text-black border-gray-400 focus:ring-black"
                      style={{ accentColor: "#000000" }}
                    />
                  </label>
                </div>
              </div>

              {/* Choose offer preference type */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <HandCoins className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Choose offer preference type</h3>
                  </div>
                  <button
                    onClick={() => openInfo("offerPreference")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">All type</span>
                    </div>
                    <input
                      type="radio"
                      name="offerPreference"
                      value="all"
                      checked={offerPreference === "all"}
                      onChange={(e) => setOfferPreference(e.target.value)}
                      className="mt-1 w-5 h-5 text-black border-gray-400 focus:ring-black"
                      style={{ accentColor: "#000000" }}
                    />
                  </label>
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Offer sensitive</span>
                      <p className="text-xs text-gray-500 mt-1">Customers highly attracted towards offers</p>
                    </div>
                    <input
                      type="radio"
                      name="offerPreference"
                      value="sensitive"
                      checked={offerPreference === "sensitive"}
                      onChange={(e) => setOfferPreference(e.target.value)}
                      className="mt-1 w-5 h-5 text-black border-gray-400 focus:ring-black"
                      style={{ accentColor: "#000000" }}
                    />
                  </label>
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Premium</span>
                      <p className="text-xs text-gray-500 mt-1">Customers less attracted towards offers</p>
                    </div>
                    <input
                      type="radio"
                      name="offerPreference"
                      value="premium"
                      checked={offerPreference === "premium"}
                      onChange={(e) => setOfferPreference(e.target.value)}
                      className="mt-1 w-5 h-5 text-black border-gray-400 focus:ring-black"
                      style={{ accentColor: "#000000" }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Discount selection */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 tracking-wider">Discount selection</p>
                  <p className="text-xs text-gray-500 tracking-wider">(STEP 2/3)</p>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
            <div className="space-y-4">
              {/* Choose discount value */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {discountType === "percentage" ? (
                        <span className="text-lg font-bold text-blue-600">%</span>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">₹</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Choose discount value</h3>
                  </div>
                  <button
                    onClick={() => openInfo("discountValue")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {discountType === "percentage" ? (
                  <>
                    {/* Discount percentage */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Discount percentage</h4>
                      <button
                        onClick={() => openDiscountModal("percentage")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span>{discountPercentage}%</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-200 my-4" />

                    {/* Max limit for discount */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Max limit for discount</h4>
                      <button
                        onClick={() => openDiscountModal("maxLimit")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span>₹{maxLimit}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* Flat discount amount */
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Flat discount amount</h4>
                    <button
                      onClick={() => openDiscountModal("maxLimit")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span>₹{maxLimit}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Select minimum order value */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Select minimum order value</h3>
                  </div>
                  <button
                    onClick={() => openInfo("minOrder")}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 appearance-none bg-white"
                  >
                    <option value="none">None</option>
                    <option value="100">₹100</option>
                    <option value="150">₹150</option>
                    <option value="200">₹200</option>
                    <option value="250">₹250</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
                <p className="text-sm text-green-800">
                  To achieve your goal, we recommend you a minimum order value of ₹159
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Offer timings */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 tracking-wider">Offer timings</p>
                  <p className="text-xs text-gray-500 tracking-wider">(STEP 3/3)</p>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
            <div>
              {/* Select offer days & start date */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Select offer days & start date</h3>
                  </div>
                    <button
                      onClick={() => openInfo("timings")}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                    <Info className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Offer days selection */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    {[
                      { id: "all", label: "All days" },
                      { id: "mon-thu", label: "Mon - Thu" },
                      { id: "fri-sun", label: "Fri - Sun" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setOfferDays(option.id)}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          offerDays === option.id
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-900 border border-gray-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Offer start date */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Offer start date</h4>
                  <div className="relative">
                    <input
                      type="text"
                      value={startDate}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You can Stop this offer anytime on the Track Offers page
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <button
          onClick={handlePreview}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
            isFormValid()
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-900 hover:bg-gray-400"
          }`}
        >
          Preview offer
        </button>
      </div>

      {/* Info Bottom Sheet */}
      <AnimatePresence>
        {infoModal.open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeInfo}
              className="fixed inset-0 bg-black/50 z-[9999]"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[9999] max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const content = getInfoModalContent()
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 rounded-t-2xl">
                      <h2 className="text-lg font-bold text-gray-900 tracking-wide">
                        {content.title}
                      </h2>
                      <button
                        onClick={closeInfo}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      {content.body}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-4 border-t border-gray-200">
                      <button
                        onClick={closeInfo}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                      >
                        Okay
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Discount Selection Bottom Sheet */}
      <AnimatePresence>
        {discountModal.open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDiscountModal}
              className="fixed inset-0 bg-black/50 z-[9999]"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[9999] max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 text-center">
                  {discountModal.type === "percentage" ? "Select discount percentage" : discountType === "percentage" ? "Select max limit" : "Select flat discount amount"}
                </h2>
              </div>

              {/* Search Bar */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={discountModal.type === "percentage" ? "Search percentage..." : "Search amount..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* List of Options */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {getFilteredOptions().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No options found</div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredOptions().map((option) => {
                      const isSelected = getCurrentSelectedValue() === option
                      return (
                        <div
                          key={option}
                          onClick={() => handleDiscountSelect(option)}
                          className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {discountModal.type === "percentage" ? `${option}%` : `₹${option}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDiscountSelect(option)
                              }}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-black border-black"
                                  : "bg-white border-gray-400"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-gray-200">
                <button
                  onClick={closeDiscountModal}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                    getCurrentSelectedValue()
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!getCurrentSelectedValue()}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNavOrders />
    </div>
  )
}
