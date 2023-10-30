const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const players = require('../../data/players.json');
const {areas} = require('./areas.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class GameImage {
  constructor(imgH, imgW, player, message) {
    this.message = message;
    this.imgH = imgH;
    this.imgW = imgW;
    this.name = player.name;
    this.elements = [];
    this.monsterArray = [];
    this.npcArray = [];
    this.generatedRandomElements = false;
    this.generatedRandomElements2 = false;
    this.image = null;
    this.gaeImage = null;
    this.distanceToNpc = 0;
    this.distanceToMonster = 0;
    this.whichMon = null;
    this.playerpos = player.playerpos
    this.isTrue = false;
    this.elementArray = [];
  }

  getRandomBoolean(probability) {
    return Math.random() < probability;
  }

  async generateRandomElements(monsterProbability, npcProbability, maxElements) {
    let monsterCount = 0;
    let npcCount = 0;
    console.log('imagew,h:', this.imgW, this.imgH)

    for (let i = this.elements.length; i < maxElements; i++) {
      const row = Math.floor(Math.random() * (this.imgH - 50)) + 50;
      const col = Math.floor(Math.random() * (this.imgW - 50)) + 50;

      if (this.getRandomBoolean(monsterProbability) && monsterCount < 7) {
        this.elements.push({ name: `monster${i}`, x: col, y: row });
        this.monsterArray.push({ name: `monster${i}`, x: col, y: row });
        monsterCount++;
      } else if (this.getRandomBoolean(npcProbability) && npcCount < 5) {
        this.elements.push({ name: `npc${i}`, x: col, y: row });
        this.npcArray.push({ name: `npc${i}`, x: col, y: row });
        npcCount++;
      }

      if (monsterCount > 5 && npcCount > 2) {
        break;
      }
    }
  }
  async generateAreaElements(areaName) {
  // Fetch area data from area.js based on areaName
  const areaData = areas[areaName];

  // Initialize counts for monsters and NPCs
  let monsterCount = 0;
  let npcCount = 0;
   const maxElements = 10

  // Loop through the area data and generate elements
  for (let i = this.elements.length; i < maxElements; i++) {
    // const row = Math.floor(Math.random() * (this.imgH - 50)) + 50;
    // const col = Math.floor(Math.random() * (this.imgW - 50)) + 50;

    // Generate monsters
    if (monsterCount < areaData.monsters.length) {
      const monster = areaData.monsters[monsterCount];
      this.elements.push({
        name: monster.name,
        x: monster.position.x,
        y: monster.position.y,
        area: areaName, // Store the area name with the element
        type: monster.type,
        hasAllies: monster.hasAllies,
        waves: monster.waves,
        rewards: monster.rewards,
      });
      this.monsterArray.push({
        name: monster.name,
        x: monster.position.x,
        y: monster.position.y,
        area: areaName, 
        amt: monster.amount,
        type: monster.type,
        hasAllies: monster.hasAllies,
        waves: monster.waves,
        rewards: monster.rewards,
      });
      monsterCount++;
    }

    // Generate NPCs
    if (npcCount < areaData.npcs.length) {
      const npc = areaData.npcs[npcCount];
      this.elements.push({
        name: npc.name,
        x: npc.position.x,
        y: npc.position.y,
        area: areaName, // Store the area name with the element
      });
      this.npcArray.push({
        name: npc.name,
        x: npc.position.x,
        y: npc.position.y,
        area: areaName, // Store the area name with the element
      });
      npcCount++;
    }

    // Break if we've generated enough monsters and NPCs
    if (monsterCount >= areaData.monsters.length && npcCount >= areaData.npcs.length) {
      break;
    }
  }
}
  async forLoop() {
    const attackRadius = 40; // Adjust the radius as needed

    for (const element of this.monsterArray) {
     this.distanceToMonster = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
        Math.pow(this.playerpos.y - element.y, 2)
      );
 if (this.distanceToMonster <= attackRadius) {
   this.isTrue = true
   this.whichMon = element.name
   if (!this.elementArray.includes(element)) {
   this.elementArray.push(element);
// Sort the elementArray by shortest distanceToMonster
      this.elementArray.sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(this.playerpos.x - a.x, 2) +
          Math.pow(this.playerpos.y - a.y, 2)
        );
        const distB = Math.sqrt(
          Math.pow(this.playerpos.x - b.x, 2) +
          Math.pow(this.playerpos.y - b.y, 2)
        );
        return distA - distB;
      });
   }
  //  console.log('ELEMENT ARRAY BANJA PLS', this.elementArray)
  //  console.log('LOOP WALA:', this.whichMon)
  //  console.log('isTrue:', this.isTrue)
   break;
 } 
    }
    return this.isTrue
  }


  async generateUpdatedImage(areaImage, playerpos) {
   let name;
    let inputImagePath;
    try {
      this.generatedRandomElements2 = false;

      if (!this.generatedRandomElements2) {
         
        // Add elements to the image
        this.generatedRandomElements2 = true;
        for (const element of this.elements) {
          const elementName = element.name
     name = `commands/adv/npcimg/${elementName}.png`
             const filePath = path.join(name);
         
// Use fs.existsSync to check if the file exists
if (fs.existsSync(name)) {
  // The file exists, you can now use it
  inputImagePath = name;
  // console.log(`The file ${filePath} exists.`);
} else {
           inputImagePath = element.name.startsWith('monster')
            ? 'commands/adv/npcimg/monster.png'
            : 'commands/adv/npcimg/npc.png';
}
          if (element === this.elements[0]) {
            // For the first element, apply the composite directly to the updatedImage
            this.image = await sharp(areaImage)
              .composite([{ input: inputImagePath, left: element.x, top: element.y }])
              .png()
              .toBuffer();
          //   console.log(`${element.name} placed at x: ${element.x}, y: ${element.y}`);
           } else {
            // For the rest of the elements, apply the composite to the updatedImage
            this.image = await sharp(this.image)
              .composite([{ input: inputImagePath, left: element.x, top: element.y }])
              .png()
              .toBuffer();
            // console.log(`${element.name} placed at x: ${element.x}, y: ${element.y}`);
          }
        }
      }
      // Load the base image
      this.gaeImage = await sharp(this.image)
        .composite([{ input: 'commands/adv/Old_man.png', left: playerpos.x, top: playerpos.y }])
        .png()
        .toBuffer();

      return new AttachmentBuilder(this.gaeImage, { name: 'updatedMap.png' });
    } catch (error) {
      console.error('An error occurred:', error);
      // Send an error message back to the channel
      message.channel.send('An error occurred while generating the updated map.');
    }
  }
  async movePlayer(player) {
    // Load the base image
   
  // Other properties of the player...
    const updatedImageBuffer = await sharp(this.image)
      .composite([{ input: 'commands/adv/Old_man.png', left: this.playerpos.x, top: this.playerpos.y }])
      .png()
      .toBuffer();
    player.playerpos = { "x": this.playerpos.x, "y":  this.playerpos.y };
     fs.writeFileSync('./data/players.json', JSON.stringify(players, null, 4));
    return new AttachmentBuilder(updatedImageBuffer, { name: 'updatedMap.png' });
   
  }
  
  async nearElement(hasAttackButton, message, initialMessage, navigationRow, attackRow, talktRow, bothButton, hasTalkButton, nowBattling) {
    const attackRadius = 40; // Adjust the radius as needed
let restartForLoop = true;
    // while (restartForLoop) {
    for (const element of this.monsterArray) {
      await this.forLoop()
      
      this.distanceToMonster = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
        Math.pow(this.playerpos.y - element.y, 2)
      );
//  console.log('elementname:', element.name);
//       console.log('Distance to monster:', this.distanceToMonster);
     

      if (
        this.distanceToMonster <= attackRadius &&
        element.name.startsWith('monster') &&
        !hasAttackButton
      ) {
        nowBattling.setFooter({text:
          'You are in the monster field radius, click the attack button to attack.'}
        );
        this.whichMon = element.name;
        console.log('whichMon:', this.whichMon);
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...attackRow],
        });
        restartForLoop = false;
        break;
      } 
      else if (
        this.distanceToMonster >= attackRadius &&
        element.name === this.whichMon &&
        hasAttackButton && this.isTrue
      ) {
        console.log('whichMon2:', this.whichMon);
        console.log('element:', element.name);
        nowBattling.setFooter({text:'You moved out of attack range.'});
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...navigationRow],
        });
        
        break;
        
      }
  }
      console.log('BROCHANGED ELEMENTS WTFFF')
    
    //}

    for (const element of this.npcArray) {
      
      this.distanceToNpc = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
        Math.pow(this.playerpos.y - element.y, 2)
      );
//  console.log('elementname:', element.name);
//       console.log('Distance to monster:', this.distanceToNpc);
     

      if (
        this.distanceToNpc <= attackRadius &&
        element.name.startsWith('npc') &&
        !hasTalkButton
      ) {
        nowBattling.setFooter({text:
          'You see an NPC, click the \'Talk\' button to interact.'}
        );
        this.whichMon = element.name;
        console.log('whichMonNpcOne:', this.whichMon);
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...talktRow],
        });
        break;
      } else if (
        this.distanceToNpc >= attackRadius &&
        element.name === this.whichMon &&
        hasTalkButton
      ) {
        console.log('whichMonNpcTwo:', this.whichMon);
        console.log('element2:', element.name);
         nowBattling.setFooter({text:'You moved out of NPC\'s range.'});
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...navigationRow],
        });
        break;
      }
    }
    if ((this.distanceToMonster <= attackRadius) && (this.distanceToNpc <= attackRadius)
        && (!hasAttackButton && !hasTalkButton)
        ) {
         message.channel.send(
           'You see an \'NPC\' and a \'Monster\', click the buttons to interact.'
         );
         initialMessage.edit({
           components: [...navigationRow, bothButton],
        });
         
       }
    
  }
  // Method to deactivate an element
  async deactivate() {
    this.isActive = false;
  }

  // Method to check if the element is active
  async isActive() {
    return this.isActive;
  }

  // Method to perform an action related to the element
  async performAction() {
    if (this.isActive) {
      // Implement logic for the element's action
      console.log(`${this.name} is active at x: ${this.x}, y: ${this.y}.`);
    } else {
      console.log(`${this.name} is inactive.`);
    }
  }  
  
}



class Player {
  constructor(name, health) {
    this.name = name;
    this.health = health;
    this.inventory = [];
  }

  // Method to take damage
  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      console.log(`${this.name} has been defeated.`);
      // Implement logic for player defeat, e.g., respawn or game over
    }
  }

  // Method to add an item to the player's inventory
  addItemToInventory(item) {
    this.inventory.push(item);
  }

  // Method to use an item from the player's inventory
  useItem(item) {
    if (this.inventory.includes(item)) {
      // Implement logic for using the item, e.g., healing or special ability
      console.log(`${this.name} used ${item}.`);
    } else {
      console.log(`${this.name} doesn't have ${item}.`);
    }
  }
}









module.exports = {
  GameImage,
  Player,
  
};
