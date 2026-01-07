import { useState, useEffect, useMemo } from "react"
import { Search, Settings, ArrowUpDown, Download, ChevronDown, FileText, FileSpreadsheet, Code, Check, Columns, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"

export default function EarningAddonHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [creditNotes, setCreditNotes] = useState("")
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    deliveryman: true,
    offerTitle: true,
    ordersCompleted: true,
    earningAmount: true,
    date: true,
    status: true,
    actions: true,
  })

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const response = await adminAPI.getEarningAddonHistory()
      if (response.data.success) {
        setHistory(response.data.data.history || [])
      }
    } catch (error) {
      console.error("Error fetching earning addon history:", error)
      toast.error("Failed to fetch earning addon history")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return history
    }
    
    const query = searchQuery.toLowerCase().trim()
    return history.filter(item =>
      item.deliveryman?.toLowerCase().includes(query) ||
      item.deliveryId?.toLowerCase().includes(query) ||
      item.offerTitle?.toLowerCase().includes(query)
    )
  }, [history, searchQuery])

  const handleCredit = async () => {
    if (!selectedHistory) return

    try {
      await adminAPI.creditEarningToWallet(selectedHistory._id, creditNotes)
      toast.success("Earning credited to wallet successfully")
      setIsCreditDialogOpen(false)
      setSelectedHistory(null)
      setCreditNotes("")
      fetchHistory()
    } catch (error) {
      console.error("Error crediting earning:", error)
      toast.error(error.response?.data?.message || "Failed to credit earning")
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this earning?")) {
      return
    }

    try {
      await adminAPI.cancelEarningAddonHistory(id, "Cancelled by admin")
      toast.success("Earning cancelled successfully")
      fetchHistory()
    } catch (error) {
      console.error("Error cancelling earning:", error)
      toast.error(error.response?.data?.message || "Failed to cancel earning")
    }
  }

  const handleOpenCreditDialog = (item) => {
    setSelectedHistory(item)
    setCreditNotes("")
    setIsCreditDialogOpen(true)
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      deliveryman: true,
      offerTitle: true,
      ordersCompleted: true,
      earningAmount: true,
      date: true,
      status: true,
      actions: true,
    })
  }

  const columnsConfig = {
    si: "Serial Number",
    deliveryman: "Deliveryman",
    offerTitle: "Offer Title",
    ordersCompleted: "Orders Completed",
    earningAmount: "Earning Amount",
    date: "Date",
    status: "Status",
    actions: "Actions",
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-blue-100", text: "text-blue-700", label: "Pending", icon: Clock },
      credited: { bg: "bg-green-100", text: "text-green-700", label: "Credited", icon: CheckCircle },
      failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed", icon: XCircle },
      cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "Cancelled", icon: XCircle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  const handleExport = (format) => {
    if (filteredHistory.length === 0) {
      toast.error("No data to export")
      return
    }
    // Export functionality can be added here
    toast.info(`Export as ${format.toUpperCase()} - Feature coming soon`)
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Earning Addon History</h1>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredHistory.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[250px]">
                <input
                  type="text"
                  placeholder="Ex: search delivery man or offer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all">
                    <Download className="w-4 h-4" />
                    <span className="text-black font-bold">Export</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")} className="cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer">
                    <Code className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Loading...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {visibleColumns.si && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>SI</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.deliveryman && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Deliveryman</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.offerTitle && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Offer Title</span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.ordersCompleted && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Orders</span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.earningAmount && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Earning Amount</span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.date && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Date</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                        </div>
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>Status</span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        No earning addon history found.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                        {visibleColumns.si && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-700">{item.sl}</span>
                          </td>
                        )}
                        {visibleColumns.deliveryman && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                              {item.deliveryman}
                            </a>
                            {item.deliveryId && (
                              <p className="text-xs text-slate-500">ID: {item.deliveryId}</p>
                            )}
                          </td>
                        )}
                        {visibleColumns.offerTitle && (
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">{item.offerTitle}</span>
                          </td>
                        )}
                        {visibleColumns.ordersCompleted && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-900">
                              {item.ordersCompleted} / {item.ordersRequired}
                            </span>
                          </td>
                        )}
                        {visibleColumns.earningAmount && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm font-medium text-slate-900">₹{item.totalEarning?.toFixed(2) || item.earningAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.date && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{item.date}</span>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(item.status)}
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => handleOpenCreditDialog(item)}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                                  title="Credit to Wallet"
                                >
                                  Credit
                                </button>
                              )}
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => handleCancel(item._id)}
                                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                  title="Cancel"
                                >
                                  <XCircle className="w-4 h-4 text-red-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Credit Dialog */}
      <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Credit Earning to Wallet</DialogTitle>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Deliveryman: <span className="font-semibold text-slate-900">{selectedHistory.deliveryman}</span></p>
                <p className="text-sm text-slate-600 mt-1">Offer: <span className="font-semibold text-slate-900">{selectedHistory.offerTitle}</span></p>
                <p className="text-sm text-slate-600 mt-1">Amount: <span className="font-semibold text-emerald-600">₹{selectedHistory.totalEarning?.toFixed(2) || selectedHistory.earningAmount?.toFixed(2) || '0.00'}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Add any notes about this credit..."
                />
              </div>
              <DialogFooter>
                <button
                  onClick={() => {
                    setIsCreditDialogOpen(false)
                    setSelectedHistory(null)
                    setCreditNotes("")
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCredit}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Credit to Wallet
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Table Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Columns className="w-4 h-4" />
                Visible Columns
              </h3>
              <div className="space-y-2">
                {Object.entries(columnsConfig).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[key]}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                    {visibleColumns[key] && (
                      <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={resetColumns}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Apply
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

