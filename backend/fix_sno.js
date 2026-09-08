import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/laboratory_reports');
  const db = mongoose.connection.db;
  const SampleRequest = db.collection('samplerequests');
  const Counter = db.collection('counters');

  const requests = await SampleRequest.find().sort({ createdAt: 1 }).toArray();
  for (let i = 0; i < requests.length; i++) {
    await SampleRequest.updateOne({ _id: requests[i]._id }, { $set: { sNo: i + 1 } });
    console.log(`Updated request ${requests[i].sampleNo} (${requests[i].customerName}) -> sNo: ${i + 1}`);
  }

  await Counter.updateOne({ _id: 'sampleRequestId' }, { $set: { seq: requests.length } }, { upsert: true });
  console.log(`\nUpdated Counter 'sampleRequestId' seq -> ${requests.length}`);
  
  mongoose.disconnect();
}

run().catch(console.error);
