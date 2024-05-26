// adventureCommand.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
const {Location, Floor, floor1, floor2, allFloors} = require('../information/loc');
const { quests } = require('../quest/quests'); // Import quest data
const { bosses } = require('../monsterInfo/bosses'); // Import boss data
// const { mobs } = require('./mobs'); // Import mob data
const players = require('../../../data/players.json');
const { navigationRow, handleNavigation } = require('./navigation');
const questData = require('../quest/quests');
const bossData = require('../monsterInfo/bosses');
let selectedValue = [];
const sharp = require('sharp');
const areaImage = 'commands/adv/information/area2.png'; 
    
module.exports = {
  name: 'adventure',
  description: 'Start an adventure!',
   aliases: ['a', 'adv'],
  async execute(client, message, args, interaction) {
const player = players[message.author.id];
// Simulate player data (replace with your actual data)
  const playerName = player.name;
  
  const playerFloorIndex = 0; // Replace with the actual floor index for the player
  const playerLocationIndex = 0; // Replace with the actual location index for the player

  const selectedFloor = allFloors[playerFloorIndex];
    
  const selectedLocation = selectedFloor.locations[playerLocationIndex];
   
    const adventureConfirmEmbed = new EmbedBuilder()
      .setTitle('Adventure Confirmation')
      .setDescription('Would you like to start an adventure?');

    const confirmationRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('start_adventure')
          .setLabel('Yes')
          .setStyle('Success'),
        new ButtonBuilder()
          .setCustomId('cancel_adventure')
          .setLabel('No')
          .setStyle('Danger')
      );
     const confirmationRowTwo = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('go_in')
          .setLabel('Lets Dive into it')
          .setStyle('Success')
      );


    const initialMessage = await message.channel.send({
    embeds: [adventureConfirmEmbed],
    components: [confirmationRow]
  });
      // Create the embed for the adventure command
    const adventureEmbed = new EmbedBuilder()
      .setTitle(selectedLocation.name)
      .setDescription('Know what this journey of yours has to offer!')
      .addFields(
      { name: '**Quests**', 
      value: selectedLocation.quests.map(quest => `'${quest}'`).join(',  '),
      inline: false },
        { name: '**Bosses**', 
      value: selectedLocation.bosses.map(boss => `\`${boss}\``).join(',  '),
      inline: false },
        { name: '**Mobs**', 
      value: `${selectedLocation.mobs.join('\n')}`,
      inline: false },
        { name: '**Adventure**', 
      value: "Go on the Adventure Lad!",
      inline: false },
        { name: '**Difficulty**', 
      value: `${selectedLocation.difficulty}`,
      inline: false },
          );
      // Create the embed for the adventure command
    const adventureIntoEmbedConfirmation = new EmbedBuilder()
      .setTitle(selectedLocation.name)
      .setDescription('Do you want to go in? If you had any saved progress, you will spawn right there!')
      .addFields(
      { name: '**Player Level**', 
      value: ` \`\`Level: ${player.exp.level}\`\`, Username: __${player.name}__ `,
      inline: false },
        { name: '**Level Restriction and Level suggestion**', 
      value: `Area only for \`\`Level ${selectedLocation.requiredLevel}\`\` and Above!\n Suggested Level for this area is 'makeLevelSuggestion'`,
      inline: false },
        { name: '**Party recommended**', 
      value: `${selectedLocation.mobs.join('\n')}`,
      inline: false },
        { name: '**Automate this adventure?**', 
      value: "You can automatically finish an adventure if you reach 100% discovery in that area and fulfil a few other requirements!!",
      inline: false },
         { name: '**Start Adventuring?**', 
      value: 'To start, click on the "Lets Dive into it" button!!',
           inline: false },
        { name: '**Difficulty**', 
      value: `${selectedLocation.difficulty}`,
      inline: false },
          );


     // Display options for quests, bosses, mobs, and adventures
    const optionSelectMenu = new StringSelectMenuBuilder()
      .setCustomId('option_select')
      .setPlaceholder('Select an option')
      .addOptions([
        { label: 'Quests', value: 'klik_quests' },
        { label: 'Bosses', value: 'klik_bosses' },
        { label: 'Mobs', value: 'klik_mobs' },
        { label: 'Go into the Adventure', value: 'klik_adventure' }
      ]);
const stringMenuRow = new ActionRowBuilder().addComponents(optionSelectMenu);

    const filter = i => (['start_adventure', 'cancel_adventure'].includes(i.customId)) || (i.customId === 'option_select') || (i.customId === 'go_in');
       const collector = initialMessage.createMessageComponentCollector({ filter, time: 300000 });

    collector.on('collect', async (i) => {
                        try {
      if (i.customId === 'start_adventure') {
        i.deferUpdate();
        // handleNavigation(allFloors, interaction, adventureEmbed, initialMessage);

   // Now you can use initialMessage to edit it or perform other actions
  initialMessage.edit({
    content: `You are at: ${selectedLocation.name}\nDescription: ${selectedLocation.description}`,
    embeds: [adventureEmbed],
    components: [stringMenuRow]
  });
       
          
        // ... Continue with location/floor selection
      }
      else  if (i.customId.startsWith('option_select')) {
        i.deferUpdate();
                              selectedValue = i.values[0]; // Get the selected value // gae shit
                  
                       if (selectedValue.startsWith('klik_')) {
                        console.log('bro clicked fr??:', selectedValue);
                         const selectedValueName = selectedValue.replace('klik_', '');
                         if (selectedValueName === 'quests') {
                            // Create options for classes
 const questEmbed = new EmbedBuilder()
    .setColor(0x992e22)
    .setDescription('More info About the available quests in this area!')
  
       const availableQuests = selectedLocation.quests.map(questName => quests[questName]);

  // Iterate over the available quests and modify the embed fields
  availableQuests.forEach((quest, index) => {

    // Modify the existing fields or add new ones to the embedBuilder
    questEmbed.addFields({
      name: ` ${index + 1} • ${quest.title}`,
      value: `Objective: ${quest.objective}\nRewards: ${quest.rewards[0].experience} XP, ${quest.rewards[0].items.join(', ')}`,
      inline: false,
    });
  });

  // Now, you can edit the original message with the updated embedBuilder
  initialMessage.edit({
    content:'',
    embeds: [questEmbed],
    components: [stringMenuRow], // Assuming you have navigationRow defined
  });
                                                                         
                       } 
                         else if (selectedValueName === 'bosses') {
                            // Create options for classes
 const questEmbed = new EmbedBuilder()
    .setColor(0x992e22)
    .setDescription('More info About the available Bosses in this area!');
  
       const availableBosses = selectedLocation.bosses.map(bossName => bosses[bossName]);

  // Iterate over the available quests and modify the embed fields
  availableBosses.forEach((boss, index) => {

    // Modify the existing fields or add new ones to the embedBuilder
    questEmbed.addFields({
      name: ` ${index + 1} • ${boss.name}`,
      value: `> Physical Stats:\n > HP: ${boss.physicalStats.hp} • ATK: ${boss.physicalStats.attack} • DEF: ${boss.physicalStats.defense} • SPD: ${boss.physicalStats.speed}\n > Magial Stats: \n > MANA: ${boss.magicalStats.mana}\n > Abilities: ${boss.abilities.map(abil => `\`${abil}\``).join(',  ')}\n > Attack Pattern: ${boss.attackPattern.map(atakPat => `\'${atakPat}\'`).join(',  ')}`,
      inline: false,
    });
  });
// \n  Rewards: ${boss.rewards[0].experience} XP, ${boss.rewards[0].items.join(', ')}
  // Now, you can edit the original message with the updated embedBuilder
  initialMessage.edit({
    content:'',
    embeds: [questEmbed],
    components: [stringMenuRow], // Assuming you have navigationRow defined
  });
                                                                         
                       }  else if (selectedValueName === 'adventure') {
                       
                             initialMessage.edit({
    content: `You are at: ${selectedLocation.name}\nDescription: ${selectedLocation.description}`,
    embeds: [adventureIntoEmbedConfirmation],
    components: [stringMenuRow, confirmationRowTwo]
  });
                            

                         
                         }
        }
      } else if (i.customId === 'go_in') {
        
 await i.deferUpdate();
            // const playerpos = { x: 100, y: 50 };
          // Generate random elements

   
              handleNavigation(allFloors, i, adventureIntoEmbedConfirmation, initialMessage, areaImage, player);
  
           
          }
                        
        else if (i.customId === 'cancel_adventure') {
        // Cancel the adventure
        await i.update({
          embeds: [new EmbedBuilder().setDescription('Adventure canceled.')],
          components: []
        });
      }
                      
                     }  catch (error) {
        console.error('An error occurred:', error);
        message.channel.send('noob ass, caused an error.');
    }
  

    collector.on('end', collected => {
      if (initialMessage.components.length > 0) {
        initialMessage.edit({
          components: []
        });
      }
    });
   
  });
}
};

  

   
 