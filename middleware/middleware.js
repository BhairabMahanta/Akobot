const PREFIXES = ["a!", "a"]; // Define valid prefixes
const { mongoClient } = require("./data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Check for valid prefix
    const prefix = PREFIXES.find((p) => message.content.startsWith(p));
    if (!prefix) return;

    // Extract command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Special case for 'start' command
    if (commandName === "register") {
      // Ensure the start command logic is handled correctly
      const command = client.commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(message, args, client);
      } catch (error) {
        console.error("Error executing start command:", error);
        message.reply("There was an error executing the start command!");
      }
      return; // Exit early after processing the start command
    }

    // Check if user is registered for other commands
    try {
      const user = await collection.findOne({ discordId: message.author.id });
      if (!user) {
        return message.reply(
          "You are not registered. Please use the `start` command to register."
        );
      }
    } catch (error) {
      console.error("Error checking user registration:", error);
      return message.reply(
        "There was an error verifying your registration status."
      );
    }

    // Retrieve and execute command
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error("Error executing command:", error);
      message.reply("There was an error executing that command!");
    }
  });
};
