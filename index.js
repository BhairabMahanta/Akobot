  const config = require('./config.json');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { connectToDB} = require('./data/mongo/mongo.js')
const { AuditLogEvent } = require('discord.js');


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]

});
client.db = null;


const Discord = require('discord.js');
const { loadCommands } = require('./handler');

// Create a new collection to store the commands
client.commands = new Collection();

// Load all the commands
loadCommands(client);



client.on('messageCreate', message => {
  try {
  if (message.content.startsWith('a!')) {
    const args = message.content.slice(2).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    console.log(`Received command: ${commandName}`);
// console.log('commandAlias:', client.commands)

   

    const command = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName.toLowerCase()));


    if (!command) return;

    try {
      console.log('Executing command:', command.name);
      command.execute(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while executing the command.');
    }
  }
    } catch (error) {
  console.log('what the fuck:', error)
}
});
const BOT_PREFIX = "a!";


client.on('ready', async () => {
  console.log(`${client.user.tag} is ready!🚀`);
const db = await connectToDB(); // Connect to MongoDB when the bot is ready

 client.db = db;

  client.user.setPresence({ activities: [{ name: 'Watching myself being coded!' }], status: 'idle' });
}); //tells that bot is hot and on


client.on('messageCreate', async (message, args) => {
  const goe = message.content.toLowerCase().substring(BOT_PREFIX.length);
 
  const cmd = message.content.toLowerCase().substring(BOT_PREFIX.length);
  if (message.channel && !message.author.bot && (cmd === "botinfo" || cmd === "bi") /*&& !botInfoSent*/) {
    // botInfoSent = true; // Set the flag to true to indicate bot info has been sent
    setTimeout(async () => {
      // Calculate the API latency
      const apiLatency = Math.round(client.ws.ping);

      // Calculate the client ping
      const clientPing = Math.round(Date.now() - message.createdTimestamp);

      const embed = new EmbedBuilder()
        .setColor('DarkBlue')
        .setTitle('Bot Info')
        .setDescription('Kriz drives truck!!')
        .addFields(
          { name: 'Bot ID', value: client.user.id, inline: true },
          { name: 'Server Count', value: client.guilds.cache.size.toString(), inline: true },
          { name: 'User Count', value: client.users.cache.size.toString(), inline: true },
          { name: 'Library', value: 'Discord.js', inline: true },
          { name: 'Version', value: `v 1.0`, inline: true },
          { name: 'Creator', value: '<@537619455409127442>', inline: true },
          { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
          { name: 'Client Ping', value: `${clientPing}ms`, inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

      await message.channel.send({ embeds: [embed] });
    }, 1000); // delay for 1 second
  }

//   if (message.channel && !message.author.bot && (goe === "who" || goe === "whoee") /*&& !botInfoSent*/) {
//     console.log('who lmao')
//     // Get the message ID from the command.
//     console.log('messagecontent:', message.content)
//     const messageID = '1159546181349802095'

//     // Get the channel where the message is located.
//     const channel = message.guild.channels.cache.get(message.channel.id);
 

//     // Get the message object.
//     const messageObject = await channel.messages.fetch(messageID);
//     console.log('messageOBKECT:', messageObject)
//     const fetchedLogs = await message.guild.fetchAuditLogs();
// const firstEntry = fetchedLogs.entries.first();
//     console.log('first:', firstEntry)



//     // Get the audit logs for the message.
//     const auditLogs = await message.guild.fetchAuditLogs({
//       type: AuditLogEvent.MessageReactionRemove
//     });
//     console.log('auditlosgs:', auditLogs)
      

//     // Get the audit log entry for the reaction removal.
//     const auditLogEntry = auditLogs.entries.find(auditLogEntry => auditLogEntry.actionType === AuditLogEvent.MessageReactionRemove && auditLogEntry.messageID === messageID);
//     console.log('enTry:', auditLogEntry)

//     // If the audit log entry is not found, send a message to the channel.
//     if (!auditLogEntry) {
//       message.channel.send('Could not find an audit log entry for the reaction removal.');
//       return;
//     }

//     // Get the user who removed the reaction.
//     const user = await client.users.fetch(auditLogEntry.executorID);

//     // Send a message to the channel with the user who removed the reaction.
//     message.channel.send(`User ${user} removed a reaction from message ${messageID}.`);
//   }
});


client.on(Events.GuildAuditLogEntryCreate, async (auditLog)=> {
  console.log('gae')
  // Define your variables.
  // The extra information here will be the message and the reaction.
  const { action, extra: { channel, message, reaction }, executorId } = auditLog;

 // Check only for deleted messages.
    if (action !== AuditLogEvent.MessageDelete) return;


  // Ensure the executor is cached.
  const executor = await client.users.fetch(executorId);

  // Log the output.
  console.log(`Reaction ${reaction} was removed from message ${message.id} by ${executor.tag} in ${channel}.`);
});




client.login(config.token);
                                                                                                                                  