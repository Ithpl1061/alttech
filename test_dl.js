const fs = require('fs');

async function testDownload() {
  const staffRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@alltech.com', password: 'password123' })
  });
  
  const staffData = await staffRes.json();
  if (!staffData.success) {
    console.log('Failed to login:', staffData.message);
    // wait, we don't have john in DB. Let's just create a quick mock request without auth to test if the endpoint is reachable.
  }
}
testDownload();
