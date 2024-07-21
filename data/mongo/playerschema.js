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
      magicDefense: Number,
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
    collectionInv: [
      {
        serialId: String,
        globalId: String,
        name: String,
        stats: {
          level: Number,
          xp: Number,
          attack: Number,
          defense: Number,
          speed: Number,
          hp: Number,
          tier: Number,
          evolution: Number,
          critRate: Number,
          critDamage: Number,
          magic: Number,
          magicDefense: Number,
          // Add other relevant stats here
        },
      },
    ],
    deck: [{ slot: Number, serialId: String, globalId: String, name: String }],
    selectedFamiliars: {
      name: [{ name: String, serialId: Number, tier: Number }],
    },
  },

  { strict: false }
);

async function playerModel(db, collectionName) {
  return db.model("Player", playerSchema, collectionName);
}

module.exports = { playerModel };
