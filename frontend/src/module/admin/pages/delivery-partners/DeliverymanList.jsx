import { useState, useMemo } from "react"
import { Search, Download, ChevronDown, Edit, Trash2, User, Star, ArrowUpDown, Settings, FileText, FileSpreadsheet, Code, Check, Columns } from "lucide-react"
import { deliverymanListDummy } from "../../data/deliverymanListDummy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { exportDeliverymenToCSV, exportDeliverymenToExcel, exportDeliverymenToPDF, exportDeliverymenToJSON } from "../../components/deliveryman/deliverymanExportUtils"

export default function DeliverymanList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [deliverymen, setDeliverymen] = useState(deliverymanListDummy)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    name: true,
    contact: true,
    zone: true,
    totalOrders: true,
    availabilityStatus: true,
    actions: true,
  })

  const filteredDeliverymen = useMemo(() => {
    if (!searchQuery.trim()) {
      return deliverymen
    }
    
    const query = searchQuery.toLowerCase().trim()
    return deliverymen.filter(dm =>
      dm.name.toLowerCase().includes(query) ||
      dm.phone.toLowerCase().includes(query) ||
      dm.zone.toLowerCase().includes(query)
    )
  }, [deliverymen, searchQuery])

  const handleDelete = (sl) => {
    const dm = deliverymen.find(d => d.sl === sl)
    setSelectedDeliveryman(dm)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (selectedDeliveryman) {
      setDeliverymen(deliverymen.filter(dm => dm.sl !== selectedDeliveryman.sl))
      setIsDeleteOpen(false)
      setSelectedDeliveryman(null)
    }
  }

  const handleExport = (format) => {
    if (filteredDeliverymen.length === 0) {
      alert("No data to export")
      return
    }
    switch (format) {
      case "csv": exportDeliverymenToCSV(filteredDeliverymen); break
      case "excel": exportDeliverymenToExcel(filteredDeliverymen); break
      case "pdf": exportDeliverymenToPDF(filteredDeliverymen); break
      case "json": exportDeliverymenToJSON(filteredDeliverymen); break
    }
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      name: true,
      contact: true,
      zone: true,
      totalOrders: true,
      availabilityStatus: true,
      actions: true,
    })
  }

  const columnsConfig = {
    si: "Serial Number",
    name: "Name",
    contact: "Contact",
    zone: "Zone",
    totalOrders: "Total Orders",
    availabilityStatus: "Availability Status",
    actions: "Actions",
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-600" />
              <h1 className="text-2xl font-bold text-slate-900">Deliveryman List</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search by name or restaur..."
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
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
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

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Deliveryman</span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredDeliverymen.length}
              </span>
            </div>
          </div>

          {/* Table */}
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
                  {visibleColumns.name && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.contact && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Contact</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.zone && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Zone</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.totalOrders && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Total Orders</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.availabilityStatus && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Availability Status</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredDeliverymen.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(v => v).length} className="px-6 py-8 text-center text-slate-500">
                      No deliverymen found
                    </td>
                  </tr>
                ) : (
                  filteredDeliverymen.map((dm) => (
                    <tr key={dm.sl} className="hover:bg-slate-50 transition-colors">
                      {visibleColumns.si && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">{dm.sl}</span>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">👤</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">{dm.name}</span>
                              {dm.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-slate-600">{dm.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.contact && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{dm.phone}</span>
                        </td>
                      )}
                      {visibleColumns.zone && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{dm.zone}</span>
                        </td>
                      )}
                      {visibleColumns.totalOrders && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{dm.totalOrders}</span>
                        </td>
                      )}
                      {visibleColumns.availabilityStatus && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-600">Currenty Assigned Orders: {dm.assignedOrders}</span>
                            <span className="text-xs">
                              Active Status: <span className="text-blue-600 underline">{dm.status}</span>
                            </span>
                          </div>
                        </td>
                      )}
                    {visibleColumns.actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dm.sl)}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Delete Deliveryman</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete "{selectedDeliveryman?.name}"? This action cannot be undone.
            </p>
          </div>
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-md"
            >
              Delete
            </button>
          </div>
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
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                Reset
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md"
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
