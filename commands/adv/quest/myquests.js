const fs = require("fs");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  Options,
  Embed,
} = require("discord.js");
const { quests } = require("./quests");
const path = require("path");
const playersFilePath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  "players.json"
);
const playerData = JSON.parse(fs.readFileSync(playersFilePath, "utf8"));
const { QuestLogic } = require("./questLogic");
let startingThisQuest = null;
let embed;
let row;
let row2;
let sentMessage;
module.exports = {
  name: "myquests",
  description: "View your selected quests",
  aliases: ["mq", "mqs"],
  async execute(client, message) {
    const db = client.db;
    const playerId = message.author.id;
    const collection = db.collection("akaillection");
    const dbFilter = { _id: playerId };
    const dbData = await collection.findOne(dbFilter);
    console.log("dbDATA:", dbData);
    if (!dbData || !dbData.quests) {
      return message.channel.send("You have no quests yet.");
    }
    const datEmbed = new EmbedBuilder()
      .setTitle("Quest Menu")
      .setDescription("This is the mooltiverse of quests boi");

    // Create a select menu with quest options
    const options = {};

    const selectMainMenu = new StringSelectMenuBuilder()
      .setCustomId("select_menu")
      .setPlaceholder("Select An Option")
      .addOptions([
        { label: "Available Quests", value: "klik_my" },
        { label: "Active Quests", value: "klik_active" },
        { label: "Expired Quests", value: "klik_expire" },
        { label: "Finished Quests", value: "klik_finished" },
      ]);
    const questList = dbData.quests;
    console.log("activeqestlost:", questList);
    const activeQuestList = dbData.activeQuests;
    const completeList = dbData.completedQuests;
    console.log("activeqestlost:", activeQuestList);

    async function myQuestBuilder() {
      embed = new EmbedBuilder()
        .setTitle("My Quests")
        .setDescription(
          "### Select a quest from the list below to view details:"
        );

      // Populate the fields with the list of quests
      questList.forEach((questName, index) => {
        // console.log('questName:', questName)
        const questDetails = quests[questName];
        embed.addFields({
          name: `${index + 1}.  ${questDetails.title}`,
          value: `>>> ${questDetails.description}`,
          inline: false,
        });
      });
    }

    // Create a select menu with quest options
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_quest")
      .setPlaceholder("Select a Quest")
      .addOptions(
        questList.map((quest, index) => ({
          label: `${index + 1}.  ${quests[quest].title}`,
          value: quest,
        }))
      );

    const activeSelectMenuOptions = Object.keys(activeQuestList).map(
      (quest, index) => ({
        label: `${index + 1}. ${quests[quest].title}`,
        value: quest,
      })
    );

    const activeSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_active")
      .setPlaceholder("Select to view further details.")
      .addOptions(activeSelectMenuOptions);

    row = new ActionRowBuilder().addComponents(selectMainMenu);

    // Send the initial embed with the select menu
    sentMessage = await message.channel.send({
      embeds: [datEmbed],
      components: [row],
    });

    // Create a collector for the select menu interaction
    const filter = (i) => i.user.id === playerId;
    const collector = sentMessage.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "select_menu") {
        await interaction.deferUpdate();
        const interactionValue = interaction.values[0];
        const click = interactionValue.replace("klik_", "");
        if (click === "my") {
          await myQuestBuilder();
          row = new ActionRowBuilder().addComponents(selectMenu);
          afterButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel("Go back")
              .setCustomId("back")
          );
          const row2 = afterButtonRow;
          sentMessage.edit({ embeds: [embed], components: [row, row2] });
        } else if (click === "active") {
          const activeEmbed = new EmbedBuilder()
            .setTitle("Active Quests")
            .setDescription("These Are your active Quests!");

          // Populate the fields with the list of active quests
          let indhex = 1;
          for (const activeQuestName in activeQuestList) {
            if (activeQuestList.hasOwnProperty(activeQuestName)) {
              const activeQuestDetails = quests[activeQuestName];
              activeEmbed.addFields({
                name: `${indhex}.  ${activeQuestDetails.title}`,
                value: `>>> ${activeQuestDetails.description}`,
                inline: false,
              });
              indhex++;
            }
          }
          afterButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel("Go back")
              .setCustomId("back")
          );
          const row2 = afterButtonRow;

          row = new ActionRowBuilder().addComponents(activeSelectMenu);
          sentMessage.edit({ embeds: [activeEmbed], components: [row, row2] });
        } else if (click === "expire") {
          const activeEmbed = new EmbedBuilder()
            .setTitle("Expired quests!!")
            .setDescription(
              "These Quests Expired Because Your Ass was too Lazy\n It will only show!"
            );

          // Populate the fields with the list of active quests
          let indhex = 1;
          let noCompletedQuests = true;

          for (const activeQuestName in completeList) {
            if (completeList.hasOwnProperty(activeQuestName)) {
              const activeQuestDetails = completeList[activeQuestName];
              const datQuestDetails = quests[activeQuestName];

              if (activeQuestDetails.questStatus === "failed") {
                activeEmbed.addFields({
                  name: `${indhex}.  ${datQuestDetails.title}`,
                  value: `>>> ${datQuestDetails.description}`,
                  inline: false,
                });
                indhex++;
                noCompletedQuests = false; // At least one completed quest found
              }
            }
          }

          // If there are no completed quests, add a special message
          if (noCompletedQuests) {
            activeEmbed.addFields({
              name: "No Completed Quests",
              value: "You haven't completed any quests yet.",
              inline: true,
            });
          }
          afterButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel("Go back")
              .setCustomId("back")
          );
          const row2 = afterButtonRow;
          try {
            const failedMenuOptions = Object.keys(completeList)
              .map((quest, index) => {
                if (completeList[quest].questStatus === "failed") {
                  return {
                    label: `${index + 1}. ${quests[quest].title}`,
                    value: quest,
                  };
                }
              })
              .filter((option) => option !== undefined);

            const failedMenu = new StringSelectMenuBuilder()
              .setCustomId("select_active")
              .setPlaceholder("Select to view further details.");
            if (failedMenuOptions.length > 0) {
              failedMenu.addOptions(failedMenuOptions);
            } else {
              failedMenu.addOption({
                label: "None",
                value: "nonexistent",
              });
            }

            row = new ActionRowBuilder().addComponents(failedMenu);
            sentMessage.edit({ embeds: [activeEmbed], components: [row2] });
          } catch (error) {
            console.log("errorHERE:", error);
          }
        } else if (click === "finished") {
          const activeEmbed = new EmbedBuilder()
            .setTitle("Finished quests")
            .setDescription("These last few quests were completed By You!!");

          // Populate the fields with the list of active quests
          let indhex = 1;
          let noCompletedQuests = true;

          for (const activeQuestName in completeList) {
            if (completeList.hasOwnProperty(activeQuestName)) {
              const activeQuestDetails = completeList[activeQuestName];
              const datQuestDetails = quests[activeQuestName];

              if (activeQuestDetails.questStatus === "completed") {
                activeEmbed.addFields({
                  name: `${indhex}.  ${datQuestDetails.title}`,
                  value: `>>> ${datQuestDetails.description}`,
                  inline: false,
                });
                indhex++;
                noCompletedQuests = false; // At least one completed quest found
              }
            }
          }

          // If there are no completed quests, add a special message
          if (noCompletedQuests) {
            activeEmbed.addFields({
              name: "No Completed Quests",
              value: "You haven't completed any quests yet.",
              inline: true,
            });
          }
          afterButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle("Primary")
              .setLabel("Go back")
              .setCustomId("back")
          );
          const row2 = afterButtonRow;
          try {
            const completedMenuOptions = Object.keys(completeList)
              .map((quest, index) => {
                if (completeList[quest].questStatus === "completed") {
                  return {
                    label: `  ${quests[quest].title}`,
                    value: quest,
                  };
                }
              })
              .filter((option) => option !== undefined);

            const completedMenu = new StringSelectMenuBuilder()
              .setCustomId("select_active")
              .setPlaceholder("Select to view further details.");
            if (completedMenuOptions) {
              console.log("completedMenu:", completedMenuOptions);
              completedMenu.addOptions(completedMenuOptions);
            } else {
              completedMenu.addOption({
                label: "None",
                value: "nonexistent",
              });
            }
            console.log("row:", completedMenu);

            row = new ActionRowBuilder().addComponents(completedMenu);
            sentMessage.edit({ embeds: [activeEmbed], components: [row2] });
          } catch (error) {
            console.log("errorHERE:", error);
          }
        }
      }

      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "select_quest"
      ) {
        const selectedQuest = interaction.values[0];
        const questDetails = quests[selectedQuest];
        startingThisQuest = questDetails;

        embed.setFields(
          {
            name: "Quest Name:",
            value: questDetails.title,
            inline: false,
          },
          {
            name: "Quest Objective:",
            value: questDetails.description,
            inline: false,
          },
          {
            name: "Quest Time Limit:",
            value: `${questDetails.timeLimit} Days`,
            inline: false,
          }
          // Add more fields as needed
        );

        const afterButtonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Go back")
            .setCustomId("back"),
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Start Quest")
            .setCustomId("start_quest")
        );
        row2 = afterButtonRow;

        await interaction.update({ embeds: [embed], components: [row, row2] });
      } else if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "select_active"
      ) {
        const selectedQuest = interaction.values[0];
        const questDetails = activeQuestList[selectedQuest];
        const questDetails2 = quests[selectedQuest];

        const activeEmbed = new EmbedBuilder()
          .setTitle("Active Quest Details")
          .setDescription(`### ${quests[selectedQuest].title}'s Details`);

        // Iterate through questDetails.objectives and add fields for each objective
        questDetails.objectives.forEach((objective, index) => {
          console.log(objective);
          activeEmbed.addFields({
            name: `Objective ${index + 1}:`,
            value: `>>> Objective Description:\n **${objective.description}**\nObjective Target - **${objective.target}**\nObjective Required: **${objective.required}**\nObjective Current: **${objective.current}**`,
            inline: true,
          });
        });

        activeEmbed.addFields(
          {
            name: "Quest Name:",
            value: `>>> ${questDetails2.title}`,
            inline: false,
          },
          {
            name: "Quest Time Limit vs time left:",
            value: `>>> Time limit: ${questDetails.timeLimit.totalDays} Days\n Time left: <t:${questDetails.timeLimit.daysLeft}:R>`,
            inline: false,
          }
          // Add more fields as needed
        );

        afterButtonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle("Primary")
            .setLabel("Go back")
            .setCustomId("back")
        );
        const row2 = afterButtonRow;
        await interaction.update({ embeds: [activeEmbed], components: [row2] });
      }

      if (interaction.customId === "start_quest") {
        await interaction.deferUpdate();
        embed.setTitle("Started Quest!");
        embed.setDescription(
          '### You can view quest details and real time information through "a!myquest" '
        );
        sentMessage.edit({ embeds: [embed] });
        const startQuest = new QuestLogic(
          message,
          interaction,
          sentMessage,
          embed,
          row,
          row2,
          dbData,
          db
        );
        startQuest.startQuest(startingThisQuest.id);
      } else if (interaction.customId === "back") {
        row = new ActionRowBuilder().addComponents(selectMainMenu);
        interaction.update({
          embeds: [datEmbed],
          components: [row],
        });
      }
    });

    collector.on("end", () => {
      // Remove the select menu after a minute
      sentMessage.edit({ components: [] });
    });
  },
};
