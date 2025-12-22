import { useState } from "react"
import { Download, RefreshCw, Calendar, FileSpreadsheet } from "lucide-react"

export default function AddonsBulkExport() {
  const [dataType, setDataType] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  const handleExport = () => {
    alert(`Exporting ${dataType} data...`)
  }

  const handleReset = () => {
    setDataType("all")
    setFromDate("")
    setToDate("")
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Download className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Export Addons</h1>
            <p className="text-sm text-slate-500 mt-1">
              Export addon data in bulk using filters
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h2 className="text-xl font-bold text-slate-900">Select Data Type</h2>
        </div>
        <div className="ml-14">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Type
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="all">All data</option>
            <option value="active">Active Addons</option>
            <option value="inactive">Inactive Addons</option>
            <option value="by-category">By Category</option>
            <option value="with-price">With Price</option>
            <option value="free">Free Addons</option>
          </select>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h2 className="text-xl font-bold text-slate-900">Select Data Range by Date and Export</h2>
        </div>
        <div className="ml-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Data will be exported in Excel (.xlsx) format</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleExport}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-2 shadow-md"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  )
}

