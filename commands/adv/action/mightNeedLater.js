/*
  async applyDebuff(target, user, debuffType, debuffName, turnLimit) {
    // Check if the target has immunity
    if (target.hasImmunity) {
      this.battleLogs.push(`${target.name} is immune to debuffs.`);
      return;
    }

    // Apply the debuff
    const debuff = {
      type: debuffType,
      name: debuffName,
      remainingTurns: turnLimit,
    };
    target.debuffs.push(debuff);
    this.battleLogs.push(
      `${user} applied ${debuffName} to ${target.name} for ${turnLimit} turns.`
    );
  }

  async removeDebuff(target, debuffType, user, isTrue) {
    target.debuffs = await target.debuffs.filter(
      (debuff) => debuff.type !== debuffType
    );
    if (isTrue === true) {
      this.battleLogs.push(
        `${user} removed ${debuffType}  removed from ${target.name}.`
      );
    }
  }
  async applyBuff(target, user, buffType, buffName, turnLimit) {
    // Apply the buff
    if (target.hasBuffBlocker) {
      this.battleLogs.push(
        `${target.name} could not get the ${buffName} buffs.`
      );
      return;
    }
    const buff = {
      type: buffType,
      name: buffName,
      remainingTurns: turnLimit,
    };
    target.buffs.push(buff);
    this.battleLogs.push(
      `${user} applied ${buffName} to ${target.name} for ${turnLimit} turns.`
    );
  }

  // Method to remove a buff
  async removeBuff(target, buffType, user, isTrue) {
    target.buffs = await target.buffs.filter((buff) => buff.type !== buffType);
    if (isTrue === true) {
      this.battleLogs.push(
        `${user} removed ${buffType} buff from ${target.name}.`
      );
    }
  }


   async generateAreaElements(areaName) {
    // Fetch area data from area.js based on areaName
    const areaData = areas[areaName];

    // Initialize counts for monsters and NPCs
    let monsterCount = 0;
    let npcCount = 0;
    const maxElements = 10;

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
      if (
        monsterCount >= areaData.monsters.length &&
        npcCount >= areaData.npcs.length
      ) {
        break;
      }
    }
  }

  //calculatespeed
    async calculateOverallSpeed(character) {
    try {
      if (character === this.player) {
        return this.player.stats.speed;
      } else if (
        this.opponentFamiliar.some(
          (fam) => fam.name === character.name && fam._id === this.opponent._id
        )
      ) {
        // Find the familiar's speed by matching it with this.characters
        const familiarInfo = this.characters.find(
          (fam) => fam.name === character.name
        );
        const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 1; // Default to 1 if not found
        return familiarSpeed;
      } else if (
        this.playerFamiliar.some(
          (fam) => fam.name === character.name && fam._id === this.player._id
        )
      ) {
        // Find the familiar's speed by matching it with this.characters
        const familiarInfo = this.characters.find(
          (fam) => fam.name === character.name
        );
        const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 1; // Default to 1 if not found
        return familiarSpeed;
      } else if (character === this.opponent) {
        return this.opponent.stats.speed;
      } else {
        console.log("Calculating speed for unknown character type: 0");
        return 0; // Default to 0 for unknown character types
      }
    } catch (error) {
      console.log("speedcalculator:", error);
    }
  }




  //team turn
   const isCurrentTurnFamiliar = (familiars, currentTurn) => {
      return familiars.some((familiar) => {
        return (
          familiar.name === currentTurn && familiar._id === this.currentTurnId
        );
      });
    };

    // Determine if it's the opponent's or player's turn
    const isOpponentTurn =
      this.currentTurn === this.opponent.name ||
      isCurrentTurnFamiliar(this.enemyFamiliars, this.currentTurn);
    const isPlayerTurn =
      this.currentTurn === this.player.name ||
      isCurrentTurnFamiliar(this.allyFamiliars, this.currentTurn);

    if (isOpponentTurn || isPlayerTurn) {
      this.teamTurn = isOpponentTurn ? this.opponent.name : this.player.name;

  */

/* for (const element of this.npcArray) {
      this.distanceToNpc = Math.sqrt(
        Math.pow(this.playerpos.x - element.x, 2) +
          Math.pow(this.playerpos.y - element.y, 2)
      );
      //  console.log('elementname:', element.name);
      //       console.log('Distance to monster:', this.distanceToNpc);

      if (
        this.distanceToNpc <= attackRadius &&
        element.name.startsWith("npc") &&
        !hasTalkButton
      ) {
        nowBattling.setFooter({
          text: "You see an NPC, click the 'Talk' button to interact.",
        });
        this.whichMon = element.name;
        console.log("whichMonNpcOne:", this.whichMon);
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
        nowBattling.setFooter({ text: "You moved out of NPC's range." });
        initialMessage.edit({
          embeds: [nowBattling],
          components: [...navigationRow],
        });
        break;
      }
    }
    if (
      this.distanceToMonster <= attackRadius &&
      this.distanceToNpc <= attackRadius &&
      !hasAttackButton &&
      !hasTalkButton
    ) {
      message.channel.send(
        "You see an 'NPC' and a 'Monster', click the buttons to interact."
      );
      initialMessage.edit({
        components: [interactRow],
      });
    }
      */

/* async forLoop() {
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
    */

// OLD COMMAND HANDLERRRR
/*
  const Discord = require("discord.js");
const { loadCommands } = require("./handler");

// Create a new collection to store the commands
client.commands = new Collection();

// Load all the commands
loadCommands(client);

const BOT_PREFIX = "a!";

client.on("messageCreate", async (message) => {
  try {
    if (message.content.toLowerCase().startsWith(`${BOT_PREFIX}`)) {
      const args = message.content.slice(2).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      console.log(`Received command: ${commandName}`);
      // console.log('commandAlias:', client.commands)

      const command =
        client.commands.get(commandName) ||
        client.commands.find(
          (c) => c.aliases && c.aliases.includes(commandName.toLowerCase())
        );

      if (!command) return;

      const player = await collection.findOne({ _id: message.author.id });

      // If player is not found, return null
      if (!player && command.name !== "register") {
        return message.channel.send(
          "Player not found. Please use the `a!register yourname` command to register."
        );
      }

      if (command.guildOnly && message.channel.type === "dm") {
        return message.reply("I can't execute that command inside DMs!");
      }

      try {
        console.log("Executing command:", command.name);
        command.execute(client, message, args);
      } catch (error) {
        console.error(error);
        message.reply("An error occurred while executing the command.");
      }
    }
  } catch (error) {
    console.log("what the fuck:", error);
  }
});
*/
