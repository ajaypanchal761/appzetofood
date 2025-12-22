import { useState, useMemo } from "react"
import { Search, Plus, Edit, Trash2, ArrowUpDown, Download, ChevronDown, Settings, FileText, FileSpreadsheet, Code, Check, Columns } from "lucide-react"
import { vehiclesCategoryDummy } from "../data/vehiclesCategoryDummy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { exportVehiclesToCSV, exportVehiclesToExcel, exportVehiclesToPDF, exportVehiclesToJSON } from "../components/vehicles/vehiclesExportUtils"

export default function VehiclesCategorySetup() {
  const [searchQuery, setSearchQuery] = useState("")
  const [vehicles, setVehicles] = useState(vehiclesCategoryDummy)
  const [isAddEditOpen, setIsAddEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [formData, setFormData] = useState({
    type: "",
    startingCoverage: "",
    maximumCoverage: "",
    extraCharges: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    type: true,
    startingCoverage: true,
    maximumCoverage: true,
    extraCharges: true,
    status: true,
    actions: true,
  })

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) {
      return vehicles
    }
    
    const query = searchQuery.toLowerCase().trim()
    return vehicles.filter(vehicle =>
      vehicle.type.toLowerCase().includes(query)
    )
  }, [vehicles, searchQuery])

  const handleToggleStatus = (sl) => {
    setVehicles(vehicles.map(vehicle =>
      vehicle.sl === sl ? { ...vehicle, status: !vehicle.status } : vehicle
    ))
  }

  const handleAdd = () => {
    setSelectedVehicle(null)
    setFormData({ type: "", startingCoverage: "", maximumCoverage: "", extraCharges: "" })
    setFormErrors({})
    setIsAddEditOpen(true)
  }

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle)
    setFormData({
      type: vehicle.type,
      startingCoverage: vehicle.startingCoverage.toString(),
      maximumCoverage: vehicle.maximumCoverage.toString(),
      extraCharges: vehicle.extraCharges.toString(),
    })
    setFormErrors({})
    setIsAddEditOpen(true)
  }

  const handleDelete = (sl) => {
    const vehicle = vehicles.find(v => v.sl === sl)
    setSelectedVehicle(vehicle)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (selectedVehicle) {
      setVehicles(vehicles.filter(vehicle => vehicle.sl !== selectedVehicle.sl))
      setIsDeleteOpen(false)
      setSelectedVehicle(null)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.type.trim()) errors.type = "Type is required"
    if (!formData.startingCoverage || parseFloat(formData.startingCoverage) < 0) errors.startingCoverage = "Valid starting coverage is required"
    if (!formData.maximumCoverage || parseFloat(formData.maximumCoverage) < 0) errors.maximumCoverage = "Valid maximum coverage is required"
    if (parseFloat(formData.startingCoverage) >= parseFloat(formData.maximumCoverage)) {
      errors.maximumCoverage = "Maximum coverage must be greater than starting coverage"
    }
    if (!formData.extraCharges || parseFloat(formData.extraCharges) < 0) errors.extraCharges = "Valid extra charges is required"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    
    if (selectedVehicle) {
      setVehicles(vehicles.map(vehicle =>
        vehicle.sl === selectedVehicle.sl
          ? {
              ...vehicle,
              type: formData.type,
              startingCoverage: parseInt(formData.startingCoverage),
              maximumCoverage: parseInt(formData.maximumCoverage),
              extraCharges: parseFloat(formData.extraCharges),
            }
          : vehicle
      ))
    } else {
      const newSl = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.sl)) + 1 : 1
      setVehicles([...vehicles, {
        sl: newSl,
        type: formData.type,
        startingCoverage: parseInt(formData.startingCoverage),
        maximumCoverage: parseInt(formData.maximumCoverage),
        extraCharges: parseFloat(formData.extraCharges),
        status: true,
      }])
    }
    setIsAddEditOpen(false)
    setFormData({ type: "", startingCoverage: "", maximumCoverage: "", extraCharges: "" })
    setSelectedVehicle(null)
  }

  const handleExport = (format) => {
    if (filteredVehicles.length === 0) {
      alert("No data to export")
      return
    }
    switch (format) {
      case "csv": exportVehiclesToCSV(filteredVehicles); break
      case "excel": exportVehiclesToExcel(filteredVehicles); break
      case "pdf": exportVehiclesToPDF(filteredVehicles); break
      case "json": exportVehiclesToJSON(filteredVehicles); break
    }
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      type: true,
      startingCoverage: true,
      maximumCoverage: true,
      extraCharges: true,
      status: true,
      actions: true,
    })
  }

  const columnsConfig = {
    si: "Serial Number",
    type: "Type",
    startingCoverage: "Starting Coverage",
    maximumCoverage: "Maximum Coverage",
    extraCharges: "Extra Charges",
    status: "Status",
    actions: "Actions",
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Vehicles Category List</h1>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredVehicles.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleAdd}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle Category
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
                placeholder="Ex: Search by type."
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
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>SI</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.type && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Type</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.startingCoverage && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Starting Coverage Area (Km)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.maximumCoverage && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Maximum Coverage Area (Km)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.extraCharges && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Extra Charges ($)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Status</span>
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
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(v => v).length} className="px-6 py-8 text-center text-slate-500">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.sl} className="hover:bg-slate-50 transition-colors">
                      {visibleColumns.si && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">{vehicle.sl}</span>
                        </td>
                      )}
                      {visibleColumns.type && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">{vehicle.type}</span>
                        </td>
                      )}
                      {visibleColumns.startingCoverage && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{vehicle.startingCoverage.toLocaleString()}</span>
                        </td>
                      )}
                      {visibleColumns.maximumCoverage && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{vehicle.maximumCoverage.toLocaleString()}</span>
                        </td>
                      )}
                      {visibleColumns.extraCharges && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900">$ {vehicle.extraCharges.toFixed(2)}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(vehicle.sl)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              vehicle.status ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                vehicle.status ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(vehicle)}
                              className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.sl)}
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
            <DialogTitle>{selectedVehicle ? "Edit Vehicle Category" : "Add Vehicle Category"}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.type ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., Car, Motorcycle"
              />
              {formErrors.type && <p className="text-xs text-red-500 mt-1">{formErrors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Starting Coverage (Km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.startingCoverage}
                onChange={(e) => setFormData({ ...formData, startingCoverage: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.startingCoverage ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., 1"
              />
              {formErrors.startingCoverage && <p className="text-xs text-red-500 mt-1">{formErrors.startingCoverage}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Maximum Coverage (Km) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maximumCoverage}
                onChange={(e) => setFormData({ ...formData, maximumCoverage: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.maximumCoverage ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., 4000"
              />
              {formErrors.maximumCoverage && <p className="text-xs text-red-500 mt-1">{formErrors.maximumCoverage}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Extra Charges ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.extraCharges}
                onChange={(e) => setFormData({ ...formData, extraCharges: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  formErrors.extraCharges ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., 20.00"
              />
              {formErrors.extraCharges && <p className="text-xs text-red-500 mt-1">{formErrors.extraCharges}</p>}
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
              {selectedVehicle ? "Update" : "Add"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Delete Vehicle Category</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete "{selectedVehicle?.type}"? This action cannot be undone.
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
