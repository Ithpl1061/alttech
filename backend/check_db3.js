import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://dubeyadi515_db_user:NEACn3HxDlaBWW3L@cluster0.gmdxnhq.mongodb.net/?appName=Cluster0');
  
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log("Databases:", dbs.databases.map(d => d.name));
  
  mongoose.disconnect();
}
run().catch(console.error);
