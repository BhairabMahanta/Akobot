const {
  EmbedBuilder,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const bossData = require("../adv/monsterInfo/bosses");
const {
  GameImage,
  Player,
  Element,
} = require("./adv/adventure/sumfunctions.js");
const fs = require("fs");
let selectedValue = [];
const { mongoClient } = require("../../data/mongo/mongo.js");
const { Duel } = require("./duels.js");

// Command handler for the duel command
module.exports = {
  name: "duel",
  description: "Challenge someone to a duel!",
  async execute(client, message, args) {
    try {
      const opponentId = extractOpponentId(args);
      const db = mongoClient.db("Akaimnky");
      const collection = db.collection("akaillection");
      // Define the filter based on the _id
      const dbFilter = { _id: message.author.id };
      const player = await collection.findOne(dbFilter);
      const dbFilter2 = { _id: opponentId };
      const opponent = await collection.findOne(dbFilter2);
      // Extract opponent ID from command arguments

      // Create a new instance of DuelLogic
      const duel = new Duel(player, opponent, message.channel);

      // Start the duel
      await duel.start();
    } catch (error) {
      console.error("Error executing duel command:", error);
      message.reply({
        content:
          "An error occurred while processing the duel command. Please try again later.",
        ephemeral: true,
      });
    }
  },
};

// Function to extract opponent ID from command arguments
function extractOpponentId(args) {
  const mentionRegex = /<@!?(\d+)>/;
  const mentionMatch = mentionRegex.exec(args[0].trim());
  return mentionMatch ? mentionMatch[1] : args[0].trim();
}
