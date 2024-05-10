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
    this.opponentsTeam = [];
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
        }
      }

      for (const familiarName of this.opponentFamiliar) {
        const familiarData = this.famSource[familiarName];

        if (familiarData) {
          this.opponentsTeam.push(familiarData);
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
  async getDuelActionRow(player) {
    try {
      // Logic to get action row for a player's turn
      // Example: const actionRow = await this.constructActionRow(player);
      // return actionRow;
    } catch (error) {
      console.error("Error getting action row:", error);
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
}
