const assert = require('assert')

const baseUrl = 'http://localhost:5000/api'

async function runTest() {
  console.log('Testing Workflow Fix...')
  // 1. Create a user
  const email = `testuser_${Date.now()}@example.com`
  let res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Test User', email, password: 'password123', confirmPassword: 'password123' })
  })
  
  // Login to get cookie
  res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  })
  const cookie = res.headers.get('set-cookie')
  assert(res.ok, 'Login failed')
  
  // 2. Create Sample Request
  const payload = {
    speciesCategory: 'Bovine',
    sampleCategory: 'Blood',
    testParameters: ['WBC', 'RBC'],
    sampleIdNo: 'S-12345',
    customerName: 'Farm ABC',
    customerAddress: '123 Farm Rd',
    isExistingCustomer: false
  }
  res = await fetch(`${baseUrl}/sample-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(payload)
  })
  let body = await res.json()
  assert(res.ok, `Create request failed: ${JSON.stringify(body)}`)
  assert.equal(body.data.sampleRequest.status, 'Pending Approval')
  
  // 3. List requests
  res = await fetch(`${baseUrl}/sample-requests`, {
    headers: { cookie }
  })
  body = await res.json()
  assert(res.ok, 'List requests failed')
  assert(body.data.sampleRequests.length > 0)
  assert.equal(body.data.sampleRequests[0].sampleIdNo, 'S-12345')
  
  console.log('All backend checks passed! The bug is fixed.')

  console.log('Cleaning up test records...')
  const { MongoClient } = require('./backend/node_modules/mongodb')
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017')
  const db = client.db('laboratory_reports')
  await db.collection('samplerequests').deleteMany({ sampleIdNo: 'S-12345' })
  await db.collection('users').deleteOne({ email })
  await client.close()
  console.log('Cleanup complete.')
}

runTest().catch(console.error)
