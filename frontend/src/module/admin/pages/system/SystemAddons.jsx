import { useState, useRef } from "react"
import { Settings, Package, Info, Upload, FileUp } from "lucide-react"

export default function SystemAddons() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = () => {
    if (selectedFile) {
      console.log("Uploading file:", selectedFile.name)
      alert(`Uploading ${selectedFile.name}...`)
    } else {
      alert("Please select a file to upload")
    }
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 relative">
          <button className="absolute top-6 right-6 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">System Addons</h1>
            </div>
            <a
              href="#"
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              See how it works
              <Info className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
          {/* Upload Payment & Sms Module Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Upload Payment & Sms Module
            </h2>

            {/* File Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : selectedFile
                  ? "border-green-500 bg-green-50"
                  : "border-blue-300 bg-blue-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".zip,.rar,.7z"
              />
              <FileUp className={`w-12 h-12 mx-auto mb-4 ${
                isDragging ? "text-blue-600" : selectedFile ? "text-green-600" : "text-blue-500"
              }`} />
              <p className="text-blue-600 font-medium">
                {selectedFile ? selectedFile.name : "Drag & drop file or Browse file"}
              </p>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Instructions</h2>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-slate-500 font-semibold mt-0.5">1.</span>
                <span>
                  Please make sure, Your server php "upload_max_filesize" Value is grater or equal to 20MB. Current value is - <span className="font-semibold text-red-600">2MB</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-500 font-semibold mt-0.5">2.</span>
                <span>
                  Please make sure, Your server php "post_max_size" Value is grater or equal to 20MB. Current value is - <span className="font-semibold text-red-600">8MB</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

