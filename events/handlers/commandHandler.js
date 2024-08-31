const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");
const PREFIXES = ["a!"];
const klient = "its a placeholder because its not working without it bro wtf";
class CommandHandler {
  constructor(client) {
    this.client = client;
    this.client.commands = new Collection();
    this.client.interactions = new Collection(); // Add collection for interactions
    this.cooldowns = new Collection(); // Collection to track cooldowns
    this.client.safemode = false; // Track safemode state
  }

  loadCommandsFromFolder(folderPath) {
    console.log(`Loading commands from ${folderPath}...`);

    if (!fs.existsSync(folderPath)) {
      console.log(`Folder ${folderPath} does not exist.`);
      return;
    }

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        // If it's a directory, recursively load commands from it
        this.loadCommandsFromFolder(filePath);
      } else if (file.endsWith(".js")) {
        // If it's a JavaScript file, require and add the command
        const command = require(filePath);
        if (command.name && command.description && command.execute) {
          this.client.commands.set(command.name, command);
          console.log(`Command added: ${command.name}`);
        }
      }
    }
  }

  // Function to load all the commands from multiple folders recursively
  loadCommands() {
    const commandsPath = path.join(__dirname, "..", "..", "commands");
    console.log("commandsPOTHOLEL:", commandsPath);
    this.loadCommandsFromFolder(commandsPath);
  }

  loadInteractions() {
    const interactionsPath = path.join(__dirname, "..", "..", "interactions");
    const interactionFiles = fs
      .readdirSync(interactionsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of interactionFiles) {
      const filePath = path.join(interactionsPath, file);
      const interaction = require(filePath);
      this.client.interactions.set(interaction.name, interaction);
      console.log(`Loaded interaction: ${interaction.name}`);
    }
  }

  async handleCommand(message) {
    if (!message || !message.content) return;
    if (this.client.safemode) {
      return message.reply("Commands are currently disabled due to safemode.");
    }
    console.log("working");
    const prefix = PREFIXES.find((p) => message.content.startsWith(p));
    if (!prefix || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    console.log("commandName:", commandName);
    const command =
      this.client.commands.get(commandName) ||
      this.client.commands.find(
        (c) => c.aliases && c.aliases.includes(commandName.toLowerCase())
      );

    if (!command) {
      //fucking debugs
      // console.log(`Command not found: ${commandName}`);
      return;
    }

    // Cooldown logic
    const now = Date.now();
    const cooldownAmount = (command.cooldown || 3) * 1000; // Convert to milliseconds
    const cooldowns = this.cooldowns.get(command.name) || new Collection();

    if (cooldowns.has(message.author.id)) {
      const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `Please wait **${timeLeft.toFixed(
            1
          )}** more seconds before reusing the \`${command.name}\` command.`
        );
      }
    }

    // Set cooldown
    cooldowns.set(message.author.id, now);
    this.cooldowns.set(command.name, cooldowns);
    setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

    // Execute command
    try {
      await command.execute(this.client, message, args);
    } catch (error) {
      console.error("Error executing command:", error);
      message.reply("There was an error executing that command!");
    }
  }

  async handleInteraction(interaction) {
    if (!interaction.isCommand()) return;

    if (this.client.safemode && !interaction.customId) {
      return interaction.reply({
        content: "Commands are currently disabled due to safemode.",
        ephemeral: true,
      });
    }
    const interactionCommand = this.client.interactions.get(
      interaction.commandName
    );
    if (!interactionCommand) {
      console.log(`Interaction not found: ${interaction.commandName}`);
      return;
    }

    try {
      await interactionCommand.execute(interaction);
    } catch (error) {
      console.error("Error executing interaction:", error);
      interaction.reply({
        content: "There was an error executing that command!",
        ephemeral: true,
      });
    }
  }
}

module.exports = CommandHandler;
