  const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Read classes and races data
const classesData = require('../../data/classes/allclasses');
const racesData = require('../../data/races/races');
const abilitiesData = require('../../data/abilities');

// Define the path to 'players.json' file
const playersFilePath = path.join(__dirname, '..', '..', 'data', 'players.json');
const userData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
const selectButton = new ButtonBuilder() // Add a new button for selecting
    .setCustomId('select_button')
    .setLabel('Select')
    .setStyle('Success');
    const selectRow = new ActionRowBuilder().addComponents(selectButton // Add the new "Select" button
);
let selectedClassValue;

// Select race and class command handler
module.exports = {
    name: 'selectclass',
    description: 'Select your race and class!',
   aliases: ['sc', 'selectc'],
    async execute(client, message, args, interaction) {
        try {
            const userId = message.author.id;

            // Create options for classes
            const classOptions = Object.keys(classesData).map(className => ({
                label: className,
                value: `class-${className}`,
            }));
  
            const optionsPerPage = 5;
            let classPageIndex = 0;

            const classFields = classOptions.map(classOption => {
                const className = classOption.value.replace('class-', '');
                return {
                    name: `Class: ${className}`,
                    value: classesData[className]?.description || 'Description not available',
                    inline: false,
                };
            });

            const page = args[0] ? parseInt(args[0], 10) : 1;
            if (isNaN(page) || page <= 0) {
                return message.reply('Invalid page number.');
            }

            const startIndex = (page - 1) * optionsPerPage;
            const endIndex = startIndex + optionsPerPage;
            const classSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('class_select')
                .setPlaceholder('Select your class')
                .addOptions(classOptions);

            const classRow = new ActionRowBuilder().addComponents(classSelectMenu);

            const initialEmbed = new EmbedBuilder()
                .setTitle('Pick a Class or Race')
                .setDescription('Use the buttons to navigate through the options.')
                .addFields(...classFields);

            let sentMessage;
            if (endIndex < classOptions.length) {
                const nextPage = page + 1;

                const actionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`familiars_${nextPage}`)
                        .setLabel('Next Page')
                        .setStyle('Secondary')
                );

                initialEmbed.setFooter({ text:`Page ${page} | Use the "Next Page" button to view more classes if any.`});
                sentMessage = await message.channel.send({ embeds: [initialEmbed], components: [classRow, actionRow] });

                const filter = i => (i.customId.startsWith('class_select') || i.customId === 'select_button') && i.user.id === message.author.id;
                const collector = sentMessage.createMessageComponentCollector({ filter, time: 300000 });

                collector.on('collect', async (i) => {
                        try {
                       i.deferUpdate();    
                    console.log('Interaction custom ID:', i.customId);
                     let updateEmbed;
                        if (i.customId.startsWith('class_select')) {
                              selectedClassValue = i.values[0]; // Get the selected value // gae shit
                  
                       if (selectedClassValue.startsWith('class-')) {
                         console.log('bro clicked:', i.user.id);

                    const className = selectedClassValue.replace('class-', '');
                          console.log('classnamebrovalue:', className)
         console.log('classdescription:', classesData[className]?.description);
        console.log('abilitiesdescription:', classesData[className]?.abilities[0], ', ', classesData[className]?.abilities[1])
                            const gae1Fields = {
                                name: `Class: ${className}`,
                                value: classesData[className]?.description || 'Description not available',
                                inline: false,
                            };

                           const gae1_1Fields = {
    name: `Abilities:`,
    value:  `**${classesData[className]?.abilities.slice(0, 2).join(', ')}**` || 'weak, no ability',
    inline: false,
};
                 abilityOne = classesData[className]?.abilities[0]
                 abilityTwo = classesData[className]?.abilities[1]
                         const abilityDescFieldOne = {
    name: `${classesData[className]?.abilities[0]}:`,
    value:  `**${abilitiesData[abilityOne]?.description}**` || 'weak, no ability',
    inline: false,
};
                                    const abilityDescFieldTwo = {
    name: `${classesData[className]?.abilities[1]}:`,
    value:  `**${abilitiesData[abilityTwo]?.description}**` || 'weak, no ability',
    inline: false,
};                       
                            updateEmbed = new EmbedBuilder()
                                .setTitle(`Pick ${className} Class?`)
                                .setDescription('Use the buttons to navigate through the options.')
                                .addFields(gae1Fields, gae1_1Fields, abilityDescFieldOne, abilityDescFieldTwo);
                       }
                          await sentMessage.edit({ embeds: [updateEmbed], components: [classRow, selectRow] });
                       } 
                       else if (i.customId === 'select_button') {
    console.log('Select button clicked!');
    console.log('Selected value after clicking "Select" button:', selectedClassValue);
    if (selectedClassValue.startsWith('class-')) { // <-- Corrected condition here
        const className = selectedClassValue.replace('class-', '');

        // Update user data with selected race
        userData[userId].class = className;
        fs.writeFileSync('./data/players.json', JSON.stringify(userData, null, 4));

        // Prepare and send reply
        await message.channel.send(`You've selected the race: ${className}`);
      sentMessage.edit({ components: [] });
     }
                        }
                       } catch (error) {
        console.error('An error occurred:', error);
        message.channel.send('noob ass, caused an error.');
                     }
                });

                collector.on('end', collected => {
                    if (!sentMessage.deleted) {
                        sentMessage.edit({ components: [] });
                    }
                });
            } else {
                message.channel.send('soja bhai');
            }
        } catch (error) {
            console.error('An error occurred:', error);
          message.channel.send('noob ass, caused an error.')
        }
    },
};
