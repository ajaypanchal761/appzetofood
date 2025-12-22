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
  Tag,
  Calendar,
  Sparkles,
  Download,
  Search,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/Footer"

const languages = [
  { value: "default", label: "Default" },
  { value: "en", label: "English(EN)" },
  { value: "bn", label: "Bengali - বাংলা(BN)" },
  { value: "ar", label: "Arabic - العربية(AR)" },
  { value: "es", label: "Spanish - español(ES)" },
]

const initialCoupons = [
  {
    id: 1,
    title: "Festival",
    code: "fest",
    type: "Default",
    totalUses: 3,
    minPurchase: 50,
    maxDiscount: 2000,
    discount: 10,
    discountType: "Percent",
    startDate: "2023-02-07",
    expireDate: "2025-12-01",
    status: true,
  },
]

export default function Coupons() {
  const [activeLang, setActiveLang] = useState("default")
  const [title, setTitle] = useState("")
  const [couponType, setCouponType] = useState("default")
  const [code, setCode] = useState("")
  const [limitPerUser, setLimitPerUser] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [discountType, setDiscountType] = useState("amount")
  const [discount, setDiscount] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("0")
  const [minPurchase, setMinPurchase] = useState("0")
  const [searchQuery, setSearchQuery] = useState("")
  const [coupons, setCoupons] = useState(initialCoupons)

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleGenerateCode = () => {
    const random = Math.random().toString(36).substring(2, 10)
    setCode(random)
  }

  const handleToggleStatus = (id) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id ? { ...coupon, status: !coupon.status } : coupon
      )
    )
  }

  const handleReset = () => {
    setTitle("")
    setCouponType("default")
    setCode("")
    setLimitPerUser("")
    setStartDate("")
    setEndDate("")
    setDiscountType("amount")
    setDiscount("")
    setMaxDiscount("0")
    setMinPurchase("0")
    setActiveLang("default")
  }

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      alert("Please enter a coupon title")
      return
    }
    if (!code.trim()) {
      alert("Please enter or generate a coupon code")
      return
    }
    if (!startDate) {
      alert("Please select a start date")
      return
    }
    if (!endDate) {
      alert("Please select an expire date")
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after expire date")
      return
    }
    if (!discount.trim()) {
      alert("Please enter a discount amount")
      return
    }

    // Create new coupon
    const newCoupon = {
      id: coupons.length + 1,
      title: title.trim(),
      code: code.trim().toUpperCase(),
      type: couponType === "default" ? "Default" : "First Order",
      totalUses: 0,
      minPurchase: parseFloat(minPurchase) || 0,
      maxDiscount: parseFloat(maxDiscount) || 0,
      discount: parseFloat(discount) || 0,
      discountType: discountType === "amount" ? "Amount" : "Percent",
      startDate: startDate,
      expireDate: endDate,
      status: true,
    }

    // Add to list
    setCoupons((prev) => [newCoupon, ...prev])

    // Reset form
    handleReset()

    alert("Coupon added successfully!")
  }

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary-orange to-orange-500 text-white shadow-md">
            <Tag className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Coupon</h1>
        </div>
      </div>

      {/* Add New Coupon Form */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Add New Coupon
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Language Tabs */}
          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList className="inline-flex w-full h-10 bg-gray-100 rounded-lg p-1 gap-1 mb-4">
              {languages.map((lang) => (
                <TabsTrigger
                  key={lang.value}
                  value={lang.value}
                  className="flex-1 text-xs font-medium text-gray-900 py-2 data-[state=active]:bg-amber-50 data-[state=active]:text-gray-900 rounded-md transition-all"
                >
                  {lang.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Title ({languages.find((l) => l.value === activeLang)?.label.split("(")[0] ||
                "Default"}
              )
            </Label>
            <Input
              placeholder="New coupon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Main Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Coupon Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Coupon Type</Label>
              <Select value={couponType} onValueChange={setCouponType}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Default" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="first-order">First Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Code + Generate */}
            <div className="space-y-2 md:col-span-1 lg:col-span-1">
              <Label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>Code</span>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate Code
                </button>
              </Label>
              <Input
                placeholder="8om2rX7m"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Limit for same user */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Limit For Same User</Label>
              <Input
                placeholder="Ex : 10"
                value={limitPerUser}
                onChange={(e) => setLimitPerUser(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Start Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Expire Date */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Expire Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Amount ($)" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Amount ($)</SelectItem>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Discount</Label>
              <Input
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Max Discount */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Max Discount</Label>
              <Input
                placeholder="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Min Purchase */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Min Purchase</Label>
              <Input
                placeholder="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
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

      {/* Coupon List Section */}
      <div className="space-y-4">
        {/* List Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Coupon List</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {filteredCoupons.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Ex : Search by title or code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 h-10"
              />
            </div>
            <Button
              variant="outline"
              className="h-10 px-4 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
                        Sl
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Title
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Code
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Type
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Total Uses
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Min Purchase
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Max Discount
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Discount
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Discount Type
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Start Date
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Expire Date
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon, index) => (
                    <TableRow key={coupon.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="text-sm text-gray-700 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.title}</TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.code}</TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.type}</TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.totalUses}</TableCell>
                      <TableCell className="text-sm text-gray-900">
                        ${" "}
                        {coupon.minPurchase.toFixed
                          ? coupon.minPurchase.toFixed(2)
                          : coupon.minPurchase.toString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        ${" "}
                        {coupon.maxDiscount.toFixed
                          ? coupon.maxDiscount.toFixed(2)
                          : coupon.maxDiscount.toString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.discount}</TableCell>
                      <TableCell className="text-sm text-gray-900">
                        {coupon.discountType}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.startDate}</TableCell>
                      <TableCell className="text-sm text-gray-900">{coupon.expireDate}</TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.status}
                          onCheckedChange={() => handleToggleStatus(coupon.id)}
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

