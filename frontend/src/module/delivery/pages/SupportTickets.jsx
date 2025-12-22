import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle } from "lucide-react"

export default function SupportTickets() {
  const navigate = useNavigate()
  
  // Sample tickets data
  const [tickets] = useState([
    {
      id: 1,
      subject: "Payment issue",
      description: "Payment not received for order #12345",
      status: "open",
      date: "2024-01-15",
      priority: "high"
    },
    {
      id: 2,
      subject: "Account verification",
      description: "Need help with account verification",
      status: "resolved",
      date: "2024-01-10",
      priority: "medium"
    },
    {
      id: 3,
      subject: "App bug report",
      description: "App crashes when viewing orders",
      status: "closed",
      date: "2024-01-05",
      priority: "low"
    }
  ])

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <Clock className="w-5 h-5 text-orange-500" />
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "closed":
        return <XCircle className="w-5 h-5 text-gray-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-700"
      case "resolved":
        return "bg-green-100 text-green-700"
      case "closed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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
          <h1 className="text-xl font-bold text-gray-900">Support tickets</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {/* Create New Ticket Button */}
        <button
          onClick={() => {
            // Navigate to create ticket page or show form
            alert("Create ticket functionality")
          }}
          className="w-full bg-black text-white font-semibold py-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create new ticket
        </button>

        {/* Tickets List */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(ticket.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">{ticket.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

