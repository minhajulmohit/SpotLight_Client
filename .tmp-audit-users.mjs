import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("spotlight");

const collections = await db.listCollections().toArray();
console.log("Collections:", collections.map((c) => c.name).join(", "));

for (const { name } of collections) {
  const count = await db.collection(name).countDocuments();
  console.log(`- ${name}: ${count}`);
}

const found = await db
  .collection("user")
  .find({ $or: [{ _id: "M7qRmOC7zFUb7CpNJYuY81QFThvg7ax1" }, { email: /audit|weak|short/i }] })
  .toArray();
console.log("Found docs:", JSON.stringify(found, null, 2));

const allUsers = await db
  .collection("user")
  .find({})
  .project({ _id: 1, email: 1, name: 1, createdAt: 1 })
  .toArray();
console.log("All users:", JSON.stringify(allUsers, null, 2));

await client.close();
