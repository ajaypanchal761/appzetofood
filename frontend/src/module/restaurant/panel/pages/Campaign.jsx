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
import { Megaphone, Search, FolderX, Eye, Pencil } from "lucide-react"
import Footer from "../components/Footer"

// Mock campaign data
const mockCampaigns = [
  {
    id: 1,
    title: "Summer Special Campaign",
    image: "https://via.placeholder.com/100",
    dateDuration: "01 Jun 2023 - 30 Jun 2023",
    timeDuration: "10:00 AM - 10:00 PM",
    status: true,
  },
  {
    id: 2,
    title: "Weekend Bonanza",
    image: "https://via.placeholder.com/100",
    dateDuration: "15 Jul 2023 - 20 Jul 2023",
    timeDuration: "12:00 PM - 11:00 PM",
    status: true,
  },
  {
    id: 3,
    title: "New Year Celebration",
    image: "https://via.placeholder.com/100",
    dateDuration: "25 Dec 2023 - 05 Jan 2024",
    timeDuration: "09:00 AM - 11:00 PM",
    status: false,
  },
]

export default function Campaign() {
  const [searchQuery, setSearchQuery] = useState("")
  const [campaigns] = useState(mockCampaigns)

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Campaign</h1>
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
            placeholder="Ex : Search by Title name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 h-10"
          />
        </div>
      </div>

      {/* Campaign Table with No Data State */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">Sl</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Title</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Image</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Date Duration</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Time Duration</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="flex items-center justify-center w-32 h-24 mb-4">
                          <FolderX className="h-16 w-16 text-gray-400" />
                        </div>
                        <div className="text-sm font-medium">No Data Found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign, index) => (
                    <TableRow key={campaign.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="text-sm text-gray-700 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 font-semibold">
                        {campaign.title}
                      </TableCell>
                      <TableCell>
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {campaign.dateDuration}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {campaign.timeDuration}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {campaign.status ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

