const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://Akaimnky:57n57ng96969@cluster0.ukxb93z.mongodb.net/?retryWrites=true&w=majority";

const mongoClient = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function connectToDB() {
    try {
    await mongoClient.connect();
    console.log('Connected to MongoDBthruclient');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
  try {
    // Connect to MongoDB using Mongoose
   const db = mongoose.createConnection(mongoURI, {
       dbName: 'Akaimnky',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Handle connection events
     db.on('error', console.error.bind(console, 'MongoDB connection error:'));
     db.once('open', () => {
      console.log('Connected to MongoDB');
    });
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }

}
//console.log(`message`);

module.exports = { mongoClient, connectToDB };

