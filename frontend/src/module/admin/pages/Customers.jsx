import { useState, useMemo } from "react"
import { Search, Download, ChevronDown, Calendar, Eye, FileDown, FileSpreadsheet, FileText, Code } from "lucide-react"
import { customersDummy } from "../data/customersDummy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { exportCustomersToCSV, exportCustomersToExcel, exportCustomersToPDF, exportCustomersToJSON } from "../components/customers/customersExportUtils"

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState(customersDummy)
  const [filters, setFilters] = useState({
    orderDate: "",
    joiningDate: "",
    status: "",
    sortBy: "",
    chooseFirst: "",
  })

  const filteredCustomers = useMemo(() => {
    let result = [...customers]
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query)
      )
    }

    // Filter by order date (if customer has order date field, otherwise skip)
    // Note: customersDummy doesn't have orderDate, so this is a placeholder for future implementation

    // Filter by joining date
    if (filters.joiningDate) {
      result = result.filter(customer => {
        // Parse joining date from format "17 Oct 2021"
        const customerDate = new Date(customer.joiningDate)
        const filterDate = new Date(filters.joiningDate)
        return customerDate.toDateString() === filterDate.toDateString()
      })
    }

    // Filter by status
    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter(customer => customer.status === true)
      } else if (filters.status === "inactive") {
        result = result.filter(customer => customer.status === false)
      }
    }

    // Sort by options
    if (filters.sortBy) {
      if (filters.sortBy === "name-asc") {
        result.sort((a, b) => a.name.localeCompare(b.name))
      } else if (filters.sortBy === "name-desc") {
        result.sort((a, b) => b.name.localeCompare(a.name))
      } else if (filters.sortBy === "orders-asc") {
        result.sort((a, b) => a.totalOrder - b.totalOrder)
      } else if (filters.sortBy === "orders-desc") {
        result.sort((a, b) => b.totalOrder - a.totalOrder)
      }
    }

    // Limit results if "Choose First" is set
    if (filters.chooseFirst && parseInt(filters.chooseFirst) > 0) {
      result = result.slice(0, parseInt(filters.chooseFirst))
    }

    return result
  }, [customers, searchQuery, filters])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleToggleStatus = (sl) => {
    setCustomers(customers.map(customer =>
      customer.sl === sl ? { ...customer, status: !customer.status } : customer
    ))
  }

  const handleExport = (format) => {
    const filename = "customers"
    switch (format) {
      case "csv":
        exportCustomersToCSV(filteredCustomers, filename)
        break
      case "excel":
        exportCustomersToExcel(filteredCustomers, filename)
        break
      case "pdf":
        exportCustomersToPDF(filteredCustomers, filename)
        break
      case "json":
        exportCustomersToJSON(filteredCustomers, filename)
        break
      default:
        break
    }
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Order Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.orderDate}
                  onChange={(e) => handleFilterChange("orderDate", e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Customer Joining Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.joiningDate}
                  onChange={(e) => handleFilterChange("joiningDate", e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Customer status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Customer Sorting Order</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="orders-asc">Orders (Low to High)</option>
                <option value="orders-desc">Orders (High to Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Choose First
              </label>
              <input
                type="number"
                value={filters.chooseFirst}
                onChange={(e) => handleFilterChange("chooseFirst", e.target.value)}
                placeholder="Ex: 100"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  // Filters are applied automatically via useMemo
                }}
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilters({
                    orderDate: "",
                    joiningDate: "",
                    status: "",
                    sortBy: "",
                    chooseFirst: "",
                  })
                }}
                className="px-6 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                Reset Filters
              </button>
            </div>
            <div className="text-sm text-slate-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
        </div>

        {/* Customer List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Customer list</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredCustomers.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <input
                  type="text"
                  placeholder="Ex: Search by name"
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
                    <FileDown className="w-4 h-4 mr-2" />
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
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Sl</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Contact Information</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Total Order</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Total Order Amount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Joining Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Active/Inactive</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.sl} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700">{customer.sl}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">👤</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{customer.email}</span>
                        <span className="text-xs text-slate-500">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{customer.totalOrder}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">$ {customer.totalOrderAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{customer.joiningDate}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(customer.sl)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          customer.status ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            customer.status ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
