const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType,
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

    const embed = new EmbedBuilder()
      .setTitle("Deck Configuration")
      .setDescription(
        "1) empty\n2) empty\n3) empty\n4) empty\n5) empty\n6) empty"
      )
      .setColor(0x00ae86);

    const buttons1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("slot1")
        .setLabel("1")
        .setStyle("Success"),
      new ButtonBuilder()
        .setCustomId("slot2")
        .setLabel("2")
        .setStyle("Success"),
      new ButtonBuilder().setCustomId("slot3").setLabel("3").setStyle("Success")
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
      new ButtonBuilder().setCustomId("slot6").setLabel("6").setStyle("Success")
    );

    await message.channel.send({
      embeds: [embed],
      components: [buttons1, buttons2],
    });

    const filterInteraction = (i) => i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({
      filter: filterInteraction,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (!i.isButton()) return;

      const slotNumber = i.customId.replace("slot", "");

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
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isModalSubmit()) return;

      const slotNumber = interaction.customId.replace("modal-", "");
      const input = interaction.fields.getTextInputValue(`input-${slotNumber}`);
      let updateText = input;

      if (input.toLowerCase() === "player") {
        updateText = {
          serialId: "player",
          globalId: message.author.id,
          name: message.author.username,
          stats: {},
        };
      } else {
        updateText = {
          serialId: input,
          globalId: `global_id_${input}`, // Example of global ID generation
          name: `Familiar ${input}`, // You can fetch the actual name from another collection if needed
          stats: {
            level: 1,
            xp: 0,
            strength: 10,
            defense: 10,
          },
        };
      }

      playerData.deck = playerData.deck || [];
      playerData.deck[slotNumber - 1] = updateText;

      const updatedDescription = playerData.deck
        .map((item, index) => `${index + 1}) ${item ? item.name : "empty"}`)
        .join("\n");
      embed.setDescription(updatedDescription);
      await interaction.update({
        embeds: [embed],
        components: [buttons1, buttons2],
      });

      await collection.updateOne(filter, { $set: { deck: playerData.deck } });
    });

    collector.on("end", (collected) => {
      console.log(`Collected ${collected.size} interactions.`);
    });
  },
};
