import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://dubeyadi515_db_user:NEACn3HxDlaBWW3L@cluster0.gmdxnhq.mongodb.net/?appName=Cluster0');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  mongoose.disconnect();
}
run().catch(console.error);
