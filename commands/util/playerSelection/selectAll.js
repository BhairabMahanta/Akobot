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
let selectMenu;
let raceOptions;
let classOptions;
let classRow;
let raceRow;
let familiars;
let playerData = null;
let selectedRaceValue;
let selectedClassValue;
const selectButton = new ButtonBuilder() // Add a new button for selecting
  .setCustomId("select_race_button")
  .setLabel("Select")
  .setStyle("Success");
const selectRow = new ActionRowBuilder().addComponents(
  selectButton // Add the new "Select" button
);
const selectButton2 = new ButtonBuilder() // Add a new button for selecting
  .setCustomId("select_class_button")
  .setLabel("Select")
  .setStyle("Success");
const selectRow2 = new ActionRowBuilder().addComponents(
  selectButton2 // Add the new "Select" button
);
module.exports = {
  name: "selectAll",
  description: "Select your race, class, and up to 3 familiars!",
  aliases: ["sa", "selectall"],
  async execute(client, message, args, interaction) {
    const { db } = client;
    const filter = { _id: message.author.id };
    playerData = await collection.findOne(filter);

    classOptions = Object.keys(classesData).map((className) => ({
      label: className,
      value: `class-${className}`,
    }));

    const classSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("class_select")
      .setPlaceholder("Select your class")
      .addOptions(classOptions);
    classRow = new ActionRowBuilder().addComponents(classSelectMenu);

    raceOptions = Object.keys(racesData).map((raceName) => ({
      label: raceName,
      value: `race-${raceName}`,
    }));
    const raceSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("race_select")
      .setPlaceholder("Select your race")
      .addOptions(raceOptions);
    raceRow = new ActionRowBuilder().addComponents(raceSelectMenu);

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
        "select_race_button",
        "select_class_button",
        "select_race",
        "select_class",
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
        let abilityOne;
        let abilityTwo;
        console.log("Interaction custom ID:", i.customId);
        let updateEmbed;

        if (i.customId === "initial_select") {
          const selectedOption = i.values[0];
          if (selectedOption === "select_race") {
            await handleSelectRace(i, sentMessage);
          } else if (selectedOption === "select_class") {
            await handleSelectClass(i, sentMessage);
          } else if (selectedOption === "select_familiar") {
            await handleSelectFamiliar(i, sentMessage);
          }
        } else if (i.customId.startsWith("race_select")) {
          selectedRaceValue = i.values[0]; // Get the selected value // gae shit
          console.log(
            "Selected race value from race_select:",
            selectedRaceValue
          );
          if (selectedRaceValue.startsWith("race-")) {
            console.log("bro clicked:", i.user.id);

            const raceNAme = selectedRaceValue.replace("race-", "");
            console.log("classnamebrovalue:", raceNAme);
            console.log("classdescription:", racesData[raceNAme]?.description);
            console.log(
              "abilitiesdescription:",
              racesData[raceNAme]?.abilities[0],
              ", ",
              racesData[raceNAme]?.abilities[1]
            );
            const gae1Fields = {
              name: `Class: ${raceNAme}`,
              value:
                racesData[raceNAme]?.description || "Description not available",
              inline: false,
            };

            const gae1_1Fields = {
              name: "Abilities:",
              value:
                `**${racesData[raceNAme]?.abilities
                  .slice(0, 2)
                  .join(", ")}**` || "weak, no ability",
              inline: false,
            };
            abilityOne = racesData[raceNAme]?.abilities[0];
            abilityTwo = racesData[raceNAme]?.abilities[1];
            const abilityDescFieldOne = {
              name: `${racesData[raceNAme]?.abilities[0]}:`,
              value:
                `**${abilitiesData[abilityOne]?.description}**` ||
                "weak, no ability",
              inline: false,
            };
            const abilityDescFieldTwo = {
              name: `${racesData[raceNAme]?.abilities[1]}:`,
              value:
                `**${abilitiesData[abilityTwo]?.description}**` ||
                "weak, no ability",
              inline: false,
            };
            updateEmbed = new EmbedBuilder()
              .setTitle(`Pick ${raceNAme} Race?`)
              .setDescription(
                "Use the buttons to navigate through the options."
              )
              .addFields(
                gae1Fields,
                gae1_1Fields,
                abilityDescFieldOne,
                abilityDescFieldTwo
              );
          }
          await sentMessage.edit({
            embeds: [updateEmbed],
            components: [selectRow, raceRow, initialRow],
          });
        } else if (i.customId === "select_race_button") {
          if (selectedRaceValue.startsWith("race-")) {
            const raceName = selectedRaceValue.replace("race-", "");

            playerData.race = raceName;
            await updateRace("asdhadad", raceName);
            await message.channel.send(
              `You've selected the class: ${raceName}`
            );
            sentMessage.edit({ components: [initialRow] });
          }
        } else if (i.customId.startsWith("class_select")) {
          selectedClassValue = i.values[0]; // Get the selected value // gae shit

          if (selectedClassValue.startsWith("class-")) {
            console.log("bro clicked:", i.user.id);

            const className = selectedClassValue.replace("class-", "");
            console.log("classnamebrovalue:", className);
            console.log(
              "classdescription:",
              classesData[className]?.description
            );
            console.log(
              "abilitiesdescription:",
              classesData[className]?.abilities[0],
              ", ",
              classesData[className]?.abilities[1]
            );
            const gae1Fields = {
              name: `Class: ${className}`,
              value:
                classesData[className]?.description ||
                "Description not available",
              inline: false,
            };

            const gae1_1Fields = {
              name: "Abilities:",
              value:
                `**${classesData[className]?.abilities
                  .slice(0, 2)
                  .join(", ")}**` || "weak, no ability",
              inline: false,
            };
            abilityOne = classesData[className]?.abilities[0];
            abilityTwo = classesData[className]?.abilities[1];
            const abilityDescFieldOne = {
              name: `${classesData[className]?.abilities[0]}:`,
              value:
                `**${abilitiesData[abilityOne]?.description}**` ||
                "weak, no ability",
              inline: false,
            };
            const abilityDescFieldTwo = {
              name: `${classesData[className]?.abilities[1]}:`,
              value:
                `**${abilitiesData[abilityTwo]?.description}**` ||
                "weak, no ability",
              inline: false,
            };
            updateEmbed = new EmbedBuilder()
              .setTitle(`Pick ${className} Class?`)
              .setDescription(
                "Use the buttons to navigate through the options."
              )
              .addFields(
                gae1Fields,
                gae1_1Fields,
                abilityDescFieldOne,
                abilityDescFieldTwo
              );
          }
          await sentMessage.edit({
            embeds: [updateEmbed],
            components: [selectRow2, classRow, initialRow],
          });
        } else if (i.customId === "select_class_button") {
          console.log("selectedClassValue:", selectedClassValue);
          if (selectedClassValue.startsWith("class-")) {
            // <-- Corrected condition here
            const className = selectedClassValue.replace("class-", "");

            // Update user data with selected race
            console.log("playerData:", playerData);
            playerData.class = className;
            await updateClass("asdhadad", className);

            await message.channel.send(
              `You've selected the class: ${className}`
            );

            sentMessage.edit({ components: [initialRow] });
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
      const raceFields = raceOptions.map((raceOption) => {
        const raceName = raceOption.value.replace("race-", "");
        return {
          name: `Race: ${raceName}`,
          value:
            racesData[raceName]?.description || "Description not available",
          inline: false,
        };
      });

      const switchSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("initial_select")
        .setPlaceholder("Switch to another selection")
        .addOptions([
          { label: "Select Class", value: "select_class" },
          { label: "Select Familiar", value: "select_familiar" },
        ]);

      const switchRow = new ActionRowBuilder().addComponents(switchSelectMenu);

      const raceEmbed = new EmbedBuilder()
        .setTitle("Pick a Race to advance forward!")
        .setDescription("Use the buttons to navigate through the options.")
        .addFields(...raceFields);

      await sentMessage.edit({
        embeds: [raceEmbed],
        components: [raceRow, switchRow],
      });

      /* const raceFilter = (i) =>
        i.customId === "race_select" && i.user.id === message.author.id;

      const raceCollector = sentMessage.createMessageComponentCollector({
        raceFilter,
        time: 300000,
      });*/
    }

    async function handleSelectClass(interaction, sentMessage) {
      const classOptions = Object.keys(classesData).map((className) => ({
        label: className,
        value: `class-${className}`,
      }));

      const classFields = classOptions.map((classOption) => {
        const className = classOption.value.replace("class-", "");
        return {
          name: `Class: ${className}`,
          value:
            classesData[className]?.description || "Description not available",
          inline: false,
        };
      });
      console.log("workingb");

      const switchSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("initial_select")
        .setPlaceholder("Switch to another selection")
        .addOptions([
          { label: "Select Race", value: "select_race" },
          { label: "Select Familiar", value: "select_familiar" },
        ]);

      const switchRow = new ActionRowBuilder().addComponents(switchSelectMenu);

      const classEmbed = new EmbedBuilder()
        .setTitle("Select Your Class")
        .setDescription("Use the buttons to navigate through the options.")
        .addFields(...classFields);

      await sentMessage.edit({
        embeds: [classEmbed],
        components: [classRow, switchRow],
      });
    }

    async function handleSelectFamiliar(interaction, sentMessage) {
      let messageja;
      familiars = playerData.cards.name;

      if (familiars.length === 0) {
        console.log("You have no familiars to select.");
        message.channel.send("You have no familiars to select.");
        return;
      }
      const options = familiars.map((familiar) => {
        if (familiar) {
          // ability.execute(this.currentTurn, this.boss.name)
          return {
            label: familiar,
            value: familiar,
          };
        }
      });

      if (familiars.length < 2) {
        // Create a SelectMenu with all of the familiars
        selectMenu = new StringSelectMenuBuilder()
          .setCustomId("select_familiars")
          .setMinValues(1)
          .setPlaceholder("Select up to 3 familiars")
          .addOptions(options);
      } else if (familiars.length < 3 && familiars.length > 1) {
        // Create a SelectMenu with all of the familiars
        selectMenu = new StringSelectMenuBuilder()
          .setCustomId("select_familiars")
          .setMinValues(1)
          .setMaxValues(2)
          .setPlaceholder("Select up to 3 familiars")
          .addOptions(options);
      } else {
        // Create a SelectMenu with all of the familiars
        selectMenu = new StringSelectMenuBuilder()
          .setCustomId("select_familiars")
          .setMinValues(1)
          .setMaxValues(3)
          .setPlaceholder("Select up to 3 familiars")
          .addOptions(options);
      }

      // Create a row for the SelectMenu
      const row = new ActionRowBuilder().addComponents(selectMenu);

      const switchSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("initial_select")
        .setPlaceholder("Switch to another selection")
        .addOptions([
          { label: "Select Race", value: "select_race" },
          { label: "Select Class", value: "select_class" },
        ]);

      const switchRow = new ActionRowBuilder().addComponents(switchSelectMenu);

      let embed = new EmbedBuilder()
        .setTitle("Select up to 3 familiars:")
        .setDescription("Select up to 3 familiars to help you on your journey.")
        .setColor("#00FFFF");

      await sentMessage.edit({
        components: [switchRow],
      });
      messageja = await message.channel.send({
        embeds: [embed],
        components: [row],
      });

      // Handle SelectMenu interactions
      const filterr = (interaction) => {
        return (
          interaction.customId === "select_familiars" &&
          interaction.user.id === message.author.id
        );
      };

      const collector = messageja.createMessageComponentCollector({
        filterr,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        try {
          let selectedFamiliars = [];
          const selectedValues = interaction.values;
          // Update the selectedFamiliars array
          selectedFamiliars = selectedValues;

          // Update the SelectMenu options
          selectMenu.setOptions(
            familiars.map((familiar, interaction) => {
              const isSelected = selectedValues.includes(familiar);
              return { label: familiar, value: familiar, default: false };
            })
          );
          console.log("selectedFamiliars:", selectedFamiliars);
          const selectedFamiliarsArray = [];
          selectedFamiliarsArray.push(selectedFamiliars);
          console.log("sfArray:", selectedFamiliarsArray);

          message.channel.send(
            `You have selected: ${selectedFamiliars.join(
              ", "
            )} as your familiars!`
          );
          // players[playerId].selectedFamiliars.name = selectedFamiliars;
          await updateFamiliar("adyuga", selectedFamiliarsArray);

          interaction.update({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectMenu)],
          });
          setTimeout(() => {
            messageja.delete();
          }, 5000);
        } catch (err) {
          console.error("Error updating player data:", err);
        }
      });

      collector.on("end", () => {
        // Update the player's data with the selected familiars
      });
    }
    async function updateFamiliar(playerIdee, className) {
      const selektFam = className;
      console.log("selectfam:", selektFam);
      /*
       
      */
      // Find the document with the _id `playerId`
      try {
        if (!playerData.selectedFamiliars) {
          // If the quest array doesn't exist, create it as an empty array
          playerData.selectedFamiliars = { name: selektFam.flat() };
        } else if (playerData.selectedFamiliars.name) {
          playerData.selectedFamiliars.name = selektFam.flat();
        }
        if (playerData) {
          const updates = {
            $set: { selectedFamiliars: playerData.selectedFamiliars },
          };
          console.log("rewards.xpereince:", playerData.selectedFamiliars);
          // Update the player's document with the xpUpdate object
          await collection.updateOne(filter, updates);
        }
      } catch (error) {
        console.error("An error occurred:", error);
        message.channel.send(
          "An error occurred while processing your selection."
        );
      }
    }

    async function updateRace(playerId, className) {
      if (playerData) {
        const updates = {
          $set: { race: className },
        };
        console.log("rewards.xpereince:", className);
        // Update the player's document with the xpUpdate object
        await collection.updateOne(filter, updates);
      }
    }
    async function updateClass(playerId, className) {
      if (playerData) {
        const updates = {
          $set: { class: className },
        };
        console.log("rewards.xpereince:", className);
        // Update the player's document with the xpUpdate object
        await collection.updateOne(filter, updates);
      }
    }
  },
};
