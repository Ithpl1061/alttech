const fs = require('fs');

async function testExcel() {
  console.log('--- TESTING EXCEL BULK DOWNLOAD ---');
  
  // Login as Staff (we need an auth token)
  const staffRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@alltech.com', password: 'password123' })
  });
  
  const staffData = await staffRes.json();
  if (!staffData.success) {
    console.log('Failed to login:', staffData.message);
    return;
  }
  const staffToken = staffData.token;
  
  // Create a dummy request to guarantee at least one exists
  const submitRes = await fetch('http://localhost:5000/api/sample-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${staffToken}` },
    body: JSON.stringify({
      sampleName: 'Test Excel',
      sampleNo: 'EXCEL-001',
      customerName: 'Excel Customer',
      sentBy: 'John',
      analysisRequired: ['Moisture'],
      location: 'Pune',
      sampleRequestDate: new Date().toISOString(),
      reportDate: new Date().toISOString(),
      remark: 'Please log me'
    })
  });
  
  const reqData = await submitRes.json();
  const reqId = reqData.data.sampleRequest._id;
  console.log('Created request for excel test:', reqId);

  // Call the excel-log route
  const excelRes = await fetch(`http://localhost:5000/api/sample-requests/${reqId}/excel-log`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });

  if (!excelRes.ok) {
    const errorText = await excelRes.text();
    console.log('Excel download failed:', errorText);
    return;
  }

  const buffer = await excelRes.arrayBuffer();
  console.log('Excel generated successfully. File size (bytes):', buffer.byteLength);
  console.log('Headers:', excelRes.headers.get('content-disposition'));
}

testExcel().catch(console.error);
