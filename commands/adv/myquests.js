const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, Options } = require('discord.js');
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
    const db = client.db
    const playerId = message.author.id;
    const collection = db.collection('akaillection');
    const dbFilter = { _id: playerId };
       const dbData = await collection.findOne(dbFilter);
       console.log('dbDATA:', dbData)
    if (!dbData || !dbData.quests) {
      return message.channel.send('You have no quests yet.');
    }
const datEmbed = new EmbedBuilder().setTitle('Quest Menu')
.setDescription('This is the mooltiverse of quests boi')

    // Create a select menu with quest options
const options = {}

    const selectMainMenu = new StringSelectMenuBuilder().setCustomId('select_menu')
    .setPlaceholder('Select An Option')
    .addOptions([
      { label: 'My Quests', value: 'klik_my' },
      { label: 'Active Quests', value: 'klik_active' },
      { label: 'Expired Quests', value: 'klik_expire' },
      { label: 'Finished Quests', value: 'klik_finished' }
    ]);
    const questList = dbData.quests;
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

     row = new ActionRowBuilder().addComponents(selectMainMenu);

    // Send the initial embed with the select menu
     sentMessage = await message.channel.send({ embeds: [datEmbed], components: [row] });

    // Create a collector for the select menu interaction
    const filter = i => (i.user.id === playerId) 
    const collector = sentMessage.createMessageComponentCollector({filter, time: 300000});

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
        await interaction.update({ embeds: [embed], components: [row, row2] });
      }
      if (interaction.customId === 'start_quest') {
         await interaction.deferUpdate();
         // console.log('questName lol?:', startingThisQuest)
        console.log('questName lolv2:', startingThisQuest.id)
        const startQuest = new QuestLogic(message, interaction, sentMessage, embed, row, row2, dbData, db)
        startQuest.startQuest(startingThisQuest.id)
      }
    });

    collector.on('end', () => {
      // Remove the select menu after a minute
      sentMessage.edit({ components: [] });
    });
  },
};
