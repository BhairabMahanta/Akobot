const fs = require('fs');
const path = require('path');
const { readdirSync } = require('node:fs');


// Function to load all the commands
function loadCommands(client) {
  console.log('Loading commands...');
  const commandsPath = path.join(__dirname, 'commands');
const dataPath = path.join(__dirname, 'data');
  
// Read files from the "enginebase" folder
const enginePath = path.join(dataPath, 'enginebase');
if (fs.existsSync(enginePath)) {
  
  const engineFiles = fs.readdirSync(enginePath).filter(file => file.endsWith('.js'));
  for (const file of engineFiles) {
    try {
      const commandFile = path.join(enginePath, file)
      // console.log(commandFile)
      const command = require(commandFile);
      client.commands.set(command.name, command);
      console.log(`Enginebase command added: ${command.name}`);
    } catch (error) {
      console.error(`Error loading enginebase command file "${file}":`, error);
    }
  }
} else {
  console.log('Enginebase folder does not exist.');
}
 // Read files from the "fun" folder
  const advPath = path.join(commandsPath, 'adv');
  if (fs.existsSync(advPath)) {
    const advFiles = fs.readdirSync(advPath).filter(file => file.endsWith('.js'));
    

    for (const file of advFiles) {
      const command = require(path.join(advPath, file));
       if (command.name && command.description && command.execute) {
        client.commands.set(command.name, command);
      console.log(`Command added: ${command.name}`);
       if (command.aliases && Array.isArray(command.aliases)) {
    for (const alias of command.aliases) {
      client.commands.set(alias, command.name);
      console.log(`Alias added: ${alias} => ${command.name}`);
    }
  }}
    }
  }
  // Read files from the "fun" folder
  const funPath = path.join(commandsPath, 'fun');
  if (fs.existsSync(funPath)) {
    const funFiles = fs.readdirSync(funPath).filter(file => file.endsWith('.js'));
    

    for (const file of funFiles) {
      const command = require(path.join(funPath, file));
      if (command.name && command.description && command.execute) {
      client.commands.set(command.name, command);
      console.log(`Command added: ${command.name}`);
          if (command.aliases && Array.isArray(command.aliases)) {
    for (const alias of command.aliases) {
      client.commands.set(alias, command.name);
      console.log(`Alias added: ${alias} => ${command.name}`);
    }
  }}
    }
  }

  // Read files from the "util" folder
  const utilPath = path.join(commandsPath, 'util');
  if (fs.existsSync(utilPath)) {
    const utilFiles = fs.readdirSync(utilPath).filter(file => file.endsWith('.js'));

    for (const file of utilFiles) {
      const command = require(path.join(utilPath, file));
      if (command.name && command.description && command.execute) {
      client.commands.set(command.name, command);
      console.log(`Command added: ${command.name}`);
          if (command.aliases && Array.isArray(command.aliases)) {
    for (const alias of command.aliases) {
      client.commands.set(alias, command);
      console.log(`Alias added: ${alias} => ${command.name}`);
    }
  }}
    }
  }
}



// Export the loadCommands function
module.exports = {
  loadCommands,
  
};
