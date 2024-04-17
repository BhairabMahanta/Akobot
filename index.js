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
      console.log("Player:", player);

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

client.on("messageCreate", async (message, args) => {
  const goe = message.content.toLowerCase().substring(BOT_PREFIX.length);

  const cmd = message.content.toLowerCase().substring(BOT_PREFIX.length);
  if (
    message.channel &&
    !message.author.bot &&
    (cmd === "botinfo" || cmd === "bi") /*&& !botInfoSent*/
  ) {
    // botInfoSent = true; // Set the flag to true to indicate bot info has been sent
    setTimeout(async () => {
      // Calculate the API latency
      const apiLatency = Math.round(client.ws.ping);

      // Calculate the client ping
      const clientPing = Math.round(Date.now() - message.createdTimestamp);

      const embed = new EmbedBuilder()
        .setColor("DarkBlue")
        .setTitle("Bot Info")
        .setDescription("Kriz drives truck!!")
        .addFields(
          { name: "Bot ID", value: client.user.id, inline: true },
          {
            name: "Server Count",
            value: client.guilds.cache.size.toString(),
            inline: true,
          },
          {
            name: "User Count",
            value: client.users.cache.size.toString(),
            inline: true,
          },
          { name: "Library", value: "Discord.js", inline: true },
          { name: "Version", value: `v 1.0`, inline: true },
          { name: "Creator", value: "<@537619455409127442>", inline: true },
          { name: "API Latency", value: `${apiLatency}ms`, inline: true },
          { name: "Client Ping", value: `${clientPing}ms`, inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

      await message.channel.send({ embeds: [embed] });
    }, 1000); // delay for 1 second
  }
});

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

/*console.log('eeee', client.listenerCount('messageReactionRemove'));

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  console.log('Events:', Events)
  console.log("reaction:", reaction)
  console.log('mayaaaheeee', client.listenerCount());
   if (reaction.message.id === '1161779655905382491') {
    // Log the user who removed the reaction
    console.log(`${user.tag} removed a reaction from the message.`);
  }
  if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

	// Now the message has been cached and is fully available
	console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
	// The reaction is now also fully available and the properties will be reflected accurately:
	console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
});
client.on(Events.MessageReactionRemove, async (reaction, user) => {
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
		}
	}

	console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});
client.on(Events.MessageReactionRemoveAll, async (reaction, user) => {
    console.log('Reactions:', reaction)
	if (reaction.message.partial) {
   
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
		}
	}

	console.log(`${user.username} removed all "${reaction.emoji.name}" reaction.`);
});
client.on(Events.MessageReactionRemoveEmoji, async (reaction, user) => {
  console.log('Reactions:', reaction)
  console.log('Reactions:', Discord.ReactionEmoji)
  console.log('Reactions:', Discord.ReactionUserManager)
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
		}
	}

	console.log(`${user} removed emoji wala "${reaction}" reaction.`);
});

client.on(Events.GuildAuditLogEntryCreate, async auditLog => {
  // Check if the audit log entry is for a reaction removal
  if (auditLog.actionType !== AuditLogEvent.MessageReactionRemove) {
    return;
  }

  // Get the message ID and reaction from the audit log entry
  const messageID = auditLog.targetID;
  const reaction = auditLog.extra.reaction;

  // Get the message
  const message = await auditLog.guild.channels.cache.get(auditLog.channelID).messages.fetch(messageID);

  // Get the user who removed the reaction
  const user = await client.users.fetch(auditLog.executorID);

  // Log the information to the console
  console.log(`User ${user.tag} removed the ${reaction} reaction from message ${message.id}.`);
});
// whodid command
client.on('messageCreate', async message => {
  if (message.content === '!whodid') {
    // Get the message ID from the command
    const messageID = message.reference.messageID;

    // Get the audit logs for the message
    const auditLogs = await message.channel.messages.fetch(messageID).getAuditLogs({
      type: AuditLogEvent.MessageReactionRemove
    });

    // Get the audit log entry for the reaction removal
    const auditLogEntry = auditLogs.entries.find(auditLogEntry => auditLogEntry.actionType === AuditLogEvent.MessageReactionRemove && auditLogEntry.targetID === messageID);

    // If the audit log entry is not found, send a message to the channel
    if (!auditLogEntry) {
      message.channel.send('Could not find an audit log entry for the reaction removal.');
      return;
    }

    // Get the user who removed the reaction
    const user = await client.users.fetch(auditLogEntry.executorID);

    // Send a message to the channel with the user who removed the reaction
    message.channel.send(`User ${user.tag} removed a reaction from message ${messageID}.`);
  }
  
});
*/

client.login(config.token);

module.exports = { client };
