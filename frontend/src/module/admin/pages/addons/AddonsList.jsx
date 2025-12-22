import { useState, useMemo } from "react"
import { Search, Filter, Download, ChevronDown, Plus, Edit, Trash2, Package } from "lucide-react"

export default function AddonsList() {
  const [searchQuery, setSearchQuery] = useState("")
  // Dummy data - in real app this would come from API
  const [addons] = useState([
    { id: 1, name: "Extra Cheese", category: "Sauces", price: 2.50, status: true },
    { id: 2, name: "Extra Sauce", category: "Sauces", price: 1.50, status: true },
    { id: 3, name: "Mild", category: "Spice Level", price: 0, status: true },
    { id: 4, name: "Medium", category: "Spice Level", price: 0, status: true },
    { id: 5, name: "Hot", category: "Spice Level", price: 0, status: true },
  ])

  const filteredAddons = useMemo(() => {
    if (!searchQuery.trim()) {
      return addons
    }
    
    const query = searchQuery.toLowerCase().trim()
    return addons.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }, [addons, searchQuery])

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Addons List</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage all addons for your food items
              </p>
            </div>
          </div>
          <button className="px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search addons..."
              className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-emerald-500 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="px-4 py-2.5 text-sm font-medium rounded-lg border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" />
            Export
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">SI</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Addon Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredAddons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-5xl text-orange-500 font-bold">!</span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-slate-700 mb-1">No Data Found</p>
                      <p className="text-sm text-slate-500">No addons match your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAddons.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-600">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md transition-all duration-150"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-150"
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
  )
}

