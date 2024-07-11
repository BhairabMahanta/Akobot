const {
  checkResults,
  updateMovesOnCd,
  calculateAbilityDamage,
  getCardStats,
  getCardMoves,
  getPlayerMoves,
} = require("../../util/glogic.js");
const { critOrNot } = require("../adventure/sumfunctions.js");
const { BuffDebuffManager } = require("./BuffDebuffManager.js");
const { BuffDebuffLogic } = require("./buffdebufflogic.js");
const abilities = require("../../../data/abilities.js");
const {
  calculateDamage,
} = require("../../../my_rust_library/my_rust_library.node");
class Ability {
  constructor(that) {
    this.battleLogs = that.battleLogs;
    this.enemyToHit = that.enemyToHit;
    this.cooldowns = that.cooldowns;
    this.buffDebuffManager = new BuffDebuffManager(that);
    this.buffDebuffLogic = new BuffDebuffLogic(that);
  }
  async cooldownFinder(ability) {
    const abilityCooldown = abilities[ability].cooldown;
    return abilityCooldown;
  }

  //PLAYER ABILOITIES AKAI THIS WORKS BLUD
  async shieldBash(user, target) {
    const damage = await critOrNot(
      user.stats.critRate,
      user.stats.critDamage,
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    const debuffType = "decrease_speed";
    const debuffDetails = {
      name: "Shield Bash",
      debuffType: debuffType,
      unique: true,
      value_amount: { speed: 20 }, // Decrease speed by 20
      targets: target,
      turnLimit: 2, // Lasts for 2 turns
      flat: true,
    };

    console.log(
      `${user} uses Shield Bash on ${target}dealing ${damage} damage.`
    );
    this.buffDebuffManager.applyDebuff(user, target, debuffDetails);
    await this.buffDebuffLogic.decreaseWhat(target, debuffDetails);

    this.cooldowns.push({
      name: "Shield Bash",
      cooldown: this.cooldownFinder("Shield Bash"),
    });
  }

  async defend(user) {
    const buffType = "increase_defense";
    const buffDetails = {
      name: "Defend",
      buffType: buffType,
      unique: true,
      value_amount: { defense: 30 }, // Increase defense by 30
      targets: user,
      turnLimit: 2, // Lasts for 2 turns
      flat: true,
    };
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.increaseWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Defend",
      cooldown: this.cooldownFinder("Defend"),
    });
  }

  async bloodlust(user, target) {
    const buffType = "increase_attack_and_increase_speed";
    const buffDetails = {
      name: "Bloodlust",
      buffType: buffType,
      unique: true,
      value_amount: { attack: 15, speed: 20 },
      targets: target,
      turnLimit: 1,
      flat: true,
    };
    this.buffDebuffManager.applyBuff(user, target, buffDetails);
    await this.buffDebuffLogic.increaseWhat(user, buffDetails);
    this.cooldowns.push({
      name: "Bloodlust",
      cooldown: this.cooldownFinder("Bloodlust"),
    });
  }

  async ragingStrike(user, target) {
    const damage = await critOrNot(
      user.stats.critRate + 50,
      user.stats.critDamage,
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} unleashes a wild Raging Strike on ${target.name}. It deals ${damage} damage!`
    );
    this.cooldowns.push({
      name: "Raging Strike",
      cooldown: this.cooldownFinder("Raging Strike"),
    });
  }

  async arenaSpin(user, target, specialContext) {
    const { damageArray, enemyNameArray } =
      await this.buffDebuffLogic.aoeDamage(user, target, specialContext);

    this.battleLogs.push(
      `+ ${user.name} performs an Arena Spin, hitting ${enemyNameArray.join(
        " ,"
      )} for ${damageArray.join(" ,")} damage respectively`
    );

    this.cooldowns.push({
      name: "Arena Spin",
      cooldown: this.cooldownFinder("Arena Spin"),
    });
  }

  async crowdControl(user, target) {
    const debuffType = "apply_taunt";
    const debuffDetails = {
      name: "Crowd Control",
      debuffType: debuffType,
      unique: true,
      targets: target,
      value_name: "taunt",
      value_amount: {
        taunt: {
          state: true,
        },
      },
      turnLimit: 3, // Lasts for 3 turns
    };

    console.log(
      `${user} taunts ${target}. ${target} is now focused on ${user}.`
    );
    this.buffDebuffManager.applyDebuff(user, target, debuffDetails);

    this.cooldowns.push({
      name: "Crowd Control",
      cooldown: this.cooldownFinder("Crowd Control"),
    });
  }

  async precisionStrike(user, target) {
    const criticalDamage = critOrNot(
      100, //in place of crit rate
      user.stats.critDamage + 15,
      user.stats.attack * 1.2,
      target.stats.defense
    );
    target.stats.hp -= criticalDamage;
    this.battleLogs.push(
      `${user.name} executes a precise Precision Strike on ${target.name}. It's a critical hit!`
    );
    this.cooldowns.push({
      name: "Precision Strike",
      cooldown: this.cooldownFinder("Precision Strike"),
    });
  }

  async honorsResolve(user) {
    const buffType = "apply_immunity";
    const buffDetails = {
      name: "Honor's Resolve",
      buffType: buffType,
      unique: true,
      targets: user,
      turnLimit: 2, // Lasts for 2 turns
    };
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Honor's Resolve",
      cooldown: this.cooldownFinder("Honor's Resolve"),
    });
  }

  async fireball(user, target, specialContext) {
    // Calculate initial damage
    const damage = critOrNot(
      user.stats.critRate,
      user.stats.critDamage,
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;

    // Apply DoT debuff
    const debuffDetails = {
      name: "Fireball",
      debuffType: "apply_burn",
      unique: true,
      value_name: "burn",
      value_amount: {
        burn: {
          state: true,
        },
      },
      targets: target,
      turnLimit: 3, // Lasts for 3 turns
    };

    await this.buffDebuffLogic.applyWhat(user, target, debuffDetails);
    await this.buffDebuffManager.applyDebuff(user, target, debuffDetails);
    this.battleLogs.push(
      `${user.name} hurls a Fireball at ${target.name}, dealing ${damage} damage and causing burn damage over time.`
    );

    this.cooldowns.push({
      name: "Fireball",
      cooldown: this.cooldownFinder("Fireball"),
    });
  }

  async arcaneShield(user) {
    const buffType = "apply_shield";
    const buffDetails = {
      name: "Arcane Shield",
      buffType: buffType,
      unique: true,
      value_name: "shield",
      value_amount: {
        shield: {
          state: true,
          amount: 50, // Example shield amount
        },
      },
      targets: user,
      turnLimit: 3,
    };

    console.log(
      `${user} creates an Arcane Shield, absorbing incoming magic attacks.`
    );
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Arcane Shield",
      cooldown: this.cooldownFinder("Arcane Shield"),
    });
  }

  async frostNova(user, target, specialContext) {
    const debuffType = "apply_freeze";
    const debuffDetails = {
      name: "Frost Nova",
      debuffType: debuffType,
      unique: true,
      value_name: "freeze",
      value_amount: {
        freeze: {
          state: true,
        },
      },
      targets: specialContext,
      turnLimit: 2, // Lasts for 2 turns
    };

    const { damageArray, enemyNameArray } =
      await this.buffDebuffLogic.aoeDamage(user, target, specialContext);

    this.buffDebuffManager.applyDebuff(user, specialContext, debuffDetails);
    // await this.buffDebuffLogic.decreaseWhat(target, debuffDetails);
    this.battleLogs.push(
      `+ ${user.name} performs frostNova, hitting ${enemyNameArray.join(
        " ,"
      )} for ${damageArray.join(" ,")} damage respectively`
    );

    this.cooldowns.push({
      name: "Frost Nova",
      cooldown: this.cooldownFinder("Frost Nova"),
    });
  }

  async thunderstorm(user, target, specialContext) {
    const { damageArray, enemyNameArray } =
      await this.buffDebuffLogic.aoeDamage(user, target, specialContext);

    this.battleLogs.push(
      `+ ${user.name} calls forth a Thunderstorm, hitting ${enemyNameArray.join(
        " ,"
      )} for ${damageArray.join(" ,")} damage respectively`
    );
    this.cooldowns.push({
      name: "Thunderstorm",
      cooldown: this.cooldownFinder("Thunderstorm"),
    });
  }

  async raiseDead(user) {
    console.log(`${user} summons a skeletal minion to aid in battle.`);
    this.minionManager.summonMinion(user, "Skeletal Minion");

    this.cooldowns.push({
      name: "Raise Dead",
      cooldown: this.cooldownFinder("Raise Dead"),
    });
  }

  async drainLife(user, target) {
    const drainAmount = critOrNot(
      user.stats.critRate,
      user.stats.critDamage,
      user.stats.attack,
      target.stats.defense
    ); // Example: Drain Life heals for 25 HP
    target.stats.hp -= drainAmount;
    user.stats.hp += drainAmount * 0.4;
    this.battleLogs.push(
      `${user.name} deals ${drainAmount} damage draining ${
        drainAmount * 0.4
      } hp from ${target.name}.`
    );
    this.cooldowns.push({
      name: "Drain Life",
      cooldown: this.cooldownFinder("Drain Life"),
    });
  }

  async mirrorImage(user) {
    const buffType = "apply_evasion";
    const buffDetails = {
      name: "Mirror Image",
      buffType: buffType,
      unique: true,
      value_name: "evasion",
      value_amount: {
        evasion: {
          state: true,
        },
      },
      targets: user,
      turnLimit: 3, // Lasts for 3 turns
    };

    console.log(
      `${user.name} creates multiple illusory copies, increasing evasion.`
    );
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Mirror Image",
      cooldown: this.cooldownFinder("Mirror Image"),
    });
  }

  async mindTrick(user, target) {
    const debuffType = "apply_confusion";
    const debuffDetails = {
      name: "Mind Trick",
      debuffType: debuffType,
      unique: true,
      value_name: "confusion",
      value_amount: {
        confusion: {
          state: true,
        },
      },
      targets: target,
      turnLimit: 3, // Lasts for 3 turns
    };

    console.log(
      `${user.name} uses a Mind Trick on ${target.name}. ${target.name} is disoriented.`
    );
    this.buffDebuffManager.applyDebuff(user, target, debuffDetails);
    await this.buffDebuffLogic.applyWhat(user, debuffDetails);

    this.cooldowns.push({
      name: "Mind Trick",
      cooldown: this.cooldownFinder("Mind Trick"),
    });
  }

  async backstab(user, target) {
    const damage = await critOrNot(
      user.stats.critRate,
      user.stats.critDamage,
      user.stats.attack,
      target.stats.defense * 0.75
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} strikes ${target.name} from behind. It's a backstab! It deals ${damage} damage.`
    );
    this.cooldowns.push({
      name: "Backstab",
      cooldown: this.cooldownFinder("Backstab"),
    });
  }

  async shadowStep(user, target) {
    const damage = critOrNot(
      user.stats.critRate + 10,
      user.stats.critDamage,
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    const buffType = "increase_critRate";
    const buffDetails = {
      name: "Shadow Step",
      buffType: buffType,
      unique: true,
      value_amount: { critRate: 10 }, // Example crit rate increase
      targets: user,
      turnLimit: 2, // Lasts for 2 turns
    };
    this.battleLogs.push(
      `+ ${user.name} teleports behind ${target.name}, dealing ${damage} damage and increasing crit rate by 10% for 2 turns.`
    );
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.increaseWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Shadow Step",
      cooldown: this.cooldownFinder("Shadow Step"),
    });
  }

  async dualWield(user) {
    const buffType = "apply_multipleHit";
    const buffDetails = {
      name: "Dual Wield",
      buffType: buffType,
      unique: true,
      value_amount: 3, // Example attack speed increase
      targets: user,
    };

    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Dual Wield",
      cooldown: this.cooldownFinder("Dual Wield"),
    });
  }

  async evasion(user) {
    const buffType = "apply_evasion";
    const buffDetails = {
      name: "Evasion",
      buffType: buffType,
      unique: true,
      value_name: "evasion",
      value_amount: {
        evasion: {
          state: true,
        },
      },
      targets: user,
      turnLimit: 2, // Lasts for 2 turns
    };

    console.log(
      `${user.name} evades his taxes, reducing damage taken for a short period.`
    );
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Evasion",
      cooldown: this.cooldownFinder("Evasion"),
    });
  }

  async smokeBomb(user) {
    const buffType = "apply_invisible";
    const buffDetails = {
      name: "Smoke Bomb",
      buffType: buffType,
      unique: true,
      value_name: "invisible",
      value_amount: {
        invisible: {
          state: true,
        },
      },
      targets: user,
      turnLimit: 2, // Lasts for 2 turns
    };

    console.log(`${user.name} throws a Smoke Bomb, creating a cloud of smoke.`);
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    // await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Smoke Bomb",
      cooldown: this.cooldownFinder("Smoke Bomb"),
    });
  }

  async shurikenBarrage(user, target, specialContext) {
    const { damageArray, enemyNameArray } =
      await this.buffDebuffLogic.aoeDamage(user, target, specialContext);

    this.battleLogs.push(
      `${user.name} throws a flurry of shurikens, hitting ${enemyNameArray.join(
        ", "
      )} for ${damageArray.join(", ")} damage respectively.`
    );

    this.cooldowns.push({
      name: "Shuriken Barrage",
      cooldown: this.cooldownFinder("Shuriken Barrage"),
    });
  }

  async charmingPresence(user, target) {
    const debuffType = "apply_charm";
    const debuffDetails = {
      name: "Charming Presence",
      debuffType: debuffType,
      unique: true,
      value_name: "charm",
      value_amount: {
        charm: {
          state: true,
        },
      },
      targets: target,
      turnLimit: 2, // Lasts for 2 turns
    };

    console.log(
      `${user.name} uses Charming Presence. ${target.name} is charmed and becomes passive.`
    );
    this.buffDebuffManager.applyDebuff(user, target, debuffDetails);

    this.cooldowns.push({
      name: "Charming Presence",
      cooldown: this.cooldownFinder("Charming Presence"),
    });
  }

  async acrobaticFlourish(user) {
    const buffType = "apply_evasion";
    const buffDetails = {
      name: "Acrobatic Flourish",
      buffType: buffType,
      unique: true,
      value_name: "evasion",
      value_amount: {
        evasion: {
          state: true,
        },
      },
      targets: user,
      turnLimit: 3, // Lasts for 3 turns
    };

    console.log(
      `${user.name} performs an Acrobatic Flourish, increasing evasion.`
    );
    this.buffDebuffManager.applyBuff(user, user, buffDetails);

    this.cooldowns.push({
      name: "Acrobatic Flourish",
      cooldown: this.cooldownFinder("Acrobatic Flourish"),
    });
  }
  async healingLight(user, target) {
    const healAmount = user.stats.magicPower * 1.5; // Example healing logic
    target.stats.hp += healAmount;
    console.log(
      `${user.name} uses Healing Light on ${target.name}. ${target.name} is healed for ${healAmount} HP.`
    );

    this.battleLogs.push(
      `${user.name} uses Healing Light on ${target.name}, healing for ${healAmount} HP.`
    );
    this.cooldowns.push({
      name: "Healing Light",
      cooldown: this.cooldownFinder("Healing Light"),
    });
  }

  async divineProtection(user) {
    const buffType = "apply_shield";
    const buffDetails = {
      name: "Divine Protection",
      buffType: buffType,
      unique: true,
      value_name: "shield",
      value_amount: {
        shield: {
          state: true,
        },
      },
      targets: user,
      turnLimit: 3, // Lasts for 3 turns
    };

    console.log(
      `${user.name} provides a shield of Divine Protection, absorbing incoming damage.`
    );
    this.buffDebuffManager.applyBuff(user, user, buffDetails);
    await this.buffDebuffLogic.applyWhat(user, buffDetails);

    this.cooldowns.push({
      name: "Divine Protection",
      cooldown: this.cooldownFinder("Divine Protection"),
    });
  }

  // RACES ABILITIES MOFO

  async adaptableNature(user) {
    console.log(
      `${user} adapts to their surroundings, gaining a bonus to all attributes.`
    );
    // Implement attribute bonus logic here
  }

  async versatileTraining(user) {
    console.log(
      `${user} has versatile training, allowing them to learn a wider range of skills.`
    );
    // Implement skill learning logic here
  }

  async elvenGrace(user) {
    console.log(
      `${user} exhibits Elven Grace, increasing agility and dexterity.`
    );
    // Implement agility and dexterity boost logic here
  }

  async naturesFavor(user) {
    console.log(
      `${user} receives Nature's Favor, enhancing their affinity with nature-based magic.`
    );
    // Implement nature magic affinity logic here
  }

  async dwarvenResilience(user) {
    console.log(
      `${user} demonstrates Dwarven Resilience, showing higher resistance to physical damage.`
    );
    // Implement physical damage resistance logic here
  }

  async masterCraftsman(user) {
    console.log(
      `${user} is a Master Craftsman, skilled in crafting weapons and armor.`
    );
    // Implement crafting proficiency logic here
  }

  async feralStrength(user) {
    console.log(
      `${user} harnesses Feral Strength, gaining increased physical power.`
    );
    // Implement strength increase logic here
  }

  async savageFury(user) {
    console.log(
      `${user} channels Savage Fury, becoming more powerful as health decreases.`
    );
    // Implement health-dependent power logic here
  }

  async sneakyTricks(user) {
    console.log(
      `${user} employs Sneaky Tricks, improving chances of stealing or evading detection.`
    );
    // Implement sneaky behavior logic here
  }

  async luckyCharm(user) {
    console.log(
      `${user} possesses a Lucky Charm, occasionally gaining advantages in critical situations.`
    );
    // Implement luck-based advantages logic here
  }

  async arcaneBrilliance(user) {
    console.log(
      `${user} shines with Arcane Brilliance, displaying innate proficiency in arcane magic.`
    );
    // Implement arcane magic proficiency logic here
  }

  async inventiveMind(user) {
    console.log(
      `${user} has an Inventive Mind, capable of creating and using unique gadgets.`
    );
    // Implement gadget creation and usage logic here
  }

  // FAMILIAR ABILITIES MAFAKA
  async flameStrike(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Flame Strike on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Flame Strike",
      cooldown: this.cooldownFinder("Flame Strike"),
    });
    // Implement additional effects for Flame Strike here
  }

  async dragonClaw(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Dragon Claw on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Dragon Claw",
      cooldown: this.cooldownFinder("Dragon Claw"),
    });
    // Implement additional effects for Dragon Claw here
  }

  async aquaBlast(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Aqua Blast on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Aqua Blast",
      cooldown: this.cooldownFinder("Aqua Blast"),
    });
    // Implement additional effects for Aqua Blast here
  }

  async healingWave(user) {
    const power = 20;
    const healingAmount = calculateAbilityDamage(power);
    user.stats.hp += healingAmount;
    this.battleLogs.push(
      `+ ${user.name} uses Healing Wave and heals for ${healingAmount}.`
    );
    this.cooldowns.push({
      name: "Healing Wave",
      cooldown: this.cooldownFinder("Healing Wave"),
    });
    // Implement additional effects for Healing Wave here
  }
  async rockThrow(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Rock Throw on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Rock Throw",
      cooldown: this.cooldownFinder("Rock Throw"),
    });
  }

  async quake(user, target) {
    const power = 30;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Quake on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Quake",
      cooldown: this.cooldownFinder("Quake"),
    });
  }
  async gust(user, target) {
    const power = 15;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Gust on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Gust",
      cooldown: this.cooldownFinder("Gust"),
    });
  }

  async aerialSlash(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Aerial Slash on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Aerial Slash",
      cooldown: this.cooldownFinder("Aerial Slash"),
    });
  }

  async thunderbolt(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Thunderbolt on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Thunderbolt",
      cooldown: this.cooldownFinder("Thunderbolt"),
    });
  }

  async staticShock(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Static Shock on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Static Shock",
      cooldown: this.cooldownFinder("Static Shock"),
    });
  }
  async shadowStrike(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Shadow Strike on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Shadow Strike",
      cooldown: this.cooldownFinder("Shadow Strike"),
    });
  }

  async darkClaw(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Dark Claw on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Dark Claw",
      cooldown: this.cooldownFinder("Dark Claw"),
    });
  }
  async vineWhip(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Vine Whip on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Vine Whip",
      cooldown: this.cooldownFinder("Vine Whip"),
    });
  }

  async leafShield(user) {
    user.stats.defense += 10; // Example: Increase defense by 10
    this.battleLogs.push(
      `+ ${user.name} uses Leaf Shield. Their defense is increased.`
    );
    this.cooldowns.push({
      name: "Leaf Shield",
      cooldown: this.cooldownFinder("Leaf Shield"),
    });
  }
  async iceBreath(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Ice Breath on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Ice Breath",
      cooldown: this.cooldownFinder("Ice Breath"),
    });
  }

  async freezingNova(user, target) {
    const power = 30;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Freezing Nova on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Frost Nova",
      cooldown: this.cooldownFinder("Frost Nova"),
    });
  }
  async lavaSpit(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Lava Spit on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Lava Spit",
      cooldown: this.cooldownFinder("Lava Spit"),
    });
  }

  async scorchingTail(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Scorching Tail on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Scorching Tail",
      cooldown: this.cooldownFinder("Scorching Tail"),
    });
  }
  async arrowShot(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Arrow Shot on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Arrow Shot",
      cooldown: this.cooldownFinder("Arrow Shot"),
    });
  }

  async Strike(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Strike on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Precision Strike",
      cooldown: this.cooldownFinder("Precision Strike"),
    });
  }
  async rockToss(user, target) {
    const power = 15;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Rock Toss on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Rock Toss",
      cooldown: this.cooldownFinder("Rock Toss"),
    });
  }

  async earthquake(user, target) {
    const power = 30;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Earthquake on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Earthquake",
      cooldown: this.cooldownFinder("Earthquake"),
    });
  }
  async windSlash(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Wind Slash on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Wind Slash",
      cooldown: this.cooldownFinder("Wind Slash"),
    });
  }

  async aeroBurst(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Aero Burst on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Aero Burst",
      cooldown: this.cooldownFinder("Aero Burst"),
    });
  }
  async frostBite(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Frost Bite on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Frost Bite",
      cooldown: this.cooldownFinder("Frost Bite"),
    });
  }

  async iceShard(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Ice Shard on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Ice Shard",
      cooldown: this.cooldownFinder("Ice Shard"),
    });
  }

  async ember(user, target) {
    const power = 20;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Ember on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Ember",
      cooldown: this.cooldownFinder("Ember"),
    });
  }

  async inferno(user, target) {
    const power = 25;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Inferno on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Inferno",
      cooldown: this.cooldownFinder("Inferno"),
    });
  }

  //Tier 2
  async fireThing(user, target) {
    const power = 30;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Fire Breath on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Fire Breath",
      cooldown: this.cooldownFinder("Fire Breath"),
    });
  }

  async scorchingRoar(user, target) {
    const power = 35;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Scorching Roar on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Scorching Roar",
      cooldown: this.cooldownFinder("Scorching Roar"),
    });
  }
  async blizzard(user, target) {
    const power = 35;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Blizzard on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Blizzard",
      cooldown: this.cooldownFinder("Blizzard"),
    });
  }

  async iceShards(user, target) {
    const power = 30;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Ice Shards on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Ice Shards",
      cooldown: this.cooldownFinder("Ice Shards"),
    });
  }
  async ragingThunder(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses ragingThunder on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "ragingThunder",
      cooldown: this.cooldownFinder("ragingThunder"),
    });
  }

  async lightningStrike(user, target) {
    const power = 45;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Lightning Strike on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Lightning Strike",
      cooldown: this.cooldownFinder("Lightning Strike"),
    });
  }
  async divineSparkle(user, target) {
    const power = 35;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Divine Sparkle on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Divine Sparkle",
      cooldown: this.cooldownFinder("Divine Sparkle"),
    });
  }

  async holyHorn(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Holy Horn on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Holy Horn",
      cooldown: this.cooldownFinder("Holy Horn"),
    });
  }
  async shadowFleet(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Shadow Strike on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Shadow Strike",
      cooldown: this.cooldownFinder("Shadow Strike"),
    });
  }

  async assassinate(user, target) {
    const power = 50;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Assassinate on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Assassinate",
      cooldown: this.cooldownFinder("Assassinate"),
    });
  }
  async tsunami(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Tsunami on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Tsunami",
      cooldown: this.cooldownFinder("Tsunami"),
    });
  }

  async aquaWhirl(user, target) {
    const power = 45;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Aqua Whirl on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Aqua Whirl",
      cooldown: this.cooldownFinder("Aqua Whirl"),
    });
  }
  async naturesWrath(user, target) {
    const power = 35;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Nature's Wrath on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Nature's Wrath",
      cooldown: this.cooldownFinder("Nature's Wrath"),
    });
  }

  async forestFury(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Forest Fury on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Forest Fury",
      cooldown: this.cooldownFinder("Forest Fury"),
    });
  }
  async stoneBarrage(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Stone Barrage on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Stone Barrage",
      cooldown: this.cooldownFinder("Stone Barrage"),
    });
  }

  async sentinelsShield(user) {
    user.stats.defense += 20; // Example: Increase defense by 20
    this.battleLogs.push(
      `+ ${user.name} uses Sentinel's Shield. Their defense is increased.`
    );
    this.cooldowns.push({
      name: "Sentinel's Shield",
      cooldown: this.cooldownFinder("Sentinel's Shield"),
    });
  }
  async arcaneBlast(user, target) {
    const power = 45;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Arcane Blast on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Arcane Blast",
      cooldown: this.cooldownFinder("Arcane Blast"),
    });
  }

  async mysticShield(user) {
    user.stats.defense += 15; // Example: Increase defense by 15
    this.battleLogs.push(
      `+ ${user.name} uses Mystic Shield. Their defense is increased.`
    );
    this.cooldowns.push({
      name: "Mystic Shield",
      cooldown: this.cooldownFinder("Mystic Shield"),
    });
  }
  async heavenlyFlames(user, target) {
    const power = 40;
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Heavenly Flames on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Heavenly Flames",
      cooldown: this.cooldownFinder("Heavenly Flames"),
    });
  }

  async sacredWing(user) {
    user.stats.attack += 20; // Example: Increase attack by 20
    this.battleLogs.push(
      `+ ${user.name} uses Sacred Wing. Their attack is increased.`
    );
    this.cooldowns.push({
      name: "Sacred Wing",
      cooldown: this.cooldownFinder("Sacred Wing"),
    });
  }

  async lightningBolt(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Lightning Bolt on ${target.name} dealing ${damage}.`
    );
    this.cooldowns.push({
      name: "Lightning Bolt",
      cooldown: this.cooldownFinder("Lightning Bolt"),
    });
    // Implement additional effects for Lightning Bolt here
  }

  //boss and mobs abilities
  async basicAttack(user, target) {
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `+ ${user.name} uses Shield Bash on ${target.name} dealing ${damage}. ${target.name} is slowed!`
    );
    console.log(this.battleLogs.length);
    console.log(
      `${user.name} uses Shield Bash on ${target.name}. ${target.name} is slowed!`
    );

    // Implement slow effect on the target here
  }

  async fireBreath(user, target) {
    const damage = await calculateDamage(
      user.stats.magic,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} hurls a Fireball at ${target.name}. ${target.name} takes damage over time.`
    );
  }

  async tailSwipe(user, target) {
    const damage = await calculateDamage(
      user.stats.attack * 1.5,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} performs a powerful Tail Swipe on ${target.name}. It deals ${damage} damage.`
    );
    // Implement additional effects for Tail Swipe here
  }

  async venomStrike(user, target) {
    const damage = await calculateDamage(
      user.stats.magic,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} delivers a Venom Strike to ${target.name}. It deals ${damage} damage.`
    );
    // Implement additional effects for Venom Strike here
  }

  async webTrap(user, target) {
    const damage = await calculateDamage(
      user.stats.magic * 0.8,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} sets up a Web Trap for ${target.name}. It deals ${damage} damage.`
    );
    // Implement additional effects for Web Trap here
  }

  async bossAbility2(user) {
    user.stats.defense += 10; // Example: Increase defense by 10
    this.battleLogs.push(
      `+ ${user.name} uses Defend. Their defense is increased.`
    );
  }

  async bossAbility3(user) {
    user.stats.attackSpeed += 20; // Example: Increase attack speed by 20
    user.stats.attack += 15; // Example: Increase attack damage by 15
    this.battleLogs.push(
      `${user.name} activates Bloodlust. Attack speed and damage increase.`
    );
  }

  async bossAbility4(user, target) {
    const damage = calculateDamage(user.stats.attack * 2, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} unleashes a wild Raging Strike on ${target.name}. It deals massive damage!`
    );
  }

  async bossAbility6(user, target) {
    target.focus = user;
    this.battleLogs.push(
      `${user.name} taunts ${target.name}. ${target.name} is now focused on ${user.name}.`
    );
  }

  async bossAbility7(user, target) {
    const criticalDamage = calculateDamage(
      user.stats.attack * 1.5,
      target.stats.defense
    );
    target.stats.hp -= criticalDamage;
    this.battleLogs.push(
      `${user.name} executes a precise Precision Strike on ${target.name}. It's a critical hit!`
    );
  }

  async bossAbility8(user) {
    user.statusEffects.resistance += 20; // Example: Increase status effect resistance by 20%
    this.battleLogs.push(
      `${user.name} enters Honor's Resolve, gaining increased resistance to status effects.`
    );
  }
}

module.exports = {
  Ability,
};
