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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tv, Search, Plus, MoreVertical, Settings, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"

// Mock ads data
const mockAds = [
  {
    id: 1,
    adsId: "1000003",
    adsType: "Restaurant Promotion",
    adsTitle: "Taste the Flavor! Fo...",
    duration: "16 Jul 2025 - 05 Mar 2028",
    status: "Running",
  },
  {
    id: 2,
    adsId: "1000000",
    adsType: "Restaurant Promotion",
    adsTitle: "Incredible Savings!...",
    duration: "16 Jul 2025 - 13 Jun 2028",
    status: "Running",
  },
]

export default function AdsList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredAds = mockAds.filter(
    (ad) =>
      (ad.adsId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.adsTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.adsType.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterType === "all" || ad.status.toLowerCase() === filterType.toLowerCase())
  )

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Tv className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Ads List</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredAds.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* New Advertisement Button */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
            onClick={() => navigate("/restaurant-panel/new-ads")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Advertisement
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by ads ID or restau"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 h-10 w-full"
          />
        </div>

        {/* All Ads Dropdown */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="flex-1 bg-white border-gray-200 h-10 text-sm [&>svg:last-child]:hidden">
            <div className="flex items-center gap-2 w-full">
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <SelectValue placeholder="All Ads" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg">
            <SelectItem value="all" className="bg-white hover:bg-gray-50 text-sm">
              All Ads
            </SelectItem>
            <SelectItem value="running" className="bg-white hover:bg-gray-50 text-sm">
              Running
            </SelectItem>
            <SelectItem value="expired" className="bg-white hover:bg-gray-50 text-sm">
              Expired
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ads Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Ads ID</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Ads Type</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Ads Title</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Duration</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad, index) => (
                  <TableRow
                    key={ad.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        {ad.adsId}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {ad.adsType}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {ad.adsTitle}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {ad.duration}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.status === "Running"
                            ? "bg-blue-100 text-blue-700"
                            : ad.status === "Expired"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ad.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white border-gray-200">
                          <DropdownMenuItem className="bg-white hover:bg-gray-50 text-sm">
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="bg-white hover:bg-gray-50 text-sm">
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="bg-white hover:bg-gray-50 text-sm text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

