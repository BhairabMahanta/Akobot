const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const players = require('../../data/players.json');
const sharp = require('sharp');
const fs = require('fs');
//  let imgH = 600;
// let imgW = 600;
let elements = [];
let generatedRandomElements = false;
let generatedRandomElements2 = false;
let image = null;
let gaeImage = null;
let whichMon = null;
// Function to generate a random boolean based on probability
function getRandomBoolean(probability) {
  return Math.random() < probability;
}



async function generateUpdatedImage(areaImage, playerpos, elements, player) {
  try {
   generatedRandomElements2 = false;
 if (!generatedRandomElements2) {
        // Add elements to the image
        generatedRandomElements2 = true;
    for (const element of elements) {
      const inputImagePath = element.type.startsWith('monster') ? 'commands/adv/monster.png' : 'commands/adv/npc.png';
      if (element === elements[0]) {
        // For the first element, apply the composite directly to the updatedImage
        image = await sharp(areaImage)
          .composite([{ input: inputImagePath, left: element.x, top: element.y }])
          .png()
          .toBuffer();
         console.log(`${element.type} placed at x: ${element.x}, y: ${element.y}`);
      } else {
        // For the rest of the elements, apply the composite to the updatedImage
        image = await sharp(image)
          .composite([{ input: inputImagePath, left: element.x, top: element.y }])
          .png()
          .toBuffer();
        console.log(`${element.type} placed at x: ${element.x}, y: ${element.y}`);
        
      }
    
    }
     
  }//  elements = []; //empty the array for someone else 
    console.log('elements:', elements)
    // Load the base image
    gaeImage = await sharp(image)
      .composite([{ input: 'commands/adv/Old_man.png', left: playerpos.x, top: playerpos.y }])
      .png()
      .toBuffer();
            
    return new AttachmentBuilder(gaeImage, { name: 'updatedMap.png' });
  } catch (error) {
    console.error('An error occurred:', error);
    // Send an error message back to the channel
    message.channel.send('An error occurred while generating the updated map.');
  }
}
async function movePlayer(areaImage, playerpos, elements, player) {
  // Load the base image
    gaeImage = await sharp(image)
      .composite([{ input: 'commands/adv/Old_man.png', left: playerpos.x, top: playerpos.y }])
      .png()
      .toBuffer();
            
    return new AttachmentBuilder(gaeImage, { name: 'updatedMap.png' });
}

function generateRandomElements(elements, monsterProbability, npcProbability, maxElements) {
  let monsterCount = 0;
  let npcCount = 0;

  for (let i = elements.length; i < maxElements; i++) {
    const row = Math.floor(Math.random() * (imgH - 50)) +50
    const col = Math.floor(Math.random() * (imgW - 50)) +50
    console.log("number of i ", i)

    if (getRandomBoolean(monsterProbability) && monsterCount < 7) {
      elements.push({ type: `monster${i}`, x: col, y: row });
      console.log({ type: `monster${i}`, x: col, y: row });
      monsterCount++;
    } else if (getRandomBoolean(npcProbability) && npcCount < 5) {
      elements.push({ type: 'npc', x: col, y: row });
       console.log({ type: 'npc', x: col, y: row });
      npcCount++;
    }

    if (monsterCount >= 5 && npcCount >= 2) {
      console.log('Breaking?')
      break;
     
    }
  }
   i = 0;
  console.log("number of i ", i)
}

function nearElement(elements, playerpos, elements, hasAttackButton, message, initialMessage, navigationRow, attackButton, talkNpc, bothButton, hasTalkButton) {
 const attackRadius = 40; // Adjust the radius as needed

 for (const element of elements) {
   const distanceToMonster = Math.sqrt(
        Math.pow(playerpos.x - element.x, 2) +
        Math.pow(playerpos.y - element.y, 2)
   );
   console.log ('elementtype:', element.type)
   console.log ('Distance to monster:', distanceToMonster)


 if ((distanceToMonster <= attackRadius) && (element.type.startsWith(`monster`))  && (!hasAttackButton)) {
      // if  (!hasAttackButton) {
         message.channel.send('You are in the monster field radius, click the attack button to attack.');
      // }
   whichMon = element.type;
   console.log('whichMon:', whichMon)
        initialMessage.edit({
       components: [navigationRow, attackButton]
  })
                 break;
      }
   
      else if ((distanceToMonster >= attackRadius) &&(element.type === whichMon) && (hasAttackButton)) {
         console.log('whichMon2:', whichMon)
         console.log('e;le:', element.type)
      // Reply to the interaction after editing the message
      message.channel.send('You moved out of attack range.');
    // Edit the message to update components
    initialMessage.edit({
      components: [navigationRow]
     })
  break;
}
   if ((distanceToMonster <= attackRadius) && (element.type === 'npc')  && (!hasTalkButton)) {
      // if  (!hasAttackButton) {
         message.channel.send('You see an NPC, click the \'Talk\' button to interact');
    whichMon = element.type;
      // }
        initialMessage.edit({
       components: [navigationRow, talkNpc]
  })
                 break;
      }
      else if ((distanceToMonster >= attackRadius) && (element.type === whichMon) && (hasTalkButton)) {
      // Reply to the interaction after editing the message
      message.channel.send('You moved out of takl range.');
    // Edit the message to update components
    initialMessage.edit({
      components: [navigationRow]
     })
  break;
} else if ((distanceToMonster <= attackRadius)  && ((!hasAttackButton) && (!hasTalkButton) )) {
      // if  (!hasAttackButton) {
         message.channel.send('You see an \'NPC\' and a \'Monster\', click the buttons to interact');
      // }
        initialMessage.edit({
       components: [navigationRow, bothButton]
  })
                 break;
      }
 }
 }

  




module.exports = {
  generateUpdatedImage,
  elements,
  generateRandomElements,
  movePlayer,
  nearElement
  
};

  //       if (!fucka) {
   //          generatedRandomElements = false;
   //         generatedRandomElements2 = true;
   //         player.stuff.generatedRandomElements = 'true';
   //        fs.writeFileSync('./data/players.json', JSON.stringify(players, null, 4));
   //         player.stuff.generatedRandomElements2 = 'true';
   //        fs.writeFileSync('./data/players.json', JSON.stringify(players, null, 4));
   // }  
      
   //  // Generate random elements
   // if (!generatedRandomElements) {
   //    generateRandomElements(elements, monsterProbability, npcProbability, maxElements);
   //    generatedRandomElements = true; // Set the flag to true after generating elements
   //  }