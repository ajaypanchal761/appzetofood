// Export utility functions for vehicles category
export const exportVehiclesToCSV = (vehicles, filename = "vehicles_category") => {
  const headers = ["SI", "Type", "Starting Coverage (Km)", "Maximum Coverage (Km)", "Extra Charges ($)", "Status"]
  const rows = vehicles.map((vehicle) => [
    vehicle.sl,
    vehicle.type,
    vehicle.startingCoverage,
    vehicle.maximumCoverage,
    vehicle.extraCharges.toFixed(2),
    vehicle.status ? "Active" : "Inactive"
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

export const exportVehiclesToExcel = (vehicles, filename = "vehicles_category") => {
  const headers = ["SI", "Type", "Starting Coverage (Km)", "Maximum Coverage (Km)", "Extra Charges ($)", "Status"]
  const rows = vehicles.map((vehicle) => [
    vehicle.sl,
    vehicle.type,
    vehicle.startingCoverage,
    vehicle.maximumCoverage,
    vehicle.extraCharges.toFixed(2),
    vehicle.status ? "Active" : "Inactive"
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

export const exportVehiclesToPDF = (vehicles, filename = "vehicles_category") => {
  const headers = ["SI", "Type", "Starting Coverage (Km)", "Maximum Coverage (Km)", "Extra Charges ($)", "Status"]
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vehicles Category Report</title>
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
      <h1>Vehicles Category Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${vehicles.map(vehicle => `
            <tr>
              <td>${vehicle.sl}</td>
              <td>${vehicle.type}</td>
              <td>${vehicle.startingCoverage.toLocaleString()}</td>
              <td>${vehicle.maximumCoverage.toLocaleString()}</td>
              <td>$${vehicle.extraCharges.toFixed(2)}</td>
              <td>${vehicle.status ? "Active" : "Inactive"}</td>
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

export const exportVehiclesToJSON = (vehicles, filename = "vehicles_category") => {
  const jsonContent = JSON.stringify(vehicles, null, 2)
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

