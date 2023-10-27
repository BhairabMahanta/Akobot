
 const mongoose = require('mongoose');


// const mongoURI = "mongodb+srv://Akaimnky:57n57ng96969@cluster0.ukxb93z.mongodb.net/?retryWrites=true&w=majority";

// // Connect to MongoDB
// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });


const { Schema } = mongoose;
const playerSchema = new Schema({
     _id: String,
  name: String,
  location: String,
  inventory: {
    active: [String],
    backpack: [String],
  },
  stats: {
    attack: Number,
    tactics: Number,
    magic: Number,
    training: Number,
    defense: Number,
    speed: Number,
    hp: Number,
    intelligence: Number,
    wise: Number,
    luck: Number,
    devotion: Number,
    potential: Number,
  },
  balance: {
    coins: Number,
    gems: Number,
  },
  exp: {
    xp: Number,
    level: Number,
  },
  cards: {
    name: [String],
  },
  class: String,
  race: String,
  stuff: {
    generatedRandomElements: Boolean,
    generatedRandomElements2: Boolean,
  },
    playerpos: {
    x: Number,
    y: Number,
  },
});

async function playerModel(db){
return db.model('Player', playerSchema, 'akaillection')
}


module.exports = {playerModel};
