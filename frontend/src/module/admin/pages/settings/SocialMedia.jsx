import { useState, useMemo } from "react"
import { Info, Pencil, Facebook, Twitter, Instagram, Linkedin, Share2, Search, Settings, ArrowUpDown, Check, Columns } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const socialMediaOptions = [
  "Facebook",
  "Twitter",
  "Instagram",
  "LinkedIn",
  "Pinterest"
]

const existingLinks = [
  { id: 1, name: "Pinterest", link: "https://www.pinterest.com/", status: true },
  { id: 2, name: "LinkedIn", link: "https://bd.linkedin.com/", status: true },
  { id: 3, name: "Twitter", link: "https://twitter.com/?lang=en", status: true },
  { id: 4, name: "Facebook", link: "https://www.facebook.com/", status: true },
  { id: 5, name: "Instagram", link: "https://www.instagram.com/?hl=en", status: true }
]

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center w-11 h-6 rounded-full border transition-all ${
        enabled
          ? "bg-blue-600 border-blue-600 justify-end"
          : "bg-slate-200 border-slate-300 justify-start"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  )
}

export default function SocialMedia() {
  const [selectedName, setSelectedName] = useState("")
  const [socialMediaLink, setSocialMediaLink] = useState("")
  const [links, setLinks] = useState(existingLinks)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    name: true,
    link: true,
    status: true,
    actions: true,
  })

  const handleStatusToggle = (id) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, status: !link.status } : link
    ))
  }

  const handleReset = () => {
    setSelectedName("")
    setSocialMediaLink("")
  }

  const handleSave = () => {
    if (selectedName && socialMediaLink) {
      // Add new link logic here
      console.log("Saving:", { selectedName, socialMediaLink })
      handleReset()
    }
  }

  const filteredLinks = useMemo(() => {
    if (!searchQuery.trim()) return links
    const query = searchQuery.toLowerCase().trim()
    return links.filter(link =>
      link.name.toLowerCase().includes(query) ||
      link.link.toLowerCase().includes(query)
    )
  }, [links, searchQuery])

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      name: true,
      link: true,
      status: true,
      actions: true,
    })
  }

  const columnsConfig = {
    si: "Serial Number",
    name: "Name",
    link: "Social Media Link",
    status: "Status",
    actions: "Actions",
  }

  const getSocialIcon = (name) => {
    switch(name.toLowerCase()) {
      case "facebook": return <Facebook className="w-4 h-4" />
      case "twitter": return <Twitter className="w-4 h-4" />
      case "instagram": return <Instagram className="w-4 h-4" />
      case "linkedin": return <Linkedin className="w-4 h-4" />
      case "pinterest": return <Share2 className="w-4 h-4" />
      default: return <Share2 className="w-4 h-4" />
    }
  }

  return (
    <div className="p-2 lg:p-3 bg-slate-50 min-h-screen">
      <div className="w-full mx-auto max-w-6xl">
        {/* Add Social Media Link Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Facebook className="w-4 h-4 text-blue-600" />
              <Twitter className="w-4 h-4 text-sky-400" />
              <Instagram className="w-4 h-4 text-pink-600" />
              <Share2 className="w-4 h-4 text-red-600" />
              <Linkedin className="w-4 h-4 text-blue-700" />
            </div>
            <h1 className="text-base font-bold text-slate-900">Social Media</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Name
              </label>
              <div className="relative">
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">---Select Social Media---</option>
                  {socialMediaOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                  ▾
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                Social media link
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <input
                type="text"
                value={socialMediaLink}
                onChange={(e) => setSocialMediaLink(e.target.value)}
                placeholder="Ex :facebook.com/your-page-name"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Existing Social Media Links Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Social Media Links</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">
                {filteredLinks.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial min-w-[250px]">
                <input
                  type="text"
                  placeholder="Search by name or link"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {visibleColumns.si && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>SI</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.link && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Social Media Link</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(v => v).length} className="px-6 py-8 text-center text-slate-500">
                      No links found
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link, index) => (
                    <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                      {visibleColumns.si && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">{index + 1}</span>
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-slate-600">
                              {getSocialIcon(link.name)}
                            </div>
                            <span className="text-sm text-slate-700">{link.name}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.link && (
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700 break-all">{link.link}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ToggleSwitch
                            enabled={link.status}
                            onToggle={() => handleStatusToggle(link.id)}
                          />
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md bg-white p-0 opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:scale-100 data-[state=closed]:scale-100">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Table Settings
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Columns className="w-4 h-4" />
                Visible Columns
              </h3>
              <div className="space-y-2">
                {Object.entries(columnsConfig).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[key]}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                    {visibleColumns[key] && (
                      <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={resetColumns}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                Reset
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
