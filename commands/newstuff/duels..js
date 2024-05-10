const { mongoClient } = require("../../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const { quests } = require("../quest/quests.js");
const { cycleCooldowns } = require("../adventure/sumfunctions.js");
const { bosses } = require("../monsterInfo/bosses.js");
const { mobs } = require("../monsterInfo/mobs.js");
const { cards } = require("../information/cards.js"); // Import the cards data from 'cards.js'
const {
  checkResults,
  getCardStats,
  getCardMoves,
  calculateDamage,
  getPlayerMoves,
} = require("../../util/glogic.js");
const classes = require("../../../data/classes/allclasses.js");
const abilities = require("../../../data/abilities.js");
const {
  Ability,
  // eslint-disable-next-line no-undef
} = require("./AbilitiesFunction.js");
let initialMessage = null;
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const buttonRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("action_normal")
    .setLabel("Basic Attack")
    .setStyle("Danger"),
  new ButtonBuilder()
    .setCustomId("action_dodge")
    .setLabel("Dodge")
    .setStyle("Danger")
);

class Duel {
  constructor(player, opponent, message) {
    this.famSource = JSON.parse(JSON.stringify(cards));
    this.message = message;
    this.player = player;
    this.opponent = opponent;
    this.allies = [];
    this.allyFamiliars = [];
    this.opponentsTeam = [];
    this.enemyFamiliars = [];
    this.playerFamiliar = [];
    this.opponentFamiliar = [];
    this.currentTurn = null;
    this.battleLogs = [];
  }
  async initialiseStuff() {
    console.log("initialised");
    try {
      try {
        if (this.player.selectedFamiliars) {
          this.playerFamiliar = this.player.selectedFamiliars.name;
        } else if (!this.player.selectedFamiliars) {
          console.log("gay");
          this.playerFamiliar = { name: ["Fire Dragon"] };
          this.message.channel.send(
            "You have to select your familiar first using a!selectFamiliar"
          );
          this.continue = false;
        }
      } catch (error) {
        console.log("No selected Familiars!", error);
      }
      try {
        if (this.opponent.selectedFamiliars) {
          this.opponentFamiliar = this.opponent.selectedFamiliars.name;
        } else if (!this.opponent.selectedFamiliars) {
          this.opponentFamiliar = { name: ["Fire Dragon"] };
          this.message.channel.send(
            "You have to select your familiar first using a!selectFamiliar"
          );
          this.continue = false;
        }
      } catch (error) {
        console.log("No selected Familiars!", error);
      }
      this.allies.push(this.player);
      this.opponentsTeam.push(this.opponent);
      for (const familiarName of this.playerFamiliar) {
        // console.log('familiarName:', this.playerFamiliar);
        const familiarData = this.famSource[familiarName];
        if (familiarData) {
          this.allies.push(familiarData);
          this.allyFamiliars.push(familiarData);
        }
      }

      for (const familiarName of this.opponentFamiliar) {
        const familiarData = this.famSource[familiarName];

        if (familiarData) {
          this.opponentsTeam.push(familiarData);
          this.opponentFamiliar.push(familiarData);
        }
      }
      this.characters = [...this.allies, ...this.opponentsTeam];

      console.log("characters:", this.characters);
      if (this.player.class != null) {
        this.playerClass = this.player.class;
        this.continue = true;
      } else if (this.player.class === null) {
        this.message.channel.send(
          "You have to select a class first, use a!selectclass"
        );
        console.log("You have to select a class first, use a!selectclass");
        return (this.continue = false);
      }
      if (this.player.race != null) {
        this.playerRace = this.player.race;
      } else if (this.player.class === null) {
        this.message.channel.send(
          "You have to select a race first, use a!selectrace"
        );
      }
      for (const character of this.characters) {
        try {
          character.maxHp = character.stats.hp;
        } catch (error) {
          console.log("fillBarError:", error);
        }
        character.atkBar = 0;
        character.attackBarEmoji = [];
        character.hpBarEmoji = [];
        //   console.log(character.name, '-', character.attackBarEmoji), '-', character.hpBarEmoji;
      }

      //   this.aliveEnemies = this.allEnemies.flat();
    } catch (error) {
      console.log("The error is here:", error);
    }
  }

  async startEmbed() {
    console.log("initialising");
    await this.initialiseStuff();
    let selectedValue;
    // Create the embed for the adventure command
    this.battleEmbed = new EmbedBuilder()
      .setTitle(`PLAYOFFS!`)
      .setDescription(
        `**${this.opponent.name} do you accept the challenge?**\n\n**${this.player.name}** has challenged you to a duel! Do you accept the challenge?`
      );
    // Display options for quests, bosses, mobs, and adventures
    const optionSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("option_select")
      .setPlaceholder("Select an option")
      .addOptions([
        { label: "Accept", value: "klik_accept" },
        { label: "Decline", value: "klik_decline" },
      ]);
    const stringMenuRow = new ActionRowBuilder().addComponents(
      optionSelectMenu
    );
    const gaeMessage = await this.message.channel.send({
      embeds: [this.battleEmbed],
      components: [stringMenuRow],
    });
    const filter = (i) =>
      i.customId === "option_select" && i.user.id === this.opponent.id;
    const collector = await gaeMessage.createMessageComponentCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "option_select") {
        i.deferUpdate();
        selectedValue = i.values[0]; // Get the selected value // gae shit

        if (selectedValue.startsWith("klik_")) {
          console.log("bro clicked fr??:", selectedValue);
          const selectedValueName = selectedValue.replace("klik_", "");
          if (selectedValueName === "decline") {
            this.battleEmbed.setDescription(`bro declined the duel, idot.`);
            gaeMessage.edit({ embeds: [this.battleEmbed], components: [] });
            this.continue = false;
          }
          if (selectedValueName === accept) {
            this.continue = true;
          }
          if (this.continue) {
            console.log("continue hogaya");
            this.startBattle(this.message);
          }
        }
      }
    });
    // // await  battle.isSelected();
    //   if (this.continue) {
    //  console.log('playerSElECTFAMILOIAR:', this.player.selectedFamilar )
    // this.startBattle(this.message);
    //   }
  } //
  async getDuelActionRow() {
    // console.log('thiscurenttyrn:', this.currentTurn)
    //    console.log('thiscurenttyrn:', this.playerFamiliar)
    let familiarArray = [];
    let opponentFamiliarArray = [];
    if (
      this.playerFamiliar.includes(this.currentTurn) ||
      this.opponentFamiliar.includes(this.currentTurn)
    ) {
      familiarArray.push(this.currentTurn);
      const moveFinder = familiarArray.map((cardName) =>
        getCardMoves(cardName)
      );

      try {
        this.abilityOptions = moveFinder[0]
          .map((ability) => {
            if (
              ability &&
              ability.id &&
              !this.cooldowns.some((cooldown) => cooldown.name === ability.name)
            ) {
              return {
                label: ability.name,
                description: ability.description,
                value: `fam-${ability.name}`,
              };
            }
          })
          .filter(Boolean); // Remove undefined items
        // If there are no abilities available, add a failsafe option
        if (this.abilityOptions.length === 0) {
          this.abilityOptions.push({
            label: "Cooldown",
            description: "Your abilities are on cooldown",
            value: "cooldown",
          });
        }
        familiarArray = [];
        // console.log('abilityOptions:', this.abilityOptions)
      } catch (error) {
        console.log("moveOptionsError:", error);
      }
    } else if (this.currentTurn === this.player.name) {
      const playerAbility = classes[this.player.class].abilities;
      // console.log('stuffimportant:', playerAbility)
      try {
        const moveFinder = playerAbility.map((cardName) =>
          getPlayerMoves(cardName)
        );
        // console.log('moveFinder:', moveFinder)
        this.abilityOptions = moveFinder
          .map((ability) => {
            if (
              ability &&
              ability.description &&
              !this.cooldowns.some((cooldown) => cooldown.name === ability.name)
            ) {
              // ability.execute(this.currentTurn, this.boss.name)
              // console.log('execuTE:', ability.execute);
              return {
                label: ability.name,
                description: ability.description,
                value: `player_ability_${ability.name}`,
              };
            }
          })
          .filter(Boolean); // Remove undefined items
        // If there are no abilities available, add a failsafe option
        if (this.abilityOptions.length === 0) {
          this.abilityOptions.push({
            label: "Cooldown",
            description: "Your abilities are on cooldown",
            value: "cooldown",
          });
        }
        // console.log('abilityOptions:', this.abilityOptions)
      } catch (error) {
        console.log("moveOptionsError:", error);
      }
    } else if (this.currentTurn === this.opponent.name) {
      const playerAbility = classes[this.opponent.class].abilities;
      // console.log('stuffimportant:', playerAbility)
      try {
        const moveFinder = playerAbility.map((cardName) =>
          getPlayerMoves(cardName)
        );
        // console.log('moveFinder:', moveFinder)
        this.abilityOptions = moveFinder
          .map((ability) => {
            if (
              ability &&
              ability.description &&
              !this.cooldowns.some((cooldown) => cooldown.name === ability.name)
            ) {
              // ability.execute(this.currentTurn, this.boss.name)
              // console.log('execuTE:', ability.execute);
              return {
                label: ability.name,
                description: ability.description,
                value: `player_ability_${ability.name}`,
              };
            }
          })
          .filter(Boolean); // Remove undefined items
        // If there are no abilities available, add a failsafe option
        if (this.abilityOptions.length === 0) {
          this.abilityOptions.push({
            label: "Cooldown",
            description: "Your abilities are on cooldown",
            value: "cooldown",
          });
        }
        // console.log('abilityOptions:', this.abilityOptions)
      } catch (error) {
        console.log("moveOptionsError:", error);
      }
      this.pickEnemyOptions = this.aliveEnemies.map((enemy, index) => ({
        label: enemy.name,
        description: `Attack ${enemy.name}`,
        value: `enemy_${index}`,
      }));
      try {
        this.selectMenu = new StringSelectMenuBuilder()
          .setCustomId("action_select")
          .setPlaceholder("Select the target")
          .addOptions(this.pickEnemyOptions);
        //   console.log('This.selectEmnu:', this.selectMenu)

        const stringMenu = new StringSelectMenuBuilder()
          .setCustomId("starter")
          .setPlaceholder("Make a selection!")
          .addOptions(this.abilityOptions);

        const stringMenuRow = new ActionRowBuilder().addComponents(stringMenu);
        // console.log('stringMENUROW:', stringMenuRow)
        const gaeRow = new ActionRowBuilder().addComponents(
          await this.selectMenu
        );

        var rows = [buttonRow, stringMenuRow, gaeRow];
      } catch (error) {
        console.log("error:", error);
      }
      return rows;
    }
  }

  async toCamelCase(str) {
    const words = str.split(" ");
    if (words.length === 1) {
      return words[0].toLowerCase();
    }
    if (words.length === 2) {
      return words[0].toLowerCase() + words[1];
    }
    return str
      .replace(/\s(.)/g, function (match, group1) {
        console.log("group1:", group1);
        console.log("match:", match);
        return group1.toUpperCase();
      })
      .replace(/\s/g, ""); // Remove any remaining spaces
  } //

  async performTurn() {
    // const attacker = this.currentTurn;
    // this.getNextTurn()
    console.log("currentTurn:", this.currentTurn);
    // If the current turn is the player, let the player choose a move
    if (this.currentTurn === this.player.name) {
      // const move = attacker.chooseMove(); // Implement this method for the player

      const target = this.enemyToHit.name;
      const damage = await calculateDamage(
        this.player.stats.attack,
        this.enemyToHit.stats.defense
      );

      // Update HP and battle logs
      this.enemyToHit.stats.hp -= damage;
      this.battleLogs.push(
        `+ ${this.currentTurn} attacks ${target} for ${damage} damage.`
      );
      console.log("loglength:", this.battleLogs.length);
      console.log(
        `${this.currentTurn} attacks ${target} for ${damage} damage.`
      );
      // this.getNextTurn()
      // console.log('currentTurn:', this.currentTurn);
    } else if (this.playerFamiliar.includes(this.currentTurn)) {
      const target = this.enemyToHit.name; // Implement target selection logic
      let damage = 0;

      // Loop through the familiars to find the attacking familiar
      for (const familiar of this.familiarInfo) {
        if (familiar.name === this.currentTurn) {
          // Calculate damage for the attacking familiar
          damage = await calculateDamage(
            familiar.stats.attack,
            this.enemyToHit.stats.defense
          );

          // Update HP and battle logs
          this.enemyToHit.stats.hp -= damage;
          this.battleLogs.push(
            `+ ${this.currentTurn} attacks ${target} for ${damage} damage using an attack`
          );
          console.log(
            `${this.currentTurn} attacks ${target} for ${damage} damage using an attack`
          );
          break; // Exit the loop once the attacking familiar is found
        }
      }

      // Set the current turn to the boss's name
    }
    // this.currentTurn = this.currentTurn === this.player ? this.boss.name : this.playerName;
  } //

  async calculateOverallSpeed(character) {
    try {
      if (character === this.player) {
        return this.player.stats.speed;
      } else if (this.playerFamiliar.includes(character.name)) {
        // Find the familiar's speed by matching it with this.familiarInfo
        const familiarInfo = this.familiarInfo.find(
          (fam) => fam.name === character.name
        );
        const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 1; // Default to 0 if not found

        return familiarSpeed;
      } else {
        console.log(`Calculating speed for unknown character type: 0`);
        return 0; // Default to 0 for unknown character types
      }
    } catch (error) {
      console.log("speedcalculator:", error);
    }
  } //

  async calculateOverallHp(character) {
    // console.log('character:', character)
    try {
      if (character === this.player) {
        return this.player.stats.hp;
      } else if (this.playerFamiliar.includes(character.name)) {
        // Find the familiar's speed by matching it with this.familiarInfo
        const familiarInfo = this.familiarInfo.find(
          (fam) => fam.name === character.name
        );
        const familiarHp = familiarInfo ? familiarInfo.stats.hp : 0; // Default to 0 if not found

        return familiarHp;
      } else {
        console.log(`Calculating speed for unknown character type: 0`);
        return 0; // Default to 0 for unknown character types
      }
    } catch (error) {
      console.log("speedcalculator:", error);
    }
  } //

  async fillAtkBars() {
    try {
      this.characters.sort((a, b) => b.stats.speed - a.stats.speed);
      for (const character of this.characters) {
        const speed = await this.calculateOverallSpeed(character);

        const speedMultiplier = character.speedBuff ? 1.3 : 1; // Apply Speed Buff if active
        character.atkBar += speed * 0.05 * speedMultiplier;
        character.attackBarEmoji = await this.generateAttackBarEmoji(
          character.atkBar
        );
      }
    } catch (error) {
      console.log("fillBarError:", error);
    }
  } //

  async fillHpBars() {
    try {
      for (const character of this.characters) {
        const hp = await this.calculateOverallHp(character);
        character.hpBarEmoji = await this.generateHPBarEmoji(
          character.stats.hp,
          character.maxHp
        );
      }
    } catch (error) {
      console.log("fillBarError:", error);
    }
  } //

  async generateAttackBarEmoji(atkBar) {
    try {
      const emoji = "■";
      let emptyBars = 0;
      if (atkBar > 113) {
        console.log("atkBar:", atkBar);
        atkBar = 113;
      }
      const filledBars = Math.floor(atkBar / 5);
      emptyBars = Math.floor(21 - filledBars);

      if (atkBar > 100) {
        emptyBars = Math.floor(22 - filledBars);
      }
      const attackBarString = `${emoji.repeat(filledBars)}${" ".repeat(
        emptyBars
      )}`;
      return `[${attackBarString}]`;
    } catch (error) {
      console.log("errorHere:", error);
    }
  } //

  async generateHPBarEmoji(currentHP, maxHP) {
    const emoji = "■";
    let filledBars;
    filledBars = Math.floor((currentHP / maxHP) * 21);
    if (currentHP < 0) {
      filledBars = 0;
    }
    const emptyBars = Math.floor(21 - filledBars);

    let hpBarString = emoji.repeat(filledBars);
    if (emptyBars > 0) {
      hpBarString += " ".repeat(emptyBars);
    }

    return `[${hpBarString}]`;
  } //

  async getNextTurn() {
    let nextTurn = null;
    console.log("ho raha hai");
    while (true) {
      await this.fillAtkBars();

      // Get all characters that have reached 100 attack bar
      const charactersWith100AtkBar = this.characters.filter(
        (character) => character.atkBar >= 100
      );
      // console.log('charactersWITHQ100ATKBAR:', charactersWith100AtkBar.length)
      if (charactersWith100AtkBar.length === 1) {
        const characterWith100AtkBar = charactersWith100AtkBar[0];
        console.log(
          `${characterWith100AtkBar.name} has reached 100 attack bar.`
        );
        this.currentTurn = characterWith100AtkBar.name;
        characterWith100AtkBar.attackBarEmoji =
          await this.generateAttackBarEmoji(characterWith100AtkBar.atkBar);
        characterWith100AtkBar.atkBar = 0;
        console.log(
          `${characterWith100AtkBar.name} - ${characterWith100AtkBar.attackBarEmoji}`
        );
        break; // Exit the loop
      } else if (charactersWith100AtkBar.length > 1) {
        // If multiple characters have reached 100 attack bar, determine the next turn based on speed
        let fastestCharacter = charactersWith100AtkBar[0];
        for (const character of charactersWith100AtkBar) {
          if (character.atkBar > fastestCharacter.atkBar) {
            fastestCharacter = character;
          }
        }
        console.log(
          `${fastestCharacter.name} has the highest atkBar and will take the next turn.`
        );
        this.currentTurn = fastestCharacter.name;
        fastestCharacter.attackBarEmoji = await this.generateAttackBarEmoji(
          fastestCharacter.atkBar
        );

        console.log(
          `${fastestCharacter.name} - ${fastestCharacter.atkBar} - ${fastestCharacter.attackBarEmoji}`
        );
        fastestCharacter.atkBar -= 100;
        break; // Exit the loop
      }
    }
    await this.fillHpBars();
    return nextTurn;
  } //
  async sendInitialEmbed() {
    try {
      console.log(this.player.name, "-inside", this.player.attackBarEmoji);
      this.battleEmbed = new EmbedBuilder()
        .setTitle(`${this.player.name} VS ${this.opponent.name}`)
        .setDescription(`**Current Turn:** \`\`${this.currentTurn}\`\``)
        // .setFooter({
        //   text: "You can run if you want lol no issues",
        // })
        .setColor(0x0099ff);
      //   this.battleEmbed.addFields({
      //     name: `Current Turn`,
      //     value: `\`\`\`${this.currentTurn}\`\`\``,
      //     inline: false,
      //   });
      let playerAndFamiliarsInfo = ""; // Initialize an empty string to store the info

      for (const familiar of this.allyFamiliars) {
        playerAndFamiliarsInfo += `[2;37m ${familiar.name}: ⚔️${
          familiar.stats.attack
        } 🛡️${familiar.stats.defense} 💨${familiar.stats.speed}\n[2;32m ${
          familiar.hpBarEmoji
        } ${familiar.stats.hp} ♥️\n[2;36m [2;34m${familiar.attackBarEmoji} ${Math.floor(
          familiar.atkBar
        )} 🙋\n\n`;
      }

      // Add the player's HP and AttackBar to the info
      playerAndFamiliarsInfo += `[2;37m ${this.player.name}: ⚔️${
        this.player.stats.attack
      } 🛡️${this.player.stats.defense} 💨${this.player.stats.speed} 🔮${
        this.player.stats.magic
      }\n[2;32m ${this.player.hpBarEmoji} ${this.player.stats.hp} ♥️\n[2;36m [2;34m${
        this.player.attackBarEmoji
      } ${Math.floor(this.player.atkBar)} 🙋`;

      this.battleEmbed.addFields({
        name: `${this.player.name}'s Team Info`,
        value: `\`\`\`ansi\n${playerAndFamiliarsInfo}\`\`\``,
        inline: false,
      });
      let opponentAndFamiliarsInfo = ""; // Initialize an empty string to store the info

      for (const familiar of this.enemyFamiliars) {
        opponentAndFamiliarsInfo += `[2;37m ${familiar.name}: ⚔️${
          familiar.stats.attack
        } 🛡️${familiar.stats.defense} 💨${familiar.stats.speed}\n[2;32m ${
          familiar.hpBarEmoji
        } ${familiar.stats.hp} ♥️\n[2;36m [2;34m${familiar.attackBarEmoji} ${Math.floor(
          familiar.atkBar
        )} 🙋\n\n`;
      }

      // Add the player's HP and AttackBar to the info
      opponentAndFamiliarsInfo += `[2;37m ${this.opponent.name}: ⚔️${
        this.player.stats.attack
      } 🛡️${this.player.stats.defense} 💨${this.player.stats.speed} 🔮${
        this.player.stats.magic
      }\n[2;32m ${this.player.hpBarEmoji} ${this.player.stats.hp} ♥️\n[2;36m [2;34m${
        this.player.attackBarEmoji
      } ${Math.floor(this.player.atkBar)} 🙋`;

      this.battleEmbed.addFields({
        name: `${this.opponent.name}'s Team Info:`,
        value: `\`\`\`ansi\n${opponentAndFamiliarsInfo}\`\`\``,
        inline: false,
      });

      console.log("battleLOgsLengthBefore", this.battleLogs.length);
      if (this.battleLogs.length > 6 && this.battleLogs.length <= 7) {
        this.battleLogs.shift();
      } else if (this.battleLogs.length > 7 && this.battleLogs.length <= 8) {
        this.battleLogs.shift();
        this.battleLogs.shift();
      } else if (this.battleLogs.length > 8) {
        this.battleLogs.shift();
        this.battleLogs.shift();
        this.battleLogs.shift();
      }
      console.log("battleLogsLengthAfterr:", this.battleLogs.length);

      if (this.battleLogs.length > 0) {
        this.battleEmbed.addFields({
          name: "Battle Logs",
          value: "```diff\n" + this.battleLogs.join("\n") + "```",
          inline: false,
        });
      } else {
        this.battleEmbed.addFields({
          name: "Battle Logs",
          value: "No battle logs yet.",
          inline: false,
        });
      }
      return this.battleEmbed;
      // return await message.channel.send({ embeds: [initialEmbed], components: [buttonRow] });
    } catch (error) {
      console.error("Error on hit:", error);
    }
    // Implement code to send an initial embed with battle information
  }

  async startBattle(message) {
    console.log("startBattle");

    await this.getNextTurn();
    console.log("currentTurn:", this.currentTurn);
    this.initialMessage = await this.sendInitialEmbed(message);
    console.log("initialMessage:", this.initialMessage);
    this.initialMessage = await message.channel.send({
      embeds: [this.initialMessage],
      components: await this.getDuelActionRow(),
    });
    console.log("initialMessage2:");
    if (this.enemyFirst) {
      this.printBattleResult();
      const updatedEmbed = await this.sendInitialEmbed(message);
      await this.initialMessage.edit({
        embeds: [updatedEmbed],
        components: await this.getDuelActionRow(),
      });
    }
    const filter = (i) =>
      (i.user.id === message.user.id && i.customId.startsWith("action_")) ||
      i.customId === "starter";

    const collector = this.initialMessage.createMessageComponentCollector({
      filter,
      time: 600000,
    });
    // Handle button interactions
    collector.on("collect", async (i) => {
      await i.deferUpdate();
      console.log("customid:", i.customId);

      if (i.customId === "action_normal") {
        try {
          console.log("aliveEnemiesearlY:", this.aliveEnemies);
          if (this.pickedChoice || this.aliveEnemies.length === 1) {
            this.pickedChoice = true; // i can use mongodb to allow people to turn this off and on
            if (this.aliveEnemies.length === 1) {
              console.log("aliveEnemies:", this.aliveEnemies);
              this.enemyToHit = this.aliveEnemies[0];
            }
            this.performTurn(message);
            await cycleCooldowns(this.cooldowns);
            await this.getNextTurn();
            await this.performEnemyTurn(message);
            console.log("currentTurn:", this.currentTurn);
            this.printBattleResult();
          } else {
            i.followUp({
              content: "Please pick an enemy to hit using the Select Menu",
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error("Error on hit:", error);
        }
      } else if (i.customId === "action_select") {
        const targetIndex = i.values[0];
        const realTarget = targetIndex.replace("enemy_", "");
        this.enemyToHit = this.aliveEnemies[realTarget];
        this.pickedChoice = true;
        // Continue with your code logic after selecting an enemy
      } else if (i.customId === "starter") {
        const selectedClassValue = i.values[0]; // Get the selected value // gae shit
        console.log("selectedValues", selectedClassValue);
        if (this.pickedChoice || this.aliveEnemies.length === 1) {
          this.pickedChoice = true;

          if (this.aliveEnemies.length === 1) {
            this.enemyToHit = this.aliveEnemies[0];
          }
          if (selectedClassValue.startsWith("player_ability_")) {
            try {
              const abilityName = selectedClassValue.replace(
                "player_ability_",
                ""
              );
              console.log("abilityName:a", abilityName);
              const abilityNameCamel = await this.toCamelCase(abilityName);
              console.log("abilityName:a", abilityNameCamel);
              // Check if the abilityName exists as a method in the Ability class
              if (typeof this.ability[abilityNameCamel] === "function") {
                const method = this.ability[abilityNameCamel];

                if (method) {
                  const functionAsString = method.toString();
                  console.log("functionAsString:", functionAsString);
                  const parameterNames = functionAsString
                    .replace(/[/][/].*$/gm, "") // remove inline comments
                    .replace(/\s+/g, "") // remove white spaces
                    .replace(/[/][*][^/*]*[*][/]/g, "") // remove multiline comments
                    .split("){", 1)[0]
                    .replace(/^[^(]*[(]/, "") // extract the parameters
                    .split(",")
                    .filter(Boolean); // split the parameters into an array

                  console.log(
                    `Method ${abilityNameCamel} has the following parameters: ${parameterNames.join(
                      ", "
                    )}`
                  );
                } else {
                  console.log(`Method ${abilityNameCamel} does not exist.`);
                }
                this.ability[abilityNameCamel](
                  this.player,
                  this.enemyToHit,
                  this.aliveEnemies
                );
                await cycleCooldowns(this.cooldowns);
                await this.getNextTurn();
                await this.performEnemyTurn(message);
                console.log("currentTurn:", this.currentTurn);
                this.printBattleResult();
                const updatedEmbed = await this.sendInitialEmbed(message);
              } else {
                console.log(`Ability ${abilityName} not found.`);
              }
            } catch (error) {
              console.error("Error on hit:", error);
              message.channel.send(
                'You perhaps have not selected a class yet. Please select it using "a!classselect", and select race using "a!raceselect".'
              );
            }
          } else if (selectedClassValue.startsWith("fam-")) {
            try {
              const abilityName = selectedClassValue.replace("fam-", "");
              console.log("abilityName:a", abilityName);
              const abilityNameCamel = await this.toCamelCase(abilityName);
              console.log("abilityName:a", abilityNameCamel);
              if (typeof this.ability[abilityNameCamel] === "function") {
                // Execute the ability by calling it using square brackets
                for (const familiar of this.familiarInfo) {
                  if (familiar.name === this.currentTurn) {
                    this.ability[abilityNameCamel](familiar, this.enemyToHit);
                    await cycleCooldowns(this.cooldowns);
                    await this.getNextTurn();
                    await this.performEnemyTurn(message);
                    console.log("currentTurn:", this.currentTurn);
                    this.printBattleResult();
                    break;
                  }
                }
              } else {
                console.log(`Ability ${abilityName} not found.`);
              }
            } catch (error) {
              console.log("ErrorFamiliar:", error);
            }
          }
        } else {
          i.followUp({
            content: "Please pick an enemy to hit using the Select Menu",
            ephemeral: true,
          });
        }
      }
    });
  }
}
