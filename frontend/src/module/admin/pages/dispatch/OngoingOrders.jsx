import { useState, useMemo } from "react"
import OrdersTopbar from "../../components/orders/OrdersTopbar"
import DispatchOrdersTable from "../../components/orders/DispatchOrdersTable"
import DispatchFilterPanel from "../../components/orders/DispatchFilterPanel"
import ViewOrderDialog from "../../components/orders/ViewOrderDialog"
import SettingsDialog from "../../components/orders/SettingsDialog"
import { useGenericTableManagement } from "../../components/orders/useGenericTableManagement"

const MOCK_ONGOING_ORDERS = [
  {
    id: "100148",
    sl: 1,
    date: "11 JUN 2023",
    time: "03:24 PM",
    customerName: "Jdjidj Dhhdhd",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 129.75",
    paymentStatus: "Unpaid",
    orderStatus: "Out For Delivery",
    orderStatusColor: "bg-orange-100 text-orange-600",
    deliveryType: "Home Delivery",
  },
  {
    id: "100130",
    sl: 2,
    date: "04 JUN 2023",
    time: "09:33 AM",
    customerName: "Jvjgjhj Fjkhgh",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 129.75",
    paymentStatus: "Unpaid",
    orderStatus: "Handover",
    orderStatusColor: "bg-blue-50 text-blue-600",
    deliveryType: "Home Delivery",
  },
  {
    id: "100068",
    sl: 3,
    date: "11 JAN 2022",
    time: "01:53 PM",
    customerName: "Jane Cooper",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 99.75",
    paymentStatus: "Paid",
    orderStatus: "Confirmed",
    orderStatusColor: "bg-blue-50 text-blue-600",
    deliveryType: "Home Delivery",
  },
  {
    id: "100056",
    sl: 4,
    date: "15 NOV 2021",
    time: "04:15 PM",
    customerName: "Jane Doe",
    customerPhone: "+8***********",
    restaurant: "Cheese Burger",
    total: "$ 81.60",
    paymentStatus: "Unpaid",
    orderStatus: "Confirmed",
    orderStatusColor: "bg-blue-50 text-blue-600",
    deliveryType: "Home Delivery",
  },
  {
    id: "100053",
    sl: 5,
    date: "17 OCT 2021",
    time: "03:56 PM",
    customerName: "Zubair Jamil",
    customerPhone: "+9***********",
    restaurant: "Hungry Puppets",
    total: "$ 99.75",
    paymentStatus: "Unpaid",
    orderStatus: "Accepted",
    orderStatusColor: "bg-red-50 text-red-500",
    deliveryType: "Home Delivery",
  },
  {
    id: "100052",
    sl: 6,
    date: "17 OCT 2021",
    time: "03:55 PM",
    customerName: "Zubair Jamil",
    customerPhone: "+9***********",
    restaurant: "Cheese Burger",
    total: "$ 1,266.84",
    paymentStatus: "Unpaid",
    orderStatus: "Confirmed",
    orderStatusColor: "bg-blue-50 text-blue-600",
    deliveryType: "Home Delivery",
  },
  {
    id: "100030",
    sl: 7,
    date: "22 AUG 2021",
    time: "08:16 AM",
    customerName: "Demo Demo",
    customerPhone: "+2***********",
    restaurant: "Café Monarch",
    total: "$ 4,700.14",
    paymentStatus: "Unpaid",
    orderStatus: "Accepted",
    orderStatusColor: "bg-red-50 text-red-500",
    deliveryType: "Home Delivery",
  },
  {
    id: "100017",
    sl: 8,
    date: "22 AUG 2021",
    time: "01:13 AM",
    customerName: "Spencer Hastings",
    customerPhone: "+8***********",
    restaurant: "Vintage Kitchen",
    total: "$ 4,390.45",
    paymentStatus: "Paid",
    orderStatus: "Accepted",
    orderStatusColor: "bg-red-50 text-red-500",
    deliveryType: "Home Delivery",
  },
  {
    id: "100016",
    sl: 9,
    date: "22 AUG 2021",
    time: "01:12 AM",
    customerName: "Spencer Hastings",
    customerPhone: "+8***********",
    restaurant: "Vintage Kitchen",
    total: "$ 4,393.20",
    paymentStatus: "Paid",
    orderStatus: "Confirmed",
    orderStatusColor: "bg-blue-50 text-blue-600",
    deliveryType: "Home Delivery",
  },
]

export default function OngoingOrders() {
  const [visibleColumns, setVisibleColumns] = useState({
    sl: true,
    order: true,
    date: true,
    customer: true,
    restaurant: true,
    total: true,
    status: true,
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
    MOCK_ONGOING_ORDERS,
    "On Going Orders",
    ["id", "customerName", "restaurant", "customerPhone"]
  )

  const resetColumns = () => {
    setVisibleColumns({
      sl: true,
      order: true,
      date: true,
      customer: true,
      restaurant: true,
      total: true,
      status: true,
      actions: true,
    })
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <OrdersTopbar 
        title="On Going Orders" 
        count={count} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onExport={handleExport}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <DispatchFilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        resetColumns={resetColumns}
        columnsConfig={{
          sl: "Serial Number",
          order: "Order",
          date: "Date",
          customer: "Customer",
          restaurant: "Restaurant",
          total: "Total Amount",
          status: "Order Status",
          actions: "Actions",
        }}
      />
      <ViewOrderDialog
        isOpen={isViewOrderOpen}
        onOpenChange={setIsViewOrderOpen}
        order={selectedOrder}
      />
      <DispatchOrdersTable 
        orders={filteredData} 
        visibleColumns={visibleColumns}
        onViewOrder={handleViewOrder}
        onPrintOrder={handlePrintOrder}
      />
    </div>
  )
}
