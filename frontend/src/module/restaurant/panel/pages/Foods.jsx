import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Filter,
  Plus,
  Search,
  Download,
  ChevronDown,
  ArrowUpDown,
  Pencil,
  Trash2,
  Settings,
  FileText,
  FileSpreadsheet,
  Code,
  Check,
  Columns,
} from "lucide-react"
import Footer from "../components/Footer"
import { exportFoodsToCSV, exportFoodsToExcel, exportFoodsToPDF, exportFoodsToJSON } from "../components/exports/foodsExportUtils"

// Import Top Rated Foods images
import topRated1 from "@/assets/restaurant icons/Top rated foods/1.png"
import topRated2 from "@/assets/restaurant icons/Top rated foods/2.png"
import topRated3 from "@/assets/restaurant icons/Top rated foods/3.png"
import topRated4 from "@/assets/restaurant icons/Top rated foods/4.png"
import topRated5 from "@/assets/restaurant icons/Top rated foods/4.png"
import topRated6 from "@/assets/restaurant icons/Top rated foods/6.png"
import topRated7 from "@/assets/restaurant icons/Top rated foods/5.png"

// Mock food items data
const foodItems = [
  {
    id: 1,
    name: "Medu Vada",
    image: topRated1,
    category: "Varieties",
    price: 95.0,
    recommended: true,
    status: true,
  },
  {
    id: 2,
    name: "Grilled Lemon Herb M...",
    image: topRated2,
    category: "Varieties",
    price: 320.0,
    recommended: true,
    status: true,
  },
  {
    id: 3,
    name: "Meat Pizza",
    image: topRated3,
    category: "Italian",
    price: 400.0,
    recommended: true,
    status: true,
  },
  {
    id: 4,
    name: "Cheese Pizza",
    image: topRated4,
    category: "Italian",
    price: 250.0,
    recommended: false,
    status: true,
  },
  {
    id: 5,
    name: "Thai Fried Rice",
    image: topRated5,
    category: "Varieties",
    price: 160.0,
    recommended: false,
    status: true,
  },
  {
    id: 6,
    name: "FRIED RICE",
    image: topRated6,
    category: "Varieties",
    price: 120.0,
    recommended: false,
    status: true,
  },
  {
    id: 7,
    name: "Steak Kebabs",
    image: topRated7,
    category: "Varieties",
    price: 160.0,
    recommended: false,
    status: true,
  },
]

export default function Foods() {
  const [searchQuery, setSearchQuery] = useState("")
  const [foods, setFoods] = useState(foodItems)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    name: true,
    category: true,
    price: true,
    recommended: true,
    status: true,
    actions: true,
  })

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return foods
    }
    
    const query = searchQuery.toLowerCase().trim()
    return foods.filter((food) =>
      food.name.toLowerCase().includes(query) ||
      food.category.toLowerCase().includes(query)
    )
  }, [foods, searchQuery])

  const handleRecommendedToggle = (id) => {
    setFoods(
      foods.map((food) =>
        food.id === id ? { ...food, recommended: !food.recommended } : food
      )
    )
  }

  const handleStatusToggle = (id) => {
    setFoods(
      foods.map((food) =>
        food.id === id ? { ...food, status: !food.status } : food
      )
    )
  }

  const handleDelete = (id) => {
    const food = foods.find(f => f.id === id)
    setSelectedFood(food)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (selectedFood) {
      setFoods(foods.filter((food) => food.id !== selectedFood.id))
      setIsDeleteOpen(false)
      setSelectedFood(null)
    }
  }

  const handleExport = (format) => {
    if (filteredFoods.length === 0) {
      alert("No data to export")
      return
    }
    switch (format) {
      case "csv": exportFoodsToCSV(filteredFoods); break
      case "excel": exportFoodsToExcel(filteredFoods); break
      case "pdf": exportFoodsToPDF(filteredFoods); break
      case "json": exportFoodsToJSON(filteredFoods); break
    }
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      name: true,
      category: true,
      price: true,
      recommended: true,
      status: true,
      actions: true,
    })
  }

  const columnsConfig = {
    si: "Serial Number",
    name: "Name",
    category: "Category",
    price: "Price",
    recommended: "Recommended",
    status: "Status",
    actions: "Actions",
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">Food List</h1>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {filteredFoods.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            Out of Stock Foods
          </Button>
          <Link to="/restaurant-panel/foods/add">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Food
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Ex: Search Food Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-full h-10 text-sm bg-white border-gray-200"
          />
        </div>
        <Button
          variant="outline"
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1">
            <DropdownMenuLabel className="px-3 py-2">Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
              <FileText className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")} className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
              <Code className="w-4 h-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          onClick={() => setIsSettingsOpen(true)}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Food List Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {visibleColumns.si && (
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      SI
                      <ArrowUpDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.name && (
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.category && (
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Category
                      <ArrowUpDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.price && (
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Price
                      <ArrowUpDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.recommended && (
                  <TableHead className="font-semibold text-gray-700">Recommended</TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                )}
                {visibleColumns.actions && (
                  <TableHead className="font-semibold text-gray-700 text-center">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFoods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={Object.values(visibleColumns).filter(v => v).length} className="py-8 text-center text-gray-500">
                    No foods found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFoods.map((food, index) => (
                  <TableRow key={food.id} className="hover:bg-gray-50">
                    {visibleColumns.si && (
                      <TableCell className="text-sm text-gray-700">{index + 1}</TableCell>
                    )}
                    {visibleColumns.name && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="text-sm font-medium text-gray-900">{food.name}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.category && (
                      <TableCell className="text-sm text-gray-700">{food.category}</TableCell>
                    )}
                    {visibleColumns.price && (
                      <TableCell className="text-sm font-semibold text-gray-900">
                        $ {food.price.toFixed(2)}
                      </TableCell>
                    )}
                    {visibleColumns.recommended && (
                      <TableCell>
                        <Switch
                          checked={food.recommended}
                          onCheckedChange={() => handleRecommendedToggle(food.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </TableCell>
                    )}
                    {visibleColumns.status && (
                      <TableCell>
                        <Switch
                          checked={food.status}
                          onCheckedChange={() => handleStatusToggle(food.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </TableCell>
                    )}
                    {visibleColumns.actions && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(food.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-white p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Delete Food</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete "{selectedFood?.name}"? This action cannot be undone.
            </p>
          </div>
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md bg-white p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Table Settings
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Columns className="w-4 h-4" />
                Visible Columns
              </h3>
              <div className="space-y-2">
                {Object.entries(columnsConfig).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[key]}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                    {visibleColumns[key] && (
                      <Check className="w-4 h-4 text-emerald-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={resetColumns}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset
              </Button>
              <Button
                onClick={() => setIsSettingsOpen(false)}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}
