import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

// Dummy data
const dummyZones = [
  { id: 1, name: 'North Zone' },
  { id: 2, name: 'South Zone' },
  { id: 3, name: 'East Zone' },
  { id: 4, name: 'West Zone' },
  { id: 5, name: 'Central Zone' }
]

const dummyRestaurants = [
  { id: 1, name: 'Spice Garden', zoneId: 1 },
  { id: 2, name: 'Tandoor Express', zoneId: 1 },
  { id: 3, name: 'Coastal Delights', zoneId: 2 },
  { id: 4, name: 'Punjabi Dhaba', zoneId: 2 },
  { id: 5, name: 'Chinese Wok', zoneId: 3 },
  { id: 6, name: 'Italian Bistro', zoneId: 3 },
  { id: 7, name: 'Burger House', zoneId: 4 },
  { id: 8, name: 'Pizza Corner', zoneId: 4 },
  { id: 9, name: 'Sweet Treats', zoneId: 5 },
  { id: 10, name: 'Cafe Mocha', zoneId: 5 }
]

const dummyCategories = [
  { id: 1, name: 'Biryani' },
  { id: 2, name: 'Starters' },
  { id: 3, name: 'Main Course' },
  { id: 4, name: 'Desserts' },
  { id: 5, name: 'Beverages' },
  { id: 6, name: 'Fast Food' }
]

const dummyFoodItems = [
  { id: 1, name: 'Chicken Biryani', categoryId: 1, restaurantId: 1, price: 250, addonPrice: 50 },
  { id: 2, name: 'Mutton Biryani', categoryId: 1, restaurantId: 1, price: 350, addonPrice: 50 },
  { id: 3, name: 'Veg Biryani', categoryId: 1, restaurantId: 1, price: 180, addonPrice: 30 },
  { id: 4, name: 'Paneer Tikka', categoryId: 2, restaurantId: 1, price: 220, addonPrice: 40 },
  { id: 5, name: 'Chicken Wings', categoryId: 2, restaurantId: 2, price: 280, addonPrice: 50 },
  { id: 6, name: 'Butter Chicken', categoryId: 3, restaurantId: 2, price: 320, addonPrice: 60 },
  { id: 7, name: 'Dal Makhani', categoryId: 3, restaurantId: 2, price: 200, addonPrice: 30 },
  { id: 8, name: 'Gulab Jamun', categoryId: 4, restaurantId: 9, price: 80, addonPrice: 0 },
  { id: 9, name: 'Ice Cream', categoryId: 4, restaurantId: 9, price: 120, addonPrice: 0 },
  { id: 10, name: 'Coca Cola', categoryId: 5, restaurantId: 10, price: 50, addonPrice: 0 },
  { id: 11, name: 'Coffee', categoryId: 5, restaurantId: 10, price: 100, addonPrice: 20 },
  { id: 12, name: 'Burger', categoryId: 6, restaurantId: 7, price: 150, addonPrice: 30 },
  { id: 13, name: 'French Fries', categoryId: 6, restaurantId: 7, price: 80, addonPrice: 20 },
  { id: 14, name: 'Margherita Pizza', categoryId: 6, restaurantId: 8, price: 300, addonPrice: 50 },
  { id: 15, name: 'Pepperoni Pizza', categoryId: 6, restaurantId: 8, price: 350, addonPrice: 50 }
]

const dummyCustomers = [
  { id: 1, name: 'John Doe', phone: '+1234567890' },
  { id: 2, name: 'Jane Smith', phone: '+1234567891' },
  { id: 3, name: 'Mike Johnson', phone: '+1234567892' },
  { id: 4, name: 'Sarah Williams', phone: '+1234567893' },
  { id: 5, name: 'David Brown', phone: '+1234567894' }
]

export default function PointOfSale() {
  // State management
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [orderType, setOrderType] = useState('takeaway')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cart, setCart] = useState([])
  const [customers, setCustomers] = useState(dummyCustomers)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  })

  // Filter restaurants based on selected zone
  const filteredRestaurants = useMemo(() => {
    if (!selectedZone) return []
    return dummyRestaurants.filter(r => r.zoneId === parseInt(selectedZone))
  }, [selectedZone])

  // Filter food items based on restaurant, category, and search
  const filteredFoodItems = useMemo(() => {
    if (!selectedRestaurant) return []
    
    let items = dummyFoodItems.filter(item => 
      item.restaurantId === parseInt(selectedRestaurant)
    )

    if (selectedCategory) {
      items = items.filter(item => item.categoryId === parseInt(selectedCategory))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item => 
        item.name.toLowerCase().includes(query)
      )
    }

    return items
  }, [selectedRestaurant, selectedCategory, searchQuery])

  // Filter categories based on selected restaurant
  const availableCategories = useMemo(() => {
    if (!selectedRestaurant) return []
    const restaurantItems = dummyFoodItems.filter(item => 
      item.restaurantId === parseInt(selectedRestaurant)
    )
    const categoryIds = [...new Set(restaurantItems.map(item => item.categoryId))]
    return dummyCategories.filter(cat => categoryIds.includes(cat.id))
  }, [selectedRestaurant])

  // Cart calculations
  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const addonTotal = cart.reduce((sum, item) => sum + (item.addonPrice * item.quantity), 0)
    const discount = subtotal * 0.1 // 10% discount
    const deliveryFee = orderType === 'delivery' ? 50 : 0
    const vatTax = (subtotal - discount) * 0.05 // 5% VAT
    const serviceCharge = (subtotal - discount) * 0.02 // 2% service charge
    const extraPackaging = cart.length * 10 // $10 per item
    const total = subtotal + addonTotal - discount + deliveryFee + vatTax + serviceCharge + extraPackaging

    return {
      addon: addonTotal,
      subtotal,
      discount,
      deliveryFee,
      vatTax,
      serviceCharge,
      extraPackaging,
      total
    }
  }, [cart, orderType])

  // Handlers
  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value)
    setSelectedRestaurant('')
    setSelectedCategory('')
    setSearchQuery('')
  }

  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value)
    setSelectedCategory('')
    setSearchQuery('')
  }

  const handleAddToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const handleQuantityChange = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change
        return { ...item, quantity: Math.max(1, newQuantity) }
      }
      return item
    }))
  }

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const handleClearCart = () => {
    setCart([])
  }

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to cart before placing order')
      return
    }
    if (!selectedCustomer) {
      alert('Please select a customer')
      return
    }
    
    // Store order details for success modal
    const customer = customers.find(c => c.id === parseInt(selectedCustomer))
    setOrderDetails({
      orderId: `ORD-${Date.now()}`,
      customerName: customer?.name || 'Unknown',
      total: cartCalculations.total,
      paymentMethod: paymentMethod,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    })
    
    // Show success modal
    setShowSuccessModal(true)
    
    // Clear cart and reset
    handleClearCart()
    setSelectedCustomer('')
  }

  const handleAddCustomer = (e) => {
    e.preventDefault()
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert('Please fill in name and phone number')
      return
    }
    
    // Add new customer
    const newId = Math.max(...customers.map(c => c.id), 0) + 1
    const customerToAdd = {
      id: newId,
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      email: newCustomer.email.trim() || ''
    }
    
    setCustomers([...customers, customerToAdd])
    setSelectedCustomer(newId.toString())
    setNewCustomer({ name: '', phone: '', email: '' })
    setShowAddCustomerModal(false)
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setOrderDetails(null)
  }

  const formatCurrency = (amount) => {
    return `$ ${amount.toFixed(2)}`
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-neutral-200 overflow-x-hidden w-full" style={{ maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full overflow-hidden" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-full overflow-hidden">
        {/* Food Section Card */}
        <div className="lg:col-span-2 w-full overflow-hidden" style={{ maxWidth: '100%' }}>
          <div className="rounded-lg bg-white shadow-sm border border-[#e3e6ef] overflow-hidden w-full" style={{ maxWidth: '100%' }}>
            <div className="px-6 py-4 border-b border-[#e3e6ef]">
              <h2 className="text-base font-semibold text-[#334257]">
                Food Section
              </h2>
            </div>

            <div className="bg-[#f9fafc] px-6 py-5">
              {/* First row: Zone & Restaurant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#334257] mb-2">
                    Zone<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedZone}
                      onChange={handleZoneChange}
                      className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 pr-10 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd]"
                    >
                      <option value="">Select Zone *</option>
                      {dummyZones.map(zone => (
                        <option key={zone.id} value={zone.id}>{zone.name}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                      ▼
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#334257] mb-2">
                    Restaurant<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedRestaurant}
                      onChange={handleRestaurantChange}
                      disabled={!selectedZone}
                      className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 pr-10 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Restaurant</option>
                      {filteredRestaurants.map(restaurant => (
                        <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Second row: Categories & Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#334257] mb-2">
                    Categories
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      disabled={!selectedRestaurant}
                      className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 pr-10 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">All Categories</option>
                      {availableCategories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                      ▼
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-transparent mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: Search Food Name"
                      disabled={!selectedRestaurant}
                      className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white pl-9 pr-3 text-sm text-[#4a5671] placeholder-[#9aa2b6] focus:outline-none focus:ring-1 focus:ring-[#006fbd] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Food Items Grid */}
              {selectedRestaurant ? (
                filteredFoodItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {filteredFoodItems.map(item => (
                      <div 
                        key={item.id}
                        className="border border-[#e3e6ef] rounded-md bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAddToCart(item)}
                      >
                        <div className="flex flex-col">
                          <h3 className="text-sm font-semibold text-[#334257] mb-1">{item.name}</h3>
                          <p className="text-xs text-[#8a94aa] mb-2">
                            {dummyCategories.find(c => c.id === item.categoryId)?.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#006fbd]">
                              {formatCurrency(item.price)}
                            </span>
                            <button className="px-3 py-1 text-xs bg-[#006fbd] text-white rounded-md hover:bg-[#00589a]">
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d1d7e6] flex items-center justify-center mb-4">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <p className="max-w-md text-[13px] text-[#8a94aa]">
                      No food items found matching your criteria.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d1d7e6] flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="max-w-md text-[13px] text-[#8a94aa]">
                    To get accurate search results, first select a zone, then choose a
                    restaurant. You can then browse food by category or search
                    manually within that restaurant.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Billing Section Card */}
        <div className="flex flex-col h-full w-full overflow-hidden" style={{ maxWidth: '100%' }}>
          <div className="rounded-lg bg-white shadow-sm border border-[#e3e6ef] overflow-hidden flex flex-col h-full w-full" style={{ maxWidth: '100%' }}>
            <div className="px-6 py-4 border-b border-[#e3e6ef] flex items-center justify-between w-full overflow-hidden">
              <h2 className="text-base font-semibold text-[#334257]">
                Billing Section
              </h2>
            </div>

            <div className="bg-[#f9fafc] px-6 py-5 w-full overflow-hidden" style={{ maxWidth: '100%' }}>
              {/* Content - no scrolling */}
              <div className="space-y-4 w-full overflow-hidden" style={{ maxWidth: '100%' }}>
                {/* Customer + Add button */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#334257] mb-2">
                      Select Customer
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 pr-10 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd]"
                      >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.phone})
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                        ▼
                      </span>
                    </div>
                  </div>
                  <div className="pt-7">
                    <button 
                      type="button"
                      onClick={() => setShowAddCustomerModal(true)}
                      className="h-11 whitespace-nowrap px-4 rounded-md bg-[#006fbd] text-white text-sm font-semibold shadow-sm hover:bg-[#00589a]"
                    >
                      Add New Customer
                    </button>
                  </div>
                </div>

                {/* Order type */}
                <div>
                  <p className="text-sm font-semibold text-[#334257] mb-2">
                    Select Order Type
                  </p>
                  <div className="rounded-md border border-[#e3e6ef] bg-white px-4 py-3 flex flex-wrap gap-6 text-sm text-[#4a5671]">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="orderType" 
                        value="takeaway"
                        checked={orderType === 'takeaway'}
                        onChange={(e) => setOrderType(e.target.value)}
                      />
                      <span>Take Away</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="orderType" 
                        value="delivery"
                        checked={orderType === 'delivery'}
                        onChange={(e) => setOrderType(e.target.value)}
                      />
                      <span>Home Delivery</span>
                    </label>
                  </div>
                </div>

                {/* Items table */}
                <div className="border border-[#e3e6ef] rounded-md overflow-hidden bg-white">
                  <div className="grid grid-cols-4 text-xs font-semibold text-[#334257] bg-[#f5f6fb] px-4 py-2">
                    <div>Item</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Price</div>
                    <div className="text-center">Delete</div>
                  </div>
                  {cart.length > 0 ? (
                    <div className="divide-y divide-[#e3e6ef]">
                      {cart.map(item => (
                        <div key={item.id} className="grid grid-cols-4 px-4 py-3 text-sm text-[#4a5671] items-center">
                          <div className="font-medium">{item.name}</div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(item.id, -1)
                              }}
                              className="w-6 h-6 rounded border border-[#e3e6ef] bg-white hover:bg-gray-50 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(item.id, 1)
                              }}
                              className="w-6 h-6 rounded border border-[#e3e6ef] bg-white hover:bg-gray-50 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFromCart(item.id)
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-[#8a94aa] text-sm">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#d1d7e6] flex items-center justify-center mb-3">
                        <span className="text-lg">🧾</span>
                      </div>
                      <p>No Items added yet</p>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm text-[#4a5671]">
                  <div className="flex justify-between">
                    <span>Addon :</span>
                    <span>{formatCurrency(cartCalculations.addon)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal :</span>
                    <span>{formatCurrency(cartCalculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount :</span>
                    <span>- {formatCurrency(cartCalculations.discount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery fee :</span>
                    <span>{formatCurrency(cartCalculations.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vat/tax :</span>
                    <span>{formatCurrency(cartCalculations.vatTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge :</span>
                    <span>{formatCurrency(cartCalculations.serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra Packaging Amount :</span>
                    <span>{formatCurrency(cartCalculations.extraPackaging)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-[#d1d7e6] mt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-[#334257]">
                      {formatCurrency(cartCalculations.total)}
                    </span>
                  </div>
                </div>

                {/* Paid by */}
                <div className="pt-2">
                  <p className="text-sm font-semibold text-[#334257] mb-2">
                    Paid by
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPaymentMethod('cash')}
                      className={`px-5 py-2 rounded-md text-sm font-semibold border ${
                        paymentMethod === 'cash'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#334257] border-[#d1d7e6] hover:bg-gray-50'
                      }`}
                    >
                      Cash
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('card')}
                      className={`px-5 py-2 rounded-md text-sm font-semibold border ${
                        paymentMethod === 'card'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#334257] border-[#d1d7e6] hover:bg-gray-50'
                      }`}
                    >
                      Card
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('wallet')}
                      className={`px-5 py-2 rounded-md text-sm font-semibold border ${
                        paymentMethod === 'wallet'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#334257] border-[#d1d7e6] hover:bg-gray-50'
                      }`}
                    >
                      Wallet
                    </button>
                  </div>
                </div>
              </div>

              {/* Fixed footer buttons */}
              <div className="pt-4 mt-4 border-t border-[#e3e6ef] bg-[#f9fafc]">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handlePlaceOrder}
                    className="h-11 rounded-md bg-[#006fbd] text-white text-sm font-semibold shadow-sm hover:bg-[#00589a]"
                  >
                    Place Order
                  </button>
                  <button 
                    onClick={handleClearCart}
                    className="h-11 rounded-md bg-[#f4f5f7] text-[#334257] text-sm font-semibold border border-[#e3e6ef] hover:bg-[#e6e7eb]"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md p-0 bg-white">
          <div className="p-8 text-center">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-green-500 rounded-full p-4">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            
            {/* Success Message */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#334257] mb-2">
                Order Placed Successfully!
              </DialogTitle>
              <DialogDescription className="text-sm text-[#8a94aa]">
                Your order has been confirmed and is being processed.
              </DialogDescription>
            </DialogHeader>

            {/* Order Details */}
            {orderDetails && (
              <div className="mt-6 p-4 bg-[#f9fafc] rounded-lg border border-[#e3e6ef] text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8a94aa]">Order ID:</span>
                    <span className="font-semibold text-[#334257]">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a94aa]">Customer:</span>
                    <span className="font-semibold text-[#334257]">{orderDetails.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a94aa]">Items:</span>
                    <span className="font-semibold text-[#334257]">{orderDetails.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a94aa]">Payment Method:</span>
                    <span className="font-semibold text-[#334257] capitalize">{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#e3e6ef] mt-2">
                    <span className="text-[#334257] font-semibold">Total Amount:</span>
                    <span className="font-bold text-lg text-[#006fbd]">
                      {formatCurrency(orderDetails.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <DialogFooter className="mt-6">
              <button
                onClick={handleCloseSuccessModal}
                className="w-full h-11 rounded-md bg-[#006fbd] text-white text-sm font-semibold shadow-sm hover:bg-[#00589a] transition-colors"
              >
                Close
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Customer Modal */}
      <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
        <DialogContent className="max-w-md p-0 bg-white">
          <DialogHeader className="p-6 pb-4 border-b border-[#e3e6ef]">
            <DialogTitle className="text-xl font-semibold text-[#334257]">
              Add New Customer
            </DialogTitle>
            <DialogDescription className="text-sm text-[#8a94aa] mt-1">
              Fill in the customer details to add them to the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddCustomer} className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="block text-sm font-medium text-[#334257] mb-2">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Enter customer name"
                  required
                  className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd]"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone" className="block text-sm font-medium text-[#334257] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                  className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd]"
                />
              </div>

              <div>
                <Label htmlFor="customerEmail" className="block text-sm font-medium text-[#334257] mb-2">
                  Email (Optional)
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full h-11 rounded-md border border-[#e3e6ef] bg-white px-3 text-sm text-[#4a5671] focus:outline-none focus:ring-1 focus:ring-[#006fbd]"
                />
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddCustomerModal(false)
                  setNewCustomer({ name: '', phone: '', email: '' })
                }}
                className="flex-1 h-11 rounded-md bg-[#f4f5f7] text-[#334257] text-sm font-semibold border border-[#e3e6ef] hover:bg-[#e6e7eb] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-md bg-[#006fbd] text-white text-sm font-semibold shadow-sm hover:bg-[#00589a] transition-colors"
              >
                Add Customer
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


