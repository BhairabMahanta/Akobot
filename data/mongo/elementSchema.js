const mongoose = require("mongoose");
const { Schema } = mongoose;

const deactivatedElementSchema = new Schema({
  playerId: { type: String, required: true },
  deactivatedElements: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
  reActivateTime: { type: Date, default: Date.now },
});

async function DeactivatedElementModel(db, collectionName) {
  return db.model(
    "DeactivatedElement",
    deactivatedElementSchema,
    collectionName
  );
}
module.exports = { DeactivatedElementModel };
