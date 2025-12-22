import { useState } from "react"
import { Download, Upload, FileSpreadsheet, FileText, FolderUp, AlertCircle, X, Copy, Eye, Info, Sparkles, Plus } from "lucide-react"

export default function FoodsBulkImport() {
  const [uploadType, setUploadType] = useState("new")
  const [variationInput, setVariationInput] = useState("")
  const [showAlert, setShowAlert] = useState(true)

  const handleDownload = (type) => {
    console.log(`Downloading ${type} template`)
    alert(`Downloading ${type} template...`)
  }

  const handleImport = () => {
    console.log("Importing file...")
    alert("File imported successfully!")
  }

  const handleReset = () => {
    setUploadType("new")
    setVariationInput("")
  }

  const handleGenerateVariation = () => {
    console.log("Generating variation...")
    alert("Variation generated!")
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Foods Bulk Import</h1>
          </div>
        </div>

        {/* Three Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">STEP 1: Download The Excel File</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Download the format file and fill it with proper data.</p>
              <p>• You can download the example file to understand how the data must be filled.</p>
              <p>• Have to upload excel file.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">STEP 2: Match Spread Sheet Data According To Instruction</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Fill up the data according to the format</p>
              <p>• Fill up the data according to the format and validations.</p>
              <p>• You can get restaurant id from their list please input the right ids.</p>
              <p>• For veg food enter 1 and for non-veg enter 0 on veg field.</p>
              <p>• If you want to create a food with variation just create variations from the generate variation section below and click generate value.</p>
              <p>• Copy the value and paste the the spread sheet file column name variation in the selected product row.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FolderUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">STEP 3: Validate Data And Complete Import</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• In the Excel file upload section first select the upload option.</p>
              <p>• Upload your file in .xls .xlsx format.</p>
              <p>• Finally click the upload button.</p>
              <p>• You can upload your product images in product folder from gallery and copy image's path.</p>
              <p>• Image file name must be in 30 character.</p>
            </div>
          </div>
        </div>

        {/* Download Spreadsheet Template */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Download Spreadsheet Template</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleDownload("with-data")}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              With Current Data
            </button>
            <button
              onClick={() => handleDownload("without-data")}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              Without Any Data
            </button>
          </div>
        </div>

        {/* Excel File Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Excel File Upload</h2>

          {/* Upload Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Select Data Upload type:</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadType"
                  value="new"
                  checked={uploadType === "new"}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-700">Upload New Data</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadType"
                  value="update"
                  checked={uploadType === "update"}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-700">Update Existing Data</span>
              </label>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Import items file:</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <FileSpreadsheet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mt-2">Must be Excel files using our Excel template above</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            >
              Reset
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
            >
              Import
            </button>
          </div>
        </div>

        {/* Generate Variation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {showAlert && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 relative">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-yellow-800">
                  <p>You must generate variations from this generator if you want to add variations to your foods. You must copy from the specific filed and past it to the specific column at your excel sheet. Otherwise you might get 500 error if you swap or entered invalid data. And if you want to make it empty then you have to enter an empty array [].</p>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              Make Variation
              <Info className="w-4 h-4 text-slate-400" />
            </label>
            <div className="relative">
              <input
                type="text"
                value={variationInput}
                onChange={(e) => setVariationInput(e.target.value)}
                placeholder="Enter variation details"
                className="w-full px-4 py-2.5 pr-24 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
                  <X className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateVariation}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Value
            </button>
            <button className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add new variation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
