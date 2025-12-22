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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  ChefHat,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/Footer"

// Mock addon data
const mockAddons = [
  { id: 1, name: "Cheese", price: 15.00, stockType: "Unlimited", stock: "Unlimited", status: true },
  { id: 2, name: "Coke", price: 12.00, stockType: "Unlimited", stock: "Unlimited", status: true },
  { id: 3, name: "Extra Chicken", price: 12.00, stockType: "Unlimited", stock: "Unlimited", status: true },
  { id: 4, name: "Extra Meat", price: 14.00, stockType: "Unlimited", stock: "Unlimited", status: true },
  { id: 5, name: "Extra Spice", price: 9.00, stockType: "Unlimited", stock: "Unlimited", status: true },
  { id: 6, name: "Pepsi", price: 18.00, stockType: "Unlimited", stock: "Unlimited", status: true },
  { id: 7, name: "Sauce", price: 11.00, stockType: "Unlimited", stock: "Unlimited", status: true },
]

const languages = [
  { value: "default", label: "Default" },
  { value: "en", label: "English(EN)" },
  { value: "bn", label: "Bengali - বাংলা(BN)" },
  { value: "ar", label: "Arabic - العربية (AR)" },
  { value: "es", label: "Spanish - español(ES)" },
]

export default function Addons() {
  const [selectedLanguage, setSelectedLanguage] = useState("default")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stockType, setStockType] = useState("unlimited")
  const [category, setCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [addons, setAddons] = useState(mockAddons)

  const filteredAddons = addons.filter((addon) =>
    addon.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleStatus = (id) => {
    setAddons(addons.map((addon) => 
      addon.id === id ? { ...addon, status: !addon.status } : addon
    ))
  }

  const handleReset = () => {
    setName("")
    setPrice("")
    setStockType("unlimited")
    setCategory("")
    setSelectedLanguage("default")
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log("Submitting addon:", { name, price, stockType, category, selectedLanguage })
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Add New Addon Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Add New Addon</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Language Tabs */}
          <div className="space-y-3">
            <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <TabsList className="inline-flex w-full h-10 bg-gray-100 rounded-lg p-1 gap-1">
                {languages.map((lang) => (
                  <TabsTrigger
                    key={lang.value}
                    value={lang.value}
                    className="flex-1 text-xs py-2 font-medium text-gray-900 data-[state=active]:bg-amber-50 data-[state=active]:text-gray-900 rounded-md transition-all"
                  >
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Name</Label>
              <Input
                placeholder="Ex : Water"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Price</Label>
              <Input
                type="number"
                placeholder="Ex : 100.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Stock Type</Label>
              <Select value={stockType} onValueChange={setStockType}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited Stock</SelectItem>
                  <SelectItem value="limited">Limited Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Select category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beverages">Beverages</SelectItem>
                  <SelectItem value="extras">Extras</SelectItem>
                  <SelectItem value="sauces">Sauces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 h-10 px-6 font-semibold"
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-semibold"
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Addon List Section */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Addon List</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredAddons.length}
            </span>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Ex : Search by Addon Name or"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 h-10"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-16 text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        SI
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        Name
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        Price
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        Stock Type
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        Stock
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        Action
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAddons.map((addon, index) => (
                    <TableRow
                      key={addon.id}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <TableCell className="text-sm text-gray-700 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900">
                        {addon.name}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900">
                        $ {addon.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {addon.stockType}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {addon.stock}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={addon.status}
                          onCheckedChange={() => handleToggleStatus(addon.id)}
                          className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

