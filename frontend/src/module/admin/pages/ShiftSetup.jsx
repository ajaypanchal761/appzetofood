import { useState, useMemo } from "react"
import { Search, Plus, Edit, Trash2, Calendar, Settings, Download, ChevronDown, FileText, FileSpreadsheet, Code, Check, Columns } from "lucide-react"
import { shiftsDummy } from "../data/shiftsDummy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { exportShiftsToCSV, exportShiftsToExcel, exportShiftsToPDF, exportShiftsToJSON } from "../components/shifts/shiftsExportUtils"

export default function ShiftSetup() {
  const [searchQuery, setSearchQuery] = useState("")
  const [shifts, setShifts] = useState(shiftsDummy)
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    name: true,
    startTime: true,
    endTime: true,
    status: true,
    actions: true,
  })

  const filteredShifts = useMemo(() => {
    if (!searchQuery.trim()) {
      return shifts
    }
    
    const query = searchQuery.toLowerCase().trim()
    return shifts.filter(shift =>
      shift.name.toLowerCase().includes(query)
    )
  }, [shifts, searchQuery])

  const handleToggleStatus = (sl) => {
    setShifts(shifts.map(shift =>
      shift.sl === sl ? { ...shift, status: !shift.status } : shift
    ))
  }

  const handleAdd = () => {
    setSelectedShift(null)
    setFormData({ name: "", startTime: "", endTime: "" })
    setFormErrors({})
    setIsAddEditOpen(true)
  }

  const handleEdit = (shift) => {
    setSelectedShift(shift)
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    })
    setFormErrors({})
    setIsAddEditOpen(true)
  }

  const handleDelete = (sl) => {
    const shift = shifts.find(s => s.sl === sl)
    setSelectedShift(shift)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (selectedShift) {
      setShifts(shifts.filter(shift => shift.sl !== selectedShift.sl))
      setIsDeleteOpen(false)
      setSelectedShift(null)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = "Name is required"
    if (!formData.startTime.trim()) errors.startTime = "Start time is required"
    if (!formData.endTime.trim()) errors.endTime = "End time is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    
    if (selectedShift) {
      setShifts(shifts.map(shift =>
        shift.sl === selectedShift.sl
          ? {
              ...shift,
              name: formData.name,
              startTime: formData.startTime,
              endTime: formData.endTime,
            }
          : shift
      ))
    } else {
      const newSl = shifts.length > 0 ? Math.max(...shifts.map(s => s.sl)) + 1 : 1
      setShifts([...shifts, {
        sl: newSl,
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: true,
      }])
    }
    setIsAddEditOpen(false)
    setFormData({ name: "", startTime: "", endTime: "" })
    setSelectedShift(null)
  }

  const handleExport = (format) => {
    if (filteredShifts.length === 0) {
      alert("No data to export")
      return
    }
    switch (format) {
      case "csv": exportShiftsToCSV(filteredShifts); break
      case "excel": exportShiftsToExcel(filteredShifts); break
      case "pdf": exportShiftsToPDF(filteredShifts); break
      case "json": exportShiftsToJSON(filteredShifts); break
    }
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
      actions: true,
    })
  }

  const columnsConfig = {
    si: "Serial Number",
    name: "Name",
    startTime: "Start Time",
    endTime: "End Time",
    status: "Status",
    actions: "Actions",
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Shift Setup</h1>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                  {filteredShifts.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleAdd}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Shift
              </button>
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

          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial min-w-[250px]">
              <input
                type="text"
                placeholder="Ex: Search by name."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {visibleColumns.si && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">SI</th>
                  )}
                  {visibleColumns.name && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Name</th>
                  )}
                  {visibleColumns.startTime && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Start Time</th>
                  )}
                  {visibleColumns.endTime && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">End Time</th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(v => v).length} className="px-6 py-8 text-center text-slate-500">
                      No shifts found
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((shift) => (
                    <tr key={shift.sl} className="hover:bg-slate-50 transition-colors">
                      {visibleColumns.si && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">{shift.sl}</span>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900">{shift.name}</span>
                        </td>
                      )}
                      {visibleColumns.startTime && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{shift.startTime}</span>
                        </td>
                      )}
                      {visibleColumns.endTime && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{shift.endTime}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(shift.sl)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              shift.status ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                shift.status ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(shift)}
                              className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(shift.sl)}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{selectedShift ? "Edit Shift" : "Add Shift"}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.name ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., Morning, Day, Evening"
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.startTime ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., 04:00 am"
              />
              {formErrors.startTime && <p className="text-xs text-red-500 mt-1">{formErrors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.endTime ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., 11:59 am"
              />
              {formErrors.endTime && <p className="text-xs text-red-500 mt-1">{formErrors.endTime}</p>}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <button
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
            >
              {selectedShift ? "Update" : "Add"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Delete Shift</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete "{selectedShift?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="px-6 pb-6">
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
