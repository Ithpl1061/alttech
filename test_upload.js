const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')

async function runTest() {
  const baseUrl = 'http://localhost:5000/api'
  const api = axios.create({ baseURL: baseUrl, withCredentials: true })
  
  // 1. Create a Staff
  const sEmail = `staff_${Date.now()}@example.com`
  await api.post('/auth/signup', { fullName: 'The Staff', email: sEmail, password: 'password123', confirmPassword: 'password123', role: 'Staff' })
  const resLogin = await api.post('/auth/login', { email: sEmail, password: 'password123' })
  const cookie = resLogin.headers['set-cookie']
  
  // 2. Staff creates request
  const payload = {
    speciesCategory: 'Avian',
    sampleCategory: 'Feather',
    testParameters: ['Zinc'],
    sampleIdNo: 'S-999',
    customerName: 'Farm XYZ',
    customerAddress: '123 XYZ Rd',
    isExistingCustomer: true
  }
  const resCreate = await api.post('/sample-requests', payload, { headers: { cookie } })
  const reqId = resCreate.data.data.sampleRequest._id
  
  // 3. Mark it as Approved via MongoDB
  const { MongoClient, ObjectId } = require('./backend/node_modules/mongodb')
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017')
  const db = client.db('laboratory_reports')
  await db.collection('samplerequests').updateOne({ _id: new ObjectId(reqId) }, { $set: { status: 'Approved' } })
  await client.close()

  // 4. Upload photo
  const form = new FormData()
  fs.writeFileSync('dummy.jpg', 'fake image content')
  form.append('photo', fs.createReadStream('dummy.jpg'))
  
  try {
    const resUpload = await api.patch(`/sample-requests/${reqId}/receive`, form, {
      headers: { cookie, ...form.getHeaders() }
    })
    console.log('Upload successful! Photo URL:', resUpload.data.data.sampleRequest.conditionPhotoUrl)
  } catch (err) {
    console.error('Upload failed:', err.response?.data || err.message)
  }

  // Cleanup
  console.log('Cleaning up test records...')
  const client2 = await MongoClient.connect('mongodb://127.0.0.1:27017')
  const db2 = client2.db('laboratory_reports')
  await db2.collection('samplerequests').deleteOne({ _id: new ObjectId(reqId) })
  await db2.collection('users').deleteOne({ email: sEmail })
  await client2.close()
  if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg')
  console.log('Cleanup complete.')
}

runTest().catch(console.error)
