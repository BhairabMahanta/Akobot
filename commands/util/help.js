const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Displays a list of available commands and their descriptions.',
  aliases: ['commands', 'cmds'], // Add aliases here
  async execute(client, message, args) {
    try {
      
   
    const { commands } = client;
    console.log('commands:', commands)
     let perPage = 10; // Number of commands to display per page
    let page = args[0] || 1; // Get the requested page from arguments

    console.log('Total commands:', commands.size);
    console.log('Requested page:', page);

    const totalPages = Math.ceil(commands.size / perPage);
    console.log('Total pages:', totalPages);

    if (page < 1 || page > totalPages) {
      console.log('Invalid page number:', page);
      return message.reply('Invalid page number. Please provide a valid page number.');
    }

    let startIndex;
    let endIndex;
    const startIndexTwo = endIndex + 1;
    const endIndexTwp = endIndex + perPage;

    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);

    const helpEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Command List')
    .setDescription('Here is a list of available commands and their descriptions:')
    .setTimestamp();
    async function getFieldsForPage(commands, page, perPage) {
      console.log('page:L', page)
      console.log('perpage:', perPage)
      startIndex = (page - 1) * perPage;
      endIndex = startIndex + perPage;
  const fields = [];
  fields.push('### Here is a list of available commands their descriptions, and Aliases:\n');
  
  const commandsArray = Array.from(client.commands.values());
  
  commandsArray.forEach((command, index) => {
    console.log('Looping for command:', command.name);
    console.log('index:', index)
    if (index >= startIndex && index < endIndex) {
      console.log('Adding field for command:', command.name);
      const field = {
        name: `### ${index + 1}.) **${command.name}**`,
        value: command.description || 'No description provided',
        inline: false,
      };
  
      fields.push(`${field.name}\n- **Description: ${field.value}**\n`);
  
      console.log('fields:', field);
  
      if (command.aliases && Array.isArray(command.aliases) && command.aliases.length > 0) {
        console.log('Adding aliases for command:', command.name);
        // Adding aliases to the description as well
        fields.push(`- **Aliases**: **${command.aliases.join(', ')}**\n`);
      }
    } 
  });
  // console.log('fieldssssss no z', fields)
  return fields;
} const fieldz = await getFieldsForPage(commands, page, perPage)
  // console.log('fieldszsszz:', fieldz)
  helpEmbed.setDescription(fieldz.join(''));
  

  

  

    

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle('Primary'),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle('Primary'),
        new ButtonBuilder()
          .setCustomId('compact')
          .setLabel('All Commands')
          .setStyle('Primary')
    );

    const messageComponents = [row];


    console.log('Message components:', messageComponents);

    const sentMessage = await message.channel.send({ embeds: [helpEmbed], components: messageComponents });
    const collector = sentMessage.createMessageComponentCollector({
      filter: (interaction) => interaction.customId === 'previous' || interaction.customId === 'compact' || interaction.customId === 'next',
      time: 300000, // 300 seconds
      dispose: true,
    });

    collector.on('collect', async (interaction) => {
      // Handle button clicks here
      if (interaction.customId === 'previous') {
        page = Math.max(page - 1, 1);
        const updatedFields = await getFieldsForPage(commands, page, perPage);
        console.log('updatedfieldszsszz:', updatedFields)

      helpEmbed.setDescription(updatedFields.join(''));
      interaction.update({ embeds: [helpEmbed] });
      } else if (interaction.customId === 'next') {
        page = Math.min(page + 1, totalPages);
        const updatedFields = await getFieldsForPage(commands, page, perPage);
        console.log('updatedfieldszsszz:', updatedFields)

      helpEmbed.setDescription(updatedFields.join(''));
      interaction.update({ embeds: [helpEmbed] });
      }  else if (interaction.customId === 'compact') {
        const fields = [];
  fields.push('### Here is a compact list of available command names:\n');
  
  const commandsArray = Array.from(client.commands.values());
  
  commandsArray.forEach((command, index) => {
    console.log('Looping for command:', command.name);
    console.log('index:', index)
    
      console.log('Adding field for command:', command.name);
      const field = {
        name: `**${command.name}**`,
        value: command.description || 'No description provided',
        inline: false, 
      };
  
      fields.push(`${field.name}, `);
    });
    console.log('fields:', fields);
      helpEmbed.setDescription(fields.join(''));
      interaction.update({ embeds: [helpEmbed] });

} 
 
      
    });
  } catch (error) {
    console.error('An error occurred:', error);

  }
  }
  ,
};
