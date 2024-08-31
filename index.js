const config = require("./config.json");
const {
  Client,
  IntentsBitField,
  ActivityType,
  ChannelType,
  Events,
  GatewayIntentBits,
  Collection,
  Partials,
} = require("discord.js");
const { checkQuestCompletion } = require("./commands/util/glogic.js");
const { connectToDB } = require("./data/mongo/mongo.js");
const CommandHandler = require("./events/handlers/commandHandler");
const { loadCommands } = require("./handler.js");
const client = new Client({
  shards: "auto",
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
const { mongoClient } = require("./data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const path = require("path");
const fs = require("fs");

client.db = null;

const Discord = require("discord.js");
const BOT_PREFIX = "a!";
const commandHandler = new CommandHandler(client);
commandHandler.loadCommands();

// Interaction handler
const interactionHandler = require("./events/handlers/interactionHandler");
client.on(Events.InteractionCreate, interactionHandler);

client.on("messageCreate", async (message) => {
  try {
    if (message.content.toLowerCase().startsWith(`${BOT_PREFIX}`)) {
      const args = message.content.slice(2).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      console.log(`Received command: ${commandName}`);

      commandHandler.handleCommand(message);
    }
  } catch (error) {
    console.log("meh:", error);
  }
});
// Load events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js", ".ts"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  const eventMethod = event.once ? "once" : "on";
  client[eventMethod](event.name, (...args) => event.execute(...args, client));
}

client.on("ready", async () => {
  console.log(`${client.user.tag} is ready!🚀`);
  const db = await connectToDB(); // Connect to MongoDB when the bot is ready

  client.db = db;
}); //tells that bot is hot and on

setInterval(checkQuestCompletion, 1000 * 60);

async function updateStatus(message) {
  if (!client.user) {
    console.log("Client user is not available");
    return;
  }

  const guildCount = client.guilds.cache.size;
  const statusMessage = ` ${guildCount} server ${guildCount !== 1 ? "s" : ""} `;

  // console.log(`Attempting to update status: ${statusMessage}`);

  try {
    client.user.setPresence({
      activities: [
        {
          name: `Watching myself being coded in ${statusMessage}`,
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });
    // console.log('Presence updated to:', statusMessage);

    // Send status update to the specified channel if it's in the correct server
    const channel = await client.channels.fetch(config.statusChannelID);
    if (
      channel &&
      channel.type === ChannelType.GuildText &&
      channel.guild.id === config.serverID
    ) {
      channel.send(message);
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
}
process.on("SIGINT", () => {
  updateStatus("Bot is restarting...")
    .then(() => process.exit())
    .catch((err) => {
      console.error("Error sending status update on restart:", err);
      process.exit();
    });
});

process.on("uncaughtException", (err) => {
  updateStatus(`Bot encountered an error and is shutting down: ${err.message}`)
    .then(() => process.exit(1))
    .catch(() => process.exit(1));
});

client.on(Events.GuildCreate, () => updateStatus("Bot joined a new server."));
client.on(Events.GuildDelete, () => updateStatus("Bot left a server."));
client.login(config.token);

module.exports = { client };
