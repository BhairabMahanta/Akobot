const mongoose = require("mongoose");

const { Schema } = mongoose;
const playerSchema = new Schema(
  {
    _id: String,
    name: String,
    location: String,
    inventory: {
      active: [String],
      backpack: [String],
      tokens: {
        commonScroll: Number,
        rareScroll: Number,
        legendaryScroll: Number,
      },
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
      critRate: Number,
      critDamage: Number,
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
  },
  { strict: false }
);

async function playerModel(db, collectionName) {
  return db.model("Player", playerSchema, collectionName);
}

module.exports = { playerModel };
