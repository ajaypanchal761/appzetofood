import { useState, useMemo, useRef, useEffect } from "react"
import { Search, Download, Plus, MapPin, Edit, Trash2, FileSpreadsheet, FileDown, ChevronDown, FileText, Code, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MOCK_CUISINES = [
  {
    id: 8,
    sl: 1,
    name: "Sea Food",
    totalRestaurants: 1,
    status: true, // On
  },
  {
    id: 7,
    sl: 2,
    name: "Spanish",
    totalRestaurants: 1,
    status: true, // On
  },
  {
    id: 6,
    sl: 3,
    name: "Fast Food",
    totalRestaurants: 1,
    status: true, // On
  },
  {
    id: 5,
    sl: 4,
    name: "Indian",
    totalRestaurants: 1,
    status: true, // On
  },
  {
    id: 4,
    sl: 5,
    name: "Italian",
    totalRestaurants: 3,
    status: true, // On
  },
  {
    id: 3,
    sl: 6,
    name: "Japanese",
    totalRestaurants: 2,
    status: true, // On
  },
  {
    id: 2,
    sl: 7,
    name: "Chinese",
    totalRestaurants: 1,
    status: true, // On
  },
  {
    id: 1,
    sl: 8,
    name: "Bengali",
    totalRestaurants: 1,
    status: true, // On
  },
]

export default function Cuisine() {
  const [showExport, setShowExport] = useState(false)
  const [cuisines, setCuisines] = useState(MOCK_CUISINES)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCuisine, setSelectedCuisine] = useState(null)
  const [formData, setFormData] = useState({ name: "", status: true })
  const exportRef = useRef(null)

  // Filter cuisines based on search query
  const filteredCuisines = useMemo(() => {
    if (!searchQuery.trim()) {
      return cuisines
    }
    const query = searchQuery.toLowerCase().trim()
    return cuisines.filter((cuisine) =>
      cuisine.name.toLowerCase().includes(query) ||
      cuisine.id.toString().includes(query)
    )
  }, [cuisines, searchQuery])

  const totalCuisines = filteredCuisines.length

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExport(false)
      }
    }
    if (showExport) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showExport])

  const toggleStatus = (id) => {
    setCuisines((prev) =>
      prev.map((cuisine) =>
        cuisine.id === id ? { ...cuisine, status: !cuisine.status } : cuisine
      )
    )
  }

  const handleAddCuisine = () => {
    setFormData({ name: "", status: true })
    setShowAddModal(true)
  }

  const handleEditCuisine = (cuisine) => {
    setSelectedCuisine(cuisine)
    setFormData({ name: cuisine.name, status: cuisine.status })
    setShowEditModal(true)
  }

  const handleDeleteCuisine = (cuisine) => {
    setSelectedCuisine(cuisine)
    setShowDeleteModal(true)
  }

  const handleSubmitAdd = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Please enter a cuisine name")
      return
    }
    const newId = Math.max(...cuisines.map((c) => c.id), 0) + 1
    const newSl = Math.max(...cuisines.map((c) => c.sl), 0) + 1
    const newCuisine = {
      id: newId,
      sl: newSl,
      name: formData.name.trim(),
      totalRestaurants: 0,
      status: formData.status,
    }
    setCuisines([newCuisine, ...cuisines])
    setShowAddModal(false)
    setFormData({ name: "", status: true })
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Please enter a cuisine name")
      return
    }
    setCuisines((prev) =>
      prev.map((cuisine) =>
        cuisine.id === selectedCuisine.id
          ? { ...cuisine, name: formData.name.trim(), status: formData.status }
          : cuisine
      )
    )
    setShowEditModal(false)
    setSelectedCuisine(null)
    setFormData({ name: "", status: true })
  }

  const handleConfirmDelete = () => {
    setCuisines((prev) => {
      const filtered = prev.filter((cuisine) => cuisine.id !== selectedCuisine.id)
      // Update serial numbers
      return filtered.map((cuisine, index) => ({ ...cuisine, sl: index + 1 }))
    })
    setShowDeleteModal(false)
    setSelectedCuisine(null)
  }

  // Export functions
  const exportToCSV = () => {
    const headers = ["Sl", "Cuisine Id", "Cuisine Name", "Total Restaurant", "Status"]
    const rows = filteredCuisines.map((cuisine) => [
      cuisine.sl,
      cuisine.id,
      cuisine.name,
      cuisine.totalRestaurants,
      cuisine.status ? "Active" : "Inactive",
    ])
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `cuisines_${new Date().toISOString().split("T")[0]}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExport(false)
  }

  const exportToExcel = () => {
    const headers = ["Sl", "Cuisine Id", "Cuisine Name", "Total Restaurant", "Status"]
    const rows = filteredCuisines.map((cuisine) => [
      cuisine.sl,
      cuisine.id,
      cuisine.name,
      cuisine.totalRestaurants,
      cuisine.status ? "Active" : "Inactive",
    ])
    const csvContent = [
      headers.join("\t"),
      ...rows.map((row) => row.join("\t")),
    ].join("\n")
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `cuisines_${new Date().toISOString().split("T")[0]}.xls`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExport(false)
  }

  const exportToPDF = () => {
    const printWindow = window.open("", "_blank")
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cuisines Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { text-align: center; color: #333; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: rgba(0, 111, 189, 0.1); padding: 12px; text-align: left; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Cuisines Report</h1>
          <table>
            <thead>
              <tr>
                <th>Sl</th>
                <th>Cuisine Id</th>
                <th>Cuisine Name</th>
                <th>Total Restaurant</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCuisines
                .map(
                  (cuisine) => `
                <tr>
                  <td>${cuisine.sl}</td>
                  <td>${cuisine.id}</td>
                  <td>${cuisine.name}</td>
                  <td>${cuisine.totalRestaurants}</td>
                  <td>${cuisine.status ? "Active" : "Inactive"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            Generated on ${new Date().toLocaleString()}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setShowExport(false)
  }

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredCuisines, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `cuisines_${new Date().toISOString().split("T")[0]}.json`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExport(false)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Cuisine
          </h1>
        </div>
      </div>

      {/* Cuisine List Section */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="p-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Cuisine List</h2>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {totalCuisines}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-2.5 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Ex: search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-[#006fbd] focus:ring-1 focus:ring-[#006fbd]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => {
                    setShowExport((v) => !v)
                  }}
                  className="relative inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
              <button
                onClick={handleAddCuisine}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#006fbd" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#005a9e")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#006fbd")}
              >
                <Plus className="w-4 h-4" />
                Add New Cuisine
              </button>
            </div>
          </div>

          {/* Export dropdown */}
          {showExport && (
            <div className="relative mb-4">
              <div className="absolute right-0 top-0 mt-1 w-52 rounded-xl bg-white shadow-xl border border-gray-100 z-20">
                <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-400">
                    DOWNLOAD OPTIONS
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={exportToExcel}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    </div>
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(0, 111, 189, 0.1)" }}>
                      <FileDown className="w-4 h-4" style={{ color: "#006fbd" }} />
                    </div>
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-red-600" />
                    </div>
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                      <Code className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="border-t border-gray-200">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead style={{ backgroundColor: "rgba(0, 111, 189, 0.1)" }}>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Sl
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cuisine Id
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cuisine Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Restaurant
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCuisines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-3 py-8 text-center text-sm text-gray-500">
                        No cuisines found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCuisines.map((cuisine) => (
                      <tr key={cuisine.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                          {cuisine.sl}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                          {cuisine.id}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                          {cuisine.name}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                          {cuisine.totalRestaurants}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleStatus(cuisine.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#006fbd] focus:ring-offset-2 ${
                              cuisine.status
                                ? "bg-[#006fbd]"
                                : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                                cuisine.status ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditCuisine(cuisine)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white transition-colors"
                              style={{ backgroundColor: "#006fbd" }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = "#005a9e")}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = "#006fbd")}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCuisine(cuisine)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Cuisine Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Cuisine
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Enter the details to add a new cuisine to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="cuisineName" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cuisineName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter cuisine name"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006fbd] focus:border-[#006fbd]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#006fbd] focus:ring-[#006fbd]"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>
            </div>
            <DialogFooter className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ name: "", status: true })
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                style={{ backgroundColor: "#006fbd" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#005a9e")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#006fbd")}
              >
                Add Cuisine
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Cuisine Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Edit Cuisine
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Update the cuisine details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="editCuisineName" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="editCuisineName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter cuisine name"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#006fbd] focus:border-[#006fbd]"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#006fbd] focus:ring-[#006fbd]"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>
            </div>
            <DialogFooter className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedCuisine(null)
                  setFormData({ name: "", status: true })
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                style={{ backgroundColor: "#006fbd" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#005a9e")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#006fbd")}
              >
                Update Cuisine
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Delete Cuisine
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete "{selectedCuisine?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedCuisine(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

