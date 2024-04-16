const mongoose = require("mongoose");

const { Schema } = mongoose;
const mailSchema = new Schema(
  {
    _id: String,
    name: String,
    mailText: String,
    mailTrigger: String,
    mailTo: String,
    mailClaimed: Boolean,
    numberClaimed: Number,
    achievement: Boolean,
    date: { type: Date, default: Date.now },
    deleteAfter: Number,
    autoClaim: Boolean,
    rewards: {
      coins: Number,
      gems: Number,
      xp: Number,
    },
  },
  { strict: false }
);

async function playerModel(db, collectionName) {
  return db.model("Player", mailSchema, collectionName);
}

module.exports = { playerModel };
