import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileSpreadsheet,
  Calendar,
  Settings,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/Footer"

export default function BulkExport() {
  const [exportType, setExportType] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [startId, setStartId] = useState("")
  const [endId, setEndId] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleReset = () => {
    setExportType("all")
    setFromDate("")
    setToDate("")
    setStartId("")
    setEndId("")
  }

  const handleSettings = () => {
    // TODO: Open settings modal or navigate to settings page
    console.log("Settings clicked")
    alert("Settings functionality will be implemented here")
  }

  const handleSubmit = async () => {
    // Validate based on export type
    if (exportType === "date") {
      if (!fromDate || !toDate) {
        alert("Please select both From Date and To Date")
        return
      }
      if (new Date(fromDate) > new Date(toDate)) {
        alert("From Date cannot be greater than To Date")
        return
      }
    }

    if (exportType === "id") {
      if (!startId || !endId) {
        alert("Please enter both Start ID and End ID")
        return
      }
      const start = parseInt(startId)
      const end = parseInt(endId)
      if (isNaN(start) || isNaN(end)) {
        alert("Please enter valid numeric IDs")
        return
      }
      if (start > end) {
        alert("Start ID cannot be greater than End ID")
        return
      }
    }

    setIsExporting(true)
    try {
      // TODO: Implement actual export logic with API call
      console.log("Exporting with:", { exportType, fromDate, toDate, startId, endId })
      
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create sample CSV export
      const headers = ["ID", "Name", "Category", "Price", "Status", "Created Date"]
      const sampleData = [
        ["1", "Chicken Biryani", "Main Course", "450", "Active", "2024-01-15"],
        ["2", "Vegetable Curry", "Main Course", "250", "Active", "2024-01-16"],
        ["3", "Mango Lassi", "Beverage", "100", "Active", "2024-01-17"],
      ]
      
      let csvContent = headers.join(",") + "\n"
      csvContent += sampleData.map(row => row.join(",")).join("\n")
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      
      const fileName = `foods-export-${exportType}-${new Date().toISOString().split("T")[0]}.csv`
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert("Export completed successfully!")
      handleReset()
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-600 flex items-center justify-center shadow-md">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Foods Bulk Export</h1>
            <p className="text-sm text-gray-500 mt-0.5">Export multiple food items at once</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSettings}
          className="h-10 w-10 text-gray-600 hover:bg-gray-100"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Two-Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">STEP 1</p>
                <p className="text-xs text-gray-600">Select data type</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">STEP 2</p>
                <p className="text-xs text-gray-600">Select data range or id then export</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Foods Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100 px-6 py-4">
          <CardTitle className="text-lg font-semibold text-gray-800">Export Foods</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-6">
          <div className="space-y-6">
            {/* Select Type Dropdown */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Select Type</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select export type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All data</SelectItem>
                  <SelectItem value="date">Date wise</SelectItem>
                  <SelectItem value="id">Id wise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Fields Based on Selection */}
            {exportType === "date" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">From Date</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="dd-mm-yyyy"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">To Date</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="dd-mm-yyyy"
                      className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {exportType === "id" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Start Id</Label>
                  <Input
                    type="number"
                    value={startId}
                    onChange={(e) => setStartId(e.target.value)}
                    placeholder="Enter start ID"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">End Id</Label>
                  <Input
                    type="number"
                    value={endId}
                    onChange={(e) => setEndId(e.target.value)}
                    placeholder="Enter end ID"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isExporting}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 h-10 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? "Exporting..." : "Submit"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

