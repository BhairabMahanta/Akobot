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
    this.message = message;
    this.player = player;
    this.opponent = opponent;
    this.allies = [];
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
        } else if (!this.player.selectedFamiliars) {
          console.log("gay");
          this.playerFamiliar = { name: ["Fire Dragon"] };
          this.message.channel.send(
            "You have to select your familiar first using a!selectfamiliar"
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
        const familiarData = this.famSource[familiarName];
        if (familiarData) {
          // Create a deep copy of the familiar object before pushing it into allies
          const clonedFamiliar = JSON.parse(JSON.stringify(familiarData));
          this.allies.push(clonedFamiliar);
          this.alivePlayerTeam = [...this.allies];
          this.allyFamiliars.push(clonedFamiliar);
        }
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
      [this.player.name, this.opponent.name].includes(this.currentTurn)
    ) {
      const currentCharacter =
        this.currentTurn === this.player.name ? this.player : this.opponent;
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
    const target = this.enemyToHit;

    const dodgeEffect = await this.handleDodge(attacker, target);

    if (dodgeEffect) {
      await handleTurnEffects(attacker);
      this.dodge = { option: null, id: null };
      return;
    }

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
        `+ ${this.currentTurn} attacks ${target.name} for ${damage} damage using an attack`
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
        `+ ${this.currentTurn} attacks ${target.name} for ${damage} damage using an attack`
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
      if (character === this.player) {
        return this.player.stats.speed;
      } else if (this.opponentFamiliar.includes(character.name)) {
        // Find the familiar's speed by matching it with this.familiarInfo
        const familiarInfo = this.characters.find(
          (fam) => fam.name === character.name
        );
        // console.log("familiarInfoOOOOO:", familiarInfo);
        const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 1; // Default to 0 if not found

        return familiarSpeed;
      } else if (this.playerFamiliar.includes(character.name)) {
        // Find the familiar's speed by matching it with this.familiarInfo
        const familiarInfo = this.characters.find(
          (fam) => fam.name === character.name
        );
        // console.log("familiarInfoOOOOO:", familiarInfo);
        const familiarSpeed = familiarInfo ? familiarInfo.stats.speed : 1; // Default to 0 if not found

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
  } //

  async calculateOverallHp(character) {
    // console.log('character:', character)
    try {
      if (character === this.player) {
        return this.player.stats.hp;
      } else if (character === this.opponent) {
        return this.opponent.stats.hp;
      } else if (this.opponentFamiliar.includes(character.name)) {
        // Find the familiar's speed by matching it with this.familiarInfo
        const familiarInfo = this.characters.find(
          (fam) => fam.name === character.name
        );
        const familiarHp = familiarInfo ? familiarInfo.stats.hp : 0; // Default to 0 if not found

        return familiarHp;
      } else if (this.playerFamiliar.includes(character.name)) {
        // Find the familiar's speed by matching it with this.familiarInfo
        const familiarInfo = this.characters.find(
          (fam) => fam.name === character.name
        );
        const familiarHp = familiarInfo ? familiarInfo.stats.hp : 0; // Default to 0 if not found

        return familiarHp;
      } else {
        // console.log(`Calculating speed for unknown character type: 0`);
        return 0; // Default to 0 for unknown character types
      }
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
        character.attackBarEmoji = await this.generateAttackBarEmoji(
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
      if (atkBar >= 100) {
        atkBar = 100;
      }
      const filledBars = Math.floor(atkBar / 10);
      emptyBars = Math.floor(10 - filledBars);

      // if (atkBar > 100) {
      //   emptyBars = Math.floor(12 - filledBars);
      // }
      const attackBarString = `${emoji.repeat(filledBars)}${" ".repeat(
        emptyBars
      )}`;
      return `[${attackBarString}]`;
    } catch (error) {
      console.log("errorHere:", error);
    }
  }

  async generateHPBarEmoji(currentHP, maxHP) {
    const emoji = "■";
    let filledBars;
    filledBars = Math.floor((currentHP / maxHP) * 17);
    if (currentHP < 0) {
      filledBars = 0;
    }
    const emptyBars = Math.floor(17 - filledBars);

    let hpBarString = emoji.repeat(filledBars);
    if (emptyBars > 0) {
      hpBarString += " ".repeat(emptyBars);
    }

    return `[${hpBarString}]`;
  }

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

      this.currentTurn = characterWith100AtkBar.name;
      this.currentTurnId = characterWith100AtkBar._id;
      if (
        this.currentTurn === this.player.name ||
        (this.playerFamiliar.includes(this.currentTurn) &&
          characterWith100AtkBar._id === this.player._id)
      ) {
        this.teamTurn = this.player.name;
      } else {
        this.teamTurn = this.opponent.name;
      }
      characterWith100AtkBar.atkBar -= 100;
      characterWith100AtkBar.attackBarEmoji = await this.generateAttackBarEmoji(
        characterWith100AtkBar.atkBar
      );
    } else if (charactersWith100AtkBar.length > 1) {
      // If multiple characters have reached 100 attack bar, determine the next turn based on speed
      charactersWith100AtkBar.sort((a, b) => b.atkBar - a.atkBar);
      let fastestCharacter = charactersWith100AtkBar[0];
      this.currentTurn = fastestCharacter.name;
      if (
        this.currentTurn === this.player.name ||
        (this.playerFamiliar.includes(this.currentTurn) &&
          fastestCharacter._id === this.player._id)
      ) {
        this.teamTurn = this.player.name;
      } else {
        this.teamTurn = this.opponent.name;
      }
      this.currentTurnId = fastestCharacter._id;

      fastestCharacter.atkBar -= 100;
      fastestCharacter.attackBarEmoji = await this.generateAttackBarEmoji(
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
          `**Battle Logs:**\n\`\`\`diff\n+ ${this.battleLogs.join("\n")}\`\`\``
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
        value: `\`\`\`${this.currentTurn}\`\`\``,
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
          this.currentTurn === familiar.name &&
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
        this.currentTurn === this.player.name ? "☝️" : "🙋"
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
          this.currentTurn === familiar.name &&
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
        this.currentTurn === this.opponent.name ? "☝️" : "🙋"
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
              this.pickedChoice = true;
              this.sendFollowUp = true;
              this.enemyToHit = this.aliveOpponentTeam[0];
            }
          } else if (
            this.teamTurn === this.opponent.name &&
            i.user.id === this.opponent._id
          ) {
            if (this.alivePlayerTeam.length === 1) {
              this.pickedChoice = true;
              this.sendFollowUp = true;
              this.enemyToHit = this.alivePlayerTeam[0];
            }
          } else {
            this.pickedChoice = false;
            this.sendFollowUp = false;
            await i.followUp({
              content: "I dont think it is your turn dawg.",
              ephemeral: true,
            });
          }
          if (this.pickedChoice) {
            this.pickedChoice = true; // i can use mongodb to allow people to turn this off and on
            this.performTurn(message);
            await this.getNextTurn();
            await cycleCooldowns(this.cooldowns);
            this.printBattleResult();
            console.log("currentTurn:", this.currentTurn);
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
          this.enemyToHit = this.aliveOpponentTeam[realTarget];
          this.pickedChoice = true;
        } else if (
          this.teamTurn === this.opponent.name &&
          i.user.id === this.opponent._id
        ) {
          this.enemyToHit = this.alivePlayerTeam[realTarget];
          this.pickedChoice = true;
        }
        // Continue with your code logic after selecting an enemy
      } else if (i.customId === "starter") {
        const selectedClassValue = i.values[0]; // Get the selected value // gae shit

        if (
          this.teamTurn === this.player.name &&
          i.user.id === this.player._id
        ) {
          if (this.aliveOpponentTeam.length === 1) {
            this.pickedChoice = true;
            this.enemyToHit = this.aliveOpponentTeam[0];
          }
        } else if (
          this.teamTurn === this.opponent.name &&
          i.user.id === this.opponent._id
        ) {
          if (this.alivePlayerTeam.length === 1) {
            this.pickedChoice = true;
            this.enemyToHit = this.alivePlayerTeam[0];
          }
        }
        if (this.pickedChoice) {
          this.pickedChoice = true;

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

                  // console.log(
                  //   `Method ${abilityNameCamel} has the following parameters: ${parameterNames.join(
                  //     ", "
                  // )}`
                  // );
                } else {
                  console.log(`Method ${abilityNameCamel} does not exist.`);
                }
                if (
                  this.teamTurn === this.player.name &&
                  i.user.id === this.player._id
                ) {
                  this.ability[abilityNameCamel](
                    this.player,
                    this.enemyToHit,
                    this.aliveOpponentTeam
                  );
                } else if (
                  this.teamTurn === this.opponent.name &&
                  i.user.id === this.opponent._id
                ) {
                  this.ability[abilityNameCamel](
                    this.opponent,
                    this.enemyToHit,
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
                      familiar.name === this.currentTurn &&
                      this.currentTurnId === this.player._id
                    ) {
                      this.ability[abilityNameCamel](familiar, this.enemyToHit);
                      await cycleCooldowns(this.cooldowns);
                      await this.getNextTurn();
                      console.log("currentTurn:", this.currentTurn);
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
                      familiar.name === this.currentTurn &&
                      this.currentTurnId === this.opponent._id
                    ) {
                      this.ability[abilityNameCamel](familiar, this.enemyToHit);
                      await cycleCooldowns(this.cooldowns);
                      await this.getNextTurn();
                      console.log("currentTurn:", this.currentTurn);
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
        this.battleLogs.push(`- ${this.currentTurn} is attempting to dodge`);
        await cycleCooldowns(this.cooldowns);
        await this.getNextTurn();
        // await this.performEnemyTurn(message);
        console.log("currentTurn:", this.currentTurn);
        this.printBattleResult();
      }
    });
  }
  getCurrentAttacker() {
    if (this.currentTurn === this.player.name) return this.player;
    if (this.currentTurn === this.opponent.name) return this.opponent;

    return (
      this.allyFamiliars.find(
        (familiar) =>
          familiar.name === this.currentTurn &&
          familiar._id === this.currentTurnId
      ) ||
      this.enemyFamiliars.find(
        (familiar) =>
          familiar.name === this.currentTurn &&
          familiar._id === this.currentTurnId
      )
    );
  }
  async calculatePFDamage(attacker, target) {
    return critOrNot(
      attacker.stats.critRate,
      attacker.stats.critDamage,
      attacker.stats.attack,
      target.stats.defense
    );
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
        character.stats.hp < 0 &&
        !this.deadCharacters.includes(character.name)
      ) {
        this.battleLogs.push(`${character.name} died poggers`);
        character.stats.speed = 0;
        character.atkBar = 0;
        character.stats.hp = 0;
        this.deadCharacters.push(character.name);
        console.log("adeadenem:", this.deadEnemies);
        this.alivePlayerTeam = this.alivePlayerTeam.filter(
          (enemy) => enemy !== character
        );
        console.log("ALIVEFAM:", this.characters);
        break;
      }
    }
    for (const character of this.aliveOpponentTeam) {
      if (
        character.stats.hp < 0 &&
        !this.deadCharacters.includes(character.name)
      ) {
        this.battleLogs.push(`${character.name} died lol`);
        character.stats.speed = 0;
        character.atkBar = 0;
        character.stats.hp = 0;
        this.deadCharacters.push(character.name);
        this.aliveOpponentTeam = this.aliveOpponentTeam.filter(
          (enemy) => enemy !== character
        );

        break;
      }
    }
    if (this.alivePlayerTeam.length === 0) {
      const battleEmbed = new EmbedBuilder().setTitle(
        "The battle has been concluded!!"
      );
      battleEmbed.setFields({
        name: `GGs ${this.opponent.name}You've won!!`,
        value: `The player ${this.opponent.name} has won the battle against ${this.player.name} \n Skill issues honestly lol`,
        inline: true,
      });
      // this.initialMessage.edit({
      //   embeds: [this.battleEmbed],
      //   components: [],
      // });
      updatedEmbed = await this.sendInitialEmbed(this.message);
      this.initialMessage.edit({
        embeds: [updatedEmbed],
        components: [],
      });
      this.message.channel.send({ embeds: [battleEmbed] });
    } else if (this.aliveOpponentTeam.length === 0) {
      const battleEmbed = new EmbedBuilder().setTitle(
        "The battle has been concluded!!"
      );
      battleEmbed.setFields({
        name: `GGs ${this.player.name}You've won!!`,
        value: `The player ${this.player.name} has won the battle against ${this.opponent.name} \n Skill issues honestly lol`,
        inline: true,
      });
      updatedEmbed = await this.sendInitialEmbed(this.message);
      this.initialMessage.edit({
        embeds: [updatedEmbed],
        components: [],
      });
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
