const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const players = require('../../data/players.json');
const sharp = require('sharp');
const fs = require('fs');


class GameImage {
  constructor(imgH, imgW, player) {
    console.log('playername', player.name)
    this.imgH = imgH;
    this.imgW = imgW;
    this.name = player.name;
    this.elements = [];
    this.generatedRandomElements = false;
    this.generatedRandomElements2 = false;
    this.image = null;
    this.gaeImage = null;
    this.whichMon = null;
    this.playerpos = player.playerpos
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
        this.elements.push({ type: `monster${i}`, x: col, y: row });
        monsterCount++;
      } else if (this.getRandomBoolean(npcProbability) && npcCount < 5) {
        this.elements.push({ type: `npc${i}`, x: col, y: row });
        npcCount++;
      }

      if (monsterCount >= 5 && npcCount >= 2) {
        break;
      }
    }
  }

  async generateUpdatedImage(areaImage, playerpos) {
    try {
      this.generatedRandomElements2 = false;

      if (!this.generatedRandomElements2) {
        // Add elements to the image
        this.generatedRandomElements2 = true;
        for (const element of this.elements) {
          const inputImagePath = element.type.startsWith('monster')
            ? 'commands/adv/monster.png'
            : 'commands/adv/npc.png';
          if (element === this.elements[0]) {
            // For the first element, apply the composite directly to the updatedImage
            this.image = await sharp(areaImage)
              .composite([{ input: inputImagePath, left: element.x, top: element.y }])
              .png()
              .toBuffer();
            console.log(`${element.type} placed at x: ${element.x}, y: ${element.y}`);
          } else {
            // For the rest of the elements, apply the composite to the updatedImage
            this.image = await sharp(this.image)
              .composite([{ input: inputImagePath, left: element.x, top: element.y }])
              .png()
              .toBuffer();
            console.log(`${element.type} placed at x: ${element.x}, y: ${element.y}`);
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
  async nearElement(hasAttackButton, message, initialMessage, navigationRow, attackButton, talkNpc, bothButton, hasTalkButton) {
    const attackRadius = 400; // Adjust the radius as needed

    for (const element of this.elements) {
      
      const distanceToMonster = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
        Math.pow(this.playerpos.y - element.y, 2)
      );
 console.log('elementtype:', element.type);
      console.log('Distance to monster:', distanceToMonster);
     

      if (
        distanceToMonster <= attackRadius &&
        element.type.startsWith('monster') &&
        !hasAttackButton
      ) {
        message.channel.send(
          'You are in the monster field radius, click the attack button to attack.'
        );
        this.whichMon = element.type;
        console.log('whichMon:', this.whichMon);
        initialMessage.edit({
          components: [navigationRow, attackButton],
        });
        break;
      } else if (
        distanceToMonster >= attackRadius &&
        element.type === this.whichMon &&
        hasAttackButton
      ) {
        console.log('whichMon2:', this.whichMon);
        console.log('element:', element.type);
        message.channel.send('You moved out of attack range.');
        initialMessage.edit({
          components: [navigationRow],
        });
        break;
      } else if (
        distanceToMonster <= attackRadius &&
        element.type === 'npc' &&
        !hasTalkButton
      ) {
        message.channel.send(
          'You see an NPC, click the \'Talk\' button to interact.'
        );
        this.whichMon = element.type;
        initialMessage.edit({
          components: [navigationRow, talkNpc],
        });
        break;
      } else if (
        distanceToMonster >= attackRadius &&
        element.type === this.whichMon &&
        hasTalkButton
      ) {
        console.log('whichMon2:', this.whichMon);
        console.log('element:', element.type);
        message.channel.send('You moved out of talk range.');
        initialMessage.edit({
          components: [navigationRow],
        });
        break;
      } //else if (
      //   distanceToMonster <= attackRadius &&
      //   !hasAttackButton &&
      //   !hasTalkButton
      // ) {
      //   message.channel.send(
      //     'You see an \'NPC\' and a \'Monster\', click the buttons to interact.'
      //   );
      //   initialMessage.edit({
      //     components: [navigationRow, bothButton],
      //   });
      //   break;
      // }
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

class Element {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.isActive = true;
  }

  // Method to deactivate an element
  deactivate() {
    this.isActive = false;
  }

  // Method to check if the element is active
  isActive() {
    return this.isActive;
  }

  // Method to perform an action related to the element
  performAction() {
    if (this.isActive) {
      // Implement logic for the element's action
      console.log(`${this.type} is active at x: ${this.x}, y: ${this.y}.`);
    } else {
      console.log(`${this.type} is inactive.`);
    }
  }
}




module.exports = {
  GameImage,
  Player,
  Element,
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