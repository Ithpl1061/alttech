const { MongoClient } = require('./backend/node_modules/mongodb')

async function promote() {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017')
  const db = client.db('laboratory_reports')
  const email = 'manager12@gmail.com'
  
  const result = await db.collection('users').updateOne(
    { email: email },
    { $set: { role: 'Manager' } }
  )
  
  if (result.matchedCount > 0) {
    console.log(`Successfully promoted ${email} to Manager!`)
  } else {
    console.log(`User ${email} not found. Please make sure you created the account first.`)
  }
  
  await client.close()
}

promote().catch(console.error)
