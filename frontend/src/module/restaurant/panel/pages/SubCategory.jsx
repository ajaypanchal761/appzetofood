import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Grid3x3, Search } from "lucide-react"
import Footer from "../components/Footer"

// Mock sub-category data
const mockSubCategories = [
  { id: 36, category: "Spanish", subCategory: "Soft Drinks" },
  { id: 35, category: "Spanish", subCategory: "Macchiato" },
  { id: 34, category: "Spanish", subCategory: "Cappuccino" },
  { id: 33, category: "Spanish", subCategory: "Robusta" },
  { id: 32, category: "Spanish", subCategory: "Black Coffee" },
  { id: 31, category: "French", subCategory: "Red Velvet" },
  { id: 30, category: "French", subCategory: "Yellow Butter" },
  { id: 29, category: "French", subCategory: "Pound Cake" },
  { id: 28, category: "Bengali", subCategory: "Pimento Cheese" },
  { id: 27, category: "Bengali", subCategory: "Nutburger" },
  { id: 26, category: "Bengali", subCategory: "Theta Burger" },
  { id: 25, category: "Bengali", subCategory: "Steamed Cheese" },
  { id: 24, category: "Bengali", subCategory: "Kubie Burger" },
]

export default function SubCategory() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSubCategories = mockSubCategories.filter(
    (subCat) =>
      subCat.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subCat.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Grid3x3 className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Sub Category List</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredSubCategories.length}
            </span>
          </div>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Ex : Search by sub categories.."
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
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="w-24 text-sm font-semibold text-gray-700">Id</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Category</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Sub Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubCategories.map((subCat, index) => (
                  <TableRow
                    key={subCat.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {subCat.id}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {subCat.category}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {subCat.subCategory}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

