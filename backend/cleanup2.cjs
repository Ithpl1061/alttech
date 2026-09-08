const { MongoClient } = require('mongodb');
async function run() {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017');
  const db = client.db('laboratory_reports');
  await db.collection('samplerequests').deleteMany({ sampleIdNo: 'S-12345' });
  await db.collection('users').deleteMany({ email: { $regex: '^testuser_' } });
  client.close();
  console.log('Cleaned up mock data from laboratory_reports (S-12345)');
}
run();
