const { ActionRowBuilder, ButtonBuilder } = require('discord.js'); // Replace with your actual library
const { EmbedBuilder } = require('discord.js');
const {Location, Floor, floor1, floor2, allFloors} = require('./loc');
const { generateUpdatedImage, elements, generateRandomElements, movePlayer, nearElement } = require('./functions');
const { GameImage, Player, Element } = require('./sumfunctions');
const players = require('../../data/players.json');
const {  Battle, BossMonster, Environment } = require('./battle.js')
const {  NPC } = require('./npc.js')
let updatedImageBuffer = null;
let attackButton = null;
let hasAttackButton = false;
let hasTalkButton = false;

 // Create a button-based navigation interface
 const navigationRowUp = new ActionRowBuilder()
    .addComponents(
       new ButtonBuilder()
        .setCustomId('Empty')
        .setLabel('x Dead')
        .setStyle('Secondary')
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('north')
        .setLabel('↑ North')
        .setStyle('Danger'),
       new ButtonBuilder()
        .setCustomId('Empty2')
        .setLabel('x Dead')
        .setStyle('Secondary')
        .setDisabled(true)
      );
const navigationRowMid = new ActionRowBuilder()
.addComponents(
      new ButtonBuilder()
         .setCustomId('west')
         .setLabel('← West')
         .setStyle('Success'),
        new ButtonBuilder()
        .setCustomId('south')
        .setLabel('↓ South')
        .setStyle('Danger'),
      // new ButtonBuilder()
      //   .setCustomId('ig')
      //   .setLabel('a     a')
      //   .setStyle('Secondary')
      //   .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('east')
        .setLabel('→ East')
        .setStyle('Success')
    );
 /*const navigationRowBot = new ActionRowBuilder()
    .addComponents(
       new ButtonBuilder()
        .setCustomId('Empty3')
        .setLabel('a     a')
        .setStyle('Secondary')
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('south')
        .setLabel('↓ South')
        .setStyle('Danger'),
       new ButtonBuilder()
        .setCustomId('a     a')
        .setLabel('a     a')
        .setStyle('Secondary')
        .setDisabled(true)
      );*/
const navigationRow = [navigationRowUp, navigationRowMid]

 // Player is in attack range, show an attack button
      attackButton = new ActionRowBuilder().addComponents(
           new ButtonBuilder()
          .setCustomId('attack_monster')
          .setLabel('Attack')
          .setStyle('Primary')
               );
 talkNpc = new ActionRowBuilder().addComponents(
           new ButtonBuilder()
          .setCustomId('talk_npc')
          .setLabel('Talk')
          .setStyle('Primary')
               );
 bothButton = new ActionRowBuilder().addComponents(
           new ButtonBuilder()
          .setCustomId('talk_npc')
          .setLabel('Talk')
          .setStyle('Primary'),
   new ButtonBuilder()
          .setCustomId('attack_monster')
          .setLabel('Attack')
          .setStyle('Primary')
               );
const nowBattling = new EmbedBuilder()
        .setTitle('Adventuring')
        .setImage('attachment://area2.png')
        .setDescription('Use the navigation buttons to move around the area!')

async function handleNavigation(allFloors, message, adventureEmbed, initialMessage, areaImage, player) {
  // Simulate player data (replace with your actual data)

  
  const playerFloorIndex = 0; // Replace with the actual floor index for the player
  const playerLocationIndex = 0; // Replace with the actual location index for the player

  const selectedFloor = allFloors[playerFloorIndex];
  const selectedLocation = selectedFloor.locations[playerLocationIndex];

 
  // Send the initial message with buttons
  console.log('player:', player.name)
  
     // Create instances of the classes
const gameImage = new GameImage(600, 600, player);
  const newNpc = new NPC(player, 'npc1', message)
  const playerpos = gameImage.playerpos
// const player = new Player('PlayerName', 100); // Replace with actual player name and health
// const element = new Element('Monster', 200, 300); // Replace with actual element details

// Call methods on the instances
   gameImage.generateAreaElements("Forest Clearing") 
gameImage.generateRandomElements(0.55, 0.5, 10);
  
 // Generate the updated image with the player's position
  updatedImageBuffer = await gameImage.generateUpdatedImage(areaImage, playerpos) 
  nowBattling.setImage(`attachment://updatedMap.png`);
   // Now you can use initialMessage to edit it or perform other actions
  initialMessage.edit({
    // content: `You are at: ${selectedLocation.name}\nDescription: ${selectedLocation.description}`,
    embeds: [nowBattling],
    components: [...navigationRow],
            files: [updatedImageBuffer]
  });

  // Collect button interactions
  const filter = i => (i.user.id === message.user.id) && ((['attack_monster', 'cancel_adventure'].includes(i.customId)) || i.customId.startsWith('action_') || (i.customId === 'option_select') || (i.customId === 'go_in') || (i.customId === 'talk_npc') || i.customId.match(/^(north|south|west|east)$/i));

   // const filter = i => (['attack_monster', 'cancel_adventure'].includes(i.customId)) && i.user.id === message.author.id || (i.customId === 'option_select') || (i.customId === 'go_in') || i.customId.match(/^(north|south|west|east)$/i);
  const collector = initialMessage.createMessageComponentCollector({ filter, time: 600000 });
 



  // Handle button interactions
  collector.on('collect', async (i) => {
   await i.deferUpdate();
   hasAttackButton = initialMessage.components.some(component =>
  component.components.some(subComponent => subComponent.customId === 'attack_monster')
);
    hasTalkButton = initialMessage.components.some(component =>
  component.components.some(subComponent => subComponent.customId === 'talk_npc')
);
    
       console.log('click1test:',  hasAttackButton)
    
 if (i.customId === 'north' && i.user.id === message.user.id) {
    console.log('click1test :  button')
   playerpos.y -= 50;
           
   console.log('click1test :', playerpos)
   updatedImageBuffer = await gameImage.movePlayer(player);
           console.log('i should work:')
           initialMessage.edit({ files: [updatedImageBuffer] })
    // ...
    } 
 
 else if (i.customId === 'east' && i.user.id === message.user.id) {
    console.log('click1test :  button')
   playerpos.x += 50;
            
   console.log('click1test :', playerpos)
    updatedImageBuffer = await gameImage.movePlayer(player);
          
           initialMessage.edit({ files: [updatedImageBuffer] })
      // ...
    } 

 else if (i.customId === 'west' && i.user.id === message.user.id) {
    console.log('click1test :  button')
   playerpos.x -= 50;
             
   console.log('click1test :', playerpos)
    updatedImageBuffer  = await gameImage.movePlayer(player);
           
           initialMessage.edit({ files: [updatedImageBuffer] })

    // ...
    } 

 else if (i.customId === 'south' && i.user.id === message.user.id) {
    console.log('click1test :  button')
   playerpos.y += 50;
   
   console.log('click1test :', playerpos)
   updatedImageBuffer = await gameImage.movePlayer(player);
          
           initialMessage.edit({ files: [updatedImageBuffer] })

                // ...
    } 
 else if (i.customId === 'attack_monster' && i.user.id === message.user.id)  {
          // Handle the attack logic here
       const battle = new Battle(player, 'Dragon Lord');
 battle.startBattle(message);
   initialMessage.edit({components: []});
            
         
    } 
 else if (i.customId === 'talk_npc' && i.user.id === message.user.id)  {
          // Handle the attack logic here
            // message.channel.send('You are talking with \`\`NpcName\`\`!');
         newNpc.initiateTalk()
    initialMessage.edit({components: []});
    }
  
    
    gameImage.nearElement(hasAttackButton, message, initialMessage, navigationRow, attackButton, talkNpc, bothButton, hasTalkButton) 

  });

  // Handle collector end
  collector.on('end', collected => {
    initialMessage.edit({ content: 'Button interaction ended.', components: [] });
  });
}

module.exports = {
  navigationRow,
  handleNavigation
};
