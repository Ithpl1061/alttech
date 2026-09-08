import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://dubeyadi515_db_user:NEACn3HxDlaBWW3L@cluster0.gmdxnhq.mongodb.net/?appName=Cluster0');
  
  const User = mongoose.connection.collection('users');
  const SampleRequest = mongoose.connection.collection('samplerequests');
  const Report = mongoose.connection.collection('reports');
  const Template = mongoose.connection.collection('templates');
  
  console.log('\n--- SAMPLE REQUEST ---');
  console.log(await SampleRequest.findOne({}, { sort: { createdAt: -1 } }));
  
  console.log('\n--- REPORT ---');
  console.log(await Report.findOne({}, { sort: { createdAt: -1 } }));
  
  console.log('\n--- TEMPLATE ---');
  console.log(await Template.findOne({}, { sort: { _id: -1 } }));
  
  mongoose.disconnect();
}
run().catch(console.error);
