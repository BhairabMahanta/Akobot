const { mongoClient } = require("../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const { quests } = require("../adv/quest/quests.js");
const {
  cycleCooldowns,
  deactivateElement,
  deactivatedElements,
  critOrNot,
} = require("../adv/adventure/sumfunctions.js");
const { bosses } = require("../adv/monsterInfo/bosses.js");
const { mobs } = require("../adv/monsterInfo/mobs.js");
const { cards } = require("../adv/information/cards.js"); // Import the cards data from 'cards.js'
const { allFamiliars } = require("../adv/information/allfamilliars.js");
const { BuffDebuffLogic } = require("../adv/action/buffdebufflogic.js");
const { BuffDebuffManager } = require("../adv/action/BuffDebuffManager.js");
const {
  calculateDamage,
} = require("../../my_rust_library/my_rust_library.node");
const {
  checkResults,
  getCardStats,
  getCardMoves,
  getPlayerMoves,
  handleTurnEffects,
  toCamelCase,
  generateAttackBarEmoji,
  generateHPBarEmoji,
} = require("../util/glogic.js");
const classes = require("../../data/classes/allclasses.js");
const abilities = require("../../data/abilities.js");
const {
  Ability,
  // eslint-disable-next-line no-undef
} = require("../adv/action/AbilitiesFunction.js");
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
    this.famsSource = JSON.parse(JSON.stringify(allFamiliars));
    this.message = message;
    this.player = player;
    this.opponent = opponent;
    this.allies = [];
    this.playerChoice = { status: false, enemy: null };
    this.opponentChoice = { status: false, enemy: null };
    this.allyFamiliars = [];
    this.opponentsTeam = [];
    this.enemyFamiliars = [];
    this.playerFamiliar = [];
    this.opponentFamiliar = [];
    this.cooldowns = [];
    this.currentTurn = null;
    this.currentTurnId = null;
    this.battleLogs = [];
    this.characters = [];
    this.aliveCharacters = [];
    this.alivePlayerTeam = [];
    this.aliveOpponentTeam = [];
    this.deadCharacters = [];
    this.sendFollowUp = true;
    this.teamTurn = null;
    this.ability = new Ability(this);
    this.buffDebuffManager = new BuffDebuffManager(this);
    this.buffDebuffLogic = new BuffDebuffLogic(this);
    this.dodge = { option: null, id: null };
  }
  async initialiseStuff() {
    console.log("initialised");
    try {
      try {
        if (this.player.selectedFamiliars) {
          this.playerFamiliar = this.player.selectedFamiliars.name;
        } else {
          console.log("No selected Familiars for player!");
          this.playerFamiliar = [{ name: "Fire Dragon" }]; // Adjusted to match the object structure
          this.message.channel.send(
            "You have to select your familiar first using a!selectFamiliar"
          );
          this.continue = false;
        }
      } catch (error) {
        console.log("Error accessing player selectedFamiliars:", error);
      }

      try {
        if (this.opponent.selectedFamiliars) {
          this.opponentFamiliar = this.opponent.selectedFamiliars.name;
          console.log("Opponent familiars:", this.opponentFamiliar);
        } else {
          console.log("No selected Familiars for opponent!");
          this.opponentFamiliar = [{ name: "Fire Dragon" }]; // Adjusted to match the object structure
          this.message.channel.send(
            "You have to select your familiar first using a!selectFamiliar"
          );
          this.continue = false;
        }
      } catch (error) {
        console.log("Error accessing opponent selectedFamiliars:", error);
      }

      // Ensure famsSource and allFamiliars are defined and accessible
      if (this.famsSource) {
        // Process player's familiars
        for (const familiar of this.playerFamiliar) {
          const familiarName = familiar.name;

          const familiarDataFromAllFamiliars =
            this.famsSource[`Tier${familiar.tier}`]?.[familiarName];
          console.log(
            "familiarDataFromAllFamiliars:",
            familiarDataFromAllFamiliars
          );

          if (familiarDataFromAllFamiliars) {
            // Create a deep copy of the familiar object before pushing it into allies
            const clonedFamiliar = JSON.parse(
              JSON.stringify(familiarDataFromAllFamiliars)
            );
            this.allies.push(clonedFamiliar);
            this.allyFamiliars.push(clonedFamiliar);
          }
        }
        this.allies.push(this.player);

        this.alivePlayerTeam = [...this.allies];

        // Process opponent's familiars
        for (const familiar of this.opponentFamiliar) {
          const familiarName = familiar.name;
          const familiarDataFromAllFamiliars =
            this.famsSource[`Tier${familiar.tier}`]?.[familiarName];

          if (familiarDataFromAllFamiliars) {
            // Create a deep copy of the familiar object before pushing it into opponentsTeam
            const clonedFamiliar = JSON.parse(
              JSON.stringify(familiarDataFromAllFamiliars)
            );
            console.log("clonedFamiliar:", clonedFamiliar);
            this.opponentsTeam.push(clonedFamiliar);
            this.enemyFamiliars.push(clonedFamiliar);
          }
        }
        this.opponentsTeam.push(this.opponent);
        this.aliveOpponentTeam = [...this.opponentsTeam];
      } else {
        console.log("famsSource or allFamiliars is not defined");
      }

      for (const familiarName of this.opponentFamiliar) {
        const familiarData = this.famSource[familiarName];
        if (familiarData) {
          // Create a deep copy of the familiar object before pushing it into opponentsTeam
          const clonedFamiliar = JSON.parse(JSON.stringify(familiarData));
          this.opponentsTeam.push(clonedFamiliar);
          this.aliveOpponentTeam = [...this.opponentsTeam];
          this.enemyFamiliars.push(clonedFamiliar);
        }
      }

      for (const character of this.allies) {
        try {
          character._id = this.player._id;
        } catch (error) {
          console.log("disstupiderror:", error);
        }
        // console.log("character:", character);
      }
      for (const character of this.opponentsTeam) {
        try {
          character._id = this.opponent._id;
        } catch (error) {
          console.log("disstupiderror:", error);
        }
      }
      this.characters = [...this.allies, ...this.opponentsTeam];
      this.aliveCharacters = [...this.characters];

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
        character.statuses = {
          buffs: [],
          debuffs: [],
        };
      }
      //find character with fastest speed and then use that to determine this.teamturn

      this.aliveCharacters = this.aliveCharacters.flat();
    } catch (error) {
      this.message.channel.send(
        "Please select a class, your race and also select your familiars!"
      );
      console.log("The error is here:", error);
    }
  }

  async startEmbed() {
    console.log("initialising");
    await this.initialiseStuff();
    let selectedValue;
    // Create the embed for the adventure command
    this.battleEmbed = new EmbedBuilder()
      .setTitle("DUEL INVITATION!")
      .setDescription(
        `**${this.opponent.name}!!${this.player.name}** has challenged you to a duel! Will you **accept** the challenge?`
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
      (i.customId === "option_select" && i.user.id === this.opponent._id) ||
      i.user.id === this.player._id;
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
            const battleEmbed = new EmbedBuilder().setTitle("PLAYOFFS!");
            battleEmbed.setDescription("bro declined the duel, idot.");
            gaeMessage.edit({ embeds: [battleEmbed], components: [] });
            this.continue = false;
          }
          if (selectedValueName === "accept") {
            gaeMessage.delete();
            this.continue = true;
          }
          if (this.continue) {
            console.log("continue hogaya");
            this.startBattle(this.message);
          } else {
            return;
          }
        }
      }
    });
  } //
  async getDuelActionRow() {
    let familiarArray = [];
    let rows;
    if (
      this.playerFamiliar.includes(this.currentTurn.name) ||
      this.opponentFamiliar.includes(this.currentTurn.name)
    ) {
      familiarArray.push(this.currentTurn.name);
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
            label: "Cool down",
            description: "Your abilities are on cooldown",
            value: "cooldown",
          });
        }
        this.abilityOptions.push({
          label: "Refresh",
          description: "Click here if your move is stuck",
          value: "refresh",
        });

        familiarArray = [];
        // console.log('abilityOptions:', this.abilityOptions)
      } catch (error) {
        console.log("moveOptionsError:", error);
      }
    } else if (
      [this.player.name, this.opponent.name].includes(this.currentTurn.name)
    ) {
      const currentCharacter =
        this.currentTurn.name === this.player.name
          ? this.player
          : this.opponent;
      const playerAbility = classes[currentCharacter.class].abilities;
      // console.log('stuffimportant:', playerAbility)
      try {
        const moveFinder = playerAbility.map((cardName) =>
          getPlayerMoves(cardName)
        );
        // console.log("moveFinder:", moveFinder);
        this.abilityOptions = moveFinder
          .map((ability) => {
            if (
              ability &&
              ability.description &&
              !this.cooldowns.some((cooldown) => cooldown.name === ability.name)
            ) {
              // ability.execute(this.currentTurn, this.boss.name)
              // console.log("execuTE:", ability.execute);
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
        this.abilityOptions.push({
          label: "Refresh",
          description: "Click here if your move is stuck",
          value: "refresh",
        });
        // console.log("abilityOptions:", this.abilityOptions);
      } catch (error) {
        console.error("moveOptionsError:", error);
      }
    }

    // Helper function to check if the current turn matches any familiar
    this.teamTurn =
      this.currentTurn._id === this.player._id
        ? this.player.name
        : this.opponent.name;
    const isOpponentTurn = this.teamTurn === this.opponent.name;
    const isPlayerTurn = this.teamTurn === this.player.name;
    if (isOpponentTurn || isPlayerTurn) {
      const aliveTeam = isOpponentTurn
        ? this.alivePlayerTeam
        : this.aliveOpponentTeam;
      this.pickEnemyOptions = aliveTeam.map((enemy, index) => ({
        label: enemy.name,
        description: `Attack ${enemy.name}`,
        value: `enemy_${index}`,
      }));

      try {
        this.selectMenu = new StringSelectMenuBuilder()
          .setCustomId("action_select")
          .setPlaceholder("Select the target")
          .addOptions(this.pickEnemyOptions);

        const stringMenu = new StringSelectMenuBuilder()
          .setCustomId("starter")
          .setPlaceholder("Make a selection!")
          .addOptions(this.abilityOptions);

        const stringMenuRow = new ActionRowBuilder().addComponents(stringMenu);
        const gaeRow = new ActionRowBuilder().addComponents(this.selectMenu);

        rows = [buttonRow, stringMenuRow, gaeRow];
      } catch (error) {
        console.log("error:", error);
      }

      return rows;
    }
  }

  async performTurn() {
    const attacker = this.getCurrentAttacker();
    const target =
      this.currentTurnId === this.player._id
        ? this.playerChoice.enemy
        : this.opponentChoice.enemy;

    const damage = await this.calculatePFDamage(attacker, target);
    await this.handleStatusEffects(target, damage, attacker);
  }
  async handlePreTurnEffects(target, type) {
    const statusEffects = {
      freeze: {
        apply: (target) => {
          this.battleLogs.push(
            `- ${target.name} is frozen and cannot act this turn.`
          );
          console.log("frozen haha");
          return true; // Turn is skipped
        },
      },
      stun: {
        apply: (target) => {
          this.battleLogs.push(
            `- ${target.name} is stunned and cannot act this turn.`
          );
          return true; // Turn is skipped
        },
      },
      sleep: {
        apply: (target) => {
          this.battleLogs.push(
            `- ${target.name} is asleep and cannot act this turn.`
          );
          return true; // Turn is skipped
        },
      },
      taunt: {
        apply: (target) => {
          this.battleLogs.push(
            `- ${target.name} is taunted and must target the taunter.`
          );
          return false; // Turn is not skipped, but actions are restricted
        },
      },
      // Add other status effects here
    };

    let statuses;
    if (type === "debuffs") {
      statuses = target.statuses.debuffs || {};
    } else if (type === "buffs") {
      statuses = target.statuses.buffs || {};
    }
    if (!statuses || statuses.length === 0) {
      return false; // No status effects to handle
    }
    for (const status of statuses) {
      for (const [effect, { apply }] of Object.entries(statusEffects)) {
        console.log("status:", status, "effect:", effect);
        if (status[effect] && apply(target)) {
          return true;
        }
      }
    }

    return false;
  }

  async handleStatusEffects(target, damage, attacker) {
    const dodgeEffect = await this.handleDodge(attacker, target);

    if (dodgeEffect) {
      await handleTurnEffects(attacker);
      this.dodge = { option: null, id: null };
      return;
    }
    if (target.isNPC === true) {
      return;
    }
    const statusEffectsOnDamage = {
      invincible: {
        apply: () => {
          this.battleLogs.push(
            `- ${target.name}'s invincibility nullifies the attack.`
          );
          damage = 0;
          return true; // Damage is null
        },
      },
      reflect: {
        apply: () => {
          const reflectDamage = Math.floor(damage * 0.4);
          this.getCurrentAttacker().stats.hp -= reflectDamage;
          this.battleLogs.push(
            `- ${target.name} reflects ${reflectDamage} damage back to the attacker.`
          );
          return true;
        },
      },
      endure: {
        apply: () => {
          if (target.stats.hp - damage <= 0) {
            target.stats.hp = 1;
            this.battleLogs.push(
              `- ${target.name} endures the hit and stays at 1 HP.`
            );
            return true; // Damage is nullified
          }
        },
      },
      // Add more status effects as needed
    };

    let statuses = target.statuses.buffs || {};
    console.log("statuses:", statuses);
    if (!statuses || statuses.length === 0) {
      await handleTurnEffects(attacker);
      target.stats.hp -= damage;
      this.battleLogs.push(
        `+ ${this.currentTurn.name} attacks ${target.name} for ${damage} damage using an attack`
      );
      return false; // No status effects to handle
    }
    let isTrue = false;
    for (const status of statuses) {
      for (const [effect, { apply }] of Object.entries(statusEffectsOnDamage)) {
        console.log("status:", status, "effect:", effect);
        if (status[effect] && apply(target)) {
          console.log("happu");
          isTrue = true;
        }
      }
    }
    if (isTrue) {
      await handleTurnEffects(attacker);
      return true;
    } else {
      target.stats.hp -= damage;
      this.battleLogs.push(
        `+ ${this.currentTurn.name} attacks ${target.name} for ${damage} damage using an attack`
      );

      await handleTurnEffects(attacker);
      return false;
    }
  }

  async handleDodge(attacker, target) {
    if (this.dodge.id !== target._id && this.dodge.id !== target.id)
      return false;

    const dodgeOptions = {
      dodge_and_increase_attack_bar: () => {
        target.atkBar += 20;
        this.battleLogs.push(
          `- ${target.name} swiftly dodges the attack increasing 20 attack bar!!`
        );
      },
      dodge: () => {
        this.battleLogs.push(`- ${target.name} barely dodges the attack!`);
      },
      reduce_damage: async () => {
        const damage = await this.calculatePFDamage(attacker, target);
        const reducedDamage = this.getReducedDamage(damage);
        target.stats.hp -= reducedDamage;
        this.battleLogs.push(
          `- ${attacker.name} attacks ${
            target.name
          } for ${reducedDamage} damage. Reduced ${
            damage - reducedDamage
          } damage!!`
        );
      },
      take_hit: async () => {
        const damage = await this.calculatePFDamage(attacker, target);
        target.stats.hp -= damage;
        this.battleLogs.push(
          `+ ${attacker.name} attacks ${target.name} for ${damage} damage. Failed to dodge!`
        );
      },
      take_15x_damage: async () => {
        const damage = await this.calculatePFDamage(attacker, target);
        const increasedDamage = this.getIncreasedDamage(damage);
        target.stats.hp -= increasedDamage + damage;
        this.battleLogs.push(
          `+ ${attacker.name} attacks ${target.name} for ${damage} damage and ${increasedDamage}. ${target.name} slipped and fell while trying to dodge!`
        );
      },
    };

    const dodgeOption = this.dodge.option;
    if (dodgeOptions[dodgeOption]) {
      await dodgeOptions[dodgeOption]();
      return true;
    }

    return false;
  }

  async calculateOverallSpeed(character) {
    try {
      return character.stats.speed || 0;
    } catch (error) {
      console.log("speedcalculator:", error);
    }
  }

  async calculateOverallHp(character) {
    // console.log('character:', character)
    try {
      return character.stats.speed || 0;
    } catch (error) {
      console.log("speedcalculator:", error);
    }
  }
  async fillAtkBars() {
    let charactersWith100AtkBar = [];
    let turnDecided = false;
    try {
      this.characters.sort((a, b) => b.stats.speed - a.stats.speed);
      // console.log("characters:", this.characters);
      for (const character of this.characters) {
        if (character.atkBar >= 100) {
          charactersWith100AtkBar.push(character);
          return charactersWith100AtkBar; // Return immediately if any character already has atkBar >= 100
        }
      }

      while (!turnDecided) {
        // let anyCharacterReached100 = false; // Flag to track if any character reached 100 attack bar in this iteration
        for (const character of this.characters) {
          const speed = await this.calculateOverallSpeed(character);
          const speedMultiplier = character.speedBuff ? 1.3 : 1; // Apply Speed Buff if active
          character.atkBar += speed * 0.05 * speedMultiplier;
          if (character.atkBar >= 100) {
            charactersWith100AtkBar.push(character);
            turnDecided = true;
          }
        }
      }
      for (const character of this.characters) {
        character.attackBarEmoji = await generateAttackBarEmoji(
          character.atkBar
        );
      }

      if (charactersWith100AtkBar.length > 0) {
        console.log();
        // Process characters with 100 attack bar further (sorting, additional actions)
        // Do something with charactersWith100AtkBar
      }
    } catch (error) {
      console.log("fillBarError:", error);
    }
    return charactersWith100AtkBar;
  }

  async fillHpBars() {
    try {
      for (const character of this.characters) {
        const hp = await this.calculateOverallHp(character);
        character.hpBarEmoji = await generateHPBarEmoji(
          character.stats.hp,
          character.maxHp
        );
      }
    } catch (error) {
      console.log("fillBarError:", error);
    }
  } //

  getTauntTarget() {
    // Implement logic to return the target with taunt
    // For now, let's assume the first taunting enemy is returned
    return (
      this.enemyFamiliars.find((familiar) => familiar.statuses.debuffs.taunt) ||
      this.opponent
    );
  }

  async getNextTurn() {
    let nextTurn = null;
    const charactersWith100AtkBar = await this.fillAtkBars();

    if (charactersWith100AtkBar.length === 1) {
      const characterWith100AtkBar = charactersWith100AtkBar[0];

      this.currentTurn = characterWith100AtkBar;
      this.currentTurnId = characterWith100AtkBar._id;
      if (
        this.currentTurn === this.player.name ||
        (this.playerFamiliar.includes(this.currentTurn.name) &&
          characterWith100AtkBar._id === this.player._id)
      ) {
        this.teamTurn = this.player.name;
      } else {
        this.teamTurn = this.opponent.name;
      }
      characterWith100AtkBar.atkBar -= 100;
      characterWith100AtkBar.attackBarEmoji = await generateAttackBarEmoji(
        characterWith100AtkBar.atkBar
      );
    } else if (charactersWith100AtkBar.length > 1) {
      // If multiple characters have reached 100 attack bar, determine the next turn based on speed
      charactersWith100AtkBar.sort((a, b) => b.atkBar - a.atkBar);
      let fastestCharacter = charactersWith100AtkBar[0];
      this.currentTurn = fastestCharacter;
      if (
        this.currentTurn.name === this.player.name ||
        (this.playerFamiliar.includes(this.currentTurn.name) &&
          fastestCharacter._id === this.player._id)
      ) {
        this.teamTurn = this.player.name;
      } else {
        this.teamTurn = this.opponent.name;
      }
      this.currentTurnId = fastestCharacter._id;

      fastestCharacter.atkBar -= 100;
      fastestCharacter.attackBarEmoji = await generateAttackBarEmoji(
        fastestCharacter.atkBar
      );
    }

    await this.fillHpBars();

    const currentAttacker = this.getCurrentAttacker();
    const debuffs = "debuffs";
    if (await this.handlePreTurnEffects(currentAttacker, debuffs)) {
      // If the current attacker is affected by a debuff that skips the turn, find the next turn
      return this.getNextTurn(); // Recursively call to get the next valid turn
    }

    return nextTurn;
  } //
  async sendInitialEmbed() {
    try {
      // console.log(this.player.name, "-inside", this.player.attackBarEmoji);
      this.battleEmbed = new EmbedBuilder()
        .setTitle(`${this.player.name} VS ${this.opponent.name}`)
        .setFooter({
          text: `Team Turn: ${this.teamTurn}'s Team!`,
        })
        .setColor(0x0099ff);
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
      if (this.battleLogs.length > 0) {
        this.battleEmbed.setDescription(
          `**Battle Logs:**\n\`\`\`diff\n${this.battleLogs.join("\n")}\`\`\``
        );
      } else {
        this.battleEmbed.addFields({
          name: "Battle Logs",
          value: "No battle logs yet.",
          inline: false,
        });
      }
      this.battleEmbed.addFields({
        name: "Current Turn",
        value: `\`\`\`${this.currentTurn.name}\`\`\``,
        inline: false,
      });
      let playerAndFamiliarsInfo = ""; // Initialize an empty string to store the info

      for (const familiar of this.allyFamiliars) {
        console.log("fam id:", familiar._id);
        playerAndFamiliarsInfo += `[2;37m ${familiar.name}: ⚔️${
          familiar.stats.attack
        } 🛡️${familiar.stats.defense} 💨${familiar.stats.speed}\n[2;32m ${
          familiar.hpBarEmoji
        } ${familiar.stats.hp} ♥️\n[2;36m [2;34m${familiar.attackBarEmoji} ${Math.floor(
          familiar.atkBar
        )} ${
          this.currentTurn.name === familiar.name &&
          familiar._id === this.currentTurnId
            ? "☝️"
            : "🙋"
        }\n\n`;
      }

      // Add the player's HP and AttackBar to the info
      playerAndFamiliarsInfo += `[2;37m ${this.player.name}: ⚔️${
        this.player.stats.attack
      } 🛡️${this.player.stats.defense} 💨${this.player.stats.speed} 🔮${
        this.player.stats.magic
      }\n[2;32m ${this.player.hpBarEmoji} ${this.player.stats.hp} ♥️\n[2;36m [2;34m${
        this.player.attackBarEmoji
      } ${Math.floor(this.player.atkBar)} ${
        this.currentTurn.name === this.player.name ? "☝️" : "🙋"
      }`;

      this.battleEmbed.addFields({
        name: `${this.player.name}'s Team Info`,
        value: `\`\`\`ansi\n${playerAndFamiliarsInfo}\`\`\``,
        inline: true,
      });
      let opponentAndFamiliarsInfo = ""; // Initialize an empty string to store the info

      for (const familiar of this.enemyFamiliars) {
        console.log("fam id:", familiar._id);
        opponentAndFamiliarsInfo += `[2;37m ${familiar.name}: ⚔️${
          familiar.stats.attack
        } 🛡️${familiar.stats.defense} 💨${familiar.stats.speed}\n[2;32m ${
          familiar.hpBarEmoji
        } ${familiar.stats.hp} ♥️\n[2;36m [2;34m${familiar.attackBarEmoji} ${Math.floor(
          familiar.atkBar
        )} ${
          this.currentTurn.name === familiar.name &&
          familiar._id === this.currentTurnId
            ? "☝️"
            : "🙋"
        }\n\n`;
      }

      // Add the player's HP and AttackBar to the info
      opponentAndFamiliarsInfo += `[2;37m ${this.opponent.name}: ⚔️${
        this.opponent.stats.attack
      } 🛡️${this.opponent.stats.defense} 💨${this.opponent.stats.speed} 🔮${
        this.opponent.stats.magic
      }\n[2;32m ${this.opponent.hpBarEmoji} ${this.opponent.stats.hp} ♥️\n[2;36m [2;34m${
        this.opponent.attackBarEmoji
      } ${Math.floor(this.opponent.atkBar)} ${
        this.currentTurn.name === this.opponent.name ? "☝️" : "🙋"
      }`;

      this.battleEmbed.addFields({
        name: `${this.opponent.name}'s Team Info:`,
        value: `\`\`\`ansi\n${opponentAndFamiliarsInfo}\`\`\``,
        inline: true,
      });

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
    this.initialMessage = await this.sendInitialEmbed(message);
    // console.log("initialMessage:", this.initialMessage);
    this.initialMessage = await message.channel.send({
      embeds: [this.initialMessage],
      components: await this.getDuelActionRow(),
    });

    if (this.enemyFirst) {
      this.printBattleResult();
      const updatedEmbed = await this.sendInitialEmbed(message);
      await this.initialMessage.edit({
        embeds: [updatedEmbed],
        components: await this.getDuelActionRow(),
      });
    }
    const filter = (i) =>
      i.user.id === message.author.id ||
      (i.user.id === this.opponent._id && i.customId.startsWith("action_")) ||
      i.customId === "starter";

    const collector = this.initialMessage.createMessageComponentCollector({
      filter,
      time: 600000,
    });
    // Handle button interactions
    collector.on("collect", async (i) => {
      await i.deferUpdate();

      if (i.customId === "action_normal") {
        try {
          if (
            this.teamTurn === this.player.name &&
            i.user.id === this.player._id
          ) {
            if (this.aliveOpponentTeam.length === 1) {
              this.playerChoice.status = true;
              this.sendFollowUp = true;
              this.playerChoice.enemy = this.aliveOpponentTeam[0];
            }
          } else if (
            this.teamTurn === this.opponent.name &&
            i.user.id === this.opponent._id
          ) {
            if (this.alivePlayerTeam.length === 1) {
              this.opponentChoice.status = true;
              this.sendFollowUp = true;
              this.opponentChoice.enemy = this.alivePlayerTeam[0];
            }
          } else {
            this.sendFollowUp = false;
            await i.followUp({
              content: "I dont think it is your turn dawg.",
              ephemeral: true,
            });
          }
          if (this.playerChoice.status || this.opponentChoice.status) {
            this.playerChoice.status
              ? (this.playerChoice.status = true)
              : (this.opponentChoice.status = true);
            // i can use mongodb to allow people to turn this off and on
            this.performTurn(message);
            await this.getNextTurn();
            await cycleCooldowns(this.cooldowns);
            this.printBattleResult();
            console.log("currentTurn:", this.currentTurn.name);
            await this.sendInitialEmbed(message);
          } else {
            if (this.sendFollowUp) {
              i.followUp({
                content: "Please pick an enemy to hit using the Select Menu",
                ephemeral: true,
              });
            }
          }
        } catch (error) {
          console.error("Error on hit:", error);
        }
      } else if (i.customId === "action_select") {
        const targetIndex = i.values[0];

        const realTarget = targetIndex.replace("enemy_", "");
        if (
          this.teamTurn === this.player.name &&
          i.user.id === this.player._id
        ) {
          this.playerChoice.enemy = this.aliveOpponentTeam[realTarget];

          this.playerChoice.status = true;
        } else if (
          this.teamTurn === this.opponent.name &&
          i.user.id === this.opponent._id
        ) {
          this.opponentChoice.enemy = this.alivePlayerTeam[realTarget];

          this.opponentChoice.status = true;
        }
        // Continue with your code logic after selecting an enemy
      } else if (i.customId === "starter") {
        const selectedClassValue = i.values[0]; // Get the selected value // gae shit

        if (
          this.teamTurn === this.player.name &&
          i.user.id === this.player._id
        ) {
          if (this.aliveOpponentTeam.length === 1) {
            this.playerChoice.status = true;
            this.playerChoice.enemy = this.aliveOpponentTeam[0];
          }
        } else if (
          this.teamTurn === this.opponent.name &&
          i.user.id === this.opponent._id
        ) {
          if (this.alivePlayerTeam.length === 1) {
            this.opponentChoice.status = true;
            this.opponentChoice.enemy = this.aliveOpponentTeam[0];
          }
        }
        if (this.playerChoice.status || this.opponentChoice.status) {
          this.playerChoice.status
            ? (this.playerChoice.status = true)
            : (this.opponentChoice.status = true);

          if (selectedClassValue.startsWith("player_ability_")) {
            try {
              const abilityName = selectedClassValue.replace(
                "player_ability_",
                ""
              );
              const abilityNameCamel = await toCamelCase(abilityName);

              // Check if the abilityName exists as a method in the Ability class
              if (typeof this.ability[abilityNameCamel] === "function") {
                const method = this.ability[abilityNameCamel];

                if (method) {
                  const functionAsString = method.toString();
                  const parameterNames = functionAsString
                    .replace(/[/][/].*$/gm, "") // remove inline comments
                    .replace(/\s+/g, "") // remove white spaces
                    .replace(/[/][*][^/*]*[*][/]/g, "") // remove multiline comments
                    .split("){", 1)[0]
                    .replace(/^[^(]*[(]/, "") // extract the parameters
                    .split(",")
                    .filter(Boolean); // split the parameters into an array
                } else {
                  console.log(`Method ${abilityNameCamel} does not exist.`);
                }
                if (
                  this.teamTurn === this.player.name &&
                  i.user.id === this.player._id
                ) {
                  this.ability[abilityNameCamel](
                    this.player,
                    this.playerChoice.enemy,
                    this.aliveOpponentTeam
                  );
                } else if (
                  this.teamTurn === this.opponent.name &&
                  i.user.id === this.opponent._id
                ) {
                  this.ability[abilityNameCamel](
                    this.opponent,
                    this.opponentChoice.enemy,
                    this.alivePlayerTeam
                  );
                }
                await cycleCooldowns(this.cooldowns);
                await this.getNextTurn();
                console.log("oppshITTTT:", this.player.statuses.debuffs.flat());
                console.log("oppshITTTT:", this.player.statuses.buffs.flat());
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
              const abilityNameCamel = await toCamelCase(abilityName);
              console.log("abilityName:a", abilityNameCamel);
              if (typeof this.ability[abilityNameCamel] === "function") {
                // Execute the ability by calling it using square brackets
                if (
                  this.teamTurn === this.player.name &&
                  i.user.id === this.player._id
                ) {
                  for (const familiar of this.characters) {
                    if (
                      familiar.name === this.currentTurn.name &&
                      this.currentTurnId === this.player._id
                    ) {
                      this.ability[abilityNameCamel](
                        familiar,
                        this.playerChoice.enemy
                      );
                      await cycleCooldowns(this.cooldowns);
                      await this.getNextTurn();
                      console.log("currentTurn:", this.currentTurn.name);
                      this.printBattleResult();
                      break;
                    }
                  }
                } else if (
                  this.teamTurn === this.opponent.name &&
                  i.user.id === this.opponent._id
                ) {
                  for (const familiar of this.characters) {
                    if (
                      familiar.name === this.currentTurn.name &&
                      this.currentTurnId === this.opponent._id
                    ) {
                      this.ability[abilityNameCamel](
                        familiar,
                        this.opponentChoice.enemy
                      );
                      await cycleCooldowns(this.cooldowns);
                      await this.getNextTurn();
                      console.log("currentTurn:", this.currentTurn.name);
                      this.printBattleResult();
                      break;
                    }
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
      } else if (i.customId === "action_dodge") {
        //it needs to have like 4 possibilities wehre 1 is the lower probability i.e dodge and increase player's attack bar by 20, 2nd is just dodge, 3rd is not being able to dodge entirely but reduce the damage by 50% and 4th is just take the hit and 5th is take 1.5x damage
        const dodgeOptions = [
          "dodge_and_increase_attack_bar",
          "dodge",
          "reduce_damage",
          "take_hit",
          "take_15x_damage",
        ];
        const randomDodge =
          dodgeOptions[Math.floor(Math.random() * dodgeOptions.length)];
        this.dodge.option = randomDodge;
        this.dodge.id = i.user.id;
        this.battleLogs.push(
          `- ${this.currentTurn.name} is attempting to dodge`
        );
        await cycleCooldowns(this.cooldowns);
        await this.getNextTurn();
        // await this.performEnemyTurn(message);
        console.log("currentTurn:", this.currentTurn.name);
        this.printBattleResult();
      }
    });
  }
  getCurrentAttacker() {
    return this.currentTurn;
  }
  async calculatePFDamage(attacker, target) {
    return critOrNot(
      attacker.stats.critRate,
      attacker.stats.critDamage,
      attacker.stats.attack,
      target.stats.defense
    );
  }
  async critOrNotHandler(critRate, critDamage, attack, defense) {
    const damage = await critOrNot(critRate, critDamage, attack, defense);
    const attacker = this.getCurrentAttacker();
    const target =
      this.currentTurn.name === this.player.name ? this.opponent : this.player;
    await this.handleStatusEffects(target, damage, attacker);
  }

  getReducedDamage(damage) {
    const damageReductionPercentage = Math.random() * (40 - 15) + 15;
    return Math.floor(damage * (1 - damageReductionPercentage / 100));
  }

  getIncreasedDamage(damage) {
    const damageReductionPercentage = Math.random() * (40 - 15) + 15;
    return Math.floor(damage * (1 - damageReductionPercentage / 100));
  }
  async printBattleResult() {
    // Implement code to display the battle result (victory, defeat, or draw)
    // this.printBattleResult();
    let updatedEmbed;
    for (const character of this.alivePlayerTeam) {
      if (
        character.stats.hp <= 0 &&
        !this.deadCharacters.includes(character.name)
      ) {
        let thang = false;

        character.stats.speed = 0;
        character.atkBar = 0;
        character.stats.hp = 0;
        this.deadCharacters.push(character.name);
        if (this.opponentChoice.enemy === character) {
          this.opponentChoice.status = false;
          this.opponentChoice.enemy = null;
          thang = true;
        }
        thang
          ? this.battleLogs.push(
              `${character.name} died, please pick a different enemy!`
            )
          : this.battleLogs.push(`${character.name} died lol`);
        this.alivePlayerTeam = this.alivePlayerTeam.filter(
          (enemy) => enemy !== character
        );

        break;
      }
    }
    for (const character of this.aliveOpponentTeam) {
      if (
        character.stats.hp < 0 &&
        !this.deadCharacters.includes(character.name)
      ) {
        let thang = false;
        character.stats.speed = 0;
        character.atkBar = 0;
        character.stats.hp = 0;
        this.deadCharacters.push(character.name);
        if (this.playerChoice.enemy === character) {
          this.playerChoice.status = false;
          this.playerChoice.enemy = null;
          thang = true;
        }
        thang
          ? this.battleLogs.push(
              `${character.name} died, please pick a different enemy!`
            )
          : this.battleLogs.push(`${character.name} died lol`);
        this.aliveOpponentTeam = this.aliveOpponentTeam.filter(
          (enemy) => enemy !== character
        );

        break;
      }
    }
    // Determine the winner and loser
    let winnerName, loserName;
    if (this.alivePlayerTeam.length === 0) {
      // Player team is defeated
      winnerName = this.opponent.name;
      loserName = this.player.name;
    } else if (this.aliveOpponentTeam.length === 0) {
      // Opponent team is defeated
      winnerName = this.player.name;
      loserName = this.opponent.name;
    }

    // Proceed only if there's a winner
    if (winnerName && loserName) {
      // Create the battle conclusion embed
      const battleEmbed = new EmbedBuilder()
        .setTitle("The battle has been concluded!!")
        .setFields({
          name: `GGs ${winnerName}, You've won!!`,
          value: `The player ${winnerName} has won the battle against ${loserName} \n Skill issues honestly lol`,
          inline: true,
        });

      // Send the initial embed and update the initial message
      const updatedEmbed = await this.sendInitialEmbed(this.message);
      await this.initialMessage.edit({
        embeds: [updatedEmbed],
        components: [],
      });

      // Send the battle conclusion message
      this.message.channel.send({ embeds: [battleEmbed] });
    } else {
      updatedEmbed = await this.sendInitialEmbed(this.message);
      this.initialMessage.edit({
        embeds: [updatedEmbed],
        components: await this.getDuelActionRow(),
      });
    }
  }
}
module.exports = {
  Duel,
};
