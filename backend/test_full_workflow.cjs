const fs = require('fs');
const path = require('path');
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
  
  // Extract set-cookie for sessions
  const cookie = res.headers.get('set-cookie');
  
  if (!res.ok) {
    throw new Error(`API ${options.method || 'GET'} ${endpoint} failed: ${res.status} ${json.error || json.message || body}`);
  }
  return { json, cookie };
}

async function run() {
  console.log('--- STARTING FULL WORKFLOW API TEST ---');
  let staffCookie, managerCookie;
  let testReqId, testReportId;
  const testStaffId = 'staff_' + Date.now();
  const testManagerId = 'mgr_' + Date.now();
  
  try {
    console.log('1. Signup Staff & Manager');
    await fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify({ fullName: 'Test Staff', email: testStaffId + '@test.com', password: 'password123', confirmPassword: 'password123' }) });
    const staffLogin = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email: testStaffId + '@test.com', password: 'password123' }) });
    staffCookie = staffLogin.cookie;
    
    await fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify({ fullName: 'Test Manager', email: testManagerId + '@test.com', password: 'password123', confirmPassword: 'password123' }) });
    
    console.log('   Promoting Manager directly in DB...');
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://127.0.0.1:27017/laboratory_reports');
    await mongoose.connection.collection('users').updateOne({ email: testManagerId + '@test.com' }, { $set: { role: 'Manager' } });
    await mongoose.disconnect();
    
    const mgrLogin = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email: testManagerId + '@test.com', password: 'password123' }) });
    managerCookie = mgrLogin.cookie;
    

    console.log('   ✓ Signup and promotion successful');

    console.log('2. [Phase 1] Create Sample Request (Staff)');
    const createReq = await fetchApi('/sample-requests', {
      method: 'POST',
      headers: { 'cookie': staffCookie },
      body: JSON.stringify({ sampleIdNo: 'TEST-123', customerName: 'Test Customer', customerAddress: '123 Test St', speciesCategory: 'Poultry', sampleCategory: 'Feed', testParameters: ['pH'] })
    });
    testReqId = createReq.json.data.sampleRequest._id;
    console.log(`   ✓ Created request ${testReqId}`);

    console.log('3. [Phase 1] Approve Request (Manager)');
    await fetchApi(`/sample-requests/${testReqId}/approve`, {
      method: 'PATCH',
      headers: { 'cookie': managerCookie },
      body: JSON.stringify({ remarks: 'Looks good' })
    });
    console.log('   ✓ Approved request');

    console.log('4. [Phase 2] Upload Condition Photo (Staff)');
    const webFd = new FormData();
    webFd.append('photo', new Blob(['fake image data'], { type: 'image/jpeg' }), 'test.jpg');
    await fetchApi(`/sample-requests/${testReqId}/receive`, {
      method: 'PATCH',
      headers: { 'cookie': staffCookie },
      body: webFd
    });
    console.log('   ✓ Uploaded photo & received');

    console.log('5. [Phase 4] Download Excel Log (Staff)');
    await fetchApi(`/sample-requests/${testReqId}/excel-log`, { method: 'PATCH', headers: { 'cookie': staffCookie } });
    console.log('   ✓ Downloaded Excel log');

    console.log('6. [Phase 5] Enter Results / Create Report (Staff)');
    const createRep = await fetchApi('/reports', {
      method: 'POST',
      headers: { 'cookie': staffCookie },
      body: JSON.stringify({
        sampleRequestId: testReqId,
        sampleNameNo: 'TEST-123',
        name: 'Test Customer',
        address: '123 Test St',
        reportNo: 'REP-001',
        sampleReceiptDate: '2026-09-01',
        reportDate: '2026-09-01',
        samplePacking: 'Sealed',
        tests: [{ parameter: 'pH', method: 'Test', result: '7.0', unit: 'pH', remark: 'Good' }]
      })
    });
    testReportId = createRep.json.data.report._id;
    console.log(`   ✓ Created report ${testReportId}`);

    console.log('7. [Phase 6] Submit for Review (Staff)');
    await fetchApi(`/sample-requests/${testReqId}/submit-review`, {
      method: 'PATCH',
      headers: { 'cookie': staffCookie }
    });
    console.log('   ✓ Submitted for review');

    console.log('8. [Phase 7] Review & Approve (Manager)');
    await fetchApi(`/sample-requests/${testReqId}/review`, {
      method: 'PATCH',
      headers: { 'cookie': managerCookie },
      body: JSON.stringify({ reviewComments: 'Excellent work' })
    });
    console.log('   ✓ Reviewed and approved');

    console.log('9. [Phase 8] Finalize Report (Manager or Staff)');
    await fetchApi(`/sample-requests/${testReqId}/finalize`, {
      method: 'PATCH',
      headers: { 'cookie': managerCookie }
    });
    console.log('   ✓ Finalized workflow');

    console.log('--- ALL WORKFLOW APIS SUCCESSFUL ---');

  } catch (error) {
    console.error('FAILED:', error.message);
  } finally {
    console.log('Cleaning up test data...');
    try {
      const mongoose = require('mongoose');
      await mongoose.connect('mongodb://127.0.0.1:27017/laboratory_reports');
      await mongoose.connection.collection('users').deleteMany({ username: { $in: [testStaffId, testManagerId] } });
      if (testReqId) await mongoose.connection.collection('samplerequests').deleteOne({ _id: new mongoose.Types.ObjectId(testReqId) });
      if (testReportId) await mongoose.connection.collection('reports').deleteOne({ _id: new mongoose.Types.ObjectId(testReportId) });
      await mongoose.disconnect();
      console.log('   ✓ Cleanup successful');
    } catch(e) {
      console.error('Cleanup failed:', e.message);
    }
  }
}

run();
