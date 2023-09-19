const { checkResults, updateMovesOnCd, calculateAbilityDamage, getCardStats, getCardMoves,
  calculateDamage, getPlayerMoves } = require('../util/glogic.js');
class Ability {
  constructor(that) {
    this.battleLogs = that.battleLogs;
    console.log('this and that worked?', this.battleLogs);
  
  }

 //PLAYER ABILOITIES
  
  shieldBash(user, target) {
    const damage = calculateDamage(user.stats.attack, target.physicalStats.defense);
    console.log('bossHp:', target.physicalStats.hp)
    target.physicalStats.hp -= damage;
    console.log('bossHpafter:', target.physicalStats.hp)
    this.battleLogs.push(`${user.name} uses Shield Bash on ${target.name} dealing ${damage}. ${target.name} is slowed!`);
    console.log(this.battleLogs.length)
    console.log(`${user.name} uses Shield Bash on ${target.name}. ${target.name} is slowed!`);
    // Implement slow effect on the target here
  }

 defend(user) {
    user.stats.defense += 10; // Example: Increase defense by 10
    this.battleLogs.push(`${user.name} uses Defend. Their defense is increased.`);
  }

  bloodlust(user) {
    user.stats.attackSpeed += 20; // Example: Increase attack speed by 20
    user.stats.attack += 15; // Example: Increase attack damage by 15
    this.battleLogs.push(`${user.name} activates Bloodlust. Attack speed and damage increase.`);
  }

  ragingStrike(user, target) {
    const damage = calculateDamage(user.stats.attack * 2, target.physicalStats.defense);
    target.physicalStats.hp -= damage;
    this.battleLogs.push(`${user.name} unleashes a wild Raging Strike on ${target.name}. It deals massive damage!`);
  }

  arenaSpin(user, targets) {
    targets.forEach((target) => {
      const damage = calculateDamage(user.stats.attack, target.physicalStats.defense);
      target.physicalStats.hp -= damage;
    });
    this.battleLogs.push(`${user.name} performs an Arena Spin, hitting multiple opponents.`);
  }

  crowdControl(user, target) {
    target.focus = user;
    this.battleLogs.push(`${user.name} taunts ${target.name}. ${target.name} is now focused on ${user.name}.`);
  }

  precisionStrike(user, target) {
    const criticalDamage = calculateDamage(user.stats.attack * 1.5, target.physicalStats.defense);
    target.physicalStats.hp -= criticalDamage;
    this.battleLogs.push(`${user.name} executes a precise Precision Strike on ${target.name}. It's a critical hit!`);
  }

  honorsResolve(user) {
    user.statusEffects.resistance += 20; // Example: Increase status effect resistance by 20%
    this.battleLogs.push(`${user.name} enters Honor's Resolve, gaining increased resistance to status effects.`);
  }

  fireball(user, target) {
    const damageOverTime = calculateAbilityDamage(user.stats.magic, target.physicalStats.defense, 3);
    target.physicalStats.hp -= damageOverTime;
    this.battleLogs.push(`${user.name} hurls a Fireball at ${target.name}. ${target.name} takes damage over time.`);
  }

  arcaneShield(user) {
    user.statusEffects.shield = true; // Example: Apply a shield status effect
    this.battleLogs.push(`${user.name} creates an Arcane Shield, absorbing incoming magic attacks.`);
  }

  frostNova(user, targets) {
    targets.forEach((target) => {
      target.statusEffects.frozen = true; // Example: Freeze the target
    });
    this.battleLogs.push(`${user.name} casts Frost Nova, freezing enemies in a radius.`);
  }

 thunderstorm(user, targets) {
    const thunderDamage = calculateAbilityDamage(user.stats.magic, 15); // Example: Thunderstorm deals 15 magic damage
    targets.forEach((target) => {
      const damage = calculateDamage(thunderDamage, target.magicalStats.resistance);
      target.magicalStats.hp -= damage;
    });
    this.battleLogs.push(`${user.name} calls forth a Thunderstorm, damaging multiple opponents.`);
  }

  raiseDead(user) {
    // Implement logic for summoning a skeletal minion here
    this.battleLogs.push(`${user.name} summons a skeletal minion to aid in battle.`);
  }

  drainLife(user, target) {
    const drainAmount = calculateAbilityDamage(user.stats.magic, 25); // Example: Drain Life heals for 25 HP
    target.physicalStats.hp -= drainAmount;
    user.physicalStats.hp += drainAmount;
    this.battleLogs.push(`${user.name} drains the life force from ${target.name}. ${user.name} is healed.`);
  }

  mirrorImage(user) {
    // Implement logic for creating illusory copies here
    this.battleLogs.push(`${user.name} creates multiple illusory copies to confuse opponents.`);
  }

  mindTrick(user, target) {
    // Implement logic for disorienting the target here
    this.battleLogs.push(`${user.name} uses a Mind Trick on ${target.name}. ${target.name} is disoriented.`);
  }

  backstab(user, target) {
    const backstabDamage = calculateDamage(user.stats.attack * 2, target.physicalStats.defense); // Example: Backstab deals double damage
    target.physicalStats.hp -= backstabDamage;
    this.battleLogs.push(`${user.name} strikes ${target.name} from behind. It's a backstab!`);
  }

  shadowStep(user, target) {
    // Implement logic for teleporting behind the target here
    this.battleLogs.push(`${user.name} teleports behind ${target.name}, gaining a positional advantage.`);
  }

  dualWield(user) {
    user.stats.attackSpeed += 20; // Example: Dual Wield increases attack speed by 20
    this.battleLogs.push(`${user.name} wields two weapons simultaneously, increasing attack speed.`);
  }

  evasion(user) {
    user.statusEffects.evasion = true; // Example: Apply an evasion status effect
    this.battleLogs.push(`${user.name} evades incoming attacks, reducing damage taken for a short period.`);
  }

  smokeBomb(user) {
    // Implement logic for creating a smoke cloud here
    this.battleLogs.push(`${user.name} throws a Smoke Bomb, creating a cloud of smoke.`);
  }

  shurikenBarrage(user, targets) {
    const shurikenDamage = calculateDamage(user.stats.attack, 10); // Example: Shuriken Barrage deals 10 damage per shuriken
    targets.forEach((target) => {
      target.physicalStats.hp -= shurikenDamage;
    });
    this.battleLogs.push(`${user.name} throws a flurry of shurikens, hitting multiple targets.`);
  }

  charmingPresence(user, target) {
    // Implement logic for charming the target here
    this.battleLogs.push(`${user.name} uses Charming Presence. ${target.name} is charmed and becomes passive.`);
  }

  acrobaticFlourish(user) {
    user.statusEffects.evasion += 30; // Example: Acrobatic Flourish increases evasion by 30%
    this.battleLogs.push(`${user.name} performs an Acrobatic Flourish, increasing evasion.`);
  }

  healingLight(user, target) {
    const healingAmount = calculateAbilityDamage(user.stats.magic, 30); // Example: Healing Light heals for 30 HP
    target.physicalStats.hp += healingAmount;
    this.battleLogs.push(`${user.name} uses Healing Light on ${target.name}. ${target.name} is healed.`);
  }

  divineProtection(user) {
    // Implement logic for providing a shield of protection here
    this.battleLogs.push(`${user.name} provides a shield of Divine Protection, absorbing incoming damage.`);
  }


// RACES ABILITIES MOFO
  
  adaptableNature(user) {
    console.log(`${user} adapts to their surroundings, gaining a bonus to all attributes.`);
    // Implement attribute bonus logic here
  }

  versatileTraining(user) {
    console.log(`${user} has versatile training, allowing them to learn a wider range of skills.`);
    // Implement skill learning logic here
  }

  elvenGrace(user) {
    console.log(`${user} exhibits Elven Grace, increasing agility and dexterity.`);
    // Implement agility and dexterity boost logic here
  }

  naturesFavor(user) {
    console.log(`${user} receives Nature's Favor, enhancing their affinity with nature-based magic.`);
    // Implement nature magic affinity logic here
  }

  dwarvenResilience(user) {
    console.log(`${user} demonstrates Dwarven Resilience, showing higher resistance to physical damage.`);
    // Implement physical damage resistance logic here
  }

  masterCraftsman(user) {
    console.log(`${user} is a Master Craftsman, skilled in crafting weapons and armor.`);
    // Implement crafting proficiency logic here
  }

  feralStrength(user) {
    console.log(`${user} harnesses Feral Strength, gaining increased physical power.`);
    // Implement strength increase logic here
  }

  savageFury(user) {
    console.log(`${user} channels Savage Fury, becoming more powerful as health decreases.`);
    // Implement health-dependent power logic here
  }

  sneakyTricks(user) {
    console.log(`${user} employs Sneaky Tricks, improving chances of stealing or evading detection.`);
    // Implement sneaky behavior logic here
  }

  luckyCharm(user) {
    console.log(`${user} possesses a Lucky Charm, occasionally gaining advantages in critical situations.`);
    // Implement luck-based advantages logic here
  }

  arcaneBrilliance(user) {
    console.log(`${user} shines with Arcane Brilliance, displaying innate proficiency in arcane magic.`);
    // Implement arcane magic proficiency logic here
  }

  inventiveMind(user) {
    console.log(`${user} has an Inventive Mind, capable of creating and using unique gadgets.`);
    // Implement gadget creation and usage logic here
  }


  
// FAMILIAR ABILITIES MAFAKA
 flameStrike(user, target) {
    const power = 20
    const damage = calculateAbilityDamage(power);
    target.physicalStats.hp -= damage;
    this.battleLogs.push(`${user.name} uses Flame Strike on ${target.name} dealing ${damage}.`);
    // Implement additional effects for Flame Strike here
  }

  dragonClaw(user, target) {
    const power = 20
    const damage = calculateAbilityDamage(power);
    target.physicalStats.hp -= damage;
    this.battleLogs.push(`${user.name} uses Dragon Claw on ${target.name} dealing ${damage}.`);
    // Implement additional effects for Dragon Claw here
  }

  aquaBlast(user, target) {
    const power = 20
    const damage = calculateAbilityDamage(power);
    target.physicalStats.hp -= damage;
    this.battleLogs.push(`${user.name} uses Aqua Blast on ${target.name} dealing ${damage}.`);
    // Implement additional effects for Aqua Blast here
  }

  healingWave(user) {
    const power = 20
    const healingAmount = calculateAbilityDamage(power);
    user.stats.hp += healingAmount;
    this.battleLogs.push(`${user.name} uses Healing Wave and heals for ${healingAmount}.`);
    // Implement additional effects for Healing Wave here
  }

}


module.exports = {
  Ability
};
