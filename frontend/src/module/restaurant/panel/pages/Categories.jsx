import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

// Import category images
import categoryImg1 from "@/assets/restaurant icons/category/1.png"
import categoryImg2 from "@/assets/restaurant icons/category/2.png"
import categoryImg3 from "@/assets/restaurant icons/category/3.png"
import categoryImg4 from "@/assets/restaurant icons/category/4.png"
import categoryImg5 from "@/assets/restaurant icons/category/5.png"
import categoryImg6 from "@/assets/restaurant icons/category/6.png"

const categoryImages = [
  categoryImg1,
  categoryImg2,
  categoryImg3,
  categoryImg4,
  categoryImg5,
  categoryImg6,
]

// Mock category data
const mockCategories = [
  { id: 20, name: "Varieties", image: categoryImg1 },
  { id: 19, name: "Japanese", image: categoryImg2 },
  { id: 18, name: "American", image: categoryImg3 },
  { id: 17, name: "Italian", image: categoryImg4 },
  { id: 16, name: "Pasta", image: categoryImg5 },
  { id: 15, name: "Mexican Food", image: categoryImg6 },
  { id: 14, name: "Noodles", image: categoryImg1 },
  { id: 13, name: "Indian", image: categoryImg2 },
  { id: 12, name: "Chinese", image: categoryImg3 },
  { id: 11, name: "Fast Food", image: categoryImg4 },
  { id: 10, name: "Spanish", image: categoryImg5 },
  { id: 9, name: "French", image: categoryImg6 },
  { id: 8, name: "Sea Food", image: categoryImg1 },
  { id: 7, name: "Caribbean", image: categoryImg2 },
  { id: 6, name: "Bengali", image: categoryImg3 },
  { id: 5, name: "Thai", image: categoryImg4 },
]

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900">Category List</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredCategories.length}
            </span>
          </div>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Ex : Search by category name.."
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
                  <TableHead className="w-24 text-sm font-semibold text-gray-700">Image</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Category Id</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Category Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {category.id}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {category.name}
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

