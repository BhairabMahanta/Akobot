const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { allFamiliars } = require("./allfamilliars.js"); // Update the path to the 'cards.js' file
const { start } = require("repl");

const FAMILIARS_PER_PAGE = 5; // Set the number of familiars per page

module.exports = {
  name: "viewfamiliars",
  description: "View information about all familiars",
  aliases: ["vf", "famview"],
  execute(client, message, args) {
    // Get the page number from the command arguments (defaults to page 1)
    const page = args[0] ? parseInt(args[0], 10) : 1;
    if (isNaN(page) || page <= 0) {
      return message.reply("Invalid page number.");
    }

    // Calculate the start and end index for the current page
    const startIndex = (page - 1) * FAMILIARS_PER_PAGE;
    const endIndex = startIndex + FAMILIARS_PER_PAGE;
    const embed = new EmbedBuilder().setColor("#FFA500");
    // Loop through each familiar on the current page and add its data to the embed
    const keys = Object.keys(allFamiliars.Tier1);

    const familiars = keys.slice(startIndex, endIndex);
    console.log("FAMILIARS", familiars);

    familiars.forEach((theFamiliar, index) => {
      const familiar = allFamiliars.Tier1[theFamiliar];
      const stats = familiar.stats;
      embed.setTitle(
        `Tier ${familiar.tier} familiars Information - Page ${page}`
      );
      // Create a string representation of the stats
      const statsString = `⚔️ ${stats.attack} | 🛡️ ${stats.defense} | 💨 ${stats.speed} | ♥️ ${stats.hp}`;
      console.log("statsString", statsString);
      console.log("done here");
      // Add the familiar's data to the embed
      embed.addFields({
        name: `**__${familiar.id}.)__** • ${familiar.name}`,
        value: `Element: **${familiar.element}**   •   Tier: **${familiar.tier}**  •  Stats: **${statsString}**`,
        inline: false,
      });
    });
    // Add pagination buttons if there are more familiars beyond the current page
    console.log("done here2");
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`first`)
        .setLabel("◀️")
        .setStyle("Secondary"),
      new ButtonBuilder().setCustomId(`prev`).setLabel("←").setStyle("Primary"),
      new ButtonBuilder().setCustomId(`next`).setLabel("→").setStyle("Primary"),
      new ButtonBuilder()
        .setCustomId(`last`)
        .setLabel("▶️")
        .setStyle("Secondary")
    );

    embed.setFooter({
      text: `Page ${page} | Use the "Next Page" button to view more familiars.`,
    });
    message.channel.send({ embeds: [embed], components: [actionRow] });
  },
};
