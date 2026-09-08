import mongoose from 'mongoose';
import Report from './src/models/Report.js';
import SampleRequest from './src/models/SampleRequest.js';
import Template from './src/models/Template.js';

async function run() {
  await mongoose.connect('mongodb+srv://dubeyadi515_db_user:NEACn3HxDlaBWW3L@cluster0.gmdxnhq.mongodb.net/?appName=Cluster0');
  
  console.log('\n--- SAMPLE REQUEST ---');
  console.log(await SampleRequest.findOne().sort({ createdAt: -1 }));
  
  console.log('\n--- REPORT ---');
  console.log(await Report.findOne().sort({ createdAt: -1 }));
  
  console.log('\n--- TEMPLATE ---');
  console.log(await Template.findOne().sort({ createdAt: -1 }));
  
  mongoose.disconnect();
}
run().catch(console.error);
