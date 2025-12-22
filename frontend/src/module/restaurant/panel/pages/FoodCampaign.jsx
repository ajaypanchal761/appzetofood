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
import { Switch } from "@/components/ui/switch"
import { Megaphone, Search, Eye, ArrowUpDown } from "lucide-react"
import Footer from "../components/Footer"

// Mock food campaign data
const mockFoodCampaigns = [
  {
    id: 1,
    title: "Cappuccino Coffee",
    date: "29 Dec 2024 - 27 Aug 2025",
    time: "02:00 pm - 10:00 pm",
    price: "50",
    status: true,
  },
  {
    id: 2,
    title: "Cheese Burger",
    date: "29 Dec 2024 - 04 Jun 2025",
    time: "02:50 am - 07:50 pm",
    price: "150",
    status: true,
  },
  {
    id: 3,
    title: "Spicy Crab Early Food",
    date: "29 Dec 2024 - 21 Aug 2025",
    time: "12:01 am - 11:59 pm",
    price: "400",
    status: true,
  },
]

export default function FoodCampaign() {
  const [searchQuery, setSearchQuery] = useState("")
  const [campaigns, setCampaigns] = useState(mockFoodCampaigns)

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleStatus = (id) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, status: !campaign.status } : campaign
      )
    )
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Food Campaign</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredCampaigns.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Ex : title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 h-10"
          />
        </div>
      </div>

      {/* Food Campaign Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      SI
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Title
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Time
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
                {filteredCampaigns.map((campaign, index) => (
                  <TableRow
                    key={campaign.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        {campaign.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {campaign.date}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {campaign.time}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {campaign.price}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={campaign.status}
                        onCheckedChange={() => handleToggleStatus(campaign.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

