  const config = require('./jsons/config.json');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, Events, ModalBuilder, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Akaimnky:57n57ng96969@cluster0.ukxb93z.mongodb.net/?retryWrites=true&w=majority";
// MongoDB connection setup
const mongoClient = new MongoClient(uri, {

  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDB() {
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}



const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]

});


const Discord = require('discord.js');
const { loadCommands } = require('./handler');

// Create a new collection to store the commands
client.commands = new Collection();

// Load all the commands
loadCommands(client);



client.on('messageCreate', message => {
  if (message.content.startsWith('a!')) {
    const args = message.content.slice(2).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    console.log(`Received command: ${commandName}`);


    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      console.log('Executing command:', command.name);
      command.execute(client, message, args);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while executing the command.');
    }
  }
});

client.on('ready', () => {
  console.log(`${client.user.tag} is ready!🚀`);
  connectToDB(); // Connect to MongoDB when the bot is ready
  client.user.setPresence({ activities: [{ name: 'Watching myself being coded!' }], status: 'idle' });
}); //tells that bot is hot and on
client.on('messageCreate', (message) => {
  const goe = message.content.toLowerCase().substring(BOT_PREFIX.length);
  if (message.channel && !message.author.bot && (goe === "dbshi" || goe === "db") /*&& !botInfoSent*/) {
    const db = mongoClient.db('Akaimnky');
    const collection = db.collection('akaillection');

    const newData = { key: 'value' };
    collection.insertOne(newData, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
      } else {
        console.log('Data inserted:', result.ops);
      }
    });
    const filter = { key: 'value' };
    const update = { $set: { key: 'new-value' } };
    collection.updateOne(filter, update, (err, result) => {
      if (err) {
        console.error('Error updating data:', err);
      } else {
        console.log('Data updated:', result.modifiedCount);
      }
    });
    collection.find({}).toArray((err, documents) => {
      if (err) {
        console.error('Error fetching data:', err);
      } else {
        console.log('Fetched data:', documents);
      }
    });
  }
});
const BOT_PREFIX = "a!";

//botinfo
client.on('messageCreate', (message) => {

  const gae = message.content.toLowerCase().substring(BOT_PREFIX.length);
  if (message.channel && !message.author.bot && (gae === "tes" || gae === "ti") /*&& !botInfoSent*/) {


    // Read the contents of the "mageConsts.json" file
    fs.readFile('./data/config/players/mageConsts.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading mageConsts.json:', err);
        return;
      }

      try {
        // Parse the JSON data into a JavaScript object
        const mageConsts = JSON.parse(data);

        // Now you can use the "mageConsts" object in your code
        console.log('mageconstsfr:', mageConsts);

        // For example, you can access the name and description of the Mage class like this:
        //console.log('Class Name:', mageConsts.className);
        //console.log('Description:', mageConsts.description);

        // Access the ability constants like this:
        //  console.log('Fireball Ability:', mageConsts.abilityConstants.fireball);

        // ...and so on

      } catch (parseError) {
        console.error('Error parsing mageConsts.json:', parseError);
      }
    });

    // const data = fs.readFileSync('../')
  }







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
                                                                                                                                  