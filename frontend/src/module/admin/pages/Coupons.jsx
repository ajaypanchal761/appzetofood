import { useState, useMemo } from "react"
import { Search, Download, ChevronDown, Plus, Edit, Trash2, Calendar, Sparkles, CheckCircle2, FileSpreadsheet, FileDown, FileText, Code } from "lucide-react"
import { couponsDummy } from "../data/couponsDummy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { exportCampaignsToCSV, exportCampaignsToExcel, exportCampaignsToPDF, exportCampaignsToJSON } from "../components/campaigns/campaignsExportUtils"
import DeleteCampaignDialog from "../components/campaigns/DeleteCampaignDialog"

export default function Coupons() {
  const [activeLanguage, setActiveLanguage] = useState("default")
  const [searchQuery, setSearchQuery] = useState("")
  const [coupons, setCoupons] = useState(couponsDummy)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    title: "",
    couponType: "Restaurant wise",
    restaurant: "",
    customer: "",
    code: "WeKxB6wQ",
    limitForSameUser: "",
    startDate: "",
    expireDate: "",
    discountType: "Amount ($)",
    discount: "",
    maxDiscount: "0",
    minPurchase: "0",
  })

  const languageTabs = [
    { key: "default", label: "Default" },
    { key: "en", label: "English(EN)" },
    { key: "bn", label: "Bengali - বাংলা (BN)" },
    { key: "ar", label: "Arabic - العربية (AR)" },
    { key: "es", label: "Spanish - español(ES)" },
  ]

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) {
      return coupons
    }
    
    const query = searchQuery.toLowerCase().trim()
    return coupons.filter(coupon =>
      coupon.title.toLowerCase().includes(query) ||
      coupon.code.toLowerCase().includes(query)
    )
  }, [coupons, searchQuery])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code }))
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = "Title is required"
    }
    
    if (!formData.code.trim()) {
      errors.code = "Code is required"
    }
    
    if (!formData.startDate) {
      errors.startDate = "Start date is required"
    }
    
    if (!formData.expireDate) {
      errors.expireDate = "Expire date is required"
    }
    
    if (formData.startDate && formData.expireDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.expireDate)
      if (end < start) {
        errors.expireDate = "Expire date must be after start date"
      }
    }
    
    if (!formData.discount) {
      errors.discount = "Discount is required"
    }
    
    if (formData.couponType === "Restaurant wise" && !formData.restaurant) {
      errors.restaurant = "Restaurant is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setFormErrors({})
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newCoupon = {
        sl: coupons.length > 0 ? Math.max(...coupons.map(c => c.sl)) + 1 : 1,
        title: formData.title,
        code: formData.code,
        type: formData.couponType,
        totalUses: 0,
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxDiscount: parseFloat(formData.maxDiscount) || 0,
        discount: parseFloat(formData.discount) || 0,
        discountType: formData.discountType === "Amount ($)" ? "Amount" : formData.discountType === "Percent (%)" ? "Percent" : "--",
        startDate: formData.startDate,
        expireDate: formData.expireDate,
        custom: formData.customer || "All customer",
        status: true,
      }
      
      setCoupons([...coupons, newCoupon])
      setShowSuccessDialog(true)
      
      setTimeout(() => {
        handleReset()
        setShowSuccessDialog(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormErrors({ submit: "Failed to add coupon. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      title: "",
      couponType: "Restaurant wise",
      restaurant: "",
      customer: "",
      code: "WeKxB6wQ",
      limitForSameUser: "",
      startDate: "",
      expireDate: "",
      discountType: "Amount ($)",
      discount: "",
      maxDiscount: "0",
      minPurchase: "0",
    })
  }

  const handleToggleStatus = (sl) => {
    setCoupons(coupons.map(coupon =>
      coupon.sl === sl ? { ...coupon, status: !coupon.status } : coupon
    ))
  }

  const handleDelete = (sl) => {
    setCoupons(coupons.filter(coupon => coupon.sl !== sl))
  }

  const handleDeleteClick = (coupon) => {
    setSelectedCoupon(coupon)
    setIsDeleteOpen(true)
  }

  const handleExport = (format) => {
    const filename = "coupons"
    const exportData = filteredCoupons.map(coupon => ({
      ...coupon,
      title: coupon.title,
      code: coupon.code,
      type: coupon.type,
    }))
    
    switch (format) {
      case "csv":
        exportCampaignsToCSV(exportData, filename, false)
        break
      case "excel":
        exportCampaignsToExcel(exportData, filename, false)
        break
      case "pdf":
        exportCampaignsToPDF(exportData, filename, false)
        break
      case "json":
        exportCampaignsToJSON(exportData, filename)
        break
      default:
        break
    }
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Add New Coupon Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Add New Coupon</h1>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
            {languageTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveLanguage(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLanguage === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title ({activeLanguage === "default" ? "Default" : languageTabs.find(t => t.key === activeLanguage)?.label}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="New coupon"
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    formErrors.title ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Coupon Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.couponType}
                  onChange={(e) => handleInputChange("couponType", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="Restaurant wise">Restaurant wise</option>
                  <option value="Zone wise">Zone wise</option>
                  <option value="Free delivery">Free delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Restaurant <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.restaurant}
                  onChange={(e) => handleInputChange("restaurant", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    formErrors.restaurant ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Select Restaurant</option>
                  <option value="cafe-monarch">Café Monarch</option>
                  <option value="hungry-puppets">Hungry Puppets</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Customer
                </label>
                <select
                  value={formData.customer}
                  onChange={(e) => handleInputChange("customer", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    className={`flex-1 px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      formErrors.code ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
                  >
                    Generate Code
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Limit For Same User
                </label>
                <input
                  type="number"
                  value={formData.limitForSameUser}
                  onChange={(e) => handleInputChange("limitForSameUser", e.target.value)}
                  placeholder="Ex: 10"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Expire Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.expireDate}
                    onChange={(e) => handleInputChange("expireDate", e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleInputChange("discountType", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="Amount ($)">Amount ($)</option>
                  <option value="Percent (%)">Percent (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleInputChange("discount", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Discount
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => handleInputChange("maxDiscount", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Min Purchase
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => handleInputChange("minPurchase", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-6">
              {formErrors.submit && (
                <p className="text-sm text-red-500 mr-auto">{formErrors.submit}</p>
              )}
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Coupon List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Coupon List</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredCoupons.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <input
                  type="text"
                  placeholder="Ex: Search by title or code"
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
                    <span>Export</span>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">SI</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Total Uses</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Min Purchase</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Max Discount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Discount Type</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Expire Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Custom</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-20 text-center">
                      <p className="text-lg font-semibold text-slate-700 mb-1">No Data Found</p>
                      <p className="text-sm text-slate-500">No coupons match your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.sl} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700">{coupon.sl}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">{coupon.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.totalUses}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">$ {coupon.minPurchase.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">$ {coupon.maxDiscount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.discount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.discountType}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.startDate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{coupon.expireDate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">{coupon.custom}</span>
                          <button
                            onClick={() => handleToggleStatus(coupon.sl)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              coupon.status ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                coupon.status ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(coupon)}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
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

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-emerald-500 rounded-full p-4">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Coupon Added Successfully!
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600">
                  The coupon has been successfully added to the system. You can now see it in the coupon list below.
                </DialogDescription>
              </DialogHeader>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <DeleteCampaignDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          campaign={selectedCoupon}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  )
}
