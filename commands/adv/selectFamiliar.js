const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
const players = require('../../data/players.json');
const fs = require('fs');

module.exports = {
  name: 'selectfamiliar',
  description: 'Select up to 3 familiars!',
  async execute(client, message, args, interaction) {
    // Check if the player exists in the data
    const playerId = message.author.id;
    if (!players[playerId]) {
      message.channel.send('Player not found in data.');
      return;
    }

    const familiars = players[playerId].cards.name;

    if (familiars.length === 0) {
      message.channel.send('You have no familiars to select.');
      return;
    }

    // Create buttons for each familiar
    const buttons = familiars.map((familiar, index) => {
      return new ButtonBuilder()
        .setCustomId(`select_familiar_${index}`)
        .setLabel(familiar)
        .setStyle('Primary');
    });

    // Create a row of buttons
    const row = new ActionRowBuilder().addComponents(buttons);

    // Send the initial message
    const initialMessage = await message.channel.send({
      content: 'Select up to 3 familiars:',
      components: [row]
    });

    // Handle button interactions
    const filter = (interaction) => {
      return interaction.customId.startsWith('select_familiar_') && interaction.user.id === playerId;
    };

    const collector = initialMessage.createMessageComponentCollector({ filter, time: 30000 });
    let selectedFamiliars = [];

    collector.on('collect', (interaction) => {
      const index = parseInt(interaction.customId.split('_')[2]);
      const selectedFamiliar = familiars[index];

      // Toggle selection (add or remove)
      if (selectedFamiliars.includes(selectedFamiliar)) {
        selectedFamiliars = selectedFamiliars.filter((f) => f !== selectedFamiliar);
      } else {
        if (selectedFamiliars.length < 3) {
          selectedFamiliars.push(selectedFamiliar);
        } else {
          // You can notify the player that they can only select up to 3 familiars here.
        }
      }

      interaction.update({
        content: 'Select up to 3 familiars:',
        components: [new ActionRowBuilder().addComponents(
          familiars.map((familiar, i) => {
            const style = selectedFamiliars.includes(familiar) ? 'Secondary' : 'Primary';
            return new ButtonBuilder()
              .setCustomId(`select_familiar_${i}`)
              .setLabel(familiar)
              .setStyle(style);
          })
        )],
      });
    });

    collector.on('end', () => {
      // Update the player's data with the selected familiars
      players[playerId].selectedFamiliars.name = selectedFamiliars;

      // Save the updated data back to the file
      fs.writeFile('./data/players.json', JSON.stringify(players, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing updated player data:', writeErr);
        }
      });
    });
  }
};
