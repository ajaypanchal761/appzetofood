import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Grid3x3, ChevronRight, ArrowLeft, Wand2, Menu, Info } from "lucide-react"
import BottomNavOrders from "../components/BottomNavOrders"
import offersAndDiscountsIcon from "@/assets/hub/icons/offersanddiscounts.png"
import createAdsIcon from "@/assets/hub/icons/createads.png"

export default function HubGrowth() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("create-offers")
  const [showToast, setShowToast] = useState(false)

  const handleCreateAdsClick = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Grow your business</h1>
          <button
            onClick={() => navigate("/restaurant/explore")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Build your own section */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Build your own</h2>
          
          <div className="space-y-3">
            {/* Offers and discounts card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/restaurant/hub-growth/create-offers")}
              className="bg-white rounded-lg p-4 flex items-center gap-4  border border-gray-200 cursor-pointer "
            >
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img src={offersAndDiscountsIcon} alt="Offers and discounts" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">Offers and discounts</h3>
                <p className="text-sm text-gray-600">Start your own offers and grow your business</p>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600 shrink-0" />
            </motion.div>

            {/* Create Ads card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAdsClick}
              className="bg-white rounded-lg p-4 flex items-center gap-4  border border-gray-200 cursor-pointer "
            >
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img src={createAdsIcon} alt="Create Ads" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">Create Ads</h3>
                <p className="text-sm text-gray-600">Get seen by more customers on Zomato app and get more orders</p>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600 shrink-0" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md"
          >
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-sm font-medium flex-1">Ads functionality will be available soon</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavOrders />
    </div>
  )
}
