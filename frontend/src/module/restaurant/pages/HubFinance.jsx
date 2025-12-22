import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, HelpCircle, Menu, ChevronDown, Calendar, Download, ArrowRight, FileText, FileDown } from "lucide-react"
import BottomNavOrders from "../components/BottomNavOrders"

export default function HubFinance() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab")
    return tabParam === "invoices" ? "invoices" : "payouts"
  })
  const [selectedDateRange, setSelectedDateRange] = useState("14 Nov - 14 Dec'25")
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const downloadMenuRef = useRef(null)

  // Get current cycle dates
  const currentCycleDates = useMemo(() => {
    return {
      start: "15",
      end: "21",
      month: "Dec",
      year: "25"
    }
  }, [])

  const handleViewDetails = () => {
    navigate("/restaurant/finance-details")
  }

  // Prepare report data
  const getReportData = () => {
    return {
      restaurantName: "Kadhai Chammach Restaurant",
      restaurantId: "20959122",
      dateRange: selectedDateRange,
      currentCycle: {
        start: currentCycleDates.start,
        end: currentCycleDates.end,
        month: currentCycleDates.month,
        year: currentCycleDates.year,
        estimatedPayout: "₹0.00",
        orders: 0,
        payoutDate: "-"
      }
    }
  }

  // Generate HTML content for the report
  const generateHTMLContent = (reportData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Finance Report - ${reportData.dateRange}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #000;
          }
          .header p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #000;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px dashed #ccc;
          }
          .info-label {
            font-weight: 600;
            color: #333;
          }
          .info-value {
            color: #000;
            font-weight: 600;
          }
          .current-cycle {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .payout-amount {
            font-size: 32px;
            font-weight: bold;
            color: #000;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .current-cycle { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Finance Report</h1>
          <p>${reportData.restaurantName}</p>
          <p>ID: ${reportData.restaurantId}</p>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div class="section">
          <div class="section-title">Current Cycle</div>
          <div class="current-cycle">
            <p style="font-size: 12px; color: #666; margin: 0 0 5px 0;">
              Est. payout (${reportData.currentCycle.start} - ${reportData.currentCycle.end} ${reportData.currentCycle.month})
            </p>
            <div class="payout-amount">${reportData.currentCycle.estimatedPayout}</div>
            <p style="font-size: 14px; color: #666; margin: 5px 0;">${reportData.currentCycle.orders} orders</p>
            <div class="info-row">
              <div>
                <p class="info-label" style="font-size: 11px; margin: 5px 0;">Payout for</p>
                <p style="margin: 0; font-weight: 600;">${reportData.currentCycle.start} - ${reportData.currentCycle.end} ${reportData.currentCycle.month}'${reportData.currentCycle.year}</p>
              </div>
              <div style="text-align: right;">
                <p class="info-label" style="font-size: 11px; margin: 5px 0;">Payout date</p>
                <p style="margin: 0; font-weight: 600;">${reportData.currentCycle.payoutDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Past Cycles</div>
          <div class="info-row">
            <span class="info-label">Date Range:</span>
            <span class="info-value">${reportData.dateRange}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">No past payouts available</span>
          </div>
        </div>

        <div class="footer">
          <p>This is an auto-generated report. For detailed information, please visit the Finance section.</p>
        </div>
      </body>
      </html>
    `
  }

  // Download HTML report
  const downloadHTML = () => {
    const reportData = getReportData()
    const htmlContent = generateHTMLContent(reportData)
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-report-${reportData.dateRange.replace(/\s+/g, '-').replace(/'/g, '')}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  // Download PDF report
  const downloadPDF = async () => {
    const reportData = getReportData()
    const htmlContent = generateHTMLContent(reportData)
    
    // Create a temporary window with the HTML content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow popups to download PDF')
      setShowDownloadMenu(false)
      return
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print
    // Use both onload and setTimeout as fallback
    const triggerPrint = () => {
      setTimeout(() => {
        printWindow.print()
        // Close window after a delay (user can save as PDF from print dialog)
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 250)
    }
    
    if (printWindow.document.readyState === 'complete') {
      triggerPrint()
    } else {
      printWindow.onload = triggerPrint
    }
    
    setShowDownloadMenu(false)
  }

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
        setShowDownloadMenu(false)
      }
    }
    
    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDownloadMenu])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <div className="sticky bg-white top-0 z-40 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold text-gray-900 truncate">
                  Kadhai Chammach Res...
                </p>
                <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                ID: 20959122 • By Pass Road (South), ...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => navigate("/restaurant/notifications")}
            >
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => navigate("/restaurant/help-centre")}
            >
              <HelpCircle className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => navigate("/restaurant/explore")}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("payouts")}
            className={`flex-1 py-3 px-4 rounded-full font-medium text-sm transition-colors ${
              activeTab === "payouts"
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Payouts
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex-1 py-3 px-4 rounded-full font-medium text-sm transition-colors ${
              activeTab === "invoices"
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Invoices & Taxes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {activeTab === "payouts" && (
          <div className="space-y-6">
            {/* Current cycle */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">Current cycle</h2>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Est. payout ({currentCycleDates.start} - {currentCycleDates.end} {currentCycleDates.month})</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">₹0.00</p>
                <p className="text-sm text-gray-600 mb-4">0 orders</p>
                <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payout for</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {currentCycleDates.start} - {currentCycleDates.end} {currentCycleDates.month}'{currentCycleDates.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Payout date</p>
                      <p className="text-sm font-semibold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleViewDetails}
                  className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                  View details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Past cycles */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">Past cycles</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button className="flex-1 bg-white rounded-lg px-4 py-3 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{selectedDateRange}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="relative" ref={downloadMenuRef}>
                    <button 
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="bg-black text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Get report</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {showDownloadMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 min-w-[180px]"
                        >
                          <button
                            onClick={downloadHTML}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                              <FileDown className="w-4 h-4 text-blue-600" />
                            </div>
                            <span>Download HTML</span>
                          </button>
                          <button
                            onClick={downloadPDF}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-red-600" />
                            </div>
                            <span>Download PDF</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className=" rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-center">
                    No past payouts are available for the selected date range
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className=" rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center py-8">
              Invoices & Taxes content will be displayed here
            </p>
          </div>
        )}
      </div>

      <BottomNavOrders />
    </div>
  )
}
