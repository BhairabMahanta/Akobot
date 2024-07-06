const mongoose = require("mongoose");
const { Schema } = mongoose;

const deactivatedElementSchema = new Schema({
  playerId: { type: String, required: true },
  deactivatedElements: {
    type: [
      {
        name: String,
        reActivateTime: Date,
      },
    ],
    default: [],
  },
  date: { type: Date, default: Date.now },
});

const DeactivatedElement = mongoose.model(
  "DeactivatedElement",
  deactivatedElementSchema
);

module.exports = { DeactivatedElement };
