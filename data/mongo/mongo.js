const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Akaimnky:57n57ng96969@cluster0.ukxb93z.mongodb.net/?retryWrites=true&w=majority";
// MongoDB connection setup
const mongoClient = new MongoClient(uri, {

  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  async function connectToDB() {
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

module.exports = {mongoClient, connectToDB};