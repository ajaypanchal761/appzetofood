import { useState, useMemo } from "react"
import { exportToCSV, exportToExcel, exportToPDF, exportToJSON } from "./ordersExportUtils"

export function useOrdersManagement(orders, statusKey, title) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({
    paymentStatus: "",
    deliveryType: "",
    minAmount: "",
    maxAmount: "",
    fromDate: "",
    toDate: "",
    restaurant: "",
  })
  const [visibleColumns, setVisibleColumns] = useState({
    si: true,
    orderId: true,
    orderDate: true,
    customer: true,
    restaurant: true,
    foodItems: true,
    totalAmount: true,
    orderStatus: true,
    actions: true,
  })

  // Get unique restaurants from orders
  const restaurants = useMemo(() => {
    return [...new Set(orders.map(o => o.restaurant))]
  }, [orders])

  // Apply search and filters
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.restaurant.toLowerCase().includes(query) ||
        order.customerPhone.includes(query) ||
        order.totalAmount.toString().includes(query)
      )
    }

    // Apply filters
    if (filters.paymentStatus) {
      result = result.filter(order => order.paymentStatus === filters.paymentStatus)
    }

    if (filters.deliveryType) {
      result = result.filter(order => order.deliveryType === filters.deliveryType)
    }

    if (filters.minAmount) {
      result = result.filter(order => order.totalAmount >= parseFloat(filters.minAmount))
    }

    if (filters.maxAmount) {
      result = result.filter(order => order.totalAmount <= parseFloat(filters.maxAmount))
    }

    if (filters.restaurant) {
      result = result.filter(order => order.restaurant === filters.restaurant)
    }

    // Helper function to parse date format "16 JUL 2025"
    const parseOrderDate = (dateStr) => {
      const months = {
        "JAN": "01", "FEB": "02", "MAR": "03", "APR": "04", "MAY": "05", "JUN": "06",
        "JUL": "07", "AUG": "08", "SEP": "09", "OCT": "10", "NOV": "11", "DEC": "12"
      }
      const parts = dateStr.split(" ")
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0")
        const month = months[parts[1].toUpperCase()] || "01"
        const year = parts[2]
        return new Date(`${year}-${month}-${day}`)
      }
      return new Date(dateStr)
    }

    if (filters.fromDate) {
      result = result.filter(order => {
        const orderDate = parseOrderDate(order.date)
        const fromDate = new Date(filters.fromDate)
        return orderDate >= fromDate
      })
    }

    if (filters.toDate) {
      result = result.filter(order => {
        const orderDate = parseOrderDate(order.date)
        const toDate = new Date(filters.toDate)
        toDate.setHours(23, 59, 59, 999) // Include entire day
        return orderDate <= toDate
      })
    }

    return result
  }, [orders, searchQuery, filters])

  const count = filteredOrders.length

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== "").length
  }, [filters])

  const handleApplyFilters = () => {
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      paymentStatus: "",
      deliveryType: "",
      minAmount: "",
      maxAmount: "",
      fromDate: "",
      toDate: "",
      restaurant: "",
    })
  }

  const handleExport = (format) => {
    const filename = title.toLowerCase().replace(/\s+/g, "_")
    switch (format) {
      case "csv":
        exportToCSV(filteredOrders, filename)
        break
      case "excel":
        exportToExcel(filteredOrders, filename)
        break
      case "pdf":
        exportToPDF(filteredOrders, filename)
        break
      case "json":
        exportToJSON(filteredOrders, filename)
        break
      default:
        break
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsViewOrderOpen(true)
  }

  const handlePrintOrder = (order) => {
    const printWindow = window.open("", "_blank")
    
    // Generate items table HTML
    const itemsHtml = order.items && Array.isArray(order.items) && order.items.length > 0
      ? `
        <div style="margin: 30px 0;">
          <h2 style="margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f5f5f5; border-bottom: 2px solid #333;">
                <th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Qty</th>
                <th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Item Name</th>
                <th style="text-align: right; padding: 12px; border: 1px solid #ddd;">Price</th>
                <th style="text-align: right; padding: 12px; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item, idx) => {
                const itemTotal = (item.quantity || 1) * (item.price || 0)
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${item.quantity || 1}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.name || 'Unknown Item'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${(item.price || 0).toFixed(2)}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">$${itemTotal.toFixed(2)}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </div>
      `
      : '<div style="margin: 20px 0; color: #999; font-style: italic;">No items found</div>'
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice - ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; }
            @media print { 
              body { padding: 20px; }
              table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Invoice</h1>
            <p>Order ID: ${order.orderId}</p>
          </div>
          <div class="order-info">
            <div class="info-row">
              <span class="label">Date:</span>
              <span>${order.date}, ${order.time}</span>
            </div>
            <div class="info-row">
              <span class="label">Customer:</span>
              <span>${order.customerName}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span>${order.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="label">Restaurant:</span>
              <span>${order.restaurant}</span>
            </div>
            <div class="info-row">
              <span class="label">Delivery Type:</span>
              <span>${order.deliveryType}</span>
            </div>
            <div class="info-row">
              <span class="label">Order Status:</span>
              <span>${order.orderStatus}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Status:</span>
              <span>${order.paymentStatus}</span>
            </div>
          </div>
          ${itemsHtml}
          <div class="info-row" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #333;">
            <span class="label" style="font-size: 18px;">Total Amount:</span>
            <span style="font-size: 18px; font-weight: bold;">$${order.totalAmount.toFixed(2)}</span>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const resetColumns = () => {
    setVisibleColumns({
      si: true,
      orderId: true,
      orderDate: true,
      customer: true,
      restaurant: true,
      foodItems: true,
      totalAmount: true,
      orderStatus: true,
      actions: true,
    })
  }

  return {
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
  }
}

