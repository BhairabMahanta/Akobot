const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Delete all messages in the channel or purge a specific number of messages from a channel.',
  async execute(client, message, args) {
    // Check if the user has permission to manage messages
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('You do not have permission to use this command. Get proper permissions first.');
    }
 if (message.author.id === '537619455409127442') {
    // Check if the user provided an argument
    if (!args[0]) {
      return message.reply('Please provide the number of messages to purge, "all" to delete all messages in the channel, or specify a channel mention (<#channel_id>) and a number to purge messages from that channel.');
    }

    const num = parseInt(args[args.length - 1]);

    /*if (args[0].toLowerCase() === 'all') {
      // Confirm with the user before proceeding
      const confirmationMessage = await message.channel.send('Are you sure you want to delete all messages in this channel? (yes/no)');

      // Collect a response from the user
      const filter = (response) => response.author.id === message.author.id;
      message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .then(async (collected) => {
          const response = collected.first().content.toLowerCase();

          if (response === 'yes') {
            // Delete all messages in the channel using pagination
            let deletedCount = 0;
            while (true) {
              const channelMessages = await message.channel.messages.fetch({ limit: 100 });
              if (channelMessages.size === 0) break;
              await message.channel.bulkDelete(channelMessages, true);
              deletedCount += channelMessages.size;
            }

            message.channel.send(`Deleted ${deletedCount} messages.`).then((msg) => {
              msg.delete({ timeout: 5000 }); // Delete the response message after 5 seconds
            });
          } else if (response === 'no') {
            confirmationMessage.delete();
            message.reply('Cancelled message deletion.');
          }
        });
    } else */if (!isNaN(num)) {
      // Purge the specified number of messages from the current channel
      const messagesToPurge = Math.min(num + 1, 100); // Limit to 100 messages per request
      const channelMessages = await message.channel.messages.fetch({ limit: messagesToPurge });
      await message.channel.bulkDelete(channelMessages, true);

      message.channel.send(`Purged ${Math.min(num, channelMessages.size)} messages.`).then((msg) => {
        msg.delete({ timeout: 5000 }); // Delete the response message after 5 seconds
      });
    }/* else if (args[0].match(/<#(\d+)>/) && !isNaN(args[1])) {
      // Check if the first argument is a channel mention and the second argument is a number
      const channelMention = args[0].match(/<#(\d+)>/);
      const channelID = channelMention[1];
      const targetChannel = message.guild.channels.cache.get(channelID);

      if (targetChannel) {
        // Purge the specified number of messages from the specified channel
        const messagesToPurge = Math.min(args[1] + 1, 100); // Limit to 100 messages per request
        const channelMessages = await targetChannel.messages.fetch({ limit: messagesToPurge });
        await targetChannel.bulkDelete(channelMessages, true);

        message.channel.send(`Purged ${Math.min(args[1], channelMessages.size)} messages in ${args[0]}.`).then((msg) => {
          msg.delete({ timeout: 5000 }); // Delete the response message after 5 seconds
        });
      } else {
        return message.reply('Invalid channel mention. Please provide a valid channel mention (<#channel_id>) to purge messages.');
      }
    } */
    else {
      return message.reply('Invalid argument. Please provide a valid number, "all," or a channel mention (<#channel_id>) and a number to purge messages.');
    }
  }
  },
};
