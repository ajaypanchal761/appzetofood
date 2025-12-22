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

export const exportToPDF = (orders, filename = "orders") => {
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
  
  const printWindow = window.open("", "_blank")
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${filename}</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
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

