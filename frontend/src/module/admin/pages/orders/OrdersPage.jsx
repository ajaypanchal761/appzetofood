import { useMemo, useState, useEffect } from "react"
import { FileText, Calendar, Package } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import OrdersTopbar from "../../components/orders/OrdersTopbar"
import OrdersTable from "../../components/orders/OrdersTable"
import FilterPanel from "../../components/orders/FilterPanel"
import ViewOrderDialog from "../../components/orders/ViewOrderDialog"
import SettingsDialog from "../../components/orders/SettingsDialog"
import { useOrdersManagement } from "../../components/orders/useOrdersManagement"
import { Loader2 } from "lucide-react"

// Status configuration with titles, colors, and icons
const statusConfig = {
  "all": { title: "All Orders", color: "emerald", icon: FileText },
  "scheduled": { title: "Scheduled Orders", color: "blue", icon: Calendar },
  "pending": { title: "Pending Orders", color: "amber", icon: Package },
  "accepted": { title: "Accepted Orders", color: "green", icon: Package },
  "processing": { title: "Processing Orders", color: "orange", icon: Package },
  "food-on-the-way": { title: "Food On The Way Orders", color: "amber", icon: Package },
  "delivered": { title: "Delivered Orders", color: "emerald", icon: Package },
  "canceled": { title: "Canceled Orders", color: "rose", icon: Package },
  "restaurant-cancelled": { title: "Restaurant Cancelled Orders", color: "red", icon: Package },
  "payment-failed": { title: "Payment Failed Orders", color: "red", icon: Package },
  "refunded": { title: "Refunded Orders", color: "sky", icon: Package },
  "offline-payments": { title: "Offline Payments", color: "slate", icon: Package },
}

export default function OrdersPage({ statusKey = "all" }) {
  const config = statusConfig[statusKey] || statusConfig["all"]
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [processingRefund, setProcessingRefund] = useState(null)
  
  // Fetch orders from backend API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const params = {
          page: 1,
          limit: 1000, // Fetch all orders for now (can be optimized with pagination later)
          status: statusKey === "all" ? undefined : 
                 statusKey === "restaurant-cancelled" ? "cancelled" : statusKey,
          cancelledBy: statusKey === "restaurant-cancelled" ? "restaurant" : undefined
        }
        
        const response = await adminAPI.getOrders(params)
        
        if (response.data?.success && response.data?.data?.orders) {
          setOrders(response.data.data.orders)
          setTotalCount(response.data.data.pagination?.total || response.data.data.orders.length)
        } else {
          console.error("Failed to fetch orders:", response.data)
          toast.error("Failed to fetch orders")
          setOrders([])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast.error(error.response?.data?.message || "Failed to fetch orders")
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [statusKey])

  // Handle refund processing
  const handleRefund = async (order) => {
    if (!confirm(`Are you sure you want to process refund for order ${order.orderId}?\n\nThis will initiate a Razorpay refund to the customer's original payment method.`)) {
      return
    }

    // Try using orderId string first (more reliable), then fallback to MongoDB _id
    // Backend accepts either MongoDB ObjectId (24 chars) or orderId string
    // Using orderId string is more reliable as it's the actual order identifier
    const orderIdToUse = order.orderId || order.id
    
    if (!orderIdToUse) {
      console.error('❌ No orderId found in order object:', order)
      toast.error('Order ID not found. Please refresh the page and try again.')
      return
    }
    
    console.log('🔍 Order details for refund:', {
      orderIdString: order.orderId,
      mongoId: order.id,
      orderIdToUse,
      willUse: order.orderId ? 'orderId string' : 'MongoDB _id'
    })

    try {
      setProcessingRefund(orderIdToUse)
      
      console.log('🔍 Processing refund for order:', {
        orderId: order.orderId,
        id: order.id,
        _id: order._id,
        orderIdToUse,
        url: `/api/admin/orders/${orderIdToUse}/refund`
      })
      const response = await adminAPI.processRefund(orderIdToUse, {})
      
      if (response.data?.success) {
        toast.success(response.data?.message || `Refund initiated successfully for order ${order.orderId}`)
        // Update the order in the local state immediately to show "Refunded" status
        setOrders(prevOrders => 
          prevOrders.map(o => 
            (o.id === order.id || o.orderId === order.orderId)
              ? { ...o, refundStatus: 'initiated' }
              : o
          )
        )
        // Refresh the orders list to get updated data
        const params = {
          page: 1,
          limit: 1000,
          status: statusKey === "all" ? undefined : 
                 statusKey === "restaurant-cancelled" ? "cancelled" : statusKey,
          cancelledBy: statusKey === "restaurant-cancelled" ? "restaurant" : undefined
        }
        const refreshResponse = await adminAPI.getOrders(params)
        if (refreshResponse.data?.success && refreshResponse.data?.data?.orders) {
          setOrders(refreshResponse.data.data.orders)
          setTotalCount(refreshResponse.data.data.pagination?.total || refreshResponse.data.data.orders.length)
        }
      } else {
        toast.error(response.data?.message || "Failed to process refund")
      }
    } catch (error) {
      console.error("Error processing refund:", error)
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        orderId: orderIdToUse,
        order: {
          id: order.id,
          orderId: order.orderId,
          _id: order._id
        }
      }
      console.error("Error details:", errorDetails)
      
      // Show more specific error message
      let errorMessage = "Failed to process refund"
      if (error.response?.status === 404) {
        errorMessage = `Order not found (ID: ${orderIdToUse}). Please check if the order exists.`
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setProcessingRefund(null)
    }
  }

  const {
    searchQuery,
    setSearchQuery,
    isFilterOpen,
    setIsFilterOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isViewOrderOpen,
    setIsViewOrderOpen,
    selectedOrder,
    filters,
    setFilters,
    visibleColumns,
    filteredOrders,
    count,
    activeFiltersCount,
    restaurants,
    handleApplyFilters,
    handleResetFilters,
    handleExport,
    handleViewOrder,
    handlePrintOrder,
    toggleColumn,
    resetColumns,
  } = useOrdersManagement(orders, statusKey, config.title)

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      <OrdersTopbar 
        title={config.title} 
        count={count} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onExport={handleExport}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        restaurants={restaurants}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        resetColumns={resetColumns}
      />
      <ViewOrderDialog
        isOpen={isViewOrderOpen}
        onOpenChange={setIsViewOrderOpen}
        order={selectedOrder}
      />
      <OrdersTable 
        orders={filteredOrders} 
        visibleColumns={visibleColumns}
        onViewOrder={handleViewOrder}
        onPrintOrder={handlePrintOrder}
        onRefund={handleRefund}
      />
    </div>
  )
}
