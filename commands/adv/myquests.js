const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require('discord.js');
const { quests } = require('./quests'); // Assuming you have quests defined in a separate file
const path = require('path');
const playersFilePath = path.join(__dirname, '..', '..', 'data', 'players.json');
const playerData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
const { QuestLogic } = require('./questLogic');
let startingThisQuest = null;
let embed;
let row;
let row2
let sentMessage;
module.exports = {
  name: 'myquests',
  description: 'View your selected quests',
  aliases: ['mq', 'mqs'],
  async execute(client, message) {
    const playerId = message.author.id;
   

    if (!playerData[playerId] || !playerData[playerId].quests) {
      return message.channel.send('You have no quests yet.');
    }

    const questList = playerData[playerId].quests;
     embed = new EmbedBuilder()
      .setTitle('My Quests')
      .setDescription('### Select a quest from the list below to view details:')
      

    // Populate the fields with the list of quests
    questList.forEach((questName, index) => {
      console.log('questName:', questName)
       const questDetails = quests[questName];
      embed.addFields({ name: `${index + 1}.  ${questDetails.title}`, value: `>>> ${questDetails.description}`, inline: false });
    });

    // Create a select menu with quest options
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_quest')
      .setPlaceholder('Select a Quest')
      .addOptions(
        questList.map((quest, index) => ({
          
          label: `${index + 1}. ${quests[quest].title}`,
          value: quest,
        }))
      );

     row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the initial embed with the select menu
     sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Create a collector for the select menu interaction
    const filter = i => (i.user.id === playerId) 
    const collector = sentMessage.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (interaction) => {
     
     // console.log('GAEINTERNATION:', interaction.values[0])
      if (interaction.isStringSelectMenu()) {
        const selectedQuest = interaction.values[0];
        var questDetails = quests[selectedQuest];
        startingThisQuest = questDetails;
        console.log('qwustDetails:', questDetails)

       embed.setFields(
          {
            name: 'Quest Name:',
            value: questDetails.title,
            inline: false
          },
          {
            name: 'Quest Objective:',
            value: questDetails.description,
            inline: false
          },
          {
            name: 'Quest Time Limit:',
            value: `${questDetails.timeLimit} Days`,
            inline: false
          }
          // Add more fields as needed
        );
afterButtonRow = new ActionRowBuilder().addComponents(
        // const options = [
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Go back")
            .setCustomId("cancel"),
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Start Quest")
            .setCustomId("start_quest"),
        // ];
          );
          row2 = afterButtonRow
        console.log('isErrorHere?')
        await interaction.update({ embeds: [embed], components: [row, row2] });
      }
      if (interaction.customId === 'start_quest') {
         await interaction.deferUpdate();
         // console.log('questName lol?:', startingThisQuest)
        console.log('questName lolv2:', startingThisQuest.id)
        const startQuest = new QuestLogic(message, interaction, sentMessage, embed, row, row2)
        startQuest.startQuest(startingThisQuest.id)
      }
    });

    collector.on('end', () => {
      // Remove the select menu after a minute
      sentMessage.edit({ components: [] });
    });
  },
};
