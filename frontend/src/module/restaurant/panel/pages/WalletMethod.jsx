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
import { UserCircle, Search, Plus, Eye, Pencil } from "lucide-react"
import Footer from "../components/Footer"

// Mock withdrawal methods data
const mockMethods = [
  {
    id: 1,
    name: "6cash",
    methodFields: [
      { label: "Account name", value: "Pichart" },
      { label: "Account number", value: "017" },
    ],
    activeStatus: true,
    defaultMethod: true,
  },
]

export default function WalletMethod() {
  const [searchQuery, setSearchQuery] = useState("")
  const [methods, setMethods] = useState(mockMethods)

  const filteredMethods = methods.filter((method) =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleActive = (id) => {
    setMethods(
      methods.map((method) =>
        method.id === id ? { ...method, activeStatus: !method.activeStatus } : method
      )
    )
  }

  const handleToggleDefault = (id) => {
    setMethods(
      methods.map((method) =>
        method.id === id
          ? { ...method, defaultMethod: !method.defaultMethod }
          : { ...method, defaultMethod: false }
      )
    )
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <UserCircle className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Method Setup</h1>
      </div>

      {/* Withdrawal Methods Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Withdrawal Methods</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredMethods.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ex: Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 h-10"
                />
              </div>

              {/* Add New Method Button */}
              <Button
                type="button"
                onClick={() => alert("Add new wallet method functionality will open a form here")}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Method
              </Button>
            </div>
          </div>

          {/* Methods Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-16 text-sm font-semibold text-gray-700">SI</TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Payment Method Name
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Method Fields
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Active Status
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Default Method
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMethods.map((method, index) => (
                  <TableRow
                    key={method.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {method.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {method.methodFields.map((field, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            <span className="font-medium">{field.label}:</span>{" "}
                            <span>{field.value}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={method.activeStatus}
                        onCheckedChange={() => handleToggleActive(method.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={method.defaultMethod}
                        onCheckedChange={() => handleToggleDefault(method.id)}
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
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
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

