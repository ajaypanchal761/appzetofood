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
import {
  Search,
  ShoppingBag,
  Trash2,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react"
import Footer from "../components/Footer"

// Import Top Rated Foods images
import topRated1 from "@/assets/restaurant icons/Top rated foods/1.png"
import topRated2 from "@/assets/restaurant icons/Top rated foods/2.png"
import topRated3 from "@/assets/restaurant icons/Top rated foods/3.png"

// Mock food items data
const foodItems = [
  {
    id: 1,
    name: "Medu Vada",
    price: 95.0,
    image: topRated1,
  },
  {
    id: 2,
    name: "Grilled Lemo...",
    price: 320.0,
    image: topRated2,
  },
  {
    id: 3,
    name: "Cheese Pizza",
    price: 232.5,
    image: topRated3,
  },
]

// Mock categories
const categories = [
  "All categories",
  "Bengali",
  "Caribbean",
  "Sea Food",
  "French",
]

// Mock customers
const customers = [
  { id: 1, name: "Walk in customer", phone: "" },
  { id: 2, name: "Spencer Hastings", phone: "**********" },
  { id: 3, name: "Kamrujjaman Joy", phone: "**********" },
  { id: 4, name: "Guy Hawkins", phone: "**********" },
  { id: 5, name: "Alif Emran Emon", phone: "**********" },
]

export default function PointOfSale() {
  const [selectedCategory, setSelectedCategory] = useState("All categories")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("Walk in customer")
  const [orderType, setOrderType] = useState("Take Away")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [paidAmount, setPaidAmount] = useState(0)
  const [cartItems, setCartItems] = useState([])

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      )
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
  }

  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId))
  }

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId)
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }

  const subtotal = calculateSubtotal()
  const addon = 0
  const discount = 0
  const deliveryFee = 0
  const vatTax = 0
  const serviceCharge = 0
  const extraPackaging = 0
  const total = subtotal + addon - discount + deliveryFee + vatTax + serviceCharge + extraPackaging
  const changeAmount = paidAmount - total

  const handleClearCart = () => {
    setCartItems([])
    setPaidAmount(0)
  }

  const handlePlaceOrder = () => {
    // Handle place order logic
    console.log("Placing order...")
  }

  return (
    <div className="space-y-6">
      {/* Main Content - Two Cards in Flex */}
      <div className="flex gap-6">
        {/* Food Section Card - Left (Wider) */}
        <Card className="flex-[3]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Food Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Filters */}
            <div className="flex gap-3 items-center">
              {/* Category Dropdown */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 h-9 bg-white border-gray-200 text-xs [&>svg:last-child]:hidden">
                  <div className="flex items-center justify-between w-full pr-6">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                      <SelectValue placeholder="All categories" />
                    </div>
                    {selectedCategory && selectedCategory !== "All categories" && (
                      <Check className="h-3 w-3 text-primary-orange" />
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className={`text-xs ${selectedCategory === category
                        ? "bg-orange-50 text-gray-900"
                        : "bg-white hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{category}</span>
                        {selectedCategory === category && (
                          <Check className="h-3 w-3 text-primary-orange ml-2" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Ex: Search Food Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 bg-white border-gray-200 text-xs"
                />
              </div>
            </div>

            {/* Food Items Grid */}
            <div className="grid grid-cols-3 gap-4">
              {foodItems.map((item, index) => (
                <div
                  key={item.id}
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleAddToCart(item)}
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-[#E5E7EB]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-[#111827] mb-1 line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-[#9BA6B7]">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Section Card - Right (Narrower) */}
        <Card className="flex-[1]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Billing Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger className="w-full h-9 bg-white border-gray-200 text-xs [&>svg:last-child]:hidden">
                  <div className="flex items-center gap-2 w-full">
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <SelectValue placeholder="Walk In Customer" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.id}
                      value={customer.name}
                      className={`text-xs ${selectedCustomer === customer.name
                        ? "bg-orange-50 text-gray-900"
                        : "bg-white hover:bg-gray-50"
                        }`}
                    >
                      <span>
                        {customer.name}{" "}
                        {customer.phone && `(${customer.phone})`}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1.5" />
                Add New Customer
              </Button>
            </div>

            {/* Order Type Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Select Order Type
              </Label>
              <div className="flex gap-4">
                {["Take Away", "Dine In", "Home Delivery"].map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={type}
                      name="orderType"
                      value={type}
                      checked={orderType === type}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <Label
                      htmlFor={type}
                      className="text-xs text-gray-700 cursor-pointer font-normal"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Order List Table */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-semibold text-gray-700 border-b border-gray-200 pb-1.5">
                <div>Item</div>
                <div>Qty</div>
                <div>Price</div>
                <div>Delete</div>
              </div>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <ShoppingBag className="h-6 w-6 mb-1.5" />
                  <p className="text-xs">No Items added yet</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-4 gap-1.5 items-center text-xs border-b border-gray-100 pb-1.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                        <span className="text-[10px] font-medium text-gray-700 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 w-5 p-0 text-[10px]"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="text-[10px] font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 w-5 p-0 text-[10px]"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-[10px] font-semibold text-gray-700">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-1.5 border-t border-gray-200 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Addon:</span>
                <span className="font-semibold text-gray-900">
                  $ {addon.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal :</span>
                <span className="font-semibold text-gray-900">
                  $ {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Discount :</span>
                <span className="font-semibold text-red-600">
                  - $ {discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Delivery fee :</span>
                <span className="font-semibold text-gray-900">
                  $ {deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Vat/tax:</span>
                <span className="font-semibold text-gray-900">
                  $ {vatTax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Service Charge :</span>
                <span className="font-semibold text-gray-900">
                  $ {serviceCharge.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Extra Packaging Amount :</span>
                <span className="font-semibold text-gray-900">
                  $ {extraPackaging.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Paid by
              </Label>
              <div className="flex gap-1.5">
                {["Cash", "Card", "Wallet"].map((method) => (
                  <Button
                    key={method}
                    variant={paymentMethod === method ? "default" : "outline"}
                    className={`text-xs h-8 ${paymentMethod === method
                      ? "bg-gray-700 hover:bg-gray-800 text-white"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>

            {/* Paid Amount and Change */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-gray-700">
                  Paid Amount :
                </Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-28 h-8 text-xs text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-gray-700">
                  Change Amount :
                </Label>
                <div className="w-28 text-right text-xs font-semibold text-gray-900">
                  $ {changeAmount >= 0 ? changeAmount.toFixed(2) : "0.00"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1.5">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 text-xs"
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 font-semibold h-9 text-xs"
                onClick={handleClearCart}
              >
                Clear Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  )
}
