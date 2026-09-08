const { MongoClient } = require('mongodb');
async function run() {
  const client = await MongoClient.connect('mongodb://127.0.0.1:27017');
  const db = client.db('laboratory_reports');
  await db.collection('samplerequests').deleteMany({ $or: [{ sampleIdNo: 'S-999' }, { customerName: 'Farm XYZ' }] });
  await db.collection('users').deleteMany({ email: { $regex: '^manager_' } });
  await db.collection('users').deleteMany({ email: { $regex: '^staff_' } });
  client.close();
  console.log('Cleaned up mock data from laboratory_reports');
}
run();
