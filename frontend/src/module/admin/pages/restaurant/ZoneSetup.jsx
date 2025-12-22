import { useState, useMemo } from "react"
import { MapPin, Hand, Shapes } from "lucide-react"
import ZonesTopbar from "../../components/zones/ZonesTopbar"
import ZonesTable from "../../components/zones/ZonesTable"
import ZoneFilterPanel from "../../components/zones/ZoneFilterPanel"
import EditZoneDialog from "../../components/zones/EditZoneDialog"
import ViewZoneDialog from "../../components/zones/ViewZoneDialog"
import SettingsDialog from "../../components/orders/SettingsDialog"
import { exportZonesToCSV, exportZonesToExcel, exportZonesToPDF, exportZonesToJSON } from "../../components/zones/zonesExportUtils"

const languageTabs = [
  { key: "default", label: "Default" },
  { key: "en", label: "English(EN)" },
  { key: "bn", label: "Bengali - বাংলা(BN)" },
  { key: "ar", label: "Arabic - العربية (AR)" },
  { key: "es", label: "Spanish - español(ES)" }
]

const zonesData = [
  {
    id: 1,
    zoneId: 1,
    name: "All over the World",
    displayName: "All over the World",
    restaurants: 16,
    deliverymen: 8,
    isDefault: false,
    status: true
  }
]

export default function ZoneSetup() {
  const [activeLanguage, setActiveLanguage] = useState("default")
  const [zoneName, setZoneName] = useState("")
  const [zoneDisplayName, setZoneDisplayName] = useState("")
  const [zones, setZones] = useState(zonesData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isEditZoneOpen, setIsEditZoneOpen] = useState(false)
  const [isViewZoneOpen, setIsViewZoneOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)
  const [filters, setFilters] = useState({
    status: "",
    isDefault: "",
    minRestaurants: "",
    maxRestaurants: "",
    minDeliverymen: "",
    maxDeliverymen: "",
  })
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    zoneId: true,
    name: true,
    displayName: true,
    restaurants: true,
    deliverymen: true,
    defaultStatus: true,
    status: true,
    actions: true,
  })

  const handleStatusToggle = (id) => {
    setZones(prev => prev.map(zone => 
      zone.id === id ? { ...zone, status: !zone.status } : zone
    ))
  }

  const handleMakeDefault = (id) => {
    setZones(prev => prev.map(zone => ({
      ...zone,
      isDefault: zone.id === id
    })))
  }

  const handleReset = () => {
    setZoneName("")
    setZoneDisplayName("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (zoneName && zoneDisplayName) {
      const newZone = {
        id: zones.length + 1,
        zoneId: zones.length + 1,
        name: zoneName,
        displayName: zoneDisplayName,
        restaurants: 0,
        deliverymen: 0,
        isDefault: false,
        status: true
      }
      setZones(prev => [...prev, newZone])
      handleReset()
    }
  }

  const handleEditZone = (zone) => {
    setSelectedZone(zone)
    setIsEditZoneOpen(true)
  }

  const handleViewZone = (zone) => {
    setSelectedZone(zone)
    setIsViewZoneOpen(true)
  }

  const handleSaveZone = (updatedZone) => {
    setZones(prev => prev.map(zone => 
      zone.id === updatedZone.id ? updatedZone : zone
    ))
  }

  // Apply search and filters
  const filteredZones = useMemo(() => {
    let result = [...zones]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(zone =>
        zone.name.toLowerCase().includes(query) ||
        zone.displayName.toLowerCase().includes(query) ||
        zone.zoneId.toString().includes(query)
      )
    }

    // Apply filters
    if (filters.status) {
      result = result.filter(zone => {
        if (filters.status === "Active") return zone.status === true
        if (filters.status === "Inactive") return zone.status === false
        return true
      })
    }

    if (filters.isDefault) {
      result = result.filter(zone => {
        if (filters.isDefault === "yes") return zone.isDefault === true
        if (filters.isDefault === "no") return zone.isDefault === false
        return true
      })
    }

    if (filters.minRestaurants) {
      result = result.filter(zone => zone.restaurants >= parseInt(filters.minRestaurants))
    }

    if (filters.maxRestaurants) {
      result = result.filter(zone => zone.restaurants <= parseInt(filters.maxRestaurants))
    }

    if (filters.minDeliverymen) {
      result = result.filter(zone => zone.deliverymen >= parseInt(filters.minDeliverymen))
    }

    if (filters.maxDeliverymen) {
      result = result.filter(zone => zone.deliverymen <= parseInt(filters.maxDeliverymen))
    }

    return result
  }, [zones, searchQuery, filters])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== "" && value !== null && value !== undefined).length
  }, [filters])

  const handleApplyFilters = () => {
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      status: "",
      isDefault: "",
      minRestaurants: "",
      maxRestaurants: "",
      minDeliverymen: "",
      maxDeliverymen: "",
    })
  }

  const handleExport = (format) => {
    const filename = "zones"
    switch (format) {
      case "csv":
        exportZonesToCSV(filteredZones, filename)
        break
      case "excel":
        exportZonesToExcel(filteredZones, filename)
        break
      case "pdf":
        exportZonesToPDF(filteredZones, filename)
        break
      case "json":
        exportZonesToJSON(filteredZones, filename)
        break
      default:
        break
    }
  }

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      zoneId: true,
      name: true,
      displayName: true,
      restaurants: true,
      deliverymen: true,
      defaultStatus: true,
      status: true,
      actions: true,
    })
  }

  const columnConfig = {
    si: "Serial Number",
    zoneId: "Zone ID",
    name: "Zone Name",
    displayName: "Display Name",
    restaurants: "Restaurants",
    deliverymen: "Deliverymen",
    defaultStatus: "Default Status",
    status: "Status",
    actions: "Actions",
  }

  return (
    <div className="p-2 lg:p-3 bg-slate-50 min-h-screen">
      <div className="w-full mx-auto max-w-7xl">
        {/* Add New Business Zone Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Add New Business Zone</h1>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
            <h2 className="text-xs font-semibold text-slate-900 mb-2">Instructions</h2>
            <p className="text-xs text-slate-600 mb-3">
              Create & connect dots in a specific area on the map to add a new business zone.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <Hand className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs text-slate-700">
                  Use this 'Hand Tool' to find your target zone.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                  <Shapes className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-xs text-slate-700">
                  Use this 'Shape Tool' to point out the areas and connect the dots. A minimum of 3 points/dots is required.
                </span>
              </div>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mb-4 overflow-x-auto">
            {languageTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveLanguage(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Zone Name ({activeLanguage === "default" ? "Default" : languageTabs.find(t => t.key === activeLanguage)?.label})
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Type new zone name here"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Zone Display Name ({activeLanguage === "default" ? "Default" : languageTabs.find(t => t.key === activeLanguage)?.label})
                </label>
                <input
                  type="text"
                  value={zoneDisplayName}
                  onChange={(e) => setZoneDisplayName(e.target.value)}
                  placeholder="Write a New Display Zone Name"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mb-4">
              <div className="w-full h-96 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Map will be integrated here</p>
                  <p className="text-xs text-slate-400 mt-1">Interactive map with zone drawing tools</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Zone List Section */}
        <div>
          <ZonesTopbar
            title="Zone List"
            count={filteredZones.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            activeFiltersCount={activeFiltersCount}
            onExport={handleExport}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />

          <ZonesTable
            zones={filteredZones}
            visibleColumns={visibleColumns}
            onEditZone={handleEditZone}
            onViewZone={handleViewZone}
            onStatusToggle={handleStatusToggle}
            onMakeDefault={handleMakeDefault}
          />
        </div>

        {/* Filter Panel */}
        <ZoneFilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {/* Settings Dialog */}
        <SettingsDialog
          isOpen={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          resetColumns={resetColumns}
          columnsConfig={columnConfig}
        />

        {/* Edit Zone Dialog */}
        <EditZoneDialog
          isOpen={isEditZoneOpen}
          onOpenChange={setIsEditZoneOpen}
          zone={selectedZone}
          onSave={handleSaveZone}
        />

        {/* View Zone Dialog */}
        <ViewZoneDialog
          isOpen={isViewZoneOpen}
          onOpenChange={setIsViewZoneOpen}
          zone={selectedZone}
        />
      </div>
    </div>
  )
}
