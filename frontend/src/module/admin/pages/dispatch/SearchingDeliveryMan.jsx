import { useState, useMemo } from "react"
import OrdersTopbar from "../../components/orders/OrdersTopbar"
import DispatchOrdersTable from "../../components/orders/DispatchOrdersTable"
import DispatchFilterPanel from "../../components/orders/DispatchFilterPanel"
import ViewOrderDialog from "../../components/orders/ViewOrderDialog"
import SettingsDialog from "../../components/orders/SettingsDialog"
import { useGenericTableManagement } from "../../components/orders/useGenericTableManagement"

const MOCK_ORDERS = [
  {
    id: "100160",
    sl: 1,
    date: "05 APR 2025",
    time: "10:13 PM",
    customerName: "Jane Doe",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 1,402.49",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100158",
    sl: 2,
    date: "02 JAN 2024",
    time: "06:48 AM",
    customerName: "Brooklyn Simmons",
    customerPhone: "+8***********",
    restaurant: "The Great Impasta",
    total: "$ 1,911.20",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100149",
    sl: 3,
    date: "11 JUN 2023",
    time: "03:24 PM",
    customerName: "Jdjidj Dhhdhd",
    customerPhone: "+8***********",
    restaurant: "Café Monarch",
    total: "$ 275.41",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100147",
    sl: 4,
    date: "11 JUN 2023",
    time: "03:22 PM",
    customerName: "Munam ShahariEr Test",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 3,327.56",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100145",
    sl: 5,
    date: "06 JUN 2023",
    time: "12:49 PM",
    customerName: "Munam ShahariEr Test",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 1,521.92",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100144",
    sl: 6,
    date: "06 JUN 2023",
    time: "12:49 PM",
    customerName: "Munam ShahariEr Test",
    customerPhone: "+8***********",
    restaurant: "Cheese Burger",
    total: "$ 367.20",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100143",
    sl: 7,
    date: "05 JUN 2023",
    time: "10:35 PM",
    customerName: "Ghhxh jgjvjv",
    customerPhone: "+8***********",
    restaurant: "Hungry Puppets",
    total: "$ 786.95",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100142",
    sl: 8,
    date: "05 JUN 2023",
    time: "10:28 PM",
    customerName: "Jane Cooper",
    customerPhone: "+8***********",
    restaurant: "Café Monarch",
    total: "$ 2,504.47",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100141",
    sl: 9,
    date: "04 JUN 2023",
    time: "10:51 AM",
    customerName: "Jvjgjgj Ffjhghgh",
    customerPhone: "+8***********",
    restaurant: "Café Monarch",
    total: "$ 2,504.46",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
  {
    id: "100140",
    sl: 10,
    date: "04 JUN 2023",
    time: "11:30 AM",
    customerName: "Jvjgjgj Ffjhghgh",
    customerPhone: "+8***********",
    restaurant: "Café Monarch",
    total: "$ 786.91",
    paymentStatus: "Unpaid",
    orderStatus: "Pending",
    deliveryType: "Home Delivery",
  },
]

export default function SearchingDeliveryMan() {
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
    MOCK_ORDERS,
    "Searching For Deliverymen Orders",
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Searching For Deliverymen Orders
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All orders that are currently searching for a deliveryman.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 border border-blue-100">
            Unassigned Orders: {count}
          </span>
        </div>
      </div>
      <OrdersTopbar 
        title="Searching For Deliverymen Orders" 
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
