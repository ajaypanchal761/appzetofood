// Export utility functions for deliveryman data
export const exportDeliverymenToCSV = (deliverymen, filename = "deliverymen") => {
  const headers = ["SI", "Name", "Contact", "Zone", "Total Orders", "Availability Status"]
  const rows = deliverymen.map((dm) => [
    dm.sl,
    dm.name,
    dm.phone,
    dm.zone,
    dm.totalOrders,
    dm.status
  ])
  
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

export const exportDeliverymenToExcel = (deliverymen, filename = "deliverymen") => {
  const headers = ["SI", "Name", "Contact", "Zone", "Total Orders", "Availability Status"]
  const rows = deliverymen.map((dm) => [
    dm.sl,
    dm.name,
    dm.phone,
    dm.zone,
    dm.totalOrders,
    dm.status
  ])
  
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

export const exportDeliverymenToPDF = (deliverymen, filename = "deliverymen") => {
  const headers = ["SI", "Name", "Contact", "Zone", "Total Orders", "Availability Status"]
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Deliverymen Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { text-align: center; }
      </style>
    </head>
    <body>
      <h1>Deliverymen Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${deliverymen.map(dm => `
            <tr>
              <td>${dm.sl}</td>
              <td>${dm.name}</td>
              <td>${dm.phone}</td>
              <td>${dm.zone}</td>
              <td>${dm.totalOrders}</td>
              <td>${dm.status}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `
  
  const printWindow = window.open("", "_blank")
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

export const exportDeliverymenToJSON = (deliverymen, filename = "deliverymen") => {
  const jsonContent = JSON.stringify(deliverymen, null, 2)
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

// Export utilities for reviews
export const exportReviewsToCSV = (reviews, filename = "deliveryman_reviews") => {
  const headers = ["SI", "Deliveryman", "Customer", "Review", "Rating"]
  const rows = reviews.map((review) => [
    review.sl,
    review.deliveryman,
    review.customer,
    review.review,
    review.rating
  ])
  
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

export const exportReviewsToExcel = (reviews, filename = "deliveryman_reviews") => {
  const headers = ["SI", "Deliveryman", "Customer", "Review", "Rating"]
  const rows = reviews.map((review) => [
    review.sl,
    review.deliveryman,
    review.customer,
    review.review,
    review.rating
  ])
  
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

export const exportReviewsToPDF = (reviews, filename = "deliveryman_reviews") => {
  const headers = ["SI", "Deliveryman", "Customer", "Review", "Rating"]
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Deliveryman Reviews Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { text-align: center; }
      </style>
    </head>
    <body>
      <h1>Deliveryman Reviews Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${reviews.map(review => `
            <tr>
              <td>${review.sl}</td>
              <td>${review.deliveryman}</td>
              <td>${review.customer}</td>
              <td>${review.review}</td>
              <td>${review.rating}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `
  
  const printWindow = window.open("", "_blank")
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

export const exportReviewsToJSON = (reviews, filename = "deliveryman_reviews") => {
  const jsonContent = JSON.stringify(reviews, null, 2)
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

// Export utilities for bonus transactions
export const exportBonusToCSV = (transactions, filename = "deliveryman_bonus") => {
  const headers = ["SI", "Transaction ID", "Deliveryman", "Bonus", "Reference", "Created At"]
  const rows = transactions.map((transaction) => [
    transaction.sl,
    transaction.transactionId,
    transaction.deliveryman,
    transaction.bonus,
    transaction.reference,
    transaction.createdAt
  ])
  
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

export const exportBonusToExcel = (transactions, filename = "deliveryman_bonus") => {
  const headers = ["SI", "Transaction ID", "Deliveryman", "Bonus", "Reference", "Created At"]
  const rows = transactions.map((transaction) => [
    transaction.sl,
    transaction.transactionId,
    transaction.deliveryman,
    transaction.bonus,
    transaction.reference,
    transaction.createdAt
  ])
  
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

export const exportBonusToPDF = (transactions, filename = "deliveryman_bonus") => {
  const headers = ["SI", "Transaction ID", "Deliveryman", "Bonus", "Reference", "Created At"]
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Deliveryman Bonus Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { text-align: center; }
      </style>
    </head>
    <body>
      <h1>Deliveryman Bonus Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${transactions.map(transaction => `
            <tr>
              <td>${transaction.sl}</td>
              <td>${transaction.transactionId}</td>
              <td>${transaction.deliveryman}</td>
              <td>${transaction.bonus}</td>
              <td>${transaction.reference}</td>
              <td>${transaction.createdAt}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
    </html>
  `
  
  const printWindow = window.open("", "_blank")
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

export const exportBonusToJSON = (transactions, filename = "deliveryman_bonus") => {
  const jsonContent = JSON.stringify(transactions, null, 2)
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

