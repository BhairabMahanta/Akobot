const mongoose = require("mongoose");

const { Schema } = mongoose;

const achievementSchema = new Schema(
  {
    _id: String,
    name: String,
    description: String,
    reward: {
      coins: Number,
      gems: Number,
      xp: Number,
    },
    firstAchieved: Number,
    achievedBy: Number, // +1 everytime
  },
  { strict: false }
);

async function achievementModel(db, collectionName) {
  return db.model("Achievement", achievementSchema, collectionName);
}

module.exports = { achievementModel };
