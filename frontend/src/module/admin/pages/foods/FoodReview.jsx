import { useState, useMemo } from "react"
import { Search, Download, ChevronDown, ArrowUpDown, Star } from "lucide-react"
import { foodReviewsDummy } from "../../data/foodReviewsDummy"
import foodImage1 from "@/assets/download.jpg"
import foodImage2 from "@/assets/download (1).jpg"
import foodImage3 from "@/assets/download (3).jpg"
import foodImage4 from "@/assets/download (4).jpg"
import foodImage5 from "@/assets/download (5).jpg"
import foodImage6 from "@/assets/images.jpg"

const foodImages = {
  "100159": foodImage1,
  "100113": foodImage2,
  "100082": foodImage3,
  "100080": foodImage2,
  "100032": foodImage5,
  "100008": foodImage2,
  "100001": foodImage6,
}

export default function FoodReview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [reviews, setReviews] = useState(foodReviewsDummy)

  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) {
      return reviews
    }
    
    const query = searchQuery.toLowerCase().trim()
    return reviews.filter(review =>
      review.foodName.toLowerCase().includes(query) ||
      review.customerName.toLowerCase().includes(query) ||
      review.orderId.includes(query) ||
      review.review.toLowerCase().includes(query)
    )
  }, [reviews, searchQuery])

  const handleToggleStatus = (sl) => {
    setReviews(reviews.map(review =>
      review.sl === sl ? { ...review, isActive: !review.isActive } : review
    ))
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Food Reviews</h1>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
              {filteredReviews.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <input
                type="text"
                placeholder="Ex: search item name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>SI</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Food</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Customer</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Review</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Restaurant Reply</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <p className="text-lg font-semibold text-slate-700 mb-1">No Data Found</p>
                    <p className="text-sm text-slate-500">No reviews match your search</p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr
                    key={review.sl}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700">{review.sl}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={foodImages[review.foodId] || foodImage1}
                            alt={review.foodName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = foodImage1
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{review.foodName}</span>
                          <span className="text-xs text-slate-500">Order ID: {review.orderId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{review.customerName}</span>
                        {review.customerPhone && (
                          <span className="text-xs text-slate-500">{review.customerPhone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-slate-900">{review.rating}★</span>
                        </div>
                        <span className="text-sm text-slate-700">{review.review}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{review.date}</span>
                        <span className="text-xs text-slate-500">{review.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{review.restaurantReply}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(review.sl)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          review.isActive ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            review.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
