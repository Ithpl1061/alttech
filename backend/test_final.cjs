const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const API_BASE = 'http://localhost:5000/api';

async function fetchApi(endpoint, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const body = await res.text();
  let json = {};
  try { json = JSON.parse(body); } catch (e) {}
  const cookie = res.headers.get('set-cookie');
  if (!res.ok) {
    throw new Error(`API ${options.method || 'GET'} ${endpoint} failed: ${res.status} ${json.error || json.message || body}`);
  }
  return { json, cookie, arrayBuffer: res.arrayBuffer.bind(res) };
}

async function runTest() {
  console.log('--- STARTING USER TEST ---');
  let staffCookie;
  let testReqId;
  const testStaffId = 'staff_' + Date.now();

  try {
    console.log('1. Signup Staff');
    await fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify({ fullName: 'Test Staff', email: testStaffId + '@test.com', password: 'password123', confirmPassword: 'password123' }) });
    const staffLogin = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email: testStaffId + '@test.com', password: 'password123' }) });
    staffCookie = staffLogin.cookie;

    console.log('2. Create Sample Request with Report Date');
    const reqBody = {
      sampleName: 'DDGS',
      sampleNo: 'AF/26/1588',
      customerName: 'BKSK',
      sentBy: 'Ankit Kumar',
      analysisRequired: ['Proximate & Aflatoxin'],
      location: 'Amritsar, Punjab',
      sampleRequestDate: '2026-07-26', // Formatted as YYYY-MM-DD
      reportDate: '2026-04-08', // 04/08/2026 (DD/MM/YYYY) is usually parsed depending on locale, let's use YYYY-MM-DD so Date object parses it correctly
      remark: 'Test'
    };
    
    const createReq = await fetchApi('/sample-requests', {
      method: 'POST',
      headers: { 'cookie': staffCookie },
      body: JSON.stringify(reqBody)
    });
    testReqId = createReq.json.data.sampleRequest._id;
    console.log(`   ✓ Created request ${testReqId}`);

    // Wait, the route says "Request must be marked as received before logging to Excel."
    // Let me update the status manually to avoid doing the whole flow.
    console.log('   (Manually forcing status to "Sample Received" in DB so we can download Excel)');
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://127.0.0.1:27017/laboratory_reports');
    await mongoose.connection.collection('samplerequests').updateOne({ _id: new mongoose.Types.ObjectId(testReqId) }, { $set: { status: 'Sample Received' } });
    await mongoose.disconnect();

    console.log('3. Generate Excel Log');
    const excelRes = await fetchApi(`/sample-requests/${testReqId}/excel-log`, {
      method: 'PATCH',
      headers: { 'cookie': staffCookie }
    });
    const buffer = await excelRes.arrayBuffer();

    console.log('4. Read Excel Log and Verify');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Sample Log');
    const row = sheet.getRow(2).values;
    console.log('   Excel Row:', row);
    console.log('   Report Date Column:', row[10]);

    if (row[10] === '08/04/2026' || row[10] === '04/08/2026') {
      console.log('   SUCCESS: Report Date correctly populated from initial request form.');
    } else {
      console.log('   FAILURE: Report Date not populated correctly.');
    }
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

runTest();
