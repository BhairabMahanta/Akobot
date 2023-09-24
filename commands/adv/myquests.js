const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } = require('discord.js');
const { quests } = require('./quests'); // Assuming you have quests defined in a separate file
const path = require('path');
const playersFilePath = path.join(__dirname, '..', '..', 'data', 'players.json');
const playerData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
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
    const embed = new EmbedBuilder()
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
          label: `${index + 1}. ${quest}`,
          value: quest,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the initial embed with the select menu
    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Create a collector for the select menu interaction
    const filter = i => (i.user.id === playerId) 
    const collector = sentMessage.createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (interaction) => {
     console.log('GAEINTERNATION:', interaction.values[0])
      if (interaction.isSelectMenu()) {
        const selectedQuest = interaction.values[0];
        const questDetails = quests[selectedQuest];
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
            .setCustomId("start"),
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Start Quest")
            .setCustomId("cancel"),
        // ];
          );
          const row2 = afterButtonRow
        console.log('isErrorHere?')
        await interaction.update({ embeds: [embed], components: [row, row2] });
      }
    });

    collector.on('end', () => {
      // Remove the select menu after a minute
      sentMessage.edit({ components: [] });
    });
  },
};
