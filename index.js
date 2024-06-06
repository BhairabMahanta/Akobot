const config = require("./config.json");
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  SlashCommandBuilder,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  Collection,
  Partials,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const { connectToDB } = require("./data/mongo/mongo.js");
const { AuditLogEvent } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.db = null;

const Discord = require("discord.js");
const { loadCommands } = require("./handler");

// Create a new collection to store the commands
client.commands = new Collection();

// Load all the commands
loadCommands(client);

const BOT_PREFIX = "a!";

client.on("messageCreate", async (message) => {
  try {
    if (message.content.toLowerCase().startsWith(`${BOT_PREFIX}`)) {
      const args = message.content.slice(2).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      console.log(`Received command: ${commandName}`);
      // console.log('commandAlias:', client.commands)

      const command =
        client.commands.get(commandName) ||
        client.commands.find(
          (c) => c.aliases && c.aliases.includes(commandName.toLowerCase())
        );

      if (!command) return;

      const player = await collection.findOne({ _id: message.author.id });

      // If player is not found, return null
      if (!player && command.name !== "register") {
        return message.channel.send(
          "Player not found. Please use the `a!register yourname` command to register."
        );
      }

      if (command.guildOnly && message.channel.type === "dm") {
        return message.reply("I can't execute that command inside DMs!");
      }

      try {
        console.log("Executing command:", command.name);
        command.execute(client, message, args);
      } catch (error) {
        console.error(error);
        message.reply("An error occurred while executing the command.");
      }
    }
  } catch (error) {
    console.log("what the fuck:", error);
  }
});

// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isButton()) return;
//   if (interaction.customId === 'selectclass') {
//     const selectClassCommand = require('./commands/util/selectclass.js');
//     await selectClassCommand.execute(client, interaction.message, [], interaction);
//   }
// });

client.on("ready", async () => {
  console.log(`${client.user.tag} is ready!🚀`);
  const db = await connectToDB(); // Connect to MongoDB when the bot is ready

  client.db = db;

  client.user.setPresence({
    activities: [{ name: "Watching myself being coded!" }],
    status: "idle",
  });
}); //tells that bot is hot and on

const { mongoClient } = require("./data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
// Define a function to periodically check quest completion
async function checkQuestCompletion() {
  const currentTime = Math.floor(Date.now() / 1000);
  const playersDb = await collection.find({}).toArray();

  // Iterate through players
  playersDb.forEach(async (player) => {
    const playerQuests = player.activeQuests;
    let questSuccess = false;
    let questFailure = false;

    // Iterate through active quests of the player
    for (const questId in playerQuests) {
      const quest = playerQuests[questId];
      const questList = player.quests;
      const timeLimit = quest.timeLimit.daysLeft;

      // Check if time limit is exceeded
      if (currentTime > timeLimit) {
        // Quest has failed
        questFailure = true;
        quest.questStatus = "timeout";
        player.completedQuests[questId] = quest;
        console.log(`Quest '${questId}' has failed for ${player.name}`);
        // Optionally, update the quest's result and other details
        delete playerQuests[questId];
        // Remove the completed quest from quests
        const questIndex = questList.indexOf(questId);
        if (questIndex !== -1) {
          questList.splice(questIndex, 1);
        }
      } else {
        // Quest is still active
        const objectives = quest.objectives;

        // Check if all objectives are met
        const allObjectivesMet = objectives.every((objective) => {
          return Number(objective.current) >= Number(objective.required);
        });

        if (allObjectivesMet) {
          // Quest is completed successfully
          questSuccess = true;
          quest.questStatus = "completed";
          player.completedQuests[questId] = quest;
          console.log(
            `Quest '${questId}' has been completed successfully for ${player.name}`
          );
          // Remove the completed quest from activeQuests
          delete playerQuests[questId];
          // Remove the completed quest from quests
          const questIndex = questList.indexOf(questId);
          if (questIndex !== -1) {
            questList.splice(questIndex, 1);
          }
        }
      }
    }
    if (questSuccess || questFailure) {
      // Update the player's data in the database
      console.log("player.activeQuests:", player.activeQuests);
      console.log("player.activeQuests:", player);
      await updatePlayer(player);
    }
  });
}

// Periodically call the function (adjust the interval as needed)
setInterval(checkQuestCompletion, 1000 * 60); // Check every minute

// Update the player's data in the database
async function updatePlayer(player) {
  try {
    const filter = { _id: player._id };
    const update = {
      $set: {
        quests: player.quests,
        activeQuests: player.activeQuests,
        completedQuests: player.completedQuests,
      },
    };
    await collection.updateOne(filter, update);
    console.log(`Player data updated for ${player.name}`);
  } catch (error) {
    console.error("Error updating player data:", error);
  }
}

client.login(config.token);

module.exports = { client };
