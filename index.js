  const config = require('./config.json');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { connectToDB} = require('./data/mongo/mongo.js')



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


client.on('messageCreate', (message) => {
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
});

client.login(config.token);
                                                                                                                                  