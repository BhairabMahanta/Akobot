const { mongoClient } = require("../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");

module.exports = async (interaction) => {
  if (interaction.isCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (command) return;

    try {
      if (interaction.commandName !== "start") {
        const user = await collection.findOne({
          discordId: interaction.user.id,
        });
        if (!user) {
          await interaction.reply({
            content: "Please run the `start` command to get started.",
            ephemeral: true,
          });
          return;
        }
      }

      await command.execute(interaction);
    } catch (error) {
      console.error("Error executing command:", error);
      await interaction.reply({
        content: "There was an error executing that command!",
        ephemeral: true,
      });
    }
  }
};
