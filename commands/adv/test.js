  
  const sharp = require('sharp');
  // adventureCommand.js
  const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
  const { Location, Floor, floor1, floor2, allFloors } = require('./loc');
  const { quests } = require('./quests'); // Import quest data
  const { bosses } = require('./bosses'); // Import boss data
  // const { mobs } = require('./mobs'); // Import mob data
  const players = require('../../data/players.json');
  const { navigationRow, handleNavigation } = require('./navigation');
  const questData = require('./quests');
  const bossData = require('./bosses');
const { GameImage, Player, Element } = require('./sumfunctions');
    const fs = require('fs');
  let selectedValue = [];
  const {mongoClient} = require('../../data/mongo/mongo.js')
  
  
  const areaImage = 'commands/adv/area2.png'; 

  
  
  
  module.exports = {
    name: 'testpng',
    description: 'Start an adventure!',
     aliases: ['tp'],
    async execute(client, message, args, interaction) {
      const db = mongoClient.db('Akaimnky');
      const collection = db.collection('akaillection');
// Define the filter based on the _id
  const dbFilter = { _id: message.author.id };
      const player = await collection.findOne(dbFilter);
      let player2 = players[message.author.id];
      if (!player) {
        return message.channel.send('You have to register first!')
      }

      const playerName = player.name; const playerFloorIndex = 0; // Replace with the actual floor index for the player 
      const playerLocationIndex = 0; // Replace with the actual location index for the player
      const selectedFloor = allFloors[playerFloorIndex]; const selectedLocation = selectedFloor.locations[playerLocationIndex];
  
  
  
      // message.channel.send({ files: [areaImage] })
      const attachment = new AttachmentBuilder('./commands/adv/area2.png', 'area2.png');
      console.log('attachment:', attachment)
   const adventureLoading = new EmbedBuilder()
        .setTitle(selectedLocation.name)
        .setImage('attachment://area2.png')
        .setDescription('Loading please wait! <a:Green:874929269741072414>')
      // Create the embed for the adventure command
      const adventureIntoEmbedConfirmation = new EmbedBuilder()
        .setTitle(selectedLocation.name)
        .setImage('attachment://area2.png')
        .setDescription('Do you want to go in? If you had any saved progress, you will spawn right there!')
        .addFields(
          {
            name: '**Player Level**',
            value: ` \`\`Level: ${player.exp.level}\`\`, Username: __${player.name}__ `,
            inline: false
          },
          {
            name: '**Level Restriction and Level suggestion**',
            value: `Area only for \`\`Level ${selectedLocation.requiredLevel}\`\` and Above!\n Suggested Level for this area is 'makeLevelSuggestion'`,
            inline: false
          },
          {
            name: '**Party recommended**',
            value: `${selectedLocation.mobs.join('\n')}`,
            inline: false
          },
          {
            name: '**Automate this adventure?**',
            value: `You can automatically finish an adventure if you reach 100% discovery in that area and fulfil a few other requirements!!`,
            inline: false
          },
          {
            name: '**Start Adventuring?**',
            value: `To start, click on the "Lets Dive into it" button!!`,
            inline: false
          },
          {
            name: '**Difficulty**',
            value: `${selectedLocation.difficulty}`,
            inline: false
          },
        );
      const confirmationRowTwo = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('go_in')
            .setLabel('Lets Dive into it')
            .setStyle('Success')
        );
      // const imageAttachment = new AttachmentBuilder('commands/adv/area1.png'); // Replace with your image file path
      // adventureIntoEmbedConfirmation.addFiles([imageAttachment]).setImage('attachment://commands/adv/area1.png');
  
  
      const initialMessage = await message.channel.send({
        embeds: [adventureIntoEmbedConfirmation],
        components: [confirmationRowTwo],
        files: [attachment]
      });
       const filter = i => (i.user.id === message.author.id) && ((['start_adventure', 'cancel_adventure'].includes(i.customId)) || (i.customId === 'option_select') || (i.customId === 'go_in'));
  
      // const filter = i => (['start_adventure', 'cancel_adventure'].includes(i.customId)) || (i.customId === 'option_select') || (i.customId === 'go_in');
      const collector = initialMessage.createMessageComponentCollector({ filter, time: 1200000 });
  
      collector.on('collect', async (i) => {
        try {
  
          if (i.customId === 'go_in' && i.user.id === message.author.id) {
            await i.deferUpdate();
            // const playerpos = { x: 100, y: 50 };
          // Generate random elements
          

            initialMessage.edit({ embeds: [adventureLoading], components:[]});
  
              
              handleNavigation(allFloors, i, adventureIntoEmbedConfirmation, initialMessage, areaImage, player);
  
           
          }
  
               // Send the updated image as an attachment
          // message.channel.send({ files: [updatedImageBuffer] });
  
  
        } catch (error) {
          console.error('An error occurred:', error);
          message.channel.send('noob ass, caused an error.');
        }
      });
  

  
  
  
  
    }
  }

