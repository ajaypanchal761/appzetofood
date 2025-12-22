import { useNavigate } from "react-router-dom"
import { ArrowLeft, HelpCircle, FileText, MessageSquare } from "lucide-react"

export default function HelpCenter() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Help center</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Search Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Find answers</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Search for frequently asked questions or browse topics below
          </p>
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Common Topics */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common topics</h3>
          <div className="space-y-3">
            {[
              { icon: FileText, title: "Getting started", description: "Learn how to use the app" },
              { icon: MessageSquare, title: "Account & Profile", description: "Manage your account settings" },
              { icon: HelpCircle, title: "Orders & Delivery", description: "Questions about orders" },
              { icon: FileText, title: "Payments", description: "Payment and earnings information" },
            ].map((topic, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <topic.icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Raise Ticket Button */}
        <button
          onClick={() => navigate("/delivery/help/tickets")}
          className="w-full bg-black text-white font-semibold py-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Raise a ticket
        </button>
      </div>
    </div>
  )
}

