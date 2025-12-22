import { useState, useMemo } from "react"
import { Search, Download, ChevronDown, Plus, Edit, Trash2, FolderTree } from "lucide-react"
import { addonCategoriesDummy } from "../../data/addonCategoriesDummy"

export default function AddonCategory() {
  const [activeTab, setActiveTab] = useState("default")
  const [categoryName, setCategoryName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState(addonCategoriesDummy)

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories
    }
    
    const query = searchQuery.toLowerCase().trim()
    return categories.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  const handleAdd = () => {
    if (!categoryName.trim()) {
      alert("Please enter category name")
      return
    }

    const newCategory = {
      sl: categories.length + 1,
      id: categories.length + 1,
      name: categoryName,
      status: true,
    }

    setCategories([...categories, newCategory])
    setCategoryName("")
    alert("Addon Category added successfully!")
  }

  const handleReset = () => {
    setCategoryName("")
  }

  const handleToggleStatus = (id) => {
    setCategories(categories.map(item =>
      item.id === id ? { ...item, status: !item.status } : item
    ))
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter(item => item.id !== id))
    }
  }

  const languageTabs = [
    { key: "default", label: "Default" },
    { key: "en", label: "English(EN)" },
    { key: "bn", label: "Bengali - বাংলা(BN)" },
    { key: "ar", label: "Arabic - العربية (AR)" },
    { key: "es", label: "Spanish - español(ES)" },
  ]

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <FolderTree className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Addon Category</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage addon categories for your food items
            </p>
          </div>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {languageTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white shadow-md border-b-2 border-emerald-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category Name ({activeTab === "default" ? "Default" : languageTabs.find(t => t.key === activeTab)?.label}) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="New category"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            >
              Reset
            </button>
            <button
              onClick={handleAdd}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Category List <span className="text-sm font-normal text-slate-500">({filteredCategories.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here"
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">SI</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Id</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-5xl text-orange-500 font-bold">!</span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-slate-700 mb-1">No Data Found</p>
                      <p className="text-sm text-slate-500">No categories match your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-blue-50/50 transition-all duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-600">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{item.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.status ? "bg-blue-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.status ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
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
                          onClick={() => handleDelete(item.id)}
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

