const { checkResults, updateMovesOnCd, calculateAbilityDamage, getCardStats, getCardMoves,
  calculateDamage, getPlayerMoves } = require('../util/glogic.js');
  const abilities = require('../../data/abilities.js');
class Ability {
  constructor(that) {
    this.battleLogs = that.battleLogs;
    this.enemyToHit = that.enemyToHit;
    this.cooldowns = that.cooldowns;
}
  async cooldownFinder(ability) {
    const abilityCooldown = abilities[ability].cooldown;
    return abilityCooldown;
  }
 //PLAYER ABILOITIES AKAI THIS WORKS BLUD
  
  async shieldBash(user, target) {
    const damage = await calculateDamage(user.stats.attack, target.stats.defense);
    console.log('bossHp:', target.stats.hp);
    target.stats.hp -= damage;
    target.stats.speed -= 10;
    console.log('bossHpafter:', target.stats.hp);
    this.battleLogs.push(`+ ${user.name} uses Shield Bash on ${target.name} dealing ${damage}. ${target.name} now has ${target.stats.speed} speed for 3 turns!`);
    console.log(this.battleLogs.length);
    console.log(`${user.name} uses Shield Bash on ${target.name}. ${target.name} is slowed!`);
    this.cooldowns.push({name: `Shield Bash`, cooldown: this.cooldownFinder('Shield Bash')});

   
    // updateMovesOnCd(this.cooldowns, this.cooldownFinder('shieldBash'));
  }

 async defend(user) {
    user.stats.defense += 10; // Example: Increase defense by 10
    this.battleLogs.push(`+ ${user.name} uses Defend. Their defense is increased.`);
    this.cooldowns.push({name: `Defend`, cooldown: this.cooldownFinder('Defend')});
  }

  async bloodlust(user) {
    user.stats.attackSpeed += 20; // Example: Increase attack speed by 20
    user.stats.attack += 15; // Example: Increase attack damage by 15
    this.battleLogs.push(`${user.name} activates Bloodlust. Attack speed and damage increase.`);
    this.cooldowns.push({name: `Bloodlust`, cooldown: this.cooldownFinder('Bloodlust')});
  }

  async ragingStrike(user, target) {
    const damage = calculateDamage(user.stats.attack * 2, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`${user.name} unleashes a wild Raging Strike on ${target.name}. It deals massive damage!`);
    this.cooldowns.push({name: `Raging Strike`, cooldown: this.cooldownFinder('Raging Strike')});
  }

  async arenaSpin(user, targets) {
    targets.forEach((target) => {
      const damage = calculateDamage(user.stats.attack, target.stats.defense);
      target.stats.hp -= damage;
    });
    this.battleLogs.push(`${user.name} performs an Arena Spin, hitting multiple opponents.`);
    this.cooldowns.push({name: `Arena Spin`, cooldown: this.cooldownFinder('Arena Spin')});
  }

  async crowdControl(user, target) {
    target.focus = user;
    this.battleLogs.push(`${user.name} taunts ${target.name}. ${target.name} is now focused on ${user.name}.`);
    this.cooldowns.push({name: `Crowd Control`, cooldown: this.cooldownFinder('Crowd Control')});
  }

  async precisionStrike(user, target) {
    const criticalDamage = calculateDamage(user.stats.attack * 1.5, target.stats.defense);
    target.stats.hp -= criticalDamage;
    this.battleLogs.push(`${user.name} executes a precise Precision Strike on ${target.name}. It's a critical hit!`);
    this.cooldowns.push({name: `Precision Strike`, cooldown: this.cooldownFinder('Precision Strike')});
  }

  async honorsResolve(user) {
    user.statusEffects.resistance += 20; // Example: Increase status effect resistance by 20%
    this.battleLogs.push(`${user.name} enters Honor's Resolve, gaining increased resistance to status effects.`);
    this.cooldowns.push({name: `Honor's Resolve`, cooldown: this.cooldownFinder(`Honor's Resolve`)});
  }

  async fireball(user, target) {
    const damageOverTime = calculateAbilityDamage(user.stats.magic, target.stats.defense, 3);
    target.stats.hp -= damageOverTime;
    this.battleLogs.push(`${user.name} hurls a Fireball at ${target.name}. ${target.name} takes damage over time.`);
    this.cooldowns.push({name: `Fireball`, cooldown: this.cooldownFinder('Fireball')});
  }

  async arcaneShield(user) {
    user.statusEffects.shield = true; // Example: Apply a shield status effect
    this.battleLogs.push(`${user.name} creates an Arcane Shield, absorbing incoming magic attacks.`);
    this.cooldowns.push({name: `Arcane Shield`, cooldown: this.cooldownFinder('Arcane Shield')});

  }

  async frostNova(user, targets) {
    targets.forEach((target) => {
      target.statusEffects.frozen = true; // Example: Freeze the target
    });
    this.battleLogs.push(`${user.name} casts Frost Nova, freezing enemies in a radius.`);
    this.cooldowns.push({name: `Frost Nova`, cooldown: this.cooldownFinder('Frost Nova')});
  }

 async thunderstorm(user, targets) {
    const thunderDamage = calculateAbilityDamage(user.stats.magic, 15); // Example: Thunderstorm deals 15 magic damage
    targets.forEach((target) => {
      const damage = calculateDamage(thunderDamage, target.magicalStats.resistance);
      target.magicalStats.hp -= damage;
    });
    this.battleLogs.push(`${user.name} calls forth a Thunderstorm, damaging multiple opponents.`);
    this.cooldowns.push({name: `Thunderstorm`, cooldown: this.cooldownFinder('Thunderstorm')});
  }

  async raiseDead(user) {
    // Implement logic for summoning a skeletal minion here
    this.battleLogs.push(`${user.name} summons a skeletal minion to aid in battle.`);
    this.cooldowns.push({name: `Raise Dead`, cooldown: this.cooldownFinder('Raise Dead')}); 
  }

  async drainLife(user, target) {
    const drainAmount = calculateAbilityDamage(user.stats.magic, 25); // Example: Drain Life heals for 25 HP
    target.stats.hp -= drainAmount;
    user.stats.hp += drainAmount;
    this.battleLogs.push(`${user.name} drains the life force from ${target.name}. ${user.name} is healed.`);
    this.cooldowns.push({name: `Drain Life`, cooldown: this.cooldownFinder('Drain Life')});
  }

  async mirrorImage(user) {
    // Implement logic for creating illusory copies here
    this.battleLogs.push(`${user.name} creates multiple illusory copies to confuse opponents.`);
    this.cooldowns.push({name: `Mirror Image`, cooldown: this.cooldownFinder('Mirror Image')});
  }

 async  mindTrick(user, target) {
    // Implement logic for disorienting the target here
    this.battleLogs.push(`${user.name} uses a Mind Trick on ${target.name}. ${target.name} is disoriented.`);
    this.cooldowns.push({name: `Mind Trick`, cooldown: this.cooldownFinder('Mind Trick')});
  }

  async backstab(user, target) {
    const backstabDamage = calculateDamage(user.stats.attack * 2, target.stats.defense); // Example: Backstab deals double damage
    target.stats.hp -= backstabDamage;
    this.battleLogs.push(`${user.name} strikes ${target.name} from behind. It's a backstab!`);
    this.cooldowns.push({name: `Backstab`, cooldown: this.cooldownFinder('Backstab')});
  }

  async shadowStep(user, target) {
    // Implement logic for teleporting behind the target here
    this.battleLogs.push(`${user.name} teleports behind ${target.name}, gaining a positional advantage.`);
    this.cooldowns.push({name: `Shadow Step`, cooldown: this.cooldownFinder('Shadow Step')});
  }

  async dualWield(user) {
    user.stats.attackSpeed += 20; // Example: Dual Wield increases attack speed by 20
    this.battleLogs.push(`${user.name} wields two weapons simultaneously, increasing attack speed.`);
    this.cooldowns.push({name: `Dual Wield`, cooldown: this.cooldownFinder('Dual Wield')});
  }

  async evasion(user) {
    user.statusEffects.evasion = true; // Example: Apply an evasion status effect
    this.battleLogs.push(`${user.name} evades incoming attacks, reducing damage taken for a short period.`);
    this.cooldowns.push({name: `Evasion`, cooldown: this.cooldownFinder('Evasion')});
  }

  async smokeBomb(user) {
    // Implement logic for creating a smoke cloud here
    this.battleLogs.push(`${user.name} throws a Smoke Bomb, creating a cloud of smoke.`);
    this.cooldowns.push({name: `Smoke Bomb`, cooldown: this.cooldownFinder('Smoke Bomb')});
  }

  async shurikenBarrage(user, targets) {
    const shurikenDamage = calculateDamage(user.stats.attack, 10); // Example: Shuriken Barrage deals 10 damage per shuriken
    targets.forEach((target) => {
      target.stats.hp -= shurikenDamage;
    });
    this.battleLogs.push(`${user.name} throws a flurry of shurikens, hitting multiple targets.`);
    this.cooldowns.push({name: `Shuriken Barrage`, cooldown: this.cooldownFinder('Shuriken Barrage')});
  }

  async charmingPresence(user, target) {
    // Implement logic for charming the target here
    this.battleLogs.push(`${user.name} uses Charming Presence. ${target.name} is charmed and becomes passive.`);
    this.cooldowns.push({name: `Charming Presence`, cooldown: this.cooldownFinder('Charming Presence')});
  }

  async acrobaticFlourish(user) {
    user.statusEffects.evasion += 30; // Example: Acrobatic Flourish increases evasion by 30%
    this.battleLogs.push(`${user.name} performs an Acrobatic Flourish, increasing evasion.`);
    this.cooldowns.push({name: `Acrobatic Flourish`, cooldown: this.cooldownFinder('Acrobatic Flourish')});
  }

  async healingLight(user, target) {
    const healingAmount = calculateAbilityDamage(user.stats.magic, 30); // Example: Healing Light heals for 30 HP
    target.stats.hp += healingAmount;
    this.battleLogs.push(`${user.name} uses Healing Light on ${target.name}. ${target.name} is healed.`);
    this.cooldowns.push({name: `Healing Light`, cooldown: this.cooldownFinder('Healing Light')});
  }

  async divineProtection(user) {
    // Implement logic for providing a shield of protection here
    this.battleLogs.push(`${user.name} provides a shield of Divine Protection, absorbing incoming damage.`);
    this.cooldowns.push({name: `Divine Protection`, cooldown: this.cooldownFinder('Divine Protection')});
  }


  // RACES ABILITIES MOFO

  async adaptableNature(user) {
    console.log(`${user} adapts to their surroundings, gaining a bonus to all attributes.`);
    // Implement attribute bonus logic here
  }

  async versatileTraining(user) {
    console.log(`${user} has versatile training, allowing them to learn a wider range of skills.`);
    // Implement skill learning logic here
  }

  async elvenGrace(user) {
    console.log(`${user} exhibits Elven Grace, increasing agility and dexterity.`);
    // Implement agility and dexterity boost logic here
  }

  async naturesFavor(user) {
    console.log(`${user} receives Nature's Favor, enhancing their affinity with nature-based magic.`);
    // Implement nature magic affinity logic here
  }

  async dwarvenResilience(user) {
    console.log(`${user} demonstrates Dwarven Resilience, showing higher resistance to physical damage.`);
    // Implement physical damage resistance logic here
  }

  async masterCraftsman(user) {
    console.log(`${user} is a Master Craftsman, skilled in crafting weapons and armor.`);
    // Implement crafting proficiency logic here
  }

  async feralStrength(user) {
    console.log(`${user} harnesses Feral Strength, gaining increased physical power.`);
    // Implement strength increase logic here
  }

  async savageFury(user) {
    console.log(`${user} channels Savage Fury, becoming more powerful as health decreases.`);
    // Implement health-dependent power logic here
  }

  async sneakyTricks(user) {
    console.log(`${user} employs Sneaky Tricks, improving chances of stealing or evading detection.`);
    // Implement sneaky behavior logic here
  }

  async luckyCharm(user) {
    console.log(`${user} possesses a Lucky Charm, occasionally gaining advantages in critical situations.`);
    // Implement luck-based advantages logic here
  }

  async arcaneBrilliance(user) {
    console.log(`${user} shines with Arcane Brilliance, displaying innate proficiency in arcane magic.`);
    // Implement arcane magic proficiency logic here
  }

  async inventiveMind(user) {
    console.log(`${user} has an Inventive Mind, capable of creating and using unique gadgets.`);
    // Implement gadget creation and usage logic here
  }



  // FAMILIAR ABILITIES MAFAKA
  async flameStrike(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(`+ ${user.name} uses Flame Strike on ${target.name} dealing ${damage}.`);
    this.cooldowns.push({name: `Flame Strike`, cooldown: this.cooldownFinder('Flame Strike')});
    // Implement additional effects for Flame Strike here
  }

  async dragonClaw(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(`+ ${user.name} uses Dragon Claw on ${target.name} dealing ${damage}.`);
    this.cooldowns.push({name: `Dragon Claw`, cooldown: this.cooldownFinder('Dragon Claw')});
    // Implement additional effects for Dragon Claw here
  }

  async aquaBlast(user, target) {
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(`+ ${user.name} uses Aqua Blast on ${target.name} dealing ${damage}.`);
    this.cooldowns.push({name: `Aqua Blast`, cooldown: this.cooldownFinder('Aqua Blast')});
    // Implement additional effects for Aqua Blast here
  }

  async healingWave(user) {
    const power = 20;
    const healingAmount = calculateAbilityDamage(power);
    user.stats.hp += healingAmount;
    this.battleLogs.push(`+ ${user.name} uses Healing Wave and heals for ${healingAmount}.`);
    this.cooldowns.push({name: `Healing Wave`, cooldown: this.cooldownFinder('Healing Wave')});
    // Implement additional effects for Healing Wave here
  }

  async lightningBolt(user, target) {   
    const power = 20;
    const damage = calculateAbilityDamage(power);
    target.stats.hp -= damage;
    this.battleLogs.push(`+ ${user.name} uses Lightning Bolt on ${target.name} dealing ${damage}.`);
    this.cooldowns.push({name: `Lightning Bolt`, cooldown: this.cooldownFinder('Lightning Bolt')});
    // Implement additional effects for Lightning Bolt here
  }


  //boss and mobs abilities
  async basicAttack(user, target) {
    const damage = await calculateDamage(user.stats.attack, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`+ ${user.name} uses Shield Bash on ${target.name} dealing ${damage}. ${target.name} is slowed!`);
    console.log(this.battleLogs.length);
    console.log(`${user.name} uses Shield Bash on ${target.name}. ${target.name} is slowed!`);

    // Implement slow effect on the target here
  }

  async fireBreath(user, target) {
    const damage = await calculateDamage(user.stats.magic, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`${user.name} hurls a Fireball at ${target.name}. ${target.name} takes damage over time.`);
  }

  async tailSwipe(user, target) {
    const damage = await calculateDamage(user.stats.attack * 1.5, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`${user.name} performs a powerful Tail Swipe on ${target.name}. It deals ${damage} damage.`);
    // Implement additional effects for Tail Swipe here
  }

  async venomStrike(user, target) {
    const damage = await calculateDamage(user.stats.magic * 1.2, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`${user.name} delivers a Venom Strike to ${target.name}. It deals ${damage} damage.`);
    // Implement additional effects for Venom Strike here
  }

  async webTrap(user, target) {
    const damage = await calculateDamage(user.stats.magic * 0.8, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`${user.name} sets up a Web Trap for ${target.name}. It deals ${damage} damage.`);
    // Implement additional effects for Web Trap here
  }

  async bossAbility2(user) {
    user.stats.defense += 10; // Example: Increase defense by 10
    this.battleLogs.push(`+ ${user.name} uses Defend. Their defense is increased.`);
  }

  async bossAbility3(user) {
    user.stats.attackSpeed += 20; // Example: Increase attack speed by 20
    user.stats.attack += 15; // Example: Increase attack damage by 15
    this.battleLogs.push(`${user.name} activates Bloodlust. Attack speed and damage increase.`);
  }

  async bossAbility4(user, target) {
    const damage = calculateDamage(user.stats.attack * 2, target.stats.defense);
    target.stats.hp -= damage;
    this.battleLogs.push(`${user.name} unleashes a wild Raging Strike on ${target.name}. It deals massive damage!`);
  }

  async bossAbility5(user, targets) {
    targets.forEach((target) => {
      const damage = calculateDamage(user.stats.attack, target.stats.defense);
      target.stats.hp -= damage;
    });
    this.battleLogs.push(`${user.name} performs an Arena Spin, hitting multiple opponents.`);
  }

  async bossAbility6(user, target) {
    target.focus = user;
    this.battleLogs.push(`${user.name} taunts ${target.name}. ${target.name} is now focused on ${user.name}.`);
  }

  async bossAbility7(user, target) {
    const criticalDamage = calculateDamage(user.stats.attack * 1.5, target.stats.defense);
    target.stats.hp -= criticalDamage;
    this.battleLogs.push(`${user.name} executes a precise Precision Strike on ${target.name}. It's a critical hit!`);
  }

  async bossAbility8(user) {
    user.statusEffects.resistance += 20; // Example: Increase status effect resistance by 20%
    this.battleLogs.push(`${user.name} enters Honor's Resolve, gaining increased resistance to status effects.`);
  }
  } 

  module.exports = {
    Ability
  };
