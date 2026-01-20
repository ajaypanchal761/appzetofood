import { useState, useMemo } from "react"
import { exportToCSV, exportToExcel, exportToPDF, exportToJSON } from "./ordersExportUtils"

export function useGenericTableManagement(data, title, searchFields = []) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({})
  const [visibleColumns, setVisibleColumns] = useState({})

  // Apply search
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search query
    if (searchQuery.trim() && searchFields.length > 0) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(item => 
        searchFields.some(field => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(query)
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        result = result.filter(item => {
          const itemValue = item[key]
          if (typeof value === 'string') {
            return itemValue === value || itemValue?.toString().toLowerCase() === value.toLowerCase()
          }
          return itemValue === value
        })
      }
    })

    return result
  }, [data, searchQuery, filters, searchFields])

  const count = filteredData.length

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== "" && value !== null && value !== undefined).length
  }, [filters])

  const handleApplyFilters = () => {
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  const handleExport = (format) => {
    const filename = title.toLowerCase().replace(/\s+/g, "_")
    switch (format) {
      case "csv":
        exportToCSV(filteredData, filename)
        break
      case "excel":
        exportToExcel(filteredData, filename)
        break
      case "pdf":
        exportToPDF(filteredData, filename)
        break
      case "json":
        exportToJSON(filteredData, filename)
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
    
    // Generate items table HTML if items exist
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
      : ''
    
    // Filter out items from general info display (we show it separately)
    const filteredOrder = { ...order }
    delete filteredOrder.items
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice - ${order.orderId || order.id || order.subscriptionId}</title>
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
            <p>Order ID: ${order.orderId || order.id || order.subscriptionId}</p>
          </div>
          <div class="order-info">
            ${Object.entries(filteredOrder).filter(([key, value]) => {
              // Skip internal/technical fields and null/undefined values
              return value !== null && value !== undefined && 
                     typeof value !== 'object' && 
                     !['_id', '__v'].includes(key)
            }).map(([key, value]) => {
              // Format key for display
              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              return `
                <div class="info-row">
                  <span class="label">${displayKey}:</span>
                  <span>${value}</span>
                </div>
              `
            }).join("")}
          </div>
          ${itemsHtml}
          ${order.totalAmount ? `
            <div class="info-row" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #333;">
              <span class="label" style="font-size: 18px;">Total Amount:</span>
              <span style="font-size: 18px; font-weight: bold;">$${typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount}</span>
            </div>
          ` : ''}
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

  const resetColumns = (defaultColumns) => {
    setVisibleColumns(defaultColumns || {})
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
    filteredData,
    count,
    activeFiltersCount,
    handleApplyFilters,
    handleResetFilters,
    handleExport,
    handleViewOrder,
    handlePrintOrder,
    toggleColumn,
    resetColumns,
  }
}

