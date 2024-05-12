const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuComponent,
} = require("discord.js");
const { allFamiliars } = require("./allfamilliars.js"); // Update the path to the 'cards.js' file
const { start } = require("repl");
let tier = "Tier1";
const FAMILIARS_PER_PAGE = 5; // Set the number of familiars per page
let keys;
module.exports = {
  name: "viewfamiliars",
  description: "View information about all familiars",
  aliases: ["vf", "famview"],
  async execute(client, message, args) {
    // Get the page number from the command arguments (defaults to page 1)
    const page = args[0] ? parseInt(args[0], 10) : 1;
    if (isNaN(page) || page <= 0) {
      return message.reply("Invalid page number.");
    }
    let newPage = page;
    // Calculate the start and end index for the current page
    const startIndex = (page - 1) * FAMILIARS_PER_PAGE;
    const endIndex = startIndex + FAMILIARS_PER_PAGE;
    const embed = new EmbedBuilder().setColor("#FFA500");
    // Loop through each familiar on the current page and add its data to the embed
    keys = Object.keys(allFamiliars.Tier1);

    const familiars = keys.slice(startIndex, endIndex);
    console.log("FAMILIARS", familiars);
    familiars.forEach((theFamiliar, index) => {
      const familiar = allFamiliars[tier][theFamiliar];
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
        .setCustomId(`fam_first`)
        .setLabel("◀️")
        .setStyle("Secondary"),
      new ButtonBuilder()
        .setCustomId(`fam_prev`)
        .setLabel("←")
        .setStyle("Primary"),
      new ButtonBuilder()
        .setCustomId(`fam_next`)
        .setLabel("→")
        .setStyle("Primary"),
      new ButtonBuilder()
        .setCustomId(`fam_last`)
        .setLabel("▶️")
        .setStyle("Secondary")
    );
    const tiers = Object.keys(allFamiliars);

    const tierSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("fam_tier_select")
      .setPlaceholder("View Different Tiers");
    tiers.forEach((tier, index) => {
      tierSelectMenu.addOptions({
        label: `Tier ${index + 1}`,
        value: tier,
      });
    });

    const tierRow = new ActionRowBuilder().addComponents(tierSelectMenu);

    embed.setFooter({
      text: `Page ${page} | Use the "Next Page" button to view more familiars.`,
    });
    const thatMessage = await message.channel.send({
      embeds: [embed],
      components: [actionRow, tierRow],
    });
    const filter = (i) =>
      i.customId.startsWith("fam_") && i.user.id === message.author.id;
    const collector = thatMessage.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      const [action, direction] = i.customId.split("_");
      await i.deferUpdate();

      if (direction === "first") {
        newPage = 1;
      } else if (direction === "prev") {
        newPage = newPage - 1;
      } else if (direction === "next") {
        newPage = newPage + 1;
      } else if (direction === "last") {
        keys = Object.keys(allFamiliars[tier]);
        newPage = Math.ceil(keys.length / FAMILIARS_PER_PAGE);
      } else if (direction === "tier") {
        tier = i.values[0];
        newPage = 1;
        console.log("tier:", tier);
        const tierKeys = Object.keys(allFamiliars[tier]);
        const tierFamiliars = tierKeys.slice(0, FAMILIARS_PER_PAGE);
        const tierEmbed = new EmbedBuilder().setColor("#FFA500");
        console.log("tier1:", tier);
        tierFamiliars.forEach((theFamiliar, index) => {
          const familiar = allFamiliars[tier][theFamiliar];
          const stats = familiar.stats;
          tierEmbed.setTitle(
            `Tier ${familiar.tier} familiars Information - Page ${newPage}`
          );
          // Create a string representation of the stats
          const statsString = `⚔️ ${stats.attack} | 🛡️ ${stats.defense} | 💨 ${stats.speed} | ♥️ ${stats.hp}`;
          console.log("statsString", statsString);
          console.log("done here");
          // Add the familiar's data to the embed
          tierEmbed.addFields({
            name: `**__${familiar.sl}.)__** • ${familiar.name}`,
            value: `Element: **${familiar.element}**   •   Tier: **${familiar.tier}**  •  Stats: **${statsString}**`,
            inline: false,
          });
        });
        tierEmbed.setFooter({
          text: `Page ${newPage} | Use the "Next Page" button to view more familiars.`,
        });
        thatMessage.edit({ embeds: [tierEmbed] });
        return;
      }
      if (newPage < 1) {
        newPage = 1;
      } else if (newPage > Math.ceil(keys.length / FAMILIARS_PER_PAGE)) {
        newPage = Math.ceil(keys.length / FAMILIARS_PER_PAGE);
      }
      console.log("newPage", newPage);
      const newEmbed = new EmbedBuilder().setColor("#FFA500");
      const newStartIndex = (newPage - 1) * FAMILIARS_PER_PAGE;
      const newEndIndex = newStartIndex + FAMILIARS_PER_PAGE;
      keys = Object.keys(allFamiliars[tier]);
      const newFamiliars = keys.slice(newStartIndex, newEndIndex);
      console.log("tier2:", tier);
      newFamiliars.forEach((theFamiliar, index) => {
        console.log("theFamiliar:", theFamiliar);
        const familiar = allFamiliars[tier][theFamiliar];
        console.log("familiar:", familiar);
        const stats = familiar.stats;
        newEmbed.setTitle(
          `Tier ${familiar.tier} familiars Information - Page ${newPage}`
        );
        // Create a string representation of the stats
        const statsString = `⚔️ ${stats.attack} | 🛡️ ${stats.defense} | 💨 ${stats.speed} | ♥️ ${stats.hp}`;
        console.log("statsString", statsString);
        console.log("done here");
        // Add the familiar's data to the embed
        newEmbed.addFields({
          name: `**__${familiar.sl}.)__** • ${familiar.name}`,
          value: `Element: **${familiar.element}**   •   Tier: **${familiar.tier}**  •  Stats: **${statsString}**`,
          inline: false,
        });
      });
      newEmbed.setFooter({
        text: `Page ${newPage} | Use the "Next Page" button to view more familiars.`,
      });
      thatMessage.edit({ embeds: [newEmbed] });
    });
  },
};
