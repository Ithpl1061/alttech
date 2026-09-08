const assert = require('assert')
const { MongoClient } = require('./backend/node_modules/mongodb')

const baseUrl = 'http://localhost:5000/api'

async function runTest() {
  console.log('Testing Manager Flow...')
  // 1. Create a Manager
  const mEmail = `manager_${Date.now()}@example.com`
  let res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'The Manager', email: mEmail, password: 'password123', confirmPassword: 'password123', role: 'Manager' })
  })
  res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: mEmail, password: 'password123' })
  })
  let managerCookie = res.headers.get('set-cookie')

  // Set Manager role via mongodb directly
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017')
  const db = client.db('laboratory_reports')
  await db.collection('users').updateOne({ email: mEmail }, { $set: { role: 'Manager' } })
  await client.close()
  
  // 2. Create a Staff
  const sEmail = `staff_${Date.now()}@example.com`
  res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'The Staff', email: sEmail, password: 'password123', confirmPassword: 'password123', role: 'Staff' })
  })
  res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: sEmail, password: 'password123' })
  })
  let staffCookie = res.headers.get('set-cookie')

  // 3. Staff creates request
  const payload = {
    speciesCategory: 'Avian',
    sampleCategory: 'Feather',
    testParameters: ['Zinc'],
    sampleIdNo: 'S-999',
    customerName: 'Farm XYZ',
    customerAddress: '123 XYZ Rd',
    isExistingCustomer: true
  }
  res = await fetch(`${baseUrl}/sample-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: staffCookie },
    body: JSON.stringify(payload)
  })
  let body = await res.json()
  if (!body.data) { console.error('Create request failed:', body); return; }
  let reqId = body.data.sampleRequest._id
  
  // 4. Check Manager gets notification
  res = await fetch(`${baseUrl}/notifications`, { headers: { cookie: managerCookie } })
  body = await res.json()
  assert(body.data.notifications.some(n => n.title === 'New Sample Pickup Request'))

  // 5. Manager Approves
  res = await fetch(`${baseUrl}/sample-requests/${reqId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie: managerCookie },
    body: JSON.stringify({ remarks: 'Looks good' })
  })
  body = await res.json()
  assert.equal(body.data.sampleRequest.status, 'Approved')

  // 6. Check Staff gets notification
  res = await fetch(`${baseUrl}/notifications`, { headers: { cookie: staffCookie } })
  body = await res.json()
  assert(body.data.notifications.some(n => n.title === 'Request Approved'))

  console.log('Manager notification flow works perfectly!')

  console.log('Cleaning up test records...')
  await db.collection('samplerequests').deleteMany({ ownerId: { $in: [body.data.sampleRequest.ownerId] } })
  await db.collection('notifications').deleteMany({ $or: [{ userId: body.data.sampleRequest.ownerId }] })
  await db.collection('users').deleteOne({ email: mEmail })
  await db.collection('users').deleteOne({ email: sEmail })
  client.close()
  console.log('Cleanup complete.')
}

runTest().catch(console.error)
