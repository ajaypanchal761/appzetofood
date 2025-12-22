// Export utility functions for join requests
export const exportJoinRequestsToCSV = (requests, filename = "join_requests") => {
  const headers = ["SI", "Name", "Email", "Phone", "Zone", "Job Type", "Vehicle Type", "Status"]
  const rows = requests.map((request) => [
    request.sl,
    request.name,
    request.email,
    request.phone,
    request.zone,
    request.jobType,
    request.vehicleType,
    request.status
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

export const exportJoinRequestsToExcel = (requests, filename = "join_requests") => {
  const headers = ["SI", "Name", "Email", "Phone", "Zone", "Job Type", "Vehicle Type", "Status"]
  const rows = requests.map((request) => [
    request.sl,
    request.name,
    request.email,
    request.phone,
    request.zone,
    request.jobType,
    request.vehicleType,
    request.status
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

export const exportJoinRequestsToPDF = (requests, filename = "join_requests") => {
  const headers = ["SI", "Name", "Email", "Phone", "Zone", "Job Type", "Vehicle Type", "Status"]
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Join Requests Report</title>
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
      <h1>Join Requests Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${requests.map(request => `
            <tr>
              <td>${request.sl}</td>
              <td>${request.name}</td>
              <td>${request.email}</td>
              <td>${request.phone}</td>
              <td>${request.zone}</td>
              <td>${request.jobType}</td>
              <td>${request.vehicleType}</td>
              <td>${request.status}</td>
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

export const exportJoinRequestsToJSON = (requests, filename = "join_requests") => {
  const jsonContent = JSON.stringify(requests, null, 2)
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

