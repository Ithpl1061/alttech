import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://dubeyadi515_db_user:NEACn3HxDlaBWW3L@cluster0.gmdxnhq.mongodb.net/?appName=Cluster0');
  
  const User = mongoose.connection.collection('users');
  const SampleRequest = mongoose.connection.collection('samplerequests');
  const Report = mongoose.connection.collection('reports');
  const Template = mongoose.connection.collection('templates');
  
  console.log('\n--- USERS ---');
  console.log(await User.find().limit(1).toArray());
  
  console.log('\n--- SAMPLE REQUESTS ---');
  console.log(await SampleRequest.find().limit(1).toArray());
  
  console.log('\n--- REPORTS ---');
  console.log(await Report.find().limit(1).toArray());
  
  console.log('\n--- TEMPLATES ---');
  console.log(await Template.find().limit(1).toArray());
  
  mongoose.disconnect();
}
run().catch(console.error);
