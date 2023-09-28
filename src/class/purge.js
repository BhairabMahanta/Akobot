const { PermissionsBitField } = require('discord.js');
module.exports = {
  name: 'dontusethisgoddamncommand',
  description: 'Purge a specific number of messages or nuke the channel.',
  async execute(client, message, args) {
    // Check if the user has permission to manage messages
  
//     if (!message.member.permissions.has(1024)) {
//   return message.reply('You do not have permission to use this command.');
// }
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
	return message.reply('dood you cannot use this command, get some permissions from the big man first.');
}


    // Check if the user provided an argument
    if (!args[0]) {
      return message.reply('Please provide the number of messages to purge or use "nuke" to clear the channel.');
    }

    const num = parseInt(args[0]);

    if (args[0].toLowerCase() === 'hidden') {
      // Nuke the channel
      message.channel.clone().then((newChannel) => {
        message.channel.delete();
        newChannel.send('Channel has been nuked! :boom:');
      });
    } else if (!isNaN(num)) {
      // Purge the specified number of messages
      message.channel.bulkDelete(num + 1).then(() => {
        message.channel.send(`Purged ${num} messages.`).then((msg) => {
          msg.delete({ timeout: 5000 }); // Delete the response message after 5 seconds
        });
      });
    } else {
      return message.reply('Invalid argument. Please provide a valid number or "nuke".');
    }
  },
};
