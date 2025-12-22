import { useState, useMemo } from "react"
import { Search, Download, ChevronDown, Eye, Settings, Building, ArrowUpDown, FileText, FileSpreadsheet, Code, Check, Columns } from "lucide-react"
import { restaurantWithdrawsDummy } from "../../data/restaurantWithdrawsDummy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { exportTransactionsToCSV, exportTransactionsToExcel, exportTransactionsToPDF, exportTransactionsToJSON } from "../../components/transactions/transactionsExportUtils"

export default function RestaurantWithdraws() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [withdraws, setWithdraws] = useState(restaurantWithdrawsDummy)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedWithdraw, setSelectedWithdraw] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    amount: true,
    restaurant: true,
    requestTime: true,
    status: true,
    actions: true,
  })

  const filteredWithdraws = useMemo(() => {
    let result = [...withdraws]
    
    if (filterStatus !== "all") {
      result = result.filter(w => w.status.toLowerCase() === filterStatus.toLowerCase())
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(w =>
        w.restaurant?.toLowerCase().includes(query) ||
        w.amount?.toString().includes(query)
      )
    }
    
    return result
  }, [withdraws, searchQuery, filterStatus])

  const getStatusBadge = (status) => {
    if (status === "Approved") {
      return "bg-green-100 text-green-700"
    }
    if (status === "Pending") {
      return "bg-blue-100 text-blue-700"
    }
    return "bg-slate-100 text-slate-700"
  }

  const handleViewWithdraw = (withdraw) => {
    setSelectedWithdraw(withdraw)
    setIsViewOpen(true)
  }

  const handleExport = (format) => {
    if (filteredWithdraws.length === 0) {
      alert("No data to export.")
      return
    }
    const headers = [
      { key: "sl", label: "SI" },
      { key: "amount", label: "Amount" },
      { key: "restaurant", label: "Restaurant" },
      { key: "requestTime", label: "Request Time" },
      { key: "status", label: "Status" },
    ]
    switch (format) {
      case "csv": exportTransactionsToCSV(filteredWithdraws, headers, "restaurant_withdraws"); break
      case "excel": exportTransactionsToExcel(filteredWithdraws, headers, "restaurant_withdraws"); break
      case "pdf": exportTransactionsToPDF(filteredWithdraws, headers, "restaurant_withdraws", "Restaurant Withdraws Report"); break
      case "json": exportTransactionsToJSON(filteredWithdraws, "restaurant_withdraws"); break
      default: break
    }
  }

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      amount: true,
      restaurant: true,
      requestTime: true,
      status: true,
      actions: true,
    })
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Restaurant Withdraw Transaction</h1>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-6 right-6 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Withdraw Request Table</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredWithdraws.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <input
                  type="text"
                  placeholder="Ex: search by Restaurant name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" /> CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")} className="cursor-pointer flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer flex items-center gap-2">
                    <Code className="w-4 h-4" /> PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer flex items-center gap-2">
                    <Code className="w-4 h-4" /> JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {visibleColumns.si && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>SI</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  </th>}
                  {visibleColumns.amount && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Amount</th>}
                  {visibleColumns.restaurant && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Restaurant</th>}
                  {visibleColumns.requestTime && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Request Time</th>}
                  {visibleColumns.status && <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Status</th>}
                  {visibleColumns.actions && <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">Action</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredWithdraws.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Building className="w-16 h-16 text-slate-400 mb-4" />
                        <p className="text-lg font-semibold text-slate-700">No Data Found</p>
                        <p className="text-sm text-slate-500">No withdraw requests match your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWithdraws.map((withdraw) => (
                    <tr key={withdraw.sl} className="hover:bg-slate-50 transition-colors">
                      {visibleColumns.si && <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700">{withdraw.sl}</span>
                      </td>}
                      {visibleColumns.amount && <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700">
                          $ {typeof withdraw.amount === 'number' ? withdraw.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) : withdraw.amount}
                        </span>
                      </td>}
                      {visibleColumns.restaurant && <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700">{withdraw.restaurant}</span>
                      </td>}
                      {visibleColumns.requestTime && <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700">{withdraw.requestTime}</span>
                      </td>}
                      {visibleColumns.status && <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(withdraw.status)}`}>
                          {withdraw.status}
                        </span>
                      </td>}
                      {visibleColumns.actions && <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewWithdraw(withdraw)}
                          className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-orange-600" />
                        </button>
                      </td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Withdraw Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Withdraw Request Details</DialogTitle>
            </DialogHeader>
            {selectedWithdraw && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Amount</label>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    $ {typeof selectedWithdraw.amount === 'number' ? selectedWithdraw.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) : selectedWithdraw.amount}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Restaurant</label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedWithdraw.restaurant}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Request Time</label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedWithdraw.requestTime}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedWithdraw.status)}`}>
                      {selectedWithdraw.status}
                    </span>
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="px-6 pb-6">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Table Settings
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Toggle Columns</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(visibleColumns).map(([key, isVisible]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`toggle-${key}`}
                        checked={isVisible}
                        onChange={() => toggleColumn(key)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`toggle-${key}`} className="ml-2 text-sm text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 pb-6 flex justify-between">
              <button
                onClick={resetColumns}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                Reset Columns
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md"
              >
                Apply
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
