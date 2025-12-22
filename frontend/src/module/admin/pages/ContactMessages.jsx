import { useState, useMemo } from "react"
import { Search, ArrowUpDown, Settings, Folder, ChevronDown } from "lucide-react"
import { contactMessagesDummy } from "../data/contactMessagesDummy"

export default function ContactMessages() {
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState(contactMessagesDummy)

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) {
      return messages
    }
    
    const query = searchQuery.toLowerCase().trim()
    return messages.filter(message =>
      message.name.toLowerCase().includes(query) ||
      message.email.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Message List</h1>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
              {filteredMessages.length}
            </span>
          </div>

          <div className="relative flex-1 sm:flex-initial min-w-[250px]">
            <input
              type="text"
              placeholder="Ex: Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                    <ChevronDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Email</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Message</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <span>Action</span>
                    <Settings className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative mb-6">
                        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
                          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md relative overflow-visible">
                            <Folder className="w-12 h-12 text-slate-400" />
                            {/* Orange tab on folder (top) */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-orange-500 rounded-t-md z-10"></div>
                            {/* Orange exclamation mark inside folder */}
                            <div className="absolute top-3 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center z-10">
                              <span className="text-white text-xs font-bold">!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-slate-700">No Data Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr
                    key={message.sl}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700">{message.sl}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{message.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{message.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{message.message}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        message.status === "unread"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {message.status === "unread" ? "Unread" : "Read"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="p-1.5 rounded text-slate-600 hover:bg-slate-100 transition-colors">
                        <Settings className="w-4 h-4" />
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
