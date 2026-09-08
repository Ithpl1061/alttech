const fs = require('fs');
let code = fs.readFileSync('src/routes/samplerequest.routes.js', 'utf8');

if (!code.includes('Counter.js')) {
  code = code.replace(`import SampleRequest from '../models/SampleRequest.js'`, 
  `import SampleRequest from '../models/SampleRequest.js'\nimport Counter from '../models/Counter.js'\nimport Report from '../models/Report.js'`);
}

code = code.replace(
  /const \{ speciesCategory.*? = req\.body\s+const request = new SampleRequest\(\{\s+ownerId: req\.userId,\s+speciesCategory,\s+sampleCategory,\s+testParameters,\s+sampleIdNo,\s+customerName,\s+customerAddress,\s+isExistingCustomer,\s+status: 'Pending Approval',/s,
  `const { sampleName, sampleNo, customerName, sentBy, analysisRequired, location, sampleRequestDate, remark } = req.body
    
    const counter = await Counter.findOneAndUpdate(
      { _id: 'sampleRequestId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
    
    const request = new SampleRequest({
      ownerId: req.userId,
      sNo: counter.seq,
      sampleName,
      sampleNo,
      customerName,
      sentBy,
      analysisRequired,
      location,
      sampleRequestDate,
      remark,
      status: 'Pending Approval',`
);

code = code.replace(
  /request\.status = 'Approved'\s+request\.workflowHistory\.push\(\{/s,
  `request.status = 'Approved'
    request.approvedBy = user.fullName || user.username
    request.workflowHistory.push({`
);

code = code.replace(
  /request\.status = 'Sample Received'\s+request\.conditionPhotoUrl = '\/uploads\/photos\/' \+ req\.file\.filename\s+request\.workflowHistory\.push\(\{/s,
  `request.status = 'Sample Received'
    request.conditionPhotoUrl = '/uploads/photos/' + req.file.filename
    request.dateOfReceipt = new Date()
    request.workflowHistory.push({`
);

code = code.replace(
  /if \(request\.status !== 'Sample Received'\) return res\.status\(400\)\.json\(\{ success: false, error: 'Only received requests can be logged to Excel\.' \}\)/s,
  `if (request.status === 'Pending Approval' || request.status === 'Approved' || request.status === 'Rejected') {
      return res.status(400).json({ success: false, error: 'Request must be marked as received before logging to Excel.' })
    }`
);

code = code.replace(
  /sheet\.columns = \[\s+\{ header: 'Sample ID'.*?width: 20 \}\s+\]\s+sheet\.addRow\(\{.*?\}\)\s+sheet\.getRow\(1\)\.font = \{ bold: true \}/s,
  `sheet.columns = [
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
    
    sheet.addRow({
      sNo: request.sNo,
      dateOfReceipt: request.dateOfReceipt ? new Date(request.dateOfReceipt).toLocaleDateString('en-GB') : '',
      sampleName: request.sampleName,
      sampleNo: request.sampleNo,
      customerName: request.customerName,
      sentBy: request.sentBy,
      analysisRequired: request.analysisRequired?.join(', '),
      location: request.location,
      status: request.status,
      reportDate: request.reportDate ? new Date(request.reportDate).toLocaleDateString('en-GB') : '',
      approvedBy: request.approvedBy,
      sampleRequestDate: request.sampleRequestDate ? new Date(request.sampleRequestDate).toLocaleDateString('en-GB') : '',
      remark: request.remark
    })
    
    sheet.getRow(1).font = { bold: true }`
);

code = code.replace(
  /request\.status = 'Excel Logged'\s+request\.workflowHistory\.push\(\{\s+status: 'Excel Logged',\s+actionBy: req\.userId,\s+remarks: 'Excel log downloaded\.'\s+\}\)\s+await request\.save\(\)/s,
  `if (request.status === 'Sample Received') {
      request.status = 'Excel Logged'
      request.workflowHistory.push({
        status: 'Excel Logged',
        actionBy: req.userId,
        remarks: 'Excel log downloaded.'
      })
      await request.save()
    }`
);

code = code.replace(
  /filename="Sample_Log_\$\{request\.sampleIdNo\}\.xlsx"/g,
  `filename="Sample_Log_\${request.sampleNo}.xlsx"`
)

code = code.replace(
  /request\.status = 'Final\/Sent'\s+request\.workflowHistory\.push\(\{/s,
  `request.status = 'Final/Sent'
    const linkedReport = await Report.findById(request.linkedReportId)
    if (linkedReport && linkedReport.reportDate) {
      request.reportDate = new Date(linkedReport.reportDate)
    }
    request.workflowHistory.push({`
);

fs.writeFileSync('src/routes/samplerequest.routes.js', code);
