// Export utility functions for foods
export const exportFoodsToCSV = (foods, filename = "foods") => {
  const headers = ["SI", "Name", "Category", "Price", "Recommended", "Status"]
  const rows = foods.map((food, index) => [
    index + 1,
    food.name,
    food.category,
    `$${food.price.toFixed(2)}`,
    food.recommended ? "Yes" : "No",
    food.status ? "Active" : "Inactive"
  ])
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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

export const exportFoodsToExcel = (foods, filename = "foods") => {
  const headers = ["SI", "Name", "Category", "Price", "Recommended", "Status"]
  const rows = foods.map((food, index) => [
    index + 1,
    food.name,
    food.category,
    `$${food.price.toFixed(2)}`,
    food.recommended ? "Yes" : "No",
    food.status ? "Active" : "Inactive"
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

export const exportFoodsToPDF = (foods, filename = "foods") => {
  const headers = ["SI", "Name", "Category", "Price", "Recommended", "Status"]
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Foods Report</title>
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
      <h1>Foods Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${foods.map((food, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${food.name}</td>
              <td>${food.category}</td>
              <td>$${food.price.toFixed(2)}</td>
              <td>${food.recommended ? "Yes" : "No"}</td>
              <td>${food.status ? "Active" : "Inactive"}</td>
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

export const exportFoodsToJSON = (foods, filename = "foods") => {
  const jsonContent = JSON.stringify(foods, null, 2)
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

