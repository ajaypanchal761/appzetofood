import { useState, useMemo } from "react"
import OrdersTopbar from "../../components/orders/OrdersTopbar"
import OrdersTable from "../../components/orders/OrdersTable"
import FilterPanel from "../../components/orders/FilterPanel"
import ViewOrderDialog from "../../components/orders/ViewOrderDialog"
import SettingsDialog from "../../components/orders/SettingsDialog"
import { useGenericTableManagement } from "../../components/orders/useGenericTableManagement"

const MOCK_REFUND_ORDERS = [
  {
    orderId: "100111",
    sl: 1,
    date: "01 JUN 2023",
    time: "10:37 AM",
    customerName: "Munam ShahariEr Test",
    customerPhone: "+8**********",
    restaurant: "Hungry Puppets",
    totalAmount: 129.75,
    paymentStatus: "Paid",
    orderStatus: "Refund Requested",
    deliveryType: "Home Delivery",
  },
  {
    orderId: "100067",
    sl: 2,
    date: "11 JAN 2022",
    time: "01:42 PM",
    customerName: "Jane Cooper",
    customerPhone: "+8**********",
    restaurant: "Hungry Puppets",
    totalAmount: 99.75,
    paymentStatus: "Paid",
    orderStatus: "Refund Requested",
    deliveryType: "Home Delivery",
  },
]

export default function NewRefundRequests() {
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    orderId: true,
    orderDate: true,
    customer: true,
    restaurant: true,
    totalAmount: true,
    orderStatus: true,
    actions: true,
  })

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
    filteredData,
    count,
    activeFiltersCount,
    handleApplyFilters,
    handleResetFilters,
    handleExport,
    handleViewOrder,
    handlePrintOrder,
    toggleColumn,
  } = useGenericTableManagement(
    MOCK_REFUND_ORDERS,
    "New Refund Requests",
    ["orderId", "customerName", "restaurant", "customerPhone"]
  )

  const restaurants = useMemo(() => {
    return [...new Set(MOCK_REFUND_ORDERS.map(o => o.restaurant))]
  }, [])

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      orderId: true,
      orderDate: true,
      customer: true,
      restaurant: true,
      totalAmount: true,
      orderStatus: true,
      actions: true,
    })
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <OrdersTopbar 
        title="Requested Orders" 
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
        orders={filteredData} 
        visibleColumns={visibleColumns}
        onViewOrder={handleViewOrder}
        onPrintOrder={handlePrintOrder}
      />
    </div>
  )
}
