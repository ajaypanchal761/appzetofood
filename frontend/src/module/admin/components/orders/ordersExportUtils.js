// Export utility functions for orders
export const exportToCSV = (orders, filename = "orders") => {
  // Detect order structure
  const firstOrder = orders[0]
  const isSubscription = firstOrder?.subscriptionId
  const isDispatch = firstOrder?.id && !firstOrder?.orderId
  
  let headers, rows
  
  if (isSubscription) {
    headers = ["SI", "Subscription ID", "Order Type", "Duration", "Restaurant", "Customer Name", "Customer Phone", "Status", "Total Orders", "Delivered"]
    rows = orders.map((order, index) => [
      index + 1,
      order.subscriptionId,
      order.orderType,
      order.duration,
      order.restaurant,
      order.customerName,
      order.customerPhone,
      order.status,
      order.totalOrders,
      order.delivered
    ])
  } else {
    headers = ["SI", "Order ID", "Order Date", "Customer Name", "Customer Phone", "Restaurant", "Total Amount", "Payment Status", "Order Status", "Delivery Type"]
    rows = orders.map((order, index) => [
      index + 1,
      order.orderId || order.id,
      `${order.date}${order.time ? `, ${order.time}` : ""}`,
      order.customerName,
      order.customerPhone,
      order.restaurant,
      order.total || `$ ${(order.totalAmount || 0).toFixed(2)}`,
      order.paymentStatus || "",
      order.orderStatus || "",
      order.deliveryType || ""
    ])
  }
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n")
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToExcel = (orders, filename = "orders") => {
  // Detect order structure
  const firstOrder = orders[0]
  const isSubscription = firstOrder?.subscriptionId
  
  let headers, rows
  
  if (isSubscription) {
    headers = ["SI", "Subscription ID", "Order Type", "Duration", "Restaurant", "Customer Name", "Customer Phone", "Status", "Total Orders", "Delivered"]
    rows = orders.map((order, index) => [
      index + 1,
      order.subscriptionId,
      order.orderType,
      order.duration,
      order.restaurant,
      order.customerName,
      order.customerPhone,
      order.status,
      order.totalOrders,
      order.delivered
    ])
  } else {
    headers = ["SI", "Order ID", "Order Date", "Customer Name", "Customer Phone", "Restaurant", "Total Amount", "Payment Status", "Order Status", "Delivery Type"]
    rows = orders.map((order, index) => [
      index + 1,
      order.orderId || order.id,
      `${order.date}${order.time ? `, ${order.time}` : ""}`,
      order.customerName,
      order.customerPhone,
      order.restaurant,
      order.total || `$ ${(order.totalAmount || 0).toFixed(2)}`,
      order.paymentStatus || "",
      order.orderStatus || "",
      order.deliveryType || ""
    ])
  }
  
  const csvContent = [
    headers.join("\t"),
    ...rows.map(row => row.join("\t"))
  ].join("\n")
  
  const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.xls`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = async (orders, filename = "orders") => {
  if (!orders || orders.length === 0) {
    alert("No data to export")
    return
  }

  try {
    // Dynamic import of jsPDF and autoTable for instant download
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    
    // Detect order structure
    const firstOrder = orders[0]
    const isSubscription = firstOrder?.subscriptionId
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Add title
    doc.setFontSize(16)
    doc.setTextColor(30, 30, 30)
    doc.text(filename.charAt(0).toUpperCase() + filename.slice(1).replace(/_/g, ' '), 148, 15, { align: 'center' })
    
    // Add export info
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const exportDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Exported on: ${exportDate} | Total Records: ${orders.length}`, 148, 22, { align: 'center' })
    
    let headers, tableData
    
    if (isSubscription) {
      headers = [["SI", "Subscription ID", "Order Type", "Duration", "Restaurant", "Customer Name", "Customer Phone", "Status", "Total Orders", "Delivered"]]
      tableData = orders.map((order, index) => [
        index + 1,
        order.subscriptionId || 'N/A',
        order.orderType || 'N/A',
        order.duration || 'N/A',
        order.restaurant || 'N/A',
        order.customerName || 'N/A',
        order.customerPhone || 'N/A',
        order.status || 'N/A',
        order.totalOrders || 0,
        order.delivered || 'N/A'
      ])
    } else {
      headers = [["SI", "Order ID", "Order Date", "Customer Name", "Customer Phone", "Restaurant", "Total Amount", "Payment Status", "Order Status", "Delivery Type"]]
      tableData = orders.map((order, index) => [
        index + 1,
        order.orderId || order.id || 'N/A',
        `${order.date || ''}${order.time ? `, ${order.time}` : ""}` || 'N/A',
        order.customerName || 'N/A',
        order.customerPhone || 'N/A',
        order.restaurant || 'N/A',
        order.total || `₹${(order.totalAmount || 0).toFixed(2)}` || 'N/A',
        order.paymentStatus || 'N/A',
        order.orderStatus || 'N/A',
        order.deliveryType || 'N/A'
      ])
    }

    // Add table using autoTable
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 30, 30]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 15 }, // SI
      },
      margin: { top: 28, left: 14, right: 14 },
    })

    // Save the PDF instantly
    const fileTimestamp = new Date().toISOString().split("T")[0]
    doc.save(`${filename}_${fileTimestamp}.pdf`)
  } catch (error) {
    console.error("Error loading PDF library:", error)
    alert("Failed to load PDF library. Please try again.")
  }
}

export const exportToJSON = (orders, filename = "orders") => {
  const jsonContent = JSON.stringify(orders, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.json`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

