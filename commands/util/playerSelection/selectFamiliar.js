const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  time,
} = require("discord.js");

const { playerModel } = require("../../../data/mongo/playerschema.js"); // Adjust the path to match your schema file location
const { mongoClient } = require("../../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
let playerData = null;
// const players = require('../../../data/players.json');
const fs = require("fs");
let selectMenu;
module.exports = {
  name: "selectfamiliar",
  description: "Select up to 3 familiars!",
  aliases: ["sf"],
  async execute(client, message, args, interaction) {
    const { db } = client;
    const PlayerModel = await playerModel(db);
    const filter = { _id: message.author.id };
    playerData = await collection.findOne(filter);
    async function updateClass(playerIdee, className) {
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
        // Save the document
      } catch (err) {
        console.error("Error updating player data:", err);
      }
    }
    const playerId = message.author.id;
    console.log("Player ID:", playerData);
    const familiars = playerData.cards.name;

    if (familiars.length === 0) {
      console.log("You have no familiars to select.");
      message.channel.send("You have no familiars to select.");
      return;
    }
    const options = familiars.map((familiar) => {
      if (familiar) {
        // ability.execute(this.currentTurn, this.boss.name)
        console.log("execuTE:", familiar);
        return {
          label: familiar,
          value: familiar,
        };
      }
    });
    console.log("Options:", options);

    if (familiars.length < 2) {
      // Create a SelectMenu with all of the familiars
      selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_familiars")
        .setMinValues(1)
        .setPlaceholder("Select up to 3 familiars")
        .addOptions(options);
      console.log("selectMenu:", selectMenu);
    } else if (familiars.length < 3 && familiars.length > 1) {
      // Create a SelectMenu with all of the familiars
      selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_familiars")
        .setMinValues(1)
        .setMaxValues(2)
        .setPlaceholder("Select up to 3 familiars")
        .addOptions(options);
      console.log("selectMenu:", selectMenu);
    } else {
      // Create a SelectMenu with all of the familiars
      selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_familiars")
        .setMinValues(1)
        .setMaxValues(3)
        .setPlaceholder("Select up to 3 familiars")
        .addOptions(options);
      console.log("selectMenu:", selectMenu);
    }

    // Create a row for the SelectMenu
    const row = new ActionRowBuilder().addComponents(selectMenu);
    console.log("row:", row);

    // Create an embed
    const embed = new EmbedBuilder()
      .setTitle(`Select up to 3 familiars:`)
      .setDescription("Select up to 3 familiars to help you on your journey.")
      .setFooter({ text: `By you at 6:09.6969pm` })
      .setColor("#00FFFF");

    // Send the embed with the SelectMenu
    const messageja = await message.channel.send({
      embeds: [embed],
      components: [row],
    });

    // Handle SelectMenu interactions
    const filterr = (interaction) => {
      return (
        interaction.customId === "select_familiars" &&
        interaction.user.id === playerId
      );
    };

    const collector = messageja.createMessageComponentCollector({
      filterr,
      time: 300000,
    });
    let selectedFamiliars = [];

    collector.on("collect", async (interaction) => {
      try {
        const selectedValues = interaction.values;

        console.log("Selected values:", selectedValues);

        // Update the selectedFamiliars array
        selectedFamiliars = selectedValues;

        // Update the SelectMenu options
        selectMenu.setOptions(
          familiars.map((familiar, i) => {
            const isSelected = selectedValues.includes(familiar);
            return { label: familiar, value: familiar, default: false };
          })
        );
        console.log("selectedFamiliars:", selectedFamiliars);
        const selectedFamiliarsArray = [];
        selectedFamiliarsArray.push(selectedFamiliars);
        console.log("sfArray:", selectedFamiliarsArray);
        // Update the embed
        embed.setDescription(
          "You have selected the following familiars:\n" +
            selectedFamiliars.join("\n")
        );
        // players[playerId].selectedFamiliars.name = selectedFamiliars;
        await updateClass(playerId, selectedFamiliarsArray);
        // Save the updated data back to the file
        // fs.writeFile('./data/players.json', JSON.stringify(players, null, 2), 'utf8', (writeErr) => {
        //   if (writeErr) {
        //     console.error('Error writing updated player data:', writeErr);
        //   }
        // });

        // Send the updated embed with the SelectMenu
        interaction.update({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(selectMenu)],
        });
      } catch (err) {
        console.error("Error updating player data:", err);
      }
    });

    collector.on("end", () => {
      // Update the player's data with the selected familiars
    });
  },
};
