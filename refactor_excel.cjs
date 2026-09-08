const fs = require('fs');

// 1. Update backend route
let routes = fs.readFileSync('backend/src/routes/samplerequest.routes.js', 'utf8');

// The route currently is: router.patch('/:id/excel-log', async (req, res) => {
// We will replace it entirely.
const routeStart = routes.indexOf("router.patch('/:id/excel-log'");
if (routeStart !== -1) {
  const routeEnd = routes.indexOf("})", routeStart) + 2;
  const newRoute = `router.get('/excel-log', async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (user?.role?.toLowerCase() === 'manager') return res.status(403).json({ success: false, error: 'Managers cannot generate the Excel log.' })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Sample Log')
    
    sheet.columns = [
      { header: 'S.No', key: 'sNo', width: 10 },
      { header: 'Date of receipt', key: 'dateOfReceipt', width: 20 },
      { header: 'Sample name', key: 'sampleName', width: 25 },
      { header: 'Sample no', key: 'sampleNo', width: 20 },
      { header: 'Customer name', key: 'customerName', width: 30 },
      { header: 'Sent by', key: 'sentBy', width: 20 },
      { header: 'Analysis required', key: 'analysisRequired', width: 40 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Report Date', key: 'reportDate', width: 20 },
      { header: 'Approved By', key: 'approvedBy', width: 20 },
      { header: 'Sample Request Date', key: 'sampleRequestDate', width: 20 },
      { header: 'Remark', key: 'remark', width: 30 }
    ]
    
    const allRequests = await SampleRequest.find().populate('linkedReportId').sort({ sNo: 1 })
    
    for (const r of allRequests) {
      let finalReportDate = ''
      if (r.linkedReportId && r.linkedReportId.reportDate) {
        finalReportDate = r.linkedReportId.reportDate
      } else if (r.reportDate) {
        finalReportDate = new Date(r.reportDate).toLocaleDateString('en-GB')
      }

      sheet.addRow({
        sNo: r.sNo,
        dateOfReceipt: r.dateOfReceipt ? new Date(r.dateOfReceipt).toLocaleDateString('en-GB') : '',
        sampleName: r.sampleName,
        sampleNo: r.sampleNo,
        customerName: r.customerName,
        sentBy: r.sentBy,
        analysisRequired: r.analysisRequired?.join(', '),
        location: r.location,
        status: r.status,
        reportDate: finalReportDate,
        approvedBy: r.approvedBy,
        sampleRequestDate: r.sampleRequestDate ? new Date(r.sampleRequestDate).toLocaleDateString('en-GB') : '',
        remark: r.remark
      })
    }
    
    sheet.getRow(1).font = { bold: true }
    
    const buffer = await workbook.xlsx.writeBuffer()
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', \`attachment; filename="All_Sample_Requests_Log.xlsx"\`)
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
`;

  // Insert the new route right BEFORE router.get('/:id', async (req, res) => {
  const getIdStart = routes.indexOf("router.get('/:id'");
  if (getIdStart !== -1) {
    const beforeGetId = routes.substring(0, getIdStart);
    const afterGetId = routes.substring(getIdStart);
    
    // Remove the old patch route from where it was
    const cleanBeforeGetId = beforeGetId.substring(0, routeStart) + beforeGetId.substring(routeEnd);
    routes = cleanBeforeGetId + newRoute + "\n" + afterGetId;
  } else {
      // If we somehow can't find get id, just replace patch inline
      routes = routes.substring(0, routeStart) + newRoute + routes.substring(routeEnd);
  }
  
  fs.writeFileSync('backend/src/routes/samplerequest.routes.js', routes);
}

// 2. Update frontend/src/api.js
let api = fs.readFileSync('frontend/src/api.js', 'utf8');
api = api.replace(
  /downloadExcelLog: async \(id\) => \{[\s\S]*?\},/,
  `downloadExcelLog: async () => {
    const res = await fetch(\`\${API_URL}/sample-requests/excel-log\`, {
      method: 'GET',
      headers: { ...getHeaders() }
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to download Excel log')
    }
    const blob = await res.blob()
    const contentDisposition = res.headers.get('content-disposition')
    let filename = 'Sample_Log.xlsx'
    if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
      filename = contentDisposition.split('filename=')[1].replace(/"/g, '')
    }
    return { blob, filename }
  },`
);
fs.writeFileSync('frontend/src/api.js', api);

// 3. Update frontend/src/App.jsx
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

app = app.replace(
  /const handleDownloadExcel = async \(id\) => \{[\s\S]*?URL\.revokeObjectURL\(url\)\n\s*setSampleRequests\(\(current\) => current\.map\(r => r\.id === id \? \{ \.\.\.r, data: \{ \.\.\.r\.data, status: 'Excel Logged' \} \} : r\)\)\n\s*\} catch \(error\) \{[\s\S]*?\}\n\s*\}/,
  `const handleDownloadExcel = async () => {
    setAppError('')
    try {
      const { blob, filename } = await api.downloadExcelLog()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setAppError(error.message)
    }
  }`
);

// Remove the row-level button
app = app.replace(
  / \{req\.data\.status === 'Sample Received' && currentUser\?\.role\?\.toLowerCase\(\) !== 'manager' && <button type="button" onClick=\{\(\) => handleDownloadExcel\(req\.id\)\} style=\{\{ fontSize: '12px', padding: '4px 8px', background: '#217346', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' \}\}>Download Excel Log<\/button>\}/,
  ''
);

// Add global button below table
app = app.replace(
  /<\/table>\n\s*<\/div>\n\s*<\/section>/,
  `</table>
        </div>
        
        {currentUser?.role?.toLowerCase() !== 'manager' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button 
              className="validate-button" 
              onClick={() => handleDownloadExcel()}
              style={{ background: '#217346', border: 'none' }}
            >
              Download Excel Log
            </button>
          </div>
        )}
      </section>`
);

fs.writeFileSync('frontend/src/App.jsx', app);
console.log('Script completed.');
