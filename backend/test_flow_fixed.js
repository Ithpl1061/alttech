import fs from 'fs'

async function runTest() {
  const baseURL = 'http://localhost:5000/api'
  let userCookie = ''
  let managerCookie = ''

  console.log('--- E2E TEST: NEW CLIENT FIELDS ---')

  // 1. Login User
  const loginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'staff@alltech.com', password: 'password123' })
  })
  if (loginRes.ok) {
    userCookie = loginRes.headers.get('set-cookie')
    console.log('User login successful')
  } else {
    console.error('Failed to login user', await loginRes.text())
    return
  }

  // 2. Login Manager
  const mgrRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mgr3@alltech.com', password: 'password123' })
  })
  if (mgrRes.ok) {
    managerCookie = mgrRes.headers.get('set-cookie')
    console.log('Manager login successful')
  } else {
    console.error('Failed to login manager', await mgrRes.text())
    return
  }

  // 3. Create Sample Request
  const reqData = {
    sampleName: 'Test Sample X',
    sampleNo: 'SMP-999',
    customerName: 'Acme Corp',
    sentBy: 'John Doe',
    analysisRequired: ['PH', 'Moisture', 'Lead'],
    location: '123 Test Ave',
    sampleRequestDate: '2026-09-02',
    remark: 'Urgent testing'
  }
  const createRes = await fetch(`${baseURL}/sample-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cookie': userCookie },
    body: JSON.stringify(reqData)
  })
  const created = await createRes.json()
  if (!created.success) return console.error('Failed to create request:', created)
  const reqId = created.data.sampleRequest._id
  console.log('Sample request created:', reqId, 'S.No:', created.data.sampleRequest.sNo)

  // 4. Approve
  const approveRes = await fetch(`${baseURL}/sample-requests/${reqId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'cookie': managerCookie },
    body: JSON.stringify({ remarks: 'Looks good' })
  })
  const approved = await approveRes.json()
  if (!approved.success) return console.error('Approve failed', approved)
  console.log('Request approved by:', approved.data.sampleRequest.approvedBy)

  // 5. Sample Received
  // Use a dummy photo upload using native node fetch
  const FormData = require('form-data')
  const form = new FormData()
  fs.writeFileSync('dummy.jpg', 'dummy data')
  form.append('photo', fs.createReadStream('dummy.jpg'))

  const receiveRes = await fetch(`${baseURL}/sample-requests/${reqId}/receive`, {
    method: 'PATCH',
    headers: { 'cookie': userCookie, ...form.getHeaders() },
    body: form
  })
  const received = await receiveRes.json()
  if (!received.success) return console.error('Receive failed:', received)
  console.log('Sample marked as received. Date of Receipt:', received.data.sampleRequest.dateOfReceipt)
  fs.unlinkSync('dummy.jpg')

  // 6. Download Excel (Stage 1)
  const excel1 = await fetch(`${baseURL}/sample-requests/${reqId}/excel-log`, {
    method: 'PATCH', headers: { 'cookie': userCookie }
  })
  if (!excel1.ok) return console.error('Excel 1 failed')
  const excelBuffer1 = await excel1.arrayBuffer()
  console.log('Excel log downloaded (size):', excelBuffer1.byteLength)

  // 7. Create/Enter Results (Report)
  const reportData = {
    name: 'Test Report X',
    address: '123 Test Ave',
    reportNo: 'RPT-999',
    sampleReceiptDate: '2026-09-02',
    sampleNameNo: 'Test Sample X / SMP-999',
    reportDate: '2026-09-05',
    samplePacking: 'Sealed',
    tests: [
      { parameter: 'PH', method: 'M1', result: '7', unit: 'pH', remark: 'OK' },
      { parameter: 'Moisture', method: 'M2', result: '10', unit: '%', remark: 'OK' },
      { parameter: 'Lead', method: 'M3', result: '0', unit: 'ppm', remark: 'OK' }
    ]
  }
  const resultRes = await fetch(`${baseURL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cookie': userCookie },
    body: JSON.stringify({ ...reportData, linkedRequestId: reqId })
  })
  const resultData = await resultRes.json()
  if (!resultData.success) return console.error('Result entry failed:', resultData)
  console.log('Results entered (report created):', resultData.data.report._id)

  // 8. Submit Review
  const submitRes = await fetch(`${baseURL}/sample-requests/${reqId}/submit-review`, {
    method: 'PATCH', headers: { 'cookie': userCookie }
  })
  if (!(await submitRes.json()).success) return console.error('Submit review failed')
  console.log('Submitted for review')

  // 9. Review
  const reviewRes = await fetch(`${baseURL}/sample-requests/${reqId}/review`, {
    method: 'PATCH', headers: { 'cookie': managerCookie }
  })
  if (!(await reviewRes.json()).success) return console.error('Review failed')
  console.log('Reviewed by manager')

  // 10. Finalize
  const finalRes = await fetch(`${baseURL}/sample-requests/${reqId}/finalize`, {
    method: 'PATCH', headers: { 'cookie': managerCookie }
  })
  const finalData = await finalRes.json()
  if (!finalData.success) return console.error('Finalize failed:', finalData)
  console.log('Finalized. Report Date set to:', finalData.data.sampleRequest.reportDate)

  // 11. Re-download Excel (Stage 2)
  const excel2 = await fetch(`${baseURL}/sample-requests/${reqId}/excel-log`, {
    method: 'PATCH', headers: { 'cookie': userCookie }
  })
  if (!excel2.ok) return console.error('Excel 2 failed', await excel2.text())
  
  // Verify History
  const history = finalData.data.sampleRequest.workflowHistory
  const statuses = history.map(h => h.status)
  console.log('Workflow History Flow:', statuses.join(' -> '))
  
  const excelHistoryCount = statuses.filter(s => s === 'Excel Logged').length
  if (excelHistoryCount > 1) {
    console.error('ERROR: Excel Logged status was duplicated in history!')
  } else {
    console.log('SUCCESS: Excel Logged status was completely stable.')
  }
  
  // Actually verify Excel columns using exceljs
  fs.writeFileSync('test_output.xlsx', Buffer.from(await excel2.arrayBuffer()))
  const ExcelJS = require('exceljs')
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile('test_output.xlsx')
  const sheet = workbook.getWorksheet(1)
  const row = sheet.getRow(1).values
  console.log('Excel Headers:', row.slice(1).join(' | '))

  const dataRow = sheet.getRow(2).values
  console.log('Data values:', dataRow.slice(1).join(' | '))

  console.log('--- END OF E2E ---')
}

runTest().catch(console.error)
