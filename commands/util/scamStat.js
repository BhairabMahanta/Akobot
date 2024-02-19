const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

let output2 = [];
module.exports = {
  name: "scam",
  description: "Allows users to choose between two scam options.",
  async execute(client, message, args) {
    try {
      // Extract the text after the command
      const textToCopy = args.join(" ");
      console.log("textToCopy:", textToCopy);

      // Check if any text is provided
      if (!textToCopy) {
        message.reply("You didn't provide any text to copy.");
        return;
      }

      // Extract user IDs from the text
      const regex = /<@(\d+)>/g;
      const matches = textToCopy.match(regex);
      const extractedIDs = matches
        ? matches.map((match) => match.substring(2, match.length - 1))
        : [];
      console.log("extractedIDs:", extractedIDs);
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Select your way to scam")
        .setDescription(extractedIDs.join("\n"));

      const stat = new ButtonBuilder()
        .setStyle("Success")
        .setLabel("Scam Stat")
        .setCustomId("stat");

      const dupe = new ButtonBuilder()
        .setCustomId("dupe")
        .setLabel("Scam Dupes")
        .setStyle("Primary");

      // Create an action row and add the buttons
      const row = new ActionRowBuilder().addComponents(stat, dupe);
      let output = [];

      for (const id of extractedIDs) {
        output.push(`sc ${id} hp>279 atk>50 def>79 spd>70\n`);
      }

      if (message.channel && !message.author.bot) {
        message.channel
          .send({ embeds: [embed], components: [row] })
          .then((msg) => {
            client.on("interactionCreate", async (interaction) => {
              if (
                !interaction.isButton() ||
                interaction.user.id !== message.author.id
              ) {
                return;
              }

              if (interaction.customId === "stat") {
                embed.setDescription(`${output.join("")}`);
                embed.setFooter({ text: "Selected stat" });
                msg.edit({ embeds: [embed], components: [] });
              } else if (interaction.customId === "dupe") {
                await createDupeModal(interaction, extractedIDs);
                // embed.setDescription(await output2.join("\n"));
                embed.setFooter({ text: 'Selected "dupe"' });
                msg.edit({ embeds: [embed], components: [] });
              }

              //   msg.edit({ embeds: [embed], components: [] }); // Remove the buttons after one click

              //   interaction
              //     .reply({
              //       content: `Button clicked. Turning them off!`,
              //       ephemeral: false,
              //     })
              //     .then(() => {
              //       console.log("Button clicked. Turning them off!");
              //     })
              //     .catch(console.error);
            });
          });
      }

      // Generate the desired output for each ID
    } catch (error) {
      console.log("Error:", error);
    }
    async function createDupeModal(interaction, extractedIDs) {
      try {
        if (!interaction.isButton()) return; // Validate interaction type
        if (interaction.customId !== "dupe") return; // Verify button clicked

        const modal = new ModalBuilder()
          .setCustomId("dupeModal") // Unique identifier for the modal
          .setTitle("Enter Dupes");

        const textInput = new TextInputBuilder()
          .setCustomId("dupeInput") // Unique identifier for the input
          .setLabel("Dupes")
          .setStyle(TextInputStyle.Short); // Single-line text input

        const firstActionRow = new ActionRowBuilder().addComponents(textInput);

        modal.addComponents([firstActionRow]);
        console.log("test1");
        await interaction.showModal(modal);

        // Handle form submission (in interactionCreate event):
        interaction.client.on("interactionCreate", async (subInteraction) => {
          if (!subInteraction.isModalSubmit()) return;
          if (subInteraction.customId !== "dupeModal") return;
          console.log("test2");
          const dupeInput =
            subInteraction.fields.getTextInputValue("dupeInput");
          console.log("test3");
          // Process your dupes logic here using dupeInput and extractedIDs
          output2 = [];
          extractedIDs.forEach((id) => {
            console.log(`sc ${id} n:${dupeInput}`);
            output2.push(`sc ${id} n:${dupeInput}`);
          });
          console.log("test4");
          // Respond to the interaction (optional):
          await subInteraction.reply({
            content: `Here are your dupes! \n${output2.join("\n")}`,
            ephemeral: true,
          }); // Only sender sees the response
        });
      } catch (error) {
        console.log("Error:", error);
      }
    }
  },
};
