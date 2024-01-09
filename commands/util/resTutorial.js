const {mongoClient} = require('../../data/mongo/mongo.js');
const db = mongoClient.db('Akaimnky');
const collection = db.collection('akaillection');
const mongoose = require('mongoose');
const {playerModel} = require('../../data/mongo/playerschema.js'); // Adjust the path to match your schema file location
const {Tutorial} = require('./tutorial.js');
// Specify the collection name (you can use the 'collection' property of the schema)
const collectionName = 'akaillection';
const story = require('./story.json'); // Load the story from the JSON file
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const locations = require('../../data/locations');
const {cards }= require('../fun/cards.js');


module.exports = {
  name: 'tutorial',
  aliases: ['tut', 't'],
  description: 'Lets begin',

  async execute(client, message, args) {
    const filterDb = { _id: message.author.id };
          const playerData = await collection.findOne(filterDb);

          const tutorial = new Tutorial(playerData, 'My Tutorial', message);
          const yes = true;
       tutorial.initiateTutorial(yes);
       // In your main bot file
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'selectclass') {
      const selectClassCommand = require('./selectclass.js');
      await selectClassCommand.execute(client, message, [], interaction);
    }
  });
  },
};