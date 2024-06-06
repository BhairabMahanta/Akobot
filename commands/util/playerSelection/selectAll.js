const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
} = require("discord.js");
const mongoose = require("mongoose");
const { playerModel } = require("../../../data/mongo/playerschema.js");
const { mongoClient } = require("../../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const classesData = require("../../../data/classes/allclasses.js");
const racesData = require("../../../data/races/races.js");
const abilitiesData = require("../../../data/abilities.js");

let playerData = null;

module.exports = {
  name: "selectAll",
  description: "Select your race, class, and up to 3 familiars!",
  aliases: ["sa", "selectall"],
  async execute(client, message, args, interaction) {
    const { db } = client;
    const filter = { _id: message.author.id };
    playerData = await collection.findOne(filter);

    // Initial Select Menu for selecting between Race, Class, and Familiar
    const initialSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("initial_select")
      .setPlaceholder("Select an option")
      .addOptions([
        { label: "Select Race", value: "select_race" },
        { label: "Select Class", value: "select_class" },
        { label: "Select Familiar", value: "select_familiar" },
      ]);

    const initialRow = new ActionRowBuilder().addComponents(initialSelectMenu);

    const initialEmbed = new EmbedBuilder()
      .setTitle("Select Your Race, Class, and Familiars")
      .setDescription("Choose an option to start:");

    let sentMessage = await message.channel.send({
      embeds: [initialEmbed],
      components: [initialRow],
    });

    const filterInteraction = (i) =>
      [
        "initial_select",
        "race_select",
        "class_select",
        "familiar_select",
      ].includes(i.customId) && i.user.id === message.author.id;

    const collector = sentMessage.createMessageComponentCollector({
      filter: filterInteraction,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      try {
        await i.deferUpdate();
        if (i.customId === "initial_select") {
          const selectedOption = i.values[0];
          if (selectedOption === "select_race") {
            await handleSelectRace(i, sentMessage);
          } else if (selectedOption === "select_class") {
            await handleSelectClass(i, sentMessage);
          } else if (selectedOption === "select_familiar") {
            await handleSelectFamiliar(i, sentMessage);
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
        message.channel.send(
          "An error occurred while processing your selection."
        );
      }
    });

    async function handleSelectRace(interaction, sentMessage) {
      const raceOptions = Object.keys(racesData).map((raceName) => ({
        label: raceName,
        value: `race-${raceName}`,
      }));

      const raceSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("race_select")
        .setPlaceholder("Select your race")
        .addOptions(raceOptions);

      const switchSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("initial_select")
        .setPlaceholder("Switch to another selection")
        .addOptions([
          { label: "Select Class", value: "select_class" },
          { label: "Select Familiar", value: "select_familiar" },
        ]);

      const raceRow = new ActionRowBuilder().addComponents(raceSelectMenu);
      const switchRow = new ActionRowBuilder().addComponents(switchSelectMenu);

      const raceEmbed = new EmbedBuilder()
        .setTitle("Select Your Race")
        .setDescription("Choose a race to start your journey.");

      await sentMessage.edit({
        embeds: [raceEmbed],
        components: [raceRow, switchRow],
      });

      const raceFilter = (i) =>
        i.customId === "race_select" && i.user.id === message.author.id;

      const raceCollector = sentMessage.createMessageComponentCollector({
        raceFilter,
        time: 300000,
      });

      raceCollector.on("collect", async (interaction) => {
        const selectedRace = interaction.values[0].replace("race-", "");
        playerData.race = selectedRace;
        await collection.updateOne(filter, { $set: { race: selectedRace } });
        await interaction.update({
          content: `You've selected the race: ${selectedRace}`,
          components: [],
        });
      });
    }

    async function handleSelectClass(interaction, sentMessage) {
      const classOptions = Object.keys(classesData).map((className) => ({
        label: className,
        value: `class-${className}`,
      }));

      const classSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("class_select")
        .setPlaceholder("Select your class")
        .addOptions(classOptions);

      const switchSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("initial_select")
        .setPlaceholder("Switch to another selection")
        .addOptions([
          { label: "Select Race", value: "select_race" },
          { label: "Select Familiar", value: "select_familiar" },
        ]);

      const classRow = new ActionRowBuilder().addComponents(classSelectMenu);
      const switchRow = new ActionRowBuilder().addComponents(switchSelectMenu);

      const classEmbed = new EmbedBuilder()
        .setTitle("Select Your Class")
        .setDescription("Choose a class to start your journey.");

      await sentMessage.edit({
        embeds: [classEmbed],
        components: [classRow, switchRow],
      });

      const classFilter = (i) =>
        i.customId === "class_select" && i.user.id === message.author.id;

      const classCollector = sentMessage.createMessageComponentCollector({
        classFilter,
        time: 300000,
      });

      classCollector.on("collect", async (interaction) => {
        const selectedClass = interaction.values[0].replace("class-", "");
        playerData.class = selectedClass;
        await collection.updateOne(filter, { $set: { class: selectedClass } });
        await interaction.update({
          content: `You've selected the class: ${selectedClass}`,
          components: [],
        });
      });
    }

    async function handleSelectFamiliar(interaction, sentMessage) {
      const familiars = playerData.cards.name;

      if (familiars.length === 0) {
        console.log("You have no familiars to select.");
        message.channel.send("You have no familiars to select.");
        return;
      }

      const options = familiars.map((familiar) => ({
        label: familiar,
        value: familiar,
      }));

      let selectMenu = new StringSelectMenuBuilder()
        .setCustomId("familiar_select")
        .setMinValues(1)
        .setMaxValues(Math.min(familiars.length, 3))
        .setPlaceholder("Select up to 3 familiars")
        .addOptions(options);

      const switchSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("initial_select")
        .setPlaceholder("Switch to another selection")
        .addOptions([
          { label: "Select Race", value: "select_race" },
          { label: "Select Class", value: "select_class" },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);
      const switchRow = new ActionRowBuilder().addComponents(switchSelectMenu);

      const embed = new EmbedBuilder()
        .setTitle("Select up to 3 familiars:")
        .setDescription("Select up to 3 familiars to help you on your journey.")
        .setColor("#00FFFF");

      await sentMessage.edit({
        embeds: [embed],
        components: [row, switchRow],
      });

      const filterr = (interaction) => {
        return (
          interaction.customId === "familiar_select" &&
          interaction.user.id === message.author.id
        );
      };

      const collector = sentMessage.createMessageComponentCollector({
        filterr,
        time: 300000,
      });

      let selectedFamiliars = [];

      collector.on("collect", async (interaction) => {
        const selectedValues = interaction.values;
        selectedFamiliars = selectedValues;

        embed.setDescription(
          "You have selected the following familiars:\n" +
            selectedFamiliars.join("\n")
        );

        await updateClass(message.author.id, selectedFamiliars);

        interaction.update({
          embeds: [embed],
          components: [
            new ActionRowBuilder().addComponents(selectMenu),
            switchRow,
          ],
        });
      });

      collector.on("end", () => {
        if (sentMessage) {
          sentMessage.edit({ components: [] });
        }
      });

      async function updateClass(playerId, selectedFamiliars) {
        try {
          const updateData = {
            selectedFamiliars: selectedFamiliars,
          };
          await collection.updateOne({ _id: playerId }, { $set: updateData });
        } catch (error) {
          console.error("Error updating player data:", error);
        }
      }
    }
  },
};
