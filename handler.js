const fs = require("fs");
const path = require("path");
const { readdirSync } = require("node:fs");
const { add_numbers } = require("./my_rust_library/pkg/my_rust_library.js");

const result = add_numbers(5, 7);
console.log("Result of adding numbers:", result);

// Function to load commands from a specific folder recursively
function loadCommandsFromFolder(client, folderPath) {
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
      loadCommandsFromFolder(client, filePath);
    } else if (file.endsWith(".js")) {
      // If it's a JavaScript file, require and add the command
      const command = require(filePath);
      if (command.name && command.description && command.execute) {
        client.commands.set(command.name, command);
        console.log(`Command added: ${command.name}`);
      }
    }
  }
}

// Function to load all the commands from multiple folders recursively
function loadCommands(client) {
  const commandsPath = path.join(__dirname, "commands");
  loadCommandsFromFolder(client, commandsPath);
}

// Export the loadCommands function
module.exports = {
  loadCommands,
};
