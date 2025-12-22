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
  Users,
  Search,
  Plus,
  User,
  Download,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"

// Mock employee data
const mockEmployees = [
  {
    id: 1,
    name: "Martin 123",
    email: "test@gmail.com",
    phone: "+8801234567890",
    role: "Manager",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
]

export default function AllEmployee() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEmployees = mockEmployees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const maskEmail = (email) => {
    if (!email) return ""
    const [localPart, domain] = email.split("@")
    if (localPart.length <= 1) return email
    const masked = localPart[0] + "*".repeat(localPart.length - 1)
    return `${masked} @${domain}`
  }

  const maskPhone = (phone) => {
    if (!phone) return ""
    return phone.slice(0, 2) + "*".repeat(phone.length - 2)
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Employee List</h1>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredEmployees.length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Actions Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Ex: Search by Employee N"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 h-10"
              />
            </div>

            {/* Add New Employee Button */}
            <Button
              onClick={() => navigate("/restaurant-panel/all-employee/add")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              <User className="h-4 w-4 mr-2" />
              Add New Employee
            </Button>

            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Employee List Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Phone</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Role</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee, index) => (
                  <TableRow
                    key={employee.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none"
                              e.target.nextSibling.style.display = "flex"
                            }}
                          />
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center hidden">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {employee.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {maskEmail(employee.email)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {maskPhone(employee.phone)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{employee.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Footer Section */}
      <Footer />
    </div>
  )
}

