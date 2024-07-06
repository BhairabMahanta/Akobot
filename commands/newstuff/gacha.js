const { pullGacha, GACHA_TYPES } = require("../adv/adventure/sumfunctions");
const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "gacha",
  description: "Perform a gacha pull to get a random familiar!",
  aliases: ["pull", "draw"],
  async execute(client, message, args, interaction) {
    const playerId = message.author.id;
    const pulledFamiliars = [];

    // Create the select menu for gacha types
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("gacha_select")
      .setPlaceholder("Choose your gacha type")
      .addOptions([
        {
          label: "Common",
          description: "Pull from the common gacha pool",
          value: GACHA_TYPES.COMMON_TOKEN,
        },
        {
          label: "Rare",
          description: "Pull from the rare gacha pool",
          value: GACHA_TYPES.RARE_TOKEN,
        },
        {
          label: "Legendary",
          description: "Pull from the legendary gacha pool",
          value: GACHA_TYPES.LEGENDARY_TOKEN,
        },
      ]);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    const finalizeButton = new ButtonBuilder()
      .setCustomId("finalize_button")
      .setLabel("Finalize")
      .setStyle("Primary");

    const finalizeRow = new ActionRowBuilder().addComponents(finalizeButton);

    const embed = new EmbedBuilder()
      .setTitle("Gacha Pull")
      .setDescription("Select the type of gacha pull you want to perform:")
      .setColor(0x00ff00);

    // Send the embed with the select menu
    const sentMessage = await message.channel.send({
      embeds: [embed],
      components: [selectRow, finalizeRow],
    });

    // Create a message collector to handle the interaction
    const filter = (i) =>
      (i.customId === "gacha_select" || "finalize_button") &&
      i.user.id === playerId;
    const collector = await sentMessage.createMessageComponentCollector({
      filter,
      time: 150000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "finalize_button" && i.user.id === playerId) {
        await i.deferUpdate();
        const summary = pulledFamiliars
          .map((fam) => `Name: ${fam.name}\nTier: ${fam.tier}`)
          .join("\n\n");
        const summaryEmbed = new EmbedBuilder()
          .setTitle("Gacha Pull Summary")
          .setDescription(summary)
          .setColor(0x00ff00);

        await sentMessage.edit({ embeds: [summaryEmbed], components: [] });
        collector.stop();
      } else {
        const gachaType = i.values[0];
        // Simulate anticipation with initial message
        i.deferUpdate();
        const anticipationMessage = await message.channel.send(
          "Drawing your familiar..."
        );
        console.log("test");
        // Delay for anticipation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const character = await pullGacha(playerId, gachaType);
        pulledFamiliars.push(character);

        // Modify the embed to show the result
        const resultEmbed = new EmbedBuilder()
          .setTitle("Gacha Pull Result")
          .setColor(0xffd700);

        if (
          gachaType === GACHA_TYPES.COMMON_TOKEN &&
          (character.tier === 2 || character.tier === 3)
        ) {
          resultEmbed.setDescription(
            "Huhh the ground is shaking!!!! ITS A MIRACLE!"
          );
          await anticipationMessage.edit({ embeds: [resultEmbed] });
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Additional delay for suspense
        }

        resultEmbed.setDescription(
          `You received: ${character.name}\nIt's a tier ${character.tier} familiar!`
        );
        const ephemeralEmbed = new EmbedBuilder()
          .setTitle("Gacha Pull Details")
          .setDescription(
            `Here are the details of your new familiar:\n\nName: ${character.name}\nStats: ${character.stats}\nElements: ${character.element}\nTier: ${character.tier}`
          )
          .setColor(0x00ffff);

        await i.followUp({ embeds: [ephemeralEmbed], ephemeral: true });
        await anticipationMessage.delete(); // Delete anticipation message after 3 seconds
        await sentMessage.edit({
          embeds: [resultEmbed],
          components: [selectRow, finalizeRow],
        });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        message.channel.send("You did not select any gacha type in time!");
      }
    });
  },
};
