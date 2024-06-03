const {
  checkResults,
  updateMovesOnCd,
  calculateAbilityDamage,
  getCardStats,
  getCardMoves,
  getPlayerMoves,
} = require("../../util/glogic.js");
const { BuffDebuffManager } = require("./BuffDebuffManager.js");
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
  }
  async cooldownFinder(ability) {
    const abilityCooldown = abilities[ability].cooldown;
    return abilityCooldown;
  }

  //PLAYER ABILOITIES AKAI THIS WORKS BLUD

  async shieldBash(user, target) {
    const damage = await calculateDamage(
      user.stats.attack,
      target.stats.defense
    );
    console.log("bossHp:", target.stats.hp);
    target.stats.hp -= damage;
    target.stats.speed -= 10;
    console.log("bossHpafter:", target.stats.hp);
    this.battleLogs.push(
      `+ ${user.name} uses Shield Bash on ${target.name} dealing ${damage}. ${target.name} now has ${target.stats.speed} speed for 3 turns!`
    );
    console.log(this.battleLogs.length);
    console.log(
      `${user.name} uses Shield Bash on ${target.name}. ${target.name} is slowed!`
    );
    this.cooldowns.push({
      name: "Shield Bash",
      cooldown: this.cooldownFinder("Shield Bash"),
    });

    // updateMovesOnCd(this.cooldowns, this.cooldownFinder('shieldBash'));
  }

  async defend(user) {
    user.stats.defense += 10; // Example: Increase defense by 10
    this.battleLogs.push(
      `+ ${user.name} uses Defend. Their defense is increased.`
    );
    this.cooldowns.push({
      name: "Defend",
      cooldown: this.cooldownFinder("Defend"),
    });
  }

  async bloodlust(user) {
    user.stats.attackSpeed += 20; // Example: Increase attack speed by 20
    user.stats.attack += 15; // Example: Increase attack damage by 15
    this.battleLogs.push(
      `${user.name} activates Bloodlust. Attack speed and damage increase.`
    );
    this.cooldowns.push({
      name: "Bloodlust",
      cooldown: this.cooldownFinder("Bloodlust"),
    });
  }

  async ragingStrike(user, target) {
    const damage = await calculateDamage(
      user.stats.attack * 2,
      target.stats.defense
    );
    target.stats.hp -= damage;
    this.battleLogs.push(
      `${user.name} unleashes a wild Raging Strike on ${target.name}. It deals massive damage!`
    );
    this.cooldowns.push({
      name: "Raging Strike",
      cooldown: this.cooldownFinder("Raging Strike"),
    });
  }

  async arenaSpin(user, target, specialContext) {
    let damageArray = [];
    let enemyNameArray = [];
    // Use Promise.all with map instead of forEach
    await Promise.all(
      specialContext.map(async (targeta) => {
        console.log("target:", targeta.stats.defense);
        console.log("length", specialContext.length);
        const damage = await calculateDamage(
          user.stats.attack,
          targeta.stats.defense
        );
        targeta.stats.hp -= damage * (1 / specialContext.length);
        damageArray.push(damage * (1 / specialContext.length));
        enemyNameArray.push(targeta.name);
      })
    );
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
    target.focus = user;
    this.battleLogs.push(
      `${user.name} taunts ${target.name}. ${target.name} is now focused on ${user.name}.`
    );
    this.cooldowns.push({
      name: "Crowd Control",
      cooldown: this.cooldownFinder("Crowd Control"),
    });
  }

  async precisionStrike(user, target) {
    const criticalDamage = calculateDamage(
      user.stats.attack * 1.5,
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
    user.statusEffects.resistance += 20; // Example: Increase status effect resistance by 20%
    this.battleLogs.push(
      `${user.name} enters Honor's Resolve, gaining increased resistance to status effects.`
    );
    this.cooldowns.push({
      name: "Honor's Resolve",
      cooldown: this.cooldownFinder("Honor's Resolve"),
    });
  }

  async fireball(user, target) {
    const damageOverTime = calculateAbilityDamage(
      user.stats.magic,
      target.stats.defense,
      3
    );
    target.stats.hp -= damageOverTime;
    this.battleLogs.push(
      `${user.name} hurls a Fireball at ${target.name}. ${target.name} takes damage over time.`
    );
    this.cooldowns.push({
      name: "Fireball",
      cooldown: this.cooldownFinder("Fireball"),
    });
  }

  async arcaneShield(user) {
    user.statusEffects.shield = true; // Example: Apply a shield status effect
    this.battleLogs.push(
      `${user.name} creates an Arcane Shield, absorbing incoming magic attacks.`
    );
    this.cooldowns.push({
      name: "Arcane Shield",
      cooldown: this.cooldownFinder("Arcane Shield"),
    });
  }

  async frostNova(user, target, specialContext) {
    let damageArray = [];
    let enemyNameArray = [];
    // Use Promise.all with map instead of forEach
    await Promise.all(
      specialContext.map(async (targeta) => {
        console.log("target:", targeta.stats.defense);
        console.log("length", specialContext.length);
        const damage = await calculateDamage(
          user.stats.attack,
          targeta.stats.defense
        );
        targeta.stats.hp -= damage * (1 / specialContext.length);
        damageArray.push(damage * (1 / specialContext.length));
        enemyNameArray.push(targeta.name);
      })
    );
    this.battleLogs.push(
      `+ ${
        user.name
      } casts Frost Nova freezing, and dealing ${enemyNameArray.join(
        " ,"
      )} for ${damageArray.join(" ,")} damage respectively`
    );
    target.statusEffects.frozen = true; // Example: Freeze the target

    this.cooldowns.push({
      name: "Frost Nova",
      cooldown: this.cooldownFinder("Frost Nova"),
    });
  }

  async thunderstorm(user, target, specialContext) {
    let damageArray = [];
    let enemyNameArray = [];
    // Use Promise.all with map instead of forEach
    await Promise.all(
      specialContext.map(async (targeta) => {
        console.log("target:", targeta.stats.defense);
        console.log("length", specialContext.length);
        const damage = await calculateDamage(
          user.stats.attack,
          targeta.stats.defense
        );
        targeta.stats.hp -= damage * (1 / specialContext.length);
        damageArray.push(damage * (1 / specialContext.length));
        enemyNameArray.push(targeta.name);
      })
    );
    this.battleLogs.push(
      `+ ${user.name} performs an Arena Spin, hitting ${enemyNameArray.join(
        " ,"
      )} for ${damageArray.join(" ,")} damage respectively`
    );
    this.battleLogs.push(
      `${user.name} calls forth a Thunderstorm, damaging multiple opponents.`
    );
    this.cooldowns.push({
      name: "Thunderstorm",
      cooldown: this.cooldownFinder("Thunderstorm"),
    });
  }

  async raiseDead(user) {
    // Implement logic for summoning a skeletal minion here
    this.battleLogs.push(
      `${user.name} summons a skeletal minion to aid in battle.`
    );
    this.cooldowns.push({
      name: "Raise Dead",
      cooldown: this.cooldownFinder("Raise Dead"),
    });
  }

  async drainLife(user, target) {
    const drainAmount = calculateAbilityDamage(user.stats.magic, 25); // Example: Drain Life heals for 25 HP
    target.stats.hp -= drainAmount;
    user.stats.hp += drainAmount;
    this.battleLogs.push(
      `${user.name} drains the life force from ${target.name}. ${user.name} is healed.`
    );
    this.cooldowns.push({
      name: "Drain Life",
      cooldown: this.cooldownFinder("Drain Life"),
    });
  }

  async mirrorImage(user) {
    // Implement logic for creating illusory copies here
    this.battleLogs.push(
      `${user.name} creates multiple illusory copies to confuse opponents.`
    );
    this.cooldowns.push({
      name: "Mirror Image",
      cooldown: this.cooldownFinder("Mirror Image"),
    });
  }

  async mindTrick(user, target) {
    // Implement logic for disorienting the target here
    this.battleLogs.push(
      `${user.name} uses a Mind Trick on ${target.name}. ${target.name} is disoriented.`
    );
    this.cooldowns.push({
      name: "Mind Trick",
      cooldown: this.cooldownFinder("Mind Trick"),
    });
  }

  async backstab(user, target) {
    const backstabDamage = calculateDamage(
      user.stats.attack * 2,
      target.stats.defense
    ); // Example: Backstab deals double damage
    target.stats.hp -= backstabDamage;
    this.battleLogs.push(
      `${user.name} strikes ${target.name} from behind. It's a backstab!`
    );
    this.cooldowns.push({
      name: "Backstab",
      cooldown: this.cooldownFinder("Backstab"),
    });
  }

  async shadowStep(user, target) {
    // Implement logic for teleporting behind the target here
    this.battleLogs.push(
      `${user.name} teleports behind ${target.name}, gaining a positional advantage.`
    );
    this.cooldowns.push({
      name: "Shadow Step",
      cooldown: this.cooldownFinder("Shadow Step"),
    });
  }

  async dualWield(user) {
    user.stats.attackSpeed += 20; // Example: Dual Wield increases attack speed by 20
    this.battleLogs.push(
      `${user.name} wields two weapons simultaneously, increasing attack speed.`
    );
    this.cooldowns.push({
      name: "Dual Wield",
      cooldown: this.cooldownFinder("Dual Wield"),
    });
  }

  async evasion(user) {
    user.statusEffects.evasion = true; // Example: Apply an evasion status effect
    this.battleLogs.push(
      `${user.name} evades incoming attacks, reducing damage taken for a short period.`
    );
    this.cooldowns.push({
      name: "Evasion",
      cooldown: this.cooldownFinder("Evasion"),
    });
  }

  async smokeBomb(user) {
    // Implement logic for creating a smoke cloud here
    this.battleLogs.push(
      `${user.name} throws a Smoke Bomb, creating a cloud of smoke.`
    );
    this.cooldowns.push({
      name: "Smoke Bomb",
      cooldown: this.cooldownFinder("Smoke Bomb"),
    });
  }

  async shurikenBarrage(user, target, specialContext) {
    let damageArray = [];
    let enemyNameArray = [];
    // Use Promise.all with map instead of forEach
    await Promise.all(
      specialContext.map(async (targeta) => {
        console.log("target:", targeta.stats.defense);
        console.log("length", specialContext.length);
        const damage = await calculateDamage(
          user.stats.attack,
          targeta.stats.defense
        );
        targeta.stats.hp -= damage * (1 / specialContext.length);
        damageArray.push(damage * (1 / specialContext.length));
        enemyNameArray.push(targeta.name);
      })
    );
    this.battleLogs.push(
      `+ ${user.name} performs Shuriken Barrage, hitting ${enemyNameArray.join(
        " ,"
      )} for ${damageArray.join(" ,")} damage respectively`
    );
    this.cooldowns.push({
      name: "Shuriken Barrage",
      cooldown: this.cooldownFinder("Shuriken Barrage"),
    });
  }

  async charmingPresence(user, target) {
    // Implement logic for charming the target here
    this.battleLogs.push(
      `${user.name} uses Charming Presence. ${target.name} is charmed and becomes passive.`
    );
    this.cooldowns.push({
      name: "Charming Presence",
      cooldown: this.cooldownFinder("Charming Presence"),
    });
  }

  async acrobaticFlourish(user) {
    user.statusEffects.evasion += 30; // Example: Acrobatic Flourish increases evasion by 30%
    this.battleLogs.push(
      `${user.name} performs an Acrobatic Flourish, increasing evasion.`
    );
    this.cooldowns.push({
      name: "Acrobatic Flourish",
      cooldown: this.cooldownFinder("Acrobatic Flourish"),
    });
  }

  async healingLight(user, target) {
    const healingAmount = calculateAbilityDamage(user.stats.magic, 30); // Example: Healing Light heals for 30 HP
    target.stats.hp += healingAmount;
    this.battleLogs.push(
      `${user.name} uses Healing Light on ${target.name}. ${target.name} is healed.`
    );
    this.cooldowns.push({
      name: "Healing Light",
      cooldown: this.cooldownFinder("Healing Light"),
    });
  }

  async divineProtection(user) {
    // Implement logic for providing a shield of protection here
    this.battleLogs.push(
      `${user.name} provides a shield of Divine Protection, absorbing incoming damage.`
    );
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
      user.stats.magic * 1.2,
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
