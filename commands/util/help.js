const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Displays a list of available commands and their descriptions.',
  aliases: ['commands', 'cmds'], // Add aliases here
  async execute(client, message, args) {
    const { commands } = client;
    console.log('commands:', commands)
     const perPage = 10; // Number of commands to display per page
    const page = args[0] || 1; // Get the requested page from arguments

    console.log('Total commands:', commands.size);
    console.log('Requested page:', page);

    const totalPages = Math.ceil(commands.size / perPage);
    console.log('Total pages:', totalPages);

    if (page < 1 || page > totalPages) {
      console.log('Invalid page number:', page);
      return message.reply('Invalid page number. Please provide a valid page number.');
    }

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);

    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Command List')
      .setDescription('Here is a list of available commands and their descriptions:')
      .setTimestamp();

    const fields = [];

        const commandsArray = Array.from(client.commands.values());

   commandsArray.forEach((command, index) => {
  console.log('Looping for command:', command.name);
     console.log('index:', index)
  if (index >= startIndex && index < endIndex) {
    console.log('Adding field for command:', command.name);
    const field = {
      name: `:green_circle: **${command.name}**`,
      value: command.description || 'No description provided',
      inline: false,
    };

    fields.push(field);
    console.log('fields:', field);

    if (command.aliases && Array.isArray(command.aliases) && command.aliases.length > 0) {
      console.log('Adding aliases for command:', command.name);
      fields.push({ name: 'Aliases', value: command.aliases.join(', '), inline: false });
    }
  } });


    helpEmbed.addFields(...fields);

    

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle('Primary'),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle('Primary')
    );

    const messageComponents = [row];

    // if (page !== 1) {
    //   messageComponents.push(
    //     new ButtonBuilder()
    //       .setCustomId('first')
    //       .setLabel('First')
    //       .setStyle('Primary')
    //   );
    // }

    // if (page !== totalPages) {
    //   messageComponents.push(
    //     new ButtonBuilder()
    //       .setCustomId('last')
    //       .setLabel('Last')
    //       .setStyle('Primary')
    //   );
    //  } 
    console.log('Message components:', messageComponents);

    message.channel.send({ embeds: [helpEmbed], components: messageComponents });
  },
};
