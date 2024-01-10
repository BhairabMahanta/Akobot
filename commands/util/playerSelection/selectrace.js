const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {playerModel} = require('../../../data/mongo/playerschema.js'); // Adjust the path to match your schema file locationss
// Read classes and races data
const classesData = require('../../../data/classes/allclasses.js');
const racesData = require('../../../data/races/races.js');
const abilitiesData = require('../../../data/abilities.js');

// Define the path to 'players.json' file
const playersFilePath = path.join(__dirname, '..', '..', '..', 'data', 'players.json');
const userData = JSON.parse(fs.readFileSync(playersFilePath, 'utf8'));
const selectButton = new ButtonBuilder() // Add a new button for selecting
    .setCustomId('select_button')
    .setLabel('Select')
    .setStyle('Success');
    const selectRow = new ActionRowBuilder().addComponents(selectButton // Add the new "Select" button
);
let selectedRaceValue;

// Select race and class command handler
module.exports = {
    name: 'selectrace',
    description: 'Select your race and class!',
  aliases: ['sr', 'selectr'],
    async execute(client, message, args, interaction) {
        try {
          const {db} = client;
            const userId = message.author.id;


         async function updateClass(playerId, className) {
  const PlayerModel = await playerModel(db);


  // Find the document with the _id `playerId`
  const player = await PlayerModel.findByIdAndUpdate(`${playerId}`, { race: `${className}` },{ upsert: true, new: true, setDefaultsOnInsert: true }
  );

console.log('AFTERCLASS:', player)
  // Save the document
  await player.save();
}
          
                 const raceOptions = Object.keys(racesData).map(raceName => ({
            label: raceName,
            value: `race-${raceName}`,
        }));
  
            const optionsPerPage = 5;
            let classPageIndex = 0;

            const raceFields = raceOptions.map(raceOption => {
                const raceName = raceOption.value.replace('race-', '');
                return {
                    name: `Race: ${raceName}`,
                    value: racesData[raceName]?.description || 'Description not available',
                    inline: false,
                };
            });

            const page = args[0] ? parseInt(args[0], 10) : 1;
            if (isNaN(page) || page <= 0) {
                return message.reply('Invalid page number.');
            }

            const startIndex = (page - 1) * optionsPerPage;
            const endIndex = startIndex + optionsPerPage;
            const raceSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('race_select')
                .setPlaceholder('Select your race')
                .addOptions(raceOptions);

            const raceRow = new ActionRowBuilder().addComponents(raceSelectMenu);

            const initialEmbed = new EmbedBuilder()
                .setTitle('Pick a Race to advance forward!')
                .setDescription('Use the buttons to navigate through the options.')
                .addFields(...raceFields);

            let sentMessage;
            if (endIndex < raceOptions.length) {
                const nextPage = page + 1;

                const actionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`familiars_${nextPage}`)
                        .setLabel('Next Page')
                        .setStyle('Danger')
                );

                initialEmbed.setFooter({ text:`Page ${page} | Use the "Next Page" button to view more races if any.`});
                sentMessage = await message.channel.send({ embeds: [initialEmbed], components: [raceRow, actionRow] });

                const filter = i => (i.customId.startsWith('race_select') || i.customId === 'select_button') && i.user.id === message.author.id;
                const collector = sentMessage.createMessageComponentCollector({ filter, time: 300000 });

                collector.on('collect', async (i) => {
                     try {
                       i.deferUpdate();                       
                    console.log('Interaction custom ID:', i.customId);
                     let updateEmbed;
                  
                        if (i.customId.startsWith('race_select')) {
                              selectedRaceValue = i.values[0]; // Get the selected value // gae shit
                          console.log('Selected race value from race_select:', selectedRaceValue);
                       if (selectedRaceValue.startsWith('race-')) {
                         console.log('bro clicked:', i.user.id);

                    const raceNAme = selectedRaceValue.replace('race-', '');
                          console.log('classnamebrovalue:', raceNAme)
         console.log('classdescription:', racesData[raceNAme]?.description);
        console.log('abilitiesdescription:', racesData[raceNAme]?.abilities[0], ', ', racesData[raceNAme]?.abilities[1])
                            const gae1Fields = {
                                name: `Class: ${raceNAme}`,
                                value: racesData[raceNAme]?.description || 'Description not available',
                                inline: false,
                            };

                           const gae1_1Fields = {
    name: `Abilities:`,
    value:  `**${racesData[raceNAme]?.abilities.slice(0, 2).join(', ')}**` || 'weak, no ability',
    inline: false,
};
                 abilityOne = racesData[raceNAme]?.abilities[0]
                 abilityTwo = racesData[raceNAme]?.abilities[1]
                         const abilityDescFieldOne = {
    name: `${racesData[raceNAme]?.abilities[0]}:`,
    value:  `**${abilitiesData[abilityOne]?.description}**` || 'weak, no ability',
    inline: false,
};
                                    const abilityDescFieldTwo = {
    name: `${racesData[raceNAme]?.abilities[1]}:`,
    value:  `**${abilitiesData[abilityTwo]?.description}**` || 'weak, no ability',
    inline: false,
};                
                            updateEmbed = new EmbedBuilder()
                                .setTitle(`Pick ${raceNAme} Race?`)
                                .setDescription('Use the buttons to navigate through the options.')
                                .addFields(gae1Fields, gae1_1Fields, abilityDescFieldOne, abilityDescFieldTwo);
                        } 
                                          await sentMessage.edit({ embeds: [updateEmbed], components: [raceRow, selectRow] })
                    } 
                        else if (i.customId === 'select_button') {
    console.log('Select button clicked!');
    console.log('Selected value after clicking "Select" button:', selectedRaceValue);
    if (selectedRaceValue.startsWith('race-')) { // <-- Corrected condition here
        const raceName = selectedRaceValue.replace('race-', '');

        // Update user data with selected race
        userData[userId].race = raceName;
        fs.writeFileSync('./data/players.json', JSON.stringify(userData, null, 4));
await updateClass(userId, raceName)
        // Prepare and send reply
   
        await message.channel.send(`You've selected the race: ${raceName}`);
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
