import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Settings,
  Search,
  Eye,
  Pencil,
  Trash2,
  Building2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/Footer"

const languages = [
  { id: "default", label: "Default" },
  { id: "english", label: "English(EN)" },
  { id: "bengali", label: "Bengali - বাংলা(BN)" },
  { id: "arabic", label: "Arabic - العربية (AR)" },
  { id: "spanish", label: "Spanish - español(ES)" },
]

const permissionCategories = [
  {
    id: "general",
    title: "General",
    permissions: ["Dashboard", "Chat", "Pos system"],
  },
  {
    id: "ads-promotions",
    title: "Ads & Promotions",
    permissions: ["New Ads", "Ads List", "Campaign", "Coupon"],
  },
  {
    id: "food-management",
    title: "Food Management",
    permissions: ["Food", "Category", "Addon", "Reviews"],
  },
  {
    id: "order-managements",
    title: "Order Managements",
    permissions: ["Regular Orders", "Subscription Orders"],
  },
  {
    id: "wallet-management",
    title: "Wallet Management",
    permissions: ["My Wallet", "Wallet Method"],
  },
  {
    id: "employee-management",
    title: "Employee Management",
    permissions: ["Role Management", "All Employee"],
  },
  {
    id: "reports",
    title: "Reports",
    permissions: [
      "Expense Report",
      "Transaction",
      "Disbursement",
      "Order Report",
      "Food Report",
      "Tax Report",
    ],
  },
  {
    id: "business-management",
    title: "Business Management",
    permissions: [
      "My Restaurant",
      "Restaurant Config",
      "Business Plan",
      "My QR Code",
      "Notification Setup",
    ],
  },
]

const mockRoles = [
  {
    id: 1,
    roleName: "Manager",
    modules:
      "Dashboard, Chat, Pos, New Ads, Ads List, Campaign, Coupon, Food, Category, Addon, Reviews, Regular Order, Subscription Order, My Wallet, Wallet Method, Role Management, All Employee, Expense Report, Transaction, Disbursement, Order Report, Food Report, Tax Report, My Restaurant, Restaurant Config, Business Plan, My Qr Code, Notification Setup,",
    createdAt: "20 Jan 2022",
  },
]

export default function EmployeeRole() {
  const [activeLanguage, setActiveLanguage] = useState("default")
  const [roleName, setRoleName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [allModulePermission, setAllModulePermission] = useState(false)
  const [permissions, setPermissions] = useState(() => {
    const initialPermissions = {}
    permissionCategories.forEach((category) => {
      initialPermissions[category.id] = {
        selectAll: false,
        permissions: category.permissions.reduce((acc, perm) => {
          acc[perm] = false
          return acc
        }, {}),
      }
    })
    return initialPermissions
  })

  const handleCategorySelectAll = (categoryId) => {
    const category = permissionCategories.find((cat) => cat.id === categoryId)
    const currentState = permissions[categoryId].selectAll

    setPermissions((prev) => ({
      ...prev,
      [categoryId]: {
        selectAll: !currentState,
        permissions: category.permissions.reduce((acc, perm) => {
          acc[perm] = !currentState
          return acc
        }, {}),
      },
    }))
  }

  const handlePermissionToggle = (categoryId, permission) => {
    setPermissions((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        permissions: {
          ...prev[categoryId].permissions,
          [permission]: !prev[categoryId].permissions[permission],
        },
      },
    }))

    // Update select all if all permissions are checked/unchecked
    const category = permissionCategories.find((cat) => cat.id === categoryId)
    const allChecked = category.permissions.every(
      (perm) =>
        (perm === permission
          ? !prev[categoryId].permissions[permission]
          : prev[categoryId].permissions[perm]) || perm === permission
    )

    setPermissions((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        selectAll: allChecked,
      },
    }))
  }

  const handleAllModulePermission = (checked) => {
    setAllModulePermission(checked)
    const newPermissions = {}
    permissionCategories.forEach((category) => {
      newPermissions[category.id] = {
        selectAll: checked,
        permissions: category.permissions.reduce((acc, perm) => {
          acc[perm] = checked
          return acc
        }, {}),
      }
    })
    setPermissions(newPermissions)
  }

  const handleReset = () => {
    setRoleName("")
    setAllModulePermission(false)
    const resetPermissions = {}
    permissionCategories.forEach((category) => {
      resetPermissions[category.id] = {
        selectAll: false,
        permissions: category.permissions.reduce((acc, perm) => {
          acc[perm] = false
          return acc
        }, {}),
      }
    })
    setPermissions(resetPermissions)
  }

  const handleSubmit = () => {
    // Handle submit logic here
    console.log("Submitting role:", { roleName, permissions })
  }

  const filteredRoles = mockRoles.filter((role) =>
    role.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Employee Role</h1>
      </div>

      {/* Role Form Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Role form</h2>
          <p className="text-sm text-gray-600 mb-6">
            Create role and assignee the role module & usage permission.
          </p>

          {/* Language Tabs */}
          <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="mb-4">
            <TabsList className="inline-flex w-full h-10 bg-gray-100 rounded-lg p-1 gap-1">
              {languages.map((lang) => (
                <TabsTrigger
                  key={lang.id}
                  value={lang.id}
                  className="flex-1 text-xs font-medium text-gray-900 py-2 data-[state=active]:bg-amber-50 data-[state=active]:text-gray-900 rounded-md transition-all"
                >
                  {lang.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Role Name Input */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Role Name ({languages.find((l) => l.id === activeLanguage)?.label.split("(")[0] ||
                "Default"})
            </Label>
            <Input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Role name example"
              className="w-full max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Module Wise Permission Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Module Wise Permission :</h2>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-module-permission"
                checked={allModulePermission}
                onCheckedChange={handleAllModulePermission}
              />
              <Label
                htmlFor="all-module-permission"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                All Module Permission
              </Label>
            </div>
          </div>

          {/* Permission Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {permissionCategories.map((category) => (
              <Card key={category.id} className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`select-all-${category.id}`}
                        checked={permissions[category.id]?.selectAll || false}
                        onCheckedChange={() => handleCategorySelectAll(category.id)}
                      />
                      <Label
                        htmlFor={`select-all-${category.id}`}
                        className="text-xs text-gray-600 cursor-pointer"
                      >
                        Select All
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.id}-${permission}`}
                          checked={permissions[category.id]?.permissions[permission] || false}
                          onCheckedChange={() => handlePermissionToggle(category.id, permission)}
                        />
                        <Label
                          htmlFor={`${category.id}-${permission}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset} className="border-gray-200">
              Reset
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">Roles Table</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {filteredRoles.length}
              </span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Ex: Search by Role Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 h-10"
              />
            </div>
          </div>

          {/* Roles Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      SI
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                        <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Role Name
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                        <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Modules
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                        <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Created At
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                        <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Action
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 text-gray-400" />
                        <ChevronDown className="h-3 w-3 text-gray-400 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role, index) => (
                  <TableRow
                    key={role.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {role.roleName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 max-w-md">
                      <div className="truncate" title={role.modules}>
                        {role.modules}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{role.createdAt}</TableCell>
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

