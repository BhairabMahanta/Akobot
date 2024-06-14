import config from "./config.json";
console.log("config:", config);
import {
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
  Interaction,
  Message,
} from "discord.js";
import path from "path";
import fs from "fs";
import { connectToDB } from "./data/mongo/mongo";
import { AuditLogEvent, GuildMember, User } from "discord.js";
import { MongoClient, Collection as MongoCollection } from "mongodb";

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

const { loadCommands } = require("./handler");

// Create a new collection to store the commands
client.commands = new Collection<string, any>();

// Load all the commands
loadCommands(client);

const BOT_PREFIX = "a!";

client.on("messageCreate", async (message: Message) => {
  try {
    if (message.content.toLowerCase().startsWith(`${BOT_PREFIX}`)) {
      const args = message.content.slice(2).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      console.log(`Received command: ${commandName}`);

      const command =
        client.commands.get(commandName) ||
        client.commands.find(
          (c) => c.aliases && c.aliases.includes(commandName)
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
    console.log("Error:", error);
  }
});

client.on("ready", async () => {
  console.log(`${client.user?.tag} is ready!🚀`);
  const db = await connectToDB(); // Connect to MongoDB when the bot is ready

  client.db = db;

  client.user?.setPresence({
    activities: [{ name: "Watching myself being coded!" }],
    status: "idle",
  });
});

const mongoClient: MongoClient = new MongoClient(config.mongoUri);
const db = mongoClient.db("Akaimnky");
const collection: MongoCollection<any> = db.collection("akaillection");

// Define a function to periodically check quest completion
async function checkQuestCompletion() {
  const currentTime = Math.floor(Date.now() / 1000);
  const playersDb = await collection.find({}).toArray();

  // Iterate through players
  for (const player of playersDb) {
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
        delete playerQuests[questId];
        const questIndex = questList.indexOf(questId);
        if (questIndex !== -1) {
          questList.splice(questIndex, 1);
        }
      } else {
        // Quest is still active
        const objectives = quest.objectives;

        // Check if all objectives are met
        const allObjectivesMet = objectives.every((objective: any) => {
          return Number(objective.current) >= Number(objective.required);
        });

        if (allObjectivesMet) {
          questSuccess = true;
          quest.questStatus = "completed";
          player.completedQuests[questId] = quest;
          console.log(
            `Quest '${questId}' has been completed successfully for ${player.name}`
          );
          delete playerQuests[questId];
          const questIndex = questList.indexOf(questId);
          if (questIndex !== -1) {
            questList.splice(questIndex, 1);
          }
        }
      }
    }

    if (questSuccess || questFailure) {
      console.log("player.activeQuests:", player.activeQuests);
      console.log("player.activeQuests:", player);
      await updatePlayer(player);
    }
  }
}

// Periodically call the function (adjust the interval as needed)
setInterval(checkQuestCompletion, 1000 * 60);

// Update the player's data in the database
async function updatePlayer(player: any) {
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

export { client };
