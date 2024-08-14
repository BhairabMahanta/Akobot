const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
} = require("discord.js");
const players = require("../../../data/players.json");
const { areas } = require("../information/areas.js");
const firstArea = require("../maps/tutorialmap/mapstart.json");
const sharp = require("sharp");
const fs = require("fs");
// Load all familiars data from your module
const { allFamiliars } = require("../information/allfamilliars.js");
const path = require("path");
const { mongoClient } = require("../../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const { cards } = require("../information/cards.js"); // Import the cards data from 'cards.js'
const abilities = require("../../../data/abilities.js");
const { DeactivatedElement } = require("../../../data/mongo/elementSchema.js");
const {
  calculateDamage,
  calculateCritDamage,
  calculateAbilityDamage,
} = require("../../../my_rust_library/my_rust_library.node");

class GameImage {
  constructor(imgH, imgW, player, message) {
    this.filter = { _id: player._id };
    this.playerData = player;
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
    this.playerpos = player.playerpos;
    this.isTrue = false;
    this.elementArray = [];
  }

  getRandomBoolean(probability) {
    return Math.random() < probability;
  }
  async generateTutorialEntities() {
    firstArea.entities.Entity.forEach((entity) => {
      this.elements.push({
        name: entity.customFields.name,
        x: entity.x,
        y: entity.y,
        area: "tutorial",
        type: entity.customFields.type,
        hasAllies: entity.customFields.hasAllies,
        waves: entity.customFields.waves,
        rewards: entity.customFields.rewards,
      });
    });

    // Accessing teleport
    console.log("Teleports:");
    // firstArea.entities.Teleport.forEach((teleport) => {
    //   console.log(teleport);
    // });

    // Accessing npc
    console.log("NPCs:");
    // firstArea.entities.Npc.forEach((npc) => {
    //   console.log(npc);
    // });
  }

  async forLoop() {
    const attackRadius = 40; // Adjust the radius as needed

    for (const element of this.elements) {
      console.log("happens");
      this.distanceToMonster = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
          Math.pow(this.playerpos.y - element.y, 2)
      );
      if (this.distanceToMonster <= attackRadius) {
        this.isTrue = true;
        console.log("it orked");
        this.whichMon = element.name;
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

        break;
      }
    }
    return this.isTrue;
  }

  async generateUpdatedImage(areaImage, playerpos) {
    let name;
    let inputImagePath;
    try {
      this.generatedRandomElements2 = false;

      if (!this.generatedRandomElements2) {
        // Add elements to the image
        this.generatedRandomElements2 = true;
        console.log("one");
        // await this.deactivatedElements();
        console.log("two");
        for (const element of this.elements) {
          console.log("element:", element);
          const elementName = element.name;
          name = `commands/adv/npcimg/${elementName}.png`;

          // Use fs.existsSync to check if the file exists
          if (fs.existsSync(name)) {
            // The file exists, you can now use it
            inputImagePath = name;
            // console.log(`The file ${filePath} exists.`);
          } else {
            inputImagePath = element.name.startsWith("monster")
              ? "commands/adv/npcimg/monster.png"
              : "commands/adv/npcimg/npc.png";
          }
          if (element === this.elements[0]) {
            // For the first element, apply the composite directly to the updatedImage
            this.image = await sharp(areaImage)
              .composite([
                { input: inputImagePath, left: element.x, top: element.y },
              ])
              .png()
              .toBuffer();
            //   console.log(`${element.name} placed at x: ${element.x}, y: ${element.y}`);
          } else {
            // For the rest of the elements, apply the composite to the updatedImage
            this.image = await sharp(this.image)
              .composite([
                { input: inputImagePath, left: element.x, top: element.y },
              ])
              .png()
              .toBuffer();
            // console.log(`${element.name} placed at x: ${element.x}, y: ${element.y}`);
          }
        }
      }
      // Load the base image
      this.gaeImage = await sharp(this.image)
        .composite([
          {
            input: "commands/adv/npcimg/Old_man.png",
            left: playerpos.x,
            top: playerpos.y,
          },
        ])
        .png()
        .toBuffer();
      console.log("doneupdatedMAP");

      return new AttachmentBuilder(this.gaeImage, { name: "updatedMap.png" });
    } catch (error) {
      console.error("An error occurred:", error);
      // Send an error message back to the channel
      this.message.channel.send(
        "An error occurred while generating the updated map."
      );
    }
  }
  async movePlayer(player) {
    // Load the base image

    // Other properties of the player...
    const updatedImageBuffer = await sharp(this.image)
      .composite([
        {
          input: "commands/adv/npcimg/Old_man.png",
          left: this.playerpos.x,
          top: this.playerpos.y,
        },
      ])
      .png()
      .toBuffer();
    // player.playerpos =
    //  fs.writeFileSync('./data/players.json', JSON.stringify(players, null, 4));
    player.playerpos = { x: this.playerpos.x, y: this.playerpos.y };
    await collection.updateOne(this.filter, {
      $set: { playerpos: player.playerpos },
    });
    return new AttachmentBuilder(updatedImageBuffer, {
      name: "updatedMap.png",
    });
  }

  async nearElement(
    hasAttackButton,
    message,
    initialMessage,
    navigationRow,
    attackRow,
    talktRow,
    bothButton,
    hasTalkButton,
    nowBattling,
    interactRow
  ) {
    const attackRadius = 40; // Adjust the radius as needed
    console.log("NearElement");

    let isMobNearby = false;
    let isNpcNearby = false;
    let nearbyElements = [];

    for (const element of this.elements) {
      this.distanceToMonster = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
          Math.pow(this.playerpos.y - element.y, 2)
      );

      console.log("elementname:", element.name);

      if (this.distanceToMonster <= attackRadius) {
        nearbyElements.push(element);
        console.log(`Nearby element: ${element.name}, Type: ${element.type}`);

        if (element.type === "mob") {
          isMobNearby = true;
          console.log("isMobNearby:", isMobNearby);
        } else if (element.type === "npc") {
          isNpcNearby = true;
        }
      }
    }

    // Determine which row to display based on nearby elements
    if (nearbyElements.length > 0) {
      console.log("Nearby elements:", nearbyElements);
      if (isMobNearby && isNpcNearby) {
        nowBattling.setFooter({
          text: "You are near both a monster and an NPC. Choose an action.",
        });
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...bothButton],
        });
      } else if (isMobNearby) {
        nowBattling.setFooter({
          text: "You are in the monster field radius, click the attack button to attack.",
        });
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...attackRow],
        });
        console.log("editing attackRow");
      } else if (isNpcNearby) {
        nowBattling.setFooter({
          text: "You are near an NPC, click the talk button to interact.",
        });
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...talktRow],
        });
      }
    }

    // If player moves out of range of an element
    // for (const element of nearbyElements) {
    //   if (
    //     this.distanceToMonster >= attackRadius &&
    //     element.name === this.whichMon &&
    //     hasAttackButton
    //   ) {
    //     console.log("whichMon2:", this.whichMon);
    //     console.log("element:", element.name);
    //     nowBattling.setFooter({ text: "You moved out of attack range." });
    //     initialMessage.edit({
    //       embeds: [nowBattling],
    //       components: [...navigationRow],
    //     });
    //     break;
    //   }
    // }

    //}
  }

  // Method to filter out deactivated elements
  async deactivatedElements() {
    console.log("playterDATA:", this.playerData);
    const result = await deactivatedElements(
      this.playerData._id,
      this.elements,
      this.monsterArray,
      this.npcArray
    );
    this.elements = result.elements;
    this.monsterArray = result.monsterArray;
    this.npcArray = result.npcArray;
  }

  async generateRandomElements(
    monsterProbability,
    npcProbability,
    maxElements
  ) {
    let monsterCount = 0;
    let npcCount = 0;
    console.log("imagew,h:", this.imgW, this.imgH);

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

      if (monsterCount > 2 && npcCount > 2) {
        break;
      }
    }
  }

  // Method to check if the element is active
  async activatedElements() {
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

async function cycleCooldowns(array) {
  // Loop through each move and decrease its cooldown by 1
  /*
  switch (moveType) {
    case 'ability':
      move = abilities[moveName].cooldown;
      break;
    // case 'card':
    //   move = cards[moveName];
    //   break;
    // Add case for the third file
    // case 'thirdType':
    //   move = thirdFile[moveName];
    //   break;
    default:
      console.log('Invalid move type');
      return;
  }

  if (!move) {
    console.log('Move not found');
    return;
  }
*/
  try {
    if (array.length === 0) {
      console.log("No moves on cooldown");
      return;
    }
    array.forEach((item) => {
      if (item.cooldown > 0) {
        item.cooldown--;
        if (item.cooldown === 0) {
          console.log(`${item.name} is no longer on cooldown.`);
          array.splice(array.indexOf(item), 1);
          console.log("array:", array);
        }
      }
    });
  } catch (error) {
    console.error("There isnt any moves on cooldown", error);
  }
}
async function deactivateElement(
  playerId,
  elementName,
  elements,
  reActivateTime
) {
  const element = elements.find((el) => el.name === elementName);
  if (element) {
    element.active = false;

    // Add the element to the deactivated elements in the database
    await DeactivatedElement.updateOne(
      { playerId: playerId },
      {
        $addToSet: {
          deactivatedElements: {
            name: elementName,
            reActivateTime: reActivateTime,
          },
        },
      },
      { upsert: true }
    );
  }
}
async function deactivatedElements(playerId, elements, monsterArray, npcArray) {
  // Fetch deactivated elements from the database
  console.log("playerId:", playerId);
  const deactivatedData = await DeactivatedElement.findOne({
    playerId: playerId,
  }).maxTimeMS(2000);

  if (!deactivatedData) {
    console.log("No deactivated data found for this player.");
    // Handle the case where no data is found
  } else {
    console.log("Deactivated data found:", deactivatedData);
  }

  const currentDate = new Date();

  if (deactivatedData) {
    const reactivatedElements = deactivatedData.deactivatedElements.filter(
      (element) => element.reActivateTime <= currentDate
    );

    // Remove reactivated elements from the database
    if (reactivatedElements.length > 0) {
      await DeactivatedElement.updateOne(
        { playerId: playerId },
        {
          $pull: {
            deactivatedElements: {
              name: { $in: reactivatedElements.map((e) => e.name) },
            },
          },
        }
      );
    }

    const deactivatedElementNames = deactivatedData.deactivatedElements
      .filter((element) => element.reActivateTime > currentDate)
      .map((element) => element.name);

    elements = elements.filter(
      (element) =>
        !deactivatedElementNames.includes(element.name) && element.active
    );
    monsterArray = monsterArray.filter(
      (element) =>
        !deactivatedElementNames.includes(element.name) && element.active
    );
    npcArray = npcArray.filter(
      (element) =>
        !deactivatedElementNames.includes(element.name) && element.active
    );
  }

  return { elements, monsterArray, npcArray };
}

const GACHA_TYPES = {
  COMMON_TOKEN: "commonScroll",
  RARE_TOKEN: "rareScroll",
  LEGENDARY_TOKEN: "legendaryScroll",
};

const DROP_RATES = {
  commonScroll: { tier1: 80, tier2: 18, tier3: 2 },
  rareScroll: { tier1: 50, tier2: 40, tier3: 10 },
  legendaryScroll: { tier1: 20, tier2: 50, tier3: 30 },
};

async function pullGacha(playerId, gachaType) {
  const rates = DROP_RATES[gachaType];
  const tier = getTier(rates);
  const tieraaa = `Tier${tier}`;
  const characters = Object.keys(allFamiliars[tieraaa]);
  const selectedCharacter =
    characters[Math.floor(Math.random() * characters.length)];

  const filter = { _id: playerId };
  const update = { $addToSet: { "cards.name": selectedCharacter } };

  await collection.updateOne(filter, update);
  return allFamiliars[tieraaa][selectedCharacter];
}

function getTier(rates) {
  const rand = Math.random() * 100;
  if (rand < rates.tier1) return 1;
  if (rand < rates.tier1 + rates.tier2) return 2;
  return 3;
}

// async function execute(client, message, args, interaction) {
//   const playerId = message.author.id;
//   const gachaType = GACHA_TYPES.COMMON_SCROLL;
//   const character = await pullGacha(playerId, gachaType);
//   console.log(`Player received: ${character}`);
// }
async function critOrNot(
  attackerCritRate,
  critDamage,
  authorAttack,
  enemyDefense,
  familiarPower
) {
  const fomiliarPower = await familiarPower;
  const critChance = Math.random() * 100;
  if (attackerCritRate === undefined && fomiliarPower === undefined) {
    console.log("normal damage");
    return calculateDamage(authorAttack, enemyDefense);
  } else if (critChance <= attackerCritRate) {
    console.log("crit damage");
    return fomiliarPower === undefined
      ? calculateCritDamage(authorAttack, critDamage, enemyDefense)
      : calculateAbilityDamage(
          authorAttack,
          critDamage,
          enemyDefense,
          fomiliarPower
        );
  } else {
    console.log("normal damage");
    return fomiliarPower === undefined
      ? calculateDamage(authorAttack, enemyDefense)
      : (calculateDamage(authorAttack, enemyDefense) * fomiliarPower) / 100;
  }
}
function capitalizeFirstLetter(string) {
  if (string.length === 0) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  GameImage,
  cycleCooldowns,
  deactivateElement,
  deactivatedElements,
  pullGacha,
  GACHA_TYPES,
  critOrNot,
  capitalizeFirstLetter,
};
