const fs = require('fs');

async function runTest() {
  console.log('--- TESTING NEW MANAGER APPROVAL WORKFLOW ---');
  
  // Login as Staff
  const staffRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@alltech.com', password: 'password123' }) // Assuming user exists from previous tests
  });
  
  const staffData = await staffRes.json();
  const staffToken = staffData.token;
  
  // Submit new request
  const submitRes = await fetch('http://localhost:5000/api/sample-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${staffToken}` },
    body: JSON.stringify({
      sampleName: 'Test Sample',
      sampleNo: 'TS-001',
      customerName: 'Test Customer',
      sentBy: 'John Doe',
      analysisRequired: ['Moisture'],
      location: 'Pune',
      sampleRequestDate: new Date().toISOString(),
      reportDate: new Date(Date.now() + 86400000).toISOString(),
      remark: 'Please approve'
    })
  });
  
  const reqData = await submitRes.json();
  console.log('Created Request:', reqData.success);
  const reqId = reqData.data.sampleRequest._id;

  // Login as Manager
  const managerRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jane@alltech.com', password: 'password123' })
  });
  const managerData = await managerRes.json();
  const managerToken = managerData.token;

  // Verify Manager Notifications
  const notifRes = await fetch('http://localhost:5000/api/notifications', {
    headers: { 'Authorization': `Bearer ${managerToken}` }
  });
  const notifications = await notifRes.json();
  const latestNotif = notifications.data.notifications[0];
  console.log('Latest Manager Notification:', {
    title: latestNotif.title,
    message: latestNotif.message,
    type: latestNotif.type,
    sampleRequestId: latestNotif.sampleRequestId
  });

  // Test Reject without remark
  const rejectFailRes = await fetch(`http://localhost:5000/api/sample-requests/${reqId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
    body: JSON.stringify({ remarks: '' })
  });
  const rejectFailData = await rejectFailRes.json();
  console.log('Reject without remarks should fail:', rejectFailData.success === false, rejectFailData.error);

  // Test Reject with remark
  const rejectSuccessRes = await fetch(`http://localhost:5000/api/sample-requests/${reqId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${managerToken}` },
    body: JSON.stringify({ remarks: 'Missing details' })
  });
  const rejectSuccessData = await rejectSuccessRes.json();
  console.log('Reject with remarks should succeed:', rejectSuccessData.success === true, 'Status:', rejectSuccessData.data.sampleRequest.status);

  // Verify Staff gets Rejection notification
  const staffNotifRes = await fetch('http://localhost:5000/api/notifications', {
    headers: { 'Authorization': `Bearer ${staffToken}` }
  });
  const staffNotifs = await staffNotifRes.json();
  console.log('Latest Staff Notification:', {
    title: staffNotifs.data.notifications[0].title,
    message: staffNotifs.data.notifications[0].message
  });
}

runTest().catch(console.error);
