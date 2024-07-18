const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
  StringSelectMenuBuilder,
} = require("discord.js");
const { mongoClient } = require("../../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");

module.exports = {
  name: "deck",
  description:
    "Configure your deck and placement of your familiars and yourself.",
  aliases: ["d"],
  async execute(client, message, args, interaction) {
    const filter = { _id: message.author.id };
    let playerData = await collection.findOne(filter);

    if (!playerData) {
      playerData = { _id: message.author.id, deck: [] };
      await collection.insertOne(playerData);
    }

    const empty = "empty";
    const empty2 = { name: "empty" };
    const updatedDescription = playerData.deck
      .map(
        (item, index) =>
          `${
            item
              ? `\`\`${item.name.toString().padStart(14, " ")}\`\``
              : `\`\`${empty.toString().padStart(7, " ")}\`\``
          }`
      )
      .join("\n");
    const formattedDescription = updatedDescription.split("\n");
    const topRow = formattedDescription.slice(0, 3).join("   ");
    const bottomRow = formattedDescription.slice(3, 6).join("   ");
    const embed = new EmbedBuilder()
      .setTitle("Deck Configuration")
      .setDescription(`**__FR__**: ${topRow}\n\n__**BR**__: ${bottomRow}\n\n`)
      .setColor(0x00ae86)
      .setFooter({
        text: `FrontRow elements are hit more often and BackRow are hit less often/reduced dmg`,
      });

    const buttons1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("slot1")
        .setLabel("1")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("slot2")
        .setLabel("2")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("slot3")
        .setLabel("3")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("save")
        .setLabel("Save")
        .setStyle("Primary")
    );
    const buttons2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("slot4")
        .setLabel("4")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("slot5")
        .setLabel("5")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("slot6")
        .setLabel("6")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("reset")
        .setLabel("Reset")
        .setStyle("Danger")
    );

    const optionSelectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("fast_select")
        .setPlaceholder("Select fast options")
        .addOptions([
          {
            label: "Select Deck Fast",
            description:
              "Input 6 responses, with 'e' for empty and numbers as serial IDs",
            value: "select_deck_fast",
          },
          {
            label: "Auto Select",
            description: "Randomly select familiar IDs for the deck",
            value: "auto_select",
          },
        ])
    );

    await message.channel.send({
      embeds: [embed],
      components: [buttons1, buttons2, optionSelectRow],
    });

    const filterInteraction = (i) => i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({
      filter: filterInteraction,
      time: 120000,
    });

    collector.on("collect", async (i) => {
      if (i.isButton()) {
        const slotNumber = i.customId.replace("slot", "");

        if (i.customId === "save") {
          await i.deferUpdate();
          await collection.updateOne(filter, {
            $set: { deck: playerData.deck },
          });
          await message.channel.send("Deck configuration saved!");
          collector.stop();
        } else if (i.customId === "reset") {
          playerData.deck = [];
          for (let j = 0; j < 6; j++) {
            playerData.deck.push(empty);
          }
          await collection.updateOne(filter, {
            $set: { deck: playerData.deck },
          });

          const resetDescription = playerData.deck
            .map((item, index) => `${index + 1}) ${item ? item.name : "empty"}`)
            .join("\n");
          embed.setDescription(resetDescription);
          await message.channel.send({
            embeds: [embed],
            components: [buttons1, buttons2, optionSelectRow],
          });
          await i.update({
            content: "Deck reset successfully!",
            components: [],
          });
        } else {
          const modal = new ModalBuilder()
            .setCustomId(`modal-${slotNumber}`)
            .setTitle(`Configure Slot ${slotNumber}`)
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId(`input-${slotNumber}`)
                  .setLabel("Enter the familiar ID or type 'player'")
                  .setStyle(TextInputStyle.Short)
              )
            );

          await i.showModal(modal);
        }
      } else if (i.isStringSelectMenu()) {
        if (i.customId === "fast_select") {
          const selectedValue = i.values[0];
          if (selectedValue === "select_deck_fast") {
            const modal = new ModalBuilder()
              .setCustomId("modal-fast_select")
              .setTitle("Fast Deck Selection")
              .addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId("input-fast_select")
                    .setLabel("Enter 6 values (e for empty, numbers for IDs)")
                    .setStyle(TextInputStyle.Paragraph)
                )
              );
            await i.showModal(modal);
          } else if (selectedValue === "auto_select") {
            // Ensure extraPlayerDataNonUpdating is defined
            const extraPlayerDataNonUpdating = await collection.findOne(filter);

            playerData.deck = [];
            for (let j = 0; j < 6; j++) {
              const randomIndex = Math.floor(
                Math.random() * extraPlayerDataNonUpdating.collectionInv.length
              );
              playerData.deck.push(
                extraPlayerDataNonUpdating.collectionInv[randomIndex]
              );
            }
            await collection.updateOne(filter, {
              $set: { deck: playerData.deck },
            });
            const autoDescription = playerData.deck
              .map(
                (item, index) => `${index + 1}) ${item ? item.name : "empty"}`
              )
              .join("\n");
            embed.setDescription(autoDescription);
            await message.channel.send({
              embeds: [embed],
              components: [buttons1, buttons2, optionSelectRow],
            });
            await i.update({
              content: "Deck auto-selected successfully!",
              components: [],
            });
          }
        }
      }
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isModalSubmit()) return;

      const inputValues = interaction.fields.getTextInputValue(
        `input-${interaction.customId.split("-")[1]}`
      );

      if (interaction.customId === "modal-fast_select") {
        const inputs = inputValues.split(" ");
        playerData.deck = [];
        for (let i = 0; i < 6; i++) {
          const input = inputs[i];
          if (input.toLowerCase() === "e") {
            playerData.deck.push(empty2);
          } else {
            const extraPlayerDataNonUpdating = await collection.findOne(filter);

            const foundItem = extraPlayerDataNonUpdating.collectionInv.find(
              (item) => item.serialId === input
            );
            playerData.deck.push(foundItem || empty);
          }
        }
      } else {
        const slotNumber = interaction.customId.replace("modal-", "");
        const input = interaction.fields.getTextInputValue(
          `input-${slotNumber}`
        );
        let updateText = input;
        // Ensure extraPlayerDataNonUpdating is defined
        const extraPlayerDataNonUpdating = await collection.findOne(filter);

        if (input.toLowerCase() === "player") {
          updateText = {
            serialId: "player",
            globalId: message.author.id,
            name: message.author.username,
            stats: {},
          };
        } else {
          const foundItem = extraPlayerDataNonUpdating.collectionInv.find(
            (item) => item.serialId === input
          );
          let theElement;
          if (foundItem) {
            theElement = foundItem;
          }

          updateText = {
            serialId: input,
            globalId: `${theElement.globalId}`, // Example of global ID generation
            name: theElement.name, // You can fetch the actual name from another collection if needed
            stats: theElement.stats,
          };
        }

        playerData.deck = playerData.deck || [];
        playerData.deck[slotNumber - 1] = updateText;
      }

      const updatedDescription = playerData.deck
        .map((item, index) => `${index + 1}) ${item ? item.name : "empty"}`)
        .join("\n");
      embed.setDescription(updatedDescription);

      await collection.updateOne(filter, { $set: { deck: playerData.deck } });

      await interaction.update({
        embeds: [embed],
        components: [buttons1, buttons2, optionSelectRow],
      });
    });

    collector.on("end", (collected) => {
      console.log(`Collected ${collected.size} interactions.`);
    });
  },
};
