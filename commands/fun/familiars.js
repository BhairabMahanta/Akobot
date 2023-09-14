const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const cards = require('./cards.js'); // Update the path to the 'cards.js' file

const FAMILIARS_PER_PAGE = 5; // Set the number of familiars per page

module.exports = {
  name: 'familiars',
  description: 'View information about all familiars',
  execute(client, message, args) {
    // Get the page number from the command arguments (defaults to page 1)
    const page = args[0] ? parseInt(args[0], 10) : 1;
    if (isNaN(page) || page <= 0) {
      return message.reply('Invalid page number.');
    }

    // Calculate the start and end index for the current page
    const startIndex = (page - 1) * FAMILIARS_PER_PAGE;
    const endIndex = startIndex + FAMILIARS_PER_PAGE;

    // Slice the familiars array to get the familiars for the current page
    const familiars = Object.values(cards).slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`Familiars Information - Page ${page}`);

    // Loop through each familiar on the current page and add its data to the embed
    for (const familiar of familiars) {
      const stats = familiar.stats;

      // Create a string representation of the stats
      const statsString = `Attack: ${stats.attack} | Defense: ${stats.defense} | Speed: ${stats.speed} | HP: ${stats.hp}`;

      // Add the familiar's data to the embed
      embed.addFields(
        { name: `**__Number: ${familiar.id}__**` , value: `Name: **${familiar.name}**  •   Element: **${familiar.element}**   •   Tier: **${familiar.tier}**`, inline: false },
        { name: 'Stats', value: statsString }
      );
    }

    // Add pagination buttons if there are more familiars beyond the current page
    if (endIndex < Object.values(cards).length) {
      const nextPage = page + 1;

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`familiars_${nextPage}`)
          .setLabel('Next Page')
          .setStyle('Danger')
      );

      embed.setFooter(`Page ${page} | Use the "Next Page" button to view more familiars.`);
      message.channel.send({ embeds: [embed], components: [actionRow] });
    } else {
      message.channel.send({ embeds: [embed] });
    }
  },
};
