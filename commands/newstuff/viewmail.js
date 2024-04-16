const { playerModel } = require("../../data/mongo/mailschema.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  name: "viewmail",
  aliases: ["vml", "vm"],
  description: "View mail documents",
  async execute(client, message) {
    const playerId = message.author.id;
    const collectionPrefix = "akaillection";

    try {
      const mailList = [];

      // Iterate over collections with the specified prefix
      let collectionIndex = 0;
      while (true) {
        const collectionName =
          collectionIndex === 0
            ? collectionPrefix
            : `${collectionPrefix}${collectionIndex}`;
        const PlayerCollection = await playerModel(client.db, collectionName);
        const playerData = await PlayerCollection.findOne({ _id: playerId });

        if (playerData && playerData.mailList) {
          mailList.push(...playerData.mailList);
        }

        // Break the loop if the collection doesn't exist
        if (!playerData && collectionIndex > 0) {
          break;
        }

        collectionIndex++;
      }

      // Add mail documents from the maildoc collection
      const MailDocCollection = await playerModel(client.db, "maildoc");
      const mailDocData = await MailDocCollection.find({ mailTo: "everyone" });

      if (mailDocData && mailDocData.length > 0) {
        for (const mailDoc of mailDocData) {
          mailList.push(mailDoc); // Assuming mailList is defined elsewhere
        }
      }

      if (mailList.length === 0) {
        return message.channel.send("You have no mail documents yet.");
      }

      const embed = new EmbedBuilder()
        .setTitle("Mail Documents")
        .setDescription(
          "Select a mail document from the list below to view details:"
        );
      // Sort mailList by date in descending order (newest first)
      mailList.sort((a, b) => b.date - a.date);
      // Add fields to the embed for each mail document
      mailList.forEach((mail, index) => {
        // const mailDate = mail.date.toLocaleString(); // Convert date to string format
        const unixTimestamp = Math.floor(mail.date.getTime() / 1000);

        embed.addFields({
          name: `${index + 1}) ${mail.name}`,
          value: `Date: <t:${unixTimestamp}:f>`,
          inline: false,
        });
        // Add any other important information here
      });

      const selectMenuOptions = mailList.map((mail, index) => ({
        label: `${index + 1}. ${mail.name}`,
        value: mail._id,
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_mail")
        .setPlaceholder("Select a Mail Document")
        .addOptions(selectMenuOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);
      const sentMessage = await message.channel.send({
        embeds: [embed],
        components: [row],
      });

      const filter = (i) => i.user.id === playerId;
      const collector = sentMessage.createMessageComponentCollector({
        filter,
        time: 300000,
      });

      collector.on("collect", async (interaction) => {
        if (
          interaction.isStringSelectMenu() &&
          interaction.customId === "select_mail"
        ) {
          const selectedMailId = interaction.values[0];
          const selectedMail = mailList.find(
            (mail) => mail._id === selectedMailId
          );
          if (selectedMail) {
            // Build and send an embed with mail details
            const mailEmbed = new EmbedBuilder()
              .setTitle(selectedMail.name)
              .setDescription(`${selectedMail.mailText}`)
              .setFields(
                {
                  name: "Mail Claimed",
                  value: "yes",
                },
                {
                  name: "Number Claimed",
                  value: `${selectedMail.numberClaimed}`,
                },
                {
                  name: "Achievement",
                  value: selectedMail.achievement ? "Yes" : "No",
                },
                { name: "Delete After", value: `${selectedMail.deleteAfter}` },
                {
                  name: "Auto Claim",
                  value: selectedMail.autoClaim ? "Yes" : "No",
                },
                {
                  name: "Rewards",
                  value: `Coins: ${selectedMail.rewards.coins}, Gems: ${selectedMail.rewards.gems}, XP: ${selectedMail.rewards.xp}`,
                }
              );

            await interaction.update({ embeds: [mailEmbed] });
          }
        }
      });

      collector.on("end", () => {
        // Remove the select menu after a minute
        sentMessage.edit({ components: [] });
      });
    } catch (error) {
      console.error("Error retrieving mail documents:", error);
      message.channel.send(
        "An error occurred while retrieving mail documents."
      );
    }
  },
};
