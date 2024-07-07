const { pullGacha, GACHA_TYPES } = require("../adv/adventure/sumfunctions");
const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { mongoClient } = require("../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");

module.exports = {
  name: "gacha",
  description: "Perform a gacha pull to get a random familiar!",
  aliases: ["pull", "draw"],
  async execute(client, message, args, interaction) {
    const playerId = message.author.id;
    const pulledFamiliars = [];
    const playerDataNonUpdating = await collection.findOne({ _id: playerId });

    if (!playerDataNonUpdating) {
      throw new Error("Player not found");
    }

    // Function to check if player has enough tokens
    const checkTokens = async (playerData, gachaType, amount) => {
      if (!playerData.inventory.tokens) {
        playerData.inventory.tokens = {
          commonScroll: 1,
          rareScroll: 0,
          legendaryScroll: 0,
        };

        // Update the player data in the database
        await collection.updateOne(
          { _id: playerData._id },
          { $set: { "inventory.tokens": playerData.inventory.tokens } }
        );
      }

      console.log(playerData.inventory.tokens);
      return playerData.inventory.tokens[gachaType] >= amount;
    };

    // Function to deduct tokens
    const deductTokens = async (playerData, gachaType, amount) => {
      playerData.inventory.tokens[gachaType] -= amount;

      // Update the player data in the database
      await collection.updateOne(
        { _id: playerData._id },
        { $set: { "inventory.tokens": playerData.inventory.tokens } }
      );
    };

    // Create the select menu for gacha types
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("gacha_select")
      .setPlaceholder("Choose your gacha type")
      .addOptions([
        {
          label: "1x Common",
          description: "Pull 1 from the common gacha pool",
          value: `${GACHA_TYPES.COMMON_TOKEN}_1`,
        },
        {
          label: "10x Common",
          description: "Pull 10 from the common gacha pool",
          value: `${GACHA_TYPES.COMMON_TOKEN}_10`,
        },
        {
          label: "1x Rare",
          description: "Pull 1 from the rare gacha pool",
          value: `${GACHA_TYPES.RARE_TOKEN}_1`,
        },
        {
          label: "10x Rare",
          description: "Pull 10 from the rare gacha pool",
          value: `${GACHA_TYPES.RARE_TOKEN}_10`,
        },
        {
          label: "1x Legendary",
          description: "Pull 1 from the legendary gacha pool",
          value: `${GACHA_TYPES.LEGENDARY_TOKEN}_1`,
        },
        {
          label: "10x Legendary",
          description: "Pull 10 from the legendary gacha pool",
          value: `${GACHA_TYPES.LEGENDARY_TOKEN}_10`,
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
      .setFields(
        {
          name: "Common Tokens",
          value: `${playerDataNonUpdating.inventory.tokens.commonScroll}`,
          inline: true,
        },
        {
          name: "Rare Tokens",
          value: `${playerDataNonUpdating.inventory.tokens.rareScroll}`,
          inline: true,
        },
        {
          name: "Legendary Tokens",
          value: `${playerDataNonUpdating.inventory.tokens.legendaryScroll}`,
          inline: true,
        }
      )
      .setColor(0x00ff00);

    // Send the embed with the select menu
    const sentMessage = await message.channel.send({
      embeds: [embed],
      components: [selectRow, finalizeRow],
    });

    // Create a message collector to handle the interaction
    const filter = (i) =>
      (i.customId === "gacha_select" || i.customId === "finalize_button") &&
      i.user.id === playerId;
    const collector = await sentMessage.createMessageComponentCollector({
      filter,
      time: 150000,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.customId === "finalize_button" && i.user.id === playerId) {
          await i.deferUpdate();
          const summary = pulledFamiliars
            .map(
              (fam, index) => `${index + 1}.) ${fam.name}, Tier: ${fam.tier}`
            )
            .join("\n");
          const summaryEmbed = new EmbedBuilder()
            .setTitle("Gacha Pull Summary")
            .setDescription(summary)
            .addFields(
              {
                name: "Common Tokens",
                value: `${playerDataNonUpdating.inventory.tokens.commonScroll}`,
                inline: true,
              },
              {
                name: "Rare Tokens",
                value: `${playerDataNonUpdating.inventory.tokens.rareScroll}`,
                inline: true,
              },
              {
                name: "Legendary Tokens",
                value: `${playerDataNonUpdating.inventory.tokens.legendaryScroll}`,
                inline: true,
              }
            )
            .setColor(0x00ff00);
          await sentMessage.delete();
          await message.channel.send({ embeds: [summaryEmbed] });
          collector.stop();
        } else {
          const [gachaType, pullAmount] = i.values[0].split("_");
          const amount = parseInt(pullAmount, 10);

          const hasTokens = await checkTokens(
            playerDataNonUpdating,
            gachaType,
            amount
          );
          if (!hasTokens) {
            await i.reply({
              content: `You don't have enough tokens to pull ${amount} ${gachaType} familiar(s).`,
              ephemeral: true,
            });
            return;
          }

          // Deduct tokens
          await deductTokens(playerDataNonUpdating, gachaType, amount);

          // Simulate anticipation with initial message
          await i.deferUpdate();
          const anticipationMessage = await message.channel.send(
            "Drawing your familiar..."
          );
          const resultEmbed = new EmbedBuilder()
            .setTitle("Gacha Pull Result")
            .setFields(
              {
                name: "Common Tokens",
                value: `${playerDataNonUpdating.inventory.tokens.commonScroll}`,
                inline: true,
              },
              {
                name: "Rare Tokens",
                value: `${playerDataNonUpdating.inventory.tokens.rareScroll}`,
                inline: true,
              },
              {
                name: "Legendary Tokens",
                value: `${playerDataNonUpdating.inventory.tokens.legendaryScroll}`,
                inline: true,
              }
            )
            .setColor(0xffd700);

          for (let j = 0; j < amount; j++) {
            await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for anticipation

            const character = await pullGacha(playerId, gachaType);
            pulledFamiliars.push(character);

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
          }

          await anticipationMessage.delete(); // Delete anticipation message after all pulls are completed
          await sentMessage.edit({
            embeds: [resultEmbed],
            components: [selectRow, finalizeRow],
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        message.channel.send("You did not select any gacha type in time!");
      }
    });
  },
};
