import { useNavigate } from "react-router-dom"
import { ArrowLeft, AlertTriangle, ThumbsUp } from "lucide-react"

export default function Notifications() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-gray-200">
        <button
          onClick={() => navigate("/restaurant")}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">Notifications</h1>
      </div>

      <div className="flex-1 px-4 pt-4 pb-28 space-y-3">
        {/* FSSAI notification */}
        <button
          type="button"
          onClick={() => navigate("/restaurant/fssai")}
          className="w-full text-left rounded-0 bg-white border-b border-gray-200  px-4 py-3 flex gap-3 items-start"
        >
          <div className="mt-1 h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              FSSAI license is expiring on 29th Dec 2025
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Submit now to continue receiving orders
            </p>
            <span className="mt-1 inline-block text-sm font-medium text-blue-600">
              Submit
            </span>
          </div>
        </button>

        {/* Feedback notification */}
        <button
          type="button"
          onClick={() => navigate("/restaurant/share-feedback")}
          className="w-full text-left rounded-0 bg-white border-b border-gray-200  px-4 py-3 flex gap-3 items-start"
        >
          <div className="mt-1 h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center">
            <ThumbsUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              We value your feedback
            </p>
            <p className="text-xs text-gray-600 mt-1">How can we improve?</p>
            <span className="mt-1 inline-block text-sm font-medium text-blue-600">
              Tell us
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
